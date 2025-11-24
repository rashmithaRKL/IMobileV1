import { createClient } from '../client'

export const accountService = {
  // Addresses
  async listAddresses() {
    const supabase = createClient()
    const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async upsertAddress(address: {
    id?: string
    type: 'billing' | 'shipping'
    full_name: string
    phone?: string
    address_line1: string
    address_line2?: string
    city: string
    state?: string
    postal_code?: string
    country: string
    is_default?: boolean
  }) {
    const supabase = createClient()
    // Attach current user id server-side via RLS check using getUser
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')
    const payload = { ...address, user_id: user.id, type: (address.type || 'billing').toLowerCase() as 'billing' | 'shipping' }

    let data = null
    let error = null as any
    if (address.id) {
      const res = await supabase.from('addresses').update(payload).eq('id', address.id).select().single()
      data = res.data; error = res.error
    } else {
      const res = await supabase.from('addresses').insert(payload).select().single()
      data = res.data; error = res.error
    }
    if (error) throw error
    return data
  },
  async deleteAddress(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (error) throw error
  },

  // Wishlist
  async getWishlist() {
    const supabase = createClient()
    const { data, error } = await supabase.from('wishlists').select('id, product_id, created_at').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async addToWishlist(productId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId }).select().single()
    if (error && error.code !== '23505') throw error // ignore unique violation
    return data
  },
  async removeFromWishlist(productId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('wishlists').delete().eq('product_id', productId)
    if (error) throw error
  },

  // Credits and Downloads
  async getCredits() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase.from('profiles').select('store_credits').eq('id', user.id).single()
    if (error) throw error
    return data.store_credits as number
  },
  async getDownloads() {
    const supabase = createClient()
    const { data, error } = await supabase.from('downloads').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
}


