import { Request, Response } from 'express'
import { createServerClient } from '@supabase/ssr'

/**
 * GET /api/products/list
 * MIGRATION: Converted from Next.js API route to Express handler
 */
export async function listHandler(req: Request, res: Response) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: 'Supabase not configured',
        message: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file',
        data: [] // Return empty array so UI doesn't break
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

    let query = supabase.from('products').select('*')

    const { category, brand, condition, search, minPrice, maxPrice } = req.query

    if (category) {
      query = query.eq('category', category as string)
    }

    if (brand) {
      query = query.eq('brand', brand as string)
    }

    if (condition) {
      query = query.eq('condition', condition as string)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (minPrice) {
      query = query.gte('price', Number(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', Number(maxPrice))
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: error.message,
        details: error.details,
        code: error.code,
      })
    }

    return res.json({ data })
  } catch (e: any) {
    return res.status(500).json({
      error: e?.message || 'Unexpected error fetching products',
    })
  }
}

