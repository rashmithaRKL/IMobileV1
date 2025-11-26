"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { productsService } from "@/lib/supabase/services/products"
import { toast } from "sonner"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  editingProductId?: string | null
}

export default function ProductModal({ isOpen, onClose, editingProductId }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    condition: "new" as "new" | "used",
  })

  useEffect(() => {
    if (editingProductId && isOpen) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          const product = await productsService.getById(editingProductId)
          if (product) {
            setFormData({
              name: product.name || "",
              category: product.category || "",
              brand: product.brand || "",
              price: product.price?.toString() || "",
              stock: product.stock?.toString() || "0",
              image: product.image || product.images?.[0] || "",
              description: product.description || "",
              condition: (product.condition as "new" | "used") || "new",
            })
          }
        } catch (error) {
          console.error('Failed to fetch product:', error)
          toast.error('Failed to load product details')
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    } else {
      setFormData({
        name: "",
        category: "",
        brand: "",
        price: "",
        stock: "",
        image: "",
        description: "",
        condition: "new",
      })
    }
  }, [editingProductId, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand || null,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock) || 0,
        image: formData.image,
        images: formData.image ? [formData.image] : [],
        description: formData.description || null,
        condition: formData.condition,
      }

      if (editingProductId) {
        await productsService.update(editingProductId, productData)
        toast.success('Product updated successfully')
      } else {
        await productsService.create(productData)
        toast.success('Product created successfully')
      }

      onClose()
      // Trigger a page refresh by calling the parent's refresh handler
      window.dispatchEvent(new Event('productUpdated'))
    } catch (error: any) {
      console.error('Failed to save product:', error)
      toast.error(error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{editingProductId ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Product Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="iPhone 15 Pro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                required
              >
                <option value="">Select category</option>
                <option value="mobile-phones">Mobile Phones</option>
                <option value="accessories">Accessories</option>
                <option value="tablets">Tablets</option>
                <option value="smartwatches">Smartwatches</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Brand</label>
              <Input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Apple, Samsung, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              required
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Price</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="999"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Stock</label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Image URL</label>
            <Input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="/iphone-15-pro-max.png"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : editingProductId ? "Update" : "Add"} Product
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
