import { createClient } from '../client'
import { getApiUrl } from '../../utils/api'
import { withRetry, handleSupabaseError } from '../utils/error-handler'
import type { Database } from '../types'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export const productsService = {
  // Get all products
  async getAll(filters?: {
    category?: string
    brand?: string
    condition?: 'new' | 'used'
    search?: string
    minPrice?: number
    maxPrice?: number
  }) {
    return withRetry(async () => {
      // Check if we have Supabase credentials - if not, skip API and use direct calls
      const hasSupabaseConfig = 
        import.meta.env.VITE_SUPABASE_URL || 
        import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL)

      // Try API first only if Supabase is configured (API might be faster)
      if (typeof window !== 'undefined' && hasSupabaseConfig) {
        try {
          const params = new URLSearchParams()
          if (filters?.category) params.set('category', filters.category)
          if (filters?.brand) params.set('brand', filters.brand)
          if (filters?.condition) params.set('condition', filters.condition)
          if (filters?.search) params.set('search', filters.search)
          if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
          if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))

          const queryString = params.toString()
          const endpoint = queryString ? `/api/products/list?${queryString}` : '/api/products/list'

          const response = await fetch(endpoint, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })
          if (response.ok) {
            const payload = await response.json()
            return payload.data as Product[]
          }
          // If API fails, fall through to direct Supabase call
          console.warn('API call failed, using direct Supabase connection')
        } catch (e) {
          // Network error or timeout - fall through to direct Supabase call
          console.warn('API unavailable, using direct Supabase connection')
        }
      }

      // Direct Supabase call (fallback or when API not available)
      // If Supabase not configured, return empty array
      if (!hasSupabaseConfig) {
        console.warn('Supabase not configured - returning empty product list')
        return [] as Product[]
      }
      
      const supabase = createClient()
      let query = supabase.from('products').select('*')

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.brand) {
        query = query.eq('brand', filters.brand)
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw handleSupabaseError(error)
      return data as Product[]
    })
  },

  // Get single product
  async getById(id: string) {
    return withRetry(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw handleSupabaseError(error)
      return data as Product
    })
  },

  // Create product
  async create(product: ProductInsert) {
    return withRetry(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw handleSupabaseError(error)
      return data as Product
    })
  },

  // Update product
  async update(id: string, updates: ProductUpdate) {
    return withRetry(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw handleSupabaseError(error)
      return data as Product
    })
  },

  // Delete product
  async delete(id: string) {
    return withRetry(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw handleSupabaseError(error)
    })
  },

  // Get categories
  async getCategories() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category')

    if (error) throw error
    const uniqueCategories = [...new Set(data.map((p) => p.category))]
    return uniqueCategories
  },

  // Get categories with product counts
  async getCategoriesWithCounts() {
    return withRetry(async () => {
      // Check if we have Supabase credentials
      const hasSupabaseConfig = 
        import.meta.env.VITE_SUPABASE_URL || 
        import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL)

      // Try API first only if Supabase is configured
      if (typeof window !== 'undefined' && hasSupabaseConfig) {
        try {
          const response = await fetch(getApiUrl('/api/products/categories'), { 
            cache: 'no-store',
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })
          if (response.ok) {
            const payload = await response.json()
            return payload.data
          }
          console.warn('API call failed, using direct Supabase connection')
        } catch (e) {
          // Network error or timeout - fall through to direct Supabase call
          console.warn('API unavailable, using direct Supabase connection')
        }
      }

      // Direct Supabase call (fallback or when API not available)
      const supabase = createClient()
      
      // If using placeholder client, return empty categories
      if (!hasSupabaseConfig) {
        console.warn('Supabase not configured - returning empty categories')
        return []
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('category, brand')

      if (error) {
        // If using placeholder client, return empty array
        if (!hasSupabaseConfig) {
          return []
        }
        throw handleSupabaseError(error)
      }

      // Count products per category
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

      // Build category structure
      const categories: Array<{
        id: string
        name: string
        count: number
        subcategories?: Array<{ id: string; name: string; count: number }>
      }> = []

      categoryCounts.forEach((count, category) => {
        const categoryId = category.toLowerCase().replace(/\s+/g, '-')
        // Format category name properly (handle special cases)
        let categoryName = category
          .split('-')
          .map((word) => {
            // Handle special cases
            if (word.toLowerCase() === 'ipads') return 'iPads'
            if (word.toLowerCase() === 'tablets') return 'Tablets'
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          })
          .join(' ')

        // Special handling for mobile-phones with subcategories
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

      // Sort categories by name
      return categories.sort((a, b) => a.name.localeCompare(b.name))
    })
  },

  // Get brands
  async getBrands() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .order('brand')

    if (error) throw error
    const uniqueBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))]
    return uniqueBrands
  },
}
