"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore, type CartItem } from "@/lib/store"
import ProductImageGallery from "@/components/product-image-gallery"
import ProductReviews from "@/components/product-reviews"
import SimilarProducts from "@/components/similar-products"

const ALL_PRODUCTS = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    price: 1199,
    image: "/iphone-15-pro-max.png",
    images: [
      "/iphone-15-pro-max.png",
      "/iphone-15-pro-max-2.jpg",
      "/iphone-15-pro-max-3.jpg",
      "/iphone-15-pro-max-4.jpg",
    ],
    condition: "new" as const,
    category: "new-phones",
    brand: "Apple",
    description:
      "Experience the ultimate iPhone with the stunning 6.7-inch Super Retina XDR display, powerful A17 Pro chip, and advanced camera system.",
    specs: {
      display: "6.7-inch Super Retina XDR",
      processor: "Apple A17 Pro",
      storage: "256GB",
      ram: "8GB",
      battery: "4685 mAh",
      camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
    },
    rating: 4.8,
    reviews: 324,
    reviewsData: [
      {
        id: 1,
        author: "John Doe",
        rating: 5,
        date: "2024-01-15",
        comment: "Excellent phone! Best camera quality I've ever seen.",
        helpful: 45,
      },
      {
        id: 2,
        author: "Sarah Smith",
        rating: 5,
        date: "2024-01-10",
        comment: "Worth every penny. Performance is incredible.",
        helpful: 32,
      },
      {
        id: 3,
        author: "Mike Johnson",
        rating: 4,
        date: "2024-01-05",
        comment: "Great phone but battery could be better.",
        helpful: 18,
      },
    ],
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 1299,
    image: "/samsung-galaxy-s24-ultra.png",
    images: ["/samsung-galaxy-s24-ultra.png", "/samsung-galaxy-s24-ultra-2.jpg", "/samsung-galaxy-s24-ultra-3.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Samsung",
    description:
      "The ultimate Android flagship with a 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, and revolutionary AI features.",
    specs: {
      display: "6.8-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      storage: "256GB",
      ram: "12GB",
      battery: "5000 mAh",
      camera: "200MP Main + 50MP Ultra Wide + 10MP Telephoto",
    },
    rating: 4.7,
    reviews: 287,
    reviewsData: [
      {
        id: 1,
        author: "Alex Chen",
        rating: 5,
        date: "2024-01-12",
        comment: "Amazing display and performance!",
        helpful: 28,
      },
      {
        id: 2,
        author: "Emma Wilson",
        rating: 4,
        date: "2024-01-08",
        comment: "Good phone, very fast processor.",
        helpful: 15,
      },
    ],
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    price: 999,
    image: "/google-pixel-8-pro.png",
    images: ["/google-pixel-8-pro.png", "/google-pixel-8-pro-2.jpg", "/google-pixel-8-pro-3.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Google",
    description:
      "Google's flagship with advanced AI capabilities, exceptional computational photography, and pure Android experience.",
    specs: {
      display: "6.7-inch OLED",
      processor: "Google Tensor G3",
      storage: "256GB",
      ram: "12GB",
      battery: "5050 mAh",
      camera: "50MP Main + 48MP Ultra Wide + 48MP Telephoto",
    },
    rating: 4.6,
    reviews: 198,
    reviewsData: [
      { id: 1, author: "David Lee", rating: 5, date: "2024-01-14", comment: "Best camera phone ever!", helpful: 52 },
    ],
  },
  {
    id: "4",
    name: "OnePlus 12",
    price: 799,
    image: "/oneplus-12-smartphone.jpg",
    images: ["/oneplus-12-smartphone.jpg", "/oneplus-12-2.jpg", "/oneplus-12-3.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "OnePlus",
    description: "Fast and smooth performance with Snapdragon 8 Gen 3, 120Hz AMOLED display, and OxygenOS.",
    specs: {
      display: "6.7-inch AMOLED",
      processor: "Snapdragon 8 Gen 3",
      storage: "256GB",
      ram: "12GB",
      battery: "5400 mAh",
      camera: "50MP Main + 48MP Ultra Wide + 8MP Telephoto",
    },
    rating: 4.5,
    reviews: 156,
    reviewsData: [
      { id: 1, author: "Lisa Park", rating: 4, date: "2024-01-11", comment: "Great value for money.", helpful: 22 },
    ],
  },
  {
    id: "5",
    name: "iPhone 14 Pro",
    price: 899,
    image: "/iphone-14-pro-used.jpg",
    images: ["/iphone-14-pro-used.jpg"],
    condition: "used" as const,
    category: "used-phones",
    brand: "Apple",
    description:
      "Excellent condition used iPhone 14 Pro with all original accessories. Fully functional and ready to use.",
    specs: {
      display: "6.1-inch Super Retina XDR",
      processor: "Apple A16 Bionic",
      storage: "256GB",
      ram: "6GB",
      battery: "3200 mAh",
      camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
    },
    rating: 4.4,
    reviews: 89,
    reviewsData: [],
  },
  {
    id: "6",
    name: "Samsung Galaxy A54",
    price: 449,
    image: "/samsung-galaxy-a54.png",
    images: ["/samsung-galaxy-a54.png"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Samsung",
    description: "Great mid-range option with 6.4-inch AMOLED display, 50MP camera, and all-day battery life.",
    specs: {
      display: "6.4-inch AMOLED",
      processor: "Exynos 1280",
      storage: "128GB",
      ram: "6GB",
      battery: "5000 mAh",
      camera: "50MP Main + 12MP Ultra Wide + 5MP Macro",
    },
    rating: 4.3,
    reviews: 234,
    reviewsData: [],
  },
  {
    id: "7",
    name: "Xiaomi 14 Ultra",
    price: 699,
    image: "/xiaomi-14-ultra-smartphone.jpg",
    images: ["/xiaomi-14-ultra-smartphone.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Xiaomi",
    description: "Premium smartphone with Leica camera system, 1-inch sensor, and powerful performance.",
    specs: {
      display: "6.73-inch AMOLED",
      processor: "Snapdragon 8 Gen 3",
      storage: "512GB",
      ram: "16GB",
      battery: "5300 mAh",
      camera: "50MP Main + 50MP Ultra Wide + 50MP Telephoto",
    },
    rating: 4.6,
    reviews: 145,
    reviewsData: [],
  },
  {
    id: "8",
    name: "iPhone 13",
    price: 699,
    image: "/iphone-13-smartphone.png",
    images: ["/iphone-13-smartphone.png"],
    condition: "used" as const,
    category: "used-phones",
    brand: "Apple",
    description: "Used iPhone 13 in good condition. Comes with charger and original box.",
    specs: {
      display: "6.1-inch Super Retina XDR",
      processor: "Apple A15 Bionic",
      storage: "256GB",
      ram: "4GB",
      battery: "3240 mAh",
      camera: "12MP Main + 12MP Ultra Wide",
    },
    rating: 4.2,
    reviews: 67,
    reviewsData: [],
  },
  {
    id: "9",
    name: "Samsung Galaxy S23",
    price: 799,
    image: "/images/phone-1.png",
    images: ["/images/phone-1.png"],
    condition: "used" as const,
    category: "used-phones",
    brand: "Samsung",
    description: "Used Samsung Galaxy S23 with minimal wear. Perfect working condition.",
    specs: {
      display: "6.1-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 2",
      storage: "256GB",
      ram: "8GB",
      battery: "4000 mAh",
      camera: "50MP Main + 12MP Ultra Wide + 10MP Telephoto",
    },
    rating: 4.4,
    reviews: 112,
    reviewsData: [],
  },
  {
    id: "10",
    name: "Oppo Find X7",
    price: 899,
    image: "/oppo-find-x7-smartphone.jpg",
    images: ["/oppo-find-x7-smartphone.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Oppo",
    description: "Flagship Oppo with advanced imaging technology and sleek design.",
    specs: {
      display: "6.78-inch AMOLED",
      processor: "Snapdragon 8 Gen 3",
      storage: "512GB",
      ram: "16GB",
      battery: "5910 mAh",
      camera: "50MP Main + 50MP Ultra Wide + 50MP Telephoto",
    },
    rating: 4.5,
    reviews: 178,
    reviewsData: [],
  },
  {
    id: "11",
    name: "Vivo X100",
    price: 749,
    image: "/vivo-x100-smartphone.jpg",
    images: ["/vivo-x100-smartphone.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Vivo",
    description: "Vivo's premium offering with MediaTek Dimensity 9300 and excellent camera performance.",
    specs: {
      display: "6.78-inch AMOLED",
      processor: "MediaTek Dimensity 9300",
      storage: "512GB",
      ram: "16GB",
      battery: "5500 mAh",
      camera: "50MP Main + 50MP Ultra Wide + 50MP Telephoto",
    },
    rating: 4.5,
    reviews: 134,
    reviewsData: [],
  },
  {
    id: "12",
    name: "Realme 12 Pro",
    price: 549,
    image: "/realme-12-pro-smartphone.jpg",
    images: ["/realme-12-pro-smartphone.jpg"],
    condition: "new" as const,
    category: "new-phones",
    brand: "Realme",
    description: "Budget-friendly flagship killer with great performance and camera.",
    specs: {
      display: "6.7-inch AMOLED",
      processor: "Snapdragon 7 Gen 3",
      storage: "256GB",
      ram: "12GB",
      battery: "5000 mAh",
      camera: "50MP Main + 8MP Ultra Wide + 2MP Macro",
    },
    rating: 4.3,
    reviews: 98,
    reviewsData: [],
  },
]

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  // Get product by id from params
  const product = ALL_PRODUCTS.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      condition: product.condition,
    }
    addToCart(item)
  }

  const similarProducts = ALL_PRODUCTS.filter((p) => p.brand === product.brand && p.id !== product.id).slice(0, 4)

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
          <ProductImageGallery images={product.images} productName={product.name} condition={product.condition} />

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
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-border py-6">
                <p className="text-3xl font-bold text-primary mb-2">${product.price.toFixed(2)}</p>
                <p className="text-muted-foreground max-w-prose">{product.description}</p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-bold mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 xl:gap-6">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="font-semibold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

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
          reviews={product.reviewsData || []}
          rating={product.rating}
          totalReviews={product.reviews}
        />

        {similarProducts.length > 0 && <SimilarProducts products={similarProducts} />}
      </div>
    </div>
  )
}

