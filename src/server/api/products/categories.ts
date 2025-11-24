import { Request, Response } from 'express'
import { createServerClient } from '@supabase/ssr'

/**
 * GET /api/products/categories
 * MIGRATION: Converted from Next.js API route to Express handler
 */
export async function categoriesHandler(req: Request, res: Response) {
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

    const { data, error } = await supabase.from('products').select('category, brand')

    if (error) {
      return res.status(500).json({
        error: error.message,
        details: error.details,
        code: error.code,
      })
    }

    const categoryCounts = new Map<string, number>()
    const categoryBrands = new Map<string, Set<string>>()

    data?.forEach((product) => {
      const category = product.category
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)

      if (product.brand) {
        if (!categoryBrands.has(category)) {
          categoryBrands.set(category, new Set())
        }
        categoryBrands.get(category)?.add(product.brand)
      }
    })

    const categories: Array<{
      id: string
      name: string
      count: number
      subcategories?: Array<{ id: string; name: string; count: number }>
    }> = []

    categoryCounts.forEach((count, category) => {
      const categoryId = category.toLowerCase().replace(/\s+/g, '-')
      let categoryName = category
        .split('-')
        .map((word) => {
          if (word.toLowerCase() === 'ipads') return 'iPads'
          if (word.toLowerCase() === 'tablets') return 'Tablets'
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')

      if (category === 'mobile-phones' && categoryBrands.has(category)) {
        const brands = Array.from(categoryBrands.get(category) || [])
        const subcategories = brands.map((brand) => {
          const brandCount = data?.filter(
            (p) => p.category === category && p.brand === brand
          ).length || 0
          return {
            id: brand.toLowerCase(),
            name: brand,
            count: brandCount,
          }
        })

        categories.push({
          id: categoryId,
          name: categoryName,
          count,
          subcategories: subcategories.sort((a, b) => a.name.localeCompare(b.name)),
        })
      } else {
        categories.push({
          id: categoryId,
          name: categoryName,
          count,
        })
      }
    })

    return res.json({
      data: categories.sort((a, b) => a.name.localeCompare(b.name)),
    })
  } catch (e: any) {
    return res.status(500).json({
      error: e?.message || 'Unexpected error fetching categories',
    })
  }
}

