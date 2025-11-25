import { createClient } from '../client'
import { getApiUrl } from '../../utils/api'

export const authService = {
  // Sign up
  async signUp(email: string, password: string, name?: string, whatsapp?: string, captchaToken?: string) {
    // Route through our server API to avoid client-side network issues
    const res = await fetch(getApiUrl('/api/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, whatsapp }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error || 'Signup failed')
    }

    // If signup returned a session (email confirmations disabled), set client session
    try {
      if (data?.session?.access_token && data?.session?.refresh_token) {
        const supabase = createClient()
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }
    } catch (setErr) {
      console.warn('Failed to set client session after signup:', setErr)
    }

    // Ensure profile is created immediately if user exists
    if (data.user) {
      try {
        console.log('Signup succeeded via server API')
      } catch (profileErr) {
        console.warn('Profile creation attempt failed (non-critical):', profileErr)
        // Don't throw - trigger should handle it
      }
    }

    // The profile is automatically created by the database trigger
    // If we have whatsapp or name, we'll update it after ensuring the profile exists
    if (data.user && (whatsapp || name)) {
      // Use a retry mechanism to update profile with exponential backoff
      const updateProfileWithRetry = async (retries = 5, initialDelay = 500) => {
        for (let i = 0; i < retries; i++) {
          try {
            // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms, 8000ms
            const delay = initialDelay * Math.pow(2, i)
            await new Promise(resolve => setTimeout(resolve, delay))
            
            // First, check if profile exists
            try {
              const existingProfile = await this.getProfile(data.user!.id)
              console.log('Profile exists, updating...', existingProfile)
            } catch (profileCheckError: any) {
              // Profile doesn't exist yet, continue waiting
              console.log(`Profile not ready yet (attempt ${i + 1}/${retries}), waiting...`)
              if (i === retries - 1) {
                console.warn('Profile was not created after signup. This might be a database trigger issue.')
                return
              }
              continue
            }
            
            // Profile exists, try to update it
            const updates: { name?: string; whatsapp?: string } = {}
            if (name) updates.name = name
            if (whatsapp) updates.whatsapp = whatsapp
            
            await this.updateProfile(data.user!.id, updates)
            console.log('Profile updated successfully with:', updates)
            return // Success, exit retry loop
          } catch (err: any) {
            console.error(`Profile update attempt ${i + 1}/${retries} failed:`, err?.message || err)
            if (i === retries - 1) {
              // Last attempt failed
              console.error('Failed to update profile after all retries. Error details:', {
                message: err?.message,
                code: err?.code,
                status: err?.status,
                details: err?.details,
                hint: err?.hint,
              })
              // Don't throw - this is not critical for signup to succeed
            }
          }
        }
      }
      
      // Don't await this - let it run in background so signup can complete
      updateProfileWithRetry().catch(err => {
        console.error('Background profile update failed:', err)
      })
    }

    return data
  },

  // Sign in
  async signIn(email: string, password: string, captchaToken?: string, signal?: AbortSignal) {
    try {
      if (typeof window !== 'undefined') {
        let res: Response
        try {
          res = await fetch(getApiUrl('/api/auth/signin'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            cache: 'no-store',
            signal,
            body: JSON.stringify({ email, password }),
          })
        } catch (fetchError: any) {
          // Network error - API server might not be running
          if (fetchError?.name === 'AbortError') {
            // Check if it's the connection timeout or the user's timeout
            if (signal?.aborted) {
              throw fetchError // User's timeout
            }
            // Connection timeout - server not responding
            const networkError = new Error(
              'Unable to connect to the authentication server. The API server may not be running.\n\n' +
              'Please start the API server in a separate terminal:\n' +
              '  npm run dev:server\n\n' +
              'This will start the server on port 4000. Then try signing in again.'
            )
            networkError.name = 'NetworkError'
            throw networkError
          }
          const networkError = new Error(
            'Unable to connect to the server. Please ensure:\n' +
            '1. The API server is running (npm run dev:server)\n' +
            '2. The server is accessible at http://localhost:4000\n' +
            '3. Your network connection is working'
          )
          networkError.name = 'NetworkError'
          throw networkError
        }

        // Check content type to ensure we're getting JSON
        const contentType = res.headers.get('content-type')
        let apiData: any = {}
        
        if (contentType && contentType.includes('application/json')) {
          try {
            apiData = await res.json()
          } catch (jsonError) {
            // If JSON parsing fails, try to get text for debugging
            const text = await res.text().catch(() => 'Unknown error')
            console.error('Failed to parse JSON response:', text)
            throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`)
          }
        } else {
          // Server returned non-JSON (probably HTML error page)
          const text = await res.text().catch(() => 'Unknown error')
          console.error('Server returned non-JSON response:', text.substring(0, 200))
          throw new Error(`Server error: Received ${contentType || 'unknown'} instead of JSON. This usually means the backend server crashed. Check server logs.`)
        }
        
        // Log the response for debugging
        console.log('[authService.signIn] API response status:', res.status)
        console.log('[authService.signIn] API response data:', {
          hasUser: !!apiData?.user,
          hasSession: !!apiData?.session,
          userId: apiData?.user?.id,
          userEmail: apiData?.user?.email,
          sessionHasAccessToken: !!apiData?.session?.access_token,
        })

        if (!res.ok) {
          // Preserve the original error message from the API
          console.error('[authService.signIn] API returned error status:', res.status)
          console.error('[authService.signIn] Error data:', apiData)
          const error = new Error(apiData?.error || 'Sign in failed')
          if (apiData?.code) {
            (error as any).code = apiData.code
          }
          if (res.status) {
            (error as any).status = res.status
          }
          throw error
        }

        // Validate response has required data
        if (!apiData?.user) {
          console.error('[authService.signIn] API returned success but no user data')
          console.error('[authService.signIn] Full response:', JSON.stringify(apiData, null, 2))
          throw new Error('Sign in succeeded but no user data returned from server')
        }

        // Set the session in the client for persistence
        // Try to set it, but don't block if it takes too long
        if (apiData?.session && apiData.session.access_token && apiData.session.refresh_token) {
          console.log('[authService.signIn] Setting client session...')
          const supabase = createClient()
          
          // Try to set session with reasonable timeout
          // If it fails, the backend has the session in cookies, and initialize() will recover it
          ;(async () => {
            try {
              const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
              
              const result = await Promise.race([
                supabase.auth.setSession({
                  access_token: apiData.session.access_token,
                  refresh_token: apiData.session.refresh_token,
                }),
                timeout
              ]) as any
              
              if (result?.error) {
                console.warn('[authService.signIn] ⚠️ setSession error:', result.error.message)
              } else {
                console.log('[authService.signIn] ✅ Session set and persisted in client')
              }
            } catch (err: any) {
              // Non-fatal - session is in backend cookies, will be recovered on refresh
              if (err.message === 'Timeout') {
                console.warn('[authService.signIn] ⚠️ setSession timed out - session will be recovered from backend on refresh')
              } else {
                console.warn('[authService.signIn] ⚠️ setSession failed (non-fatal):', err.message)
              }
            }
          })()
        }
        
        // Store access_token in localStorage for database session lookup
        if (apiData?.session?.access_token) {
          try {
            localStorage.setItem('supabase_session_token', apiData.session.access_token)
            console.log('[authService.signIn] ✅ Session token stored in localStorage')
          } catch (storageError: any) {
            console.warn('[authService.signIn] ⚠️ Failed to store token in localStorage:', storageError.message)
          }
        }
        
        console.log('[authService.signIn] ✅ Returning apiData')
        return apiData
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    } catch (error: any) {
      console.error("Auth service sign in error:", error)
      console.error("Error type:", error?.constructor?.name)
      console.error("Error message:", error?.message)
      
      // Re-throw with more context if needed
      if (error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError") || error?.code === "ECONNREFUSED") {
        const networkError = new Error("Network error: Unable to connect to Supabase. Please check:\n1. Your internet connection\n2. Your Supabase URL is correct in .env.local\n3. Your Supabase project is active (not paused)")
        networkError.name = "NetworkError"
        throw networkError
      }
      
      // If it's already a Supabase error, throw it as-is
      if (error?.status || error?.message) {
        throw error
      }
      
      // Otherwise, wrap it
      throw new Error(error?.message || "Unknown error during sign in")
    }
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    
    // Remove stored session token
    try {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('supabase_session_token')
        localStorage.removeItem('supabase_session_token')
        
        // Also delete from database if we have a token
        if (storedToken) {
          // Call backend to delete session from database
          await fetch(getApiUrl('/api/auth/signout'), {
            method: 'POST',
            headers: { 'x-session-token': storedToken },
            credentials: 'include',
          }).catch(() => {}) // Ignore errors
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get user profile
  async getProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Update profile
  async updateProfile(userId: string, updates: {
    name?: string
    whatsapp?: string
    avatar_url?: string
  }) {
    const supabase = createClient()
    
    // First, try to get the current user to ensure we're authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user || user.id !== userId) {
      throw new Error('Unauthorized: Cannot update profile for this user')
    }

    // Try to update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
        updates,
      })
      
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        console.log('Profile does not exist, creating new profile...')
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email || '',
            ...updates,
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Failed to create profile:', insertError)
          throw new Error(`Failed to create profile: ${insertError.message}`)
        }
        
        return newProfile
      }
      
      throw error
    }
    
    return data
  },

  // Reset password
  async resetPassword(email: string, redirectUrl?: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : ''),
    })
    if (error) throw error
  },

  // Resend email confirmation
  async resendEmailConfirmation(email: string, captchaToken?: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        captchaToken: captchaToken || undefined,
      },
    })
    if (error) throw error
  },

  // Update password
  async updatePassword(newPassword: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  },

  // Sign in with Google OAuth
  async signInWithGoogle() {
    const supabase = createClient()
    const siteUrl = import.meta.env.VITE_SITE_URL || import.meta.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const redirectTo = `${siteUrl}/api/auth/callback`

    console.log('🔐 Initiating Google OAuth sign-in...')
    console.log('📍 Redirect URL:', redirectTo)
    console.log('🌐 Site URL:', siteUrl)
    console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('❌ Google OAuth error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      })
      
      // Provide more helpful error messages
      if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
        throw new Error(
          'Google OAuth is not properly configured in Supabase.\n\n' +
          'Please verify:\n' +
          '1. Go to Supabase Dashboard → Authentication → Providers\n' +
          '2. Make sure Google is enabled (toggle is ON)\n' +
          '3. Enter your Google Client ID and Client Secret\n' +
          '4. Click "Save" and wait a few seconds\n' +
          '5. Try again\n\n' +
          'If the issue persists, check that your Client ID and Secret are correct in Google Cloud Console.'
        )
      }
      throw error
    }

    console.log('✅ Google OAuth initiated successfully')
    return data
  },
}
