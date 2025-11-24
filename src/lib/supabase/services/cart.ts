import { createClient } from '../client'
import { withRetry, handleSupabaseError } from '../utils/error-handler'
import type { Database } from '../types'

type CartItem = Database['public']['Tables']['cart_items']['Row']
type CartItemInsert = Database['public']['Tables']['cart_items']['Insert']
type CartItemUpdate = Database['public']['Tables']['cart_items']['Update']

export const cartService = {
  // Get user's cart items with product details
  async getCartItems(userId: string) {
    return withRetry(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image,
            condition,
            stock
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw handleSupabaseError(error)
      return data
    })
  },

  // Add item to cart
  async addItem(userId: string, productId: string, quantity: number = 1) {
    return withRetry(async () => {
      const supabase = createClient()
      
      // Check if item already exists
      const { data: existing, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle()

      if (checkError) throw handleSupabaseError(checkError)

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw handleSupabaseError(error)
        return data
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
          })
          .select()
          .single()

        if (error) throw handleSupabaseError(error)
        return data
      }
    })
  },

  // Update cart item quantity
  async updateQuantity(userId: string, itemId: string, quantity: number) {
    return withRetry(async () => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return this.removeItem(userId, itemId)
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw handleSupabaseError(error)
      return data
    })
  },

  // Remove item from cart
  async removeItem(userId: string, itemId: string) {
    return withRetry(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)

      if (error) throw handleSupabaseError(error)
    })
  },

  // Clear cart
  async clearCart(userId: string) {
    return withRetry(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (error) throw handleSupabaseError(error)
    })
  },
}
