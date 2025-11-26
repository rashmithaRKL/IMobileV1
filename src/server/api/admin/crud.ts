import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

// Async error wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('[Admin CRUD API] Unhandled async error:', error)
      if (!res.headersSent) {
        res.status(error.status || 500).json({
          error: error.message || 'Internal Server Error',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        })
      }
    })
  }
}

/**
 * POST /api/admin/products
 * Create a new product (admin only)
 */
export const createProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data, error } = await supabase
    .from('products')
    .insert(req.body)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ data })
})

/**
 * PUT /api/admin/products/:id
 * Update a product (admin only)
 */
export const updateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params

  const { data, error } = await supabase
    .from('products')
    .update(req.body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ data })
})

/**
 * DELETE /api/admin/products/:id
 * Delete a product (admin only)
 */
export const deleteProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ success: true })
})

/**
 * PUT /api/admin/orders/:id/status
 * Update order status (admin only)
 */
export const updateOrderStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ data })
})

/**
 * PUT /api/admin/messages/:id/status
 * Update message status (admin only)
 */
export const updateMessageStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }

  const { data, error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating message status:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ data })
})

/**
 * PUT /api/admin/customers/:id
 * Update customer (admin only)
 */
export const updateCustomerHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params

  const { data, error } = await supabase
    .from('profiles')
    .update(req.body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ data })
})

/**
 * DELETE /api/admin/customers/:id
 * Delete customer (admin only)
 */
export const deleteCustomerHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params

  // Delete user from auth (this will cascade to profiles)
  const { error: authError } = await supabase.auth.admin.deleteUser(id)

  if (authError) {
    console.error('Error deleting customer:', authError)
    return res.status(500).json({ error: authError.message })
  }

  return res.json({ success: true })
})

/**
 * DELETE /api/admin/messages/:id
 * Delete message (admin only)
 */
export const deleteMessageHandler = asyncHandler(async (req: Request, res: Response) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { id } = req.params

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting message:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.json({ success: true })
})

