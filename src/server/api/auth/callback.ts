import { Request, Response } from 'express'
import { createServerClient } from '@supabase/ssr'

/**
 * GET /api/auth/callback
 * MIGRATION: Converted from Next.js auth callback route to Express handler
 */
export async function callbackHandler(req: Request, res: Response) {
  try {
    const { code } = req.query

    if (!code) {
      return res.redirect('/auth/error?error=missing_code&message=Authorization code is missing')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.redirect('/auth/error?error=supabase_not_configured&message=Supabase environment variables are not set')
    }

    // Create Supabase client with Express cookie handling
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return req.cookies?.[name]
          },
          set(name: string, value: string, options: any) {
            res.cookie(name, value, {
              ...options,
              httpOnly: options?.httpOnly ?? true,
              sameSite: options?.sameSite ?? 'lax',
            })
          },
          remove(name: string, options: any) {
            res.clearCookie(name, options)
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)

    if (error) {
      return res.redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
    }

    // If we have a session, the user is now authenticated
    // The client-side auth provider will detect the session change via cookies
    if (data?.session) {
      // Redirect to home page - the auth provider will handle setting the user state
      return res.redirect('/?oauth=success')
    }

    return res.redirect('/')
  } catch (e: any) {
    return res.redirect(`/auth/error?error=${encodeURIComponent(e?.message || 'Unexpected error')}`)
  }
}

