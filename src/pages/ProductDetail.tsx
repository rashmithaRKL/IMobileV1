"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore, type CartItem } from "@/lib/store"
import ProductImageGallery from "@/components/product-image-gallery"
import ProductReviews from "@/components/product-reviews"
import SimilarProducts from "@/components/similar-products"
import { getApiUrl } from "@/lib/utils/api"

// Product type matching database schema
interface Product {
  id: string
  name: string
  price: number
  image?: string
  images?: string[]
  condition: "new" | "used"
  category: string
  brand?: string
  description?: string
  specs?: any
  rating?: number
  reviews?: number
  reviewsData?: any[]
}

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const addToCart = useCartStore((state) => state.addToCart)

  // Fetch product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(getApiUrl(`/api/products/${id}`))
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found")
          } else {
            setError("Failed to load product")
          }
          setLoading(false)
          return
        }

        const result = await response.json()
        setProduct(result.data)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Product not found"}</h1>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!product) return
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || productImages[0] || "/placeholder.svg",
      quantity,
      condition: product.condition,
    }
    addToCart(item)
  }

  // Get product images - use images array or single image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : ["/placeholder.svg"]

  // Default specs if not available
  const productSpecs = product.specs || {}
  
  // Default rating and reviews
  const productRating = product.rating || 4.5
  const productReviews = product.reviews || 0
  const productReviewsData = product.reviewsData || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button onClick={() => navigate("/shop")} variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr] gap-12 xl:gap-16 mb-16">
          <ProductImageGallery images={productImages} productName={product.name} condition={product.condition} />

          {/* Details Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(productRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {productRating} ({productReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-border py-6">
                <p className="text-3xl font-bold text-primary mb-2">${Number(product.price).toFixed(2)}</p>
                <p className="text-muted-foreground max-w-prose">{product.description || "No description available"}</p>
              </div>

              {/* Specifications */}
              {Object.keys(productSpecs).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 xl:gap-6">
                    {Object.entries(productSpecs).map(([key, value]) => (
                      <div key={key} className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                        <p className="font-semibold text-sm">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 xl:gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                  <Truck className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-semibold">Free Shipping</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                  <Shield className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-semibold">Warranty</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                  <RotateCcw className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-semibold">Easy Returns</p>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
                <Button onClick={handleAddToCart} className="flex-1 gap-2 text-base py-6">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button onClick={() => setIsFavorite(!isFavorite)} variant="outline" className="px-6 py-6">
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <ProductReviews
          productId={product.id}
          reviews={productReviewsData}
          rating={productRating}
          totalReviews={productReviews}
        />

        {product.brand && (
          <SimilarProducts currentProductId={product.id} brand={product.brand} />
        )}
      </div>
    </div>
  )
}

