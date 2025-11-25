import { Request, Response } from 'express'
import { createServerClient } from '@supabase/ssr'

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export async function detailHandler(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        error: 'Product ID is required',
      })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: 'Supabase not configured',
        message: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file',
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
            // No-op for read-only operations
          },
          remove(name: string, options: any) {
            // No-op for read-only operations
          },
        },
      }
    )

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return res.status(404).json({
          error: 'Product not found',
        })
      }
      return res.status(500).json({
        error: error.message,
        details: error.details,
        code: error.code,
      })
    }

    return res.json({ data })
  } catch (e: any) {
    return res.status(500).json({
      error: e?.message || 'Unexpected error fetching product',
    })
  }
}

