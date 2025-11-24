import { createClient } from '../client'

export const storageService = {
  // Upload product image
  async uploadProductImage(file: File, productId: string): Promise<string> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  // Delete product image
  async deleteProductImage(filePath: string) {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath])

    if (error) throw error
  },

  // Upload avatar
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  // Delete avatar
  async deleteAvatar(filePath: string) {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath])

    if (error) throw error
  },
}
