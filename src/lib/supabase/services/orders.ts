import { createClient } from '../client'
import { withRetry, handleSupabaseError } from '../utils/error-handler'
import type { Database } from '../types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export const ordersService = {
  // Get all orders (admin) - uses backend API with service role
  async getAll() {
    try {
      const { getApiUrl } = await import('@/lib/utils/api')
      const response = await fetch(getApiUrl('/api/admin/data/orders'))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }
      
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error fetching orders from API:', error)
      // Fallback to direct Supabase call
      return withRetry(async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false })

        if (error) throw handleSupabaseError(error)
        return data || []
      })
    }
  },

  // Get user's orders
  async getByUserId(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get single order
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create order
  async create(order: OrderInsert, items: Array<{
    product_id: string | null
    product_name: string
    product_image: string | null
    quantity: number
    price: number
  }>) {
    const supabase = createClient()

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        ...item,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError
    }

    return orderData
  },

  // Update order status - uses backend API with service role
  async updateStatus(id: string, status: Order['status']) {
    try {
      const { getApiUrl } = await import('@/lib/utils/api')
      const response = await fetch(getApiUrl(`/api/admin/orders/${id}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order status')
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error updating order status via API:', error)
      // Fallback to direct Supabase call
      const supabase = createClient()
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError
      return data
    }
  },

  // Update order
  async update(id: string, updates: OrderUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Generate unique order number
  async generateOrderNumber(): Promise<string> {
    const supabase = createClient()
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const orderNumber = `ORD${timestamp}${random}`
    
    // Check if exists
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single()

    if (data) {
      // If exists, generate again
      return this.generateOrderNumber()
    }

    return orderNumber
  },
}
