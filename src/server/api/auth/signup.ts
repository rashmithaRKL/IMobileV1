import { Request, Response } from 'express'
import { createServerClient } from '@supabase/ssr'

/**
 * POST /api/auth/signup
 * MIGRATION: Converted from Next.js API route to Express handler
 */
export async function signupHandler(req: Request, res: Response) {
  try {
    const { email, password, name, whatsapp } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Create Supabase client with Express cookie handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: 'Supabase not configured',
        message: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
      })
    }

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

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VITE_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          name: name || email,
          whatsapp: whatsapp || '',
        },
      },
    })

    if (error) {
      return res.status(400).json({ error: error.message, code: error.status })
    }

    // Best-effort profile creation (does not fail the request)
    try {
      if (data.user?.id) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email || email,
              name: name || data.user.email || email,
              whatsapp: whatsapp || '',
            },
            { onConflict: 'id' }
          )
      }
    } catch {}

    return res.json({ user: data.user, session: data.session })
  } catch (e: any) {
    return res.status(500).json({
      error: e?.message || 'Unexpected error during signup',
    })
  }
}

