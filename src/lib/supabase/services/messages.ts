import { createClient } from '../client'
import { withRetry, handleSupabaseError } from '../utils/error-handler'
import type { Database } from '../types'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']

export const messagesService = {
  // Get all messages (admin only)
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Message[]
  },

  // Get single message
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Message
  },

  // Create message (from contact form)
  async create(message: MessageInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data as Message
  },

  // Update message status
  async updateStatus(id: string, status: Message['status']) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Message
  },

  // Update message
  async update(id: string, updates: MessageUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Message
  },

  // Delete message
  async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
