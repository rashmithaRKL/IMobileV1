"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { lazy, Suspense } from "react"
import { productsService } from "@/lib/supabase/services/products"
import type { Database } from "@/lib/supabase/types"

type Product = Database["public"]["Tables"]["products"]["Row"]

// Lazy load heavy components
const ProductCard = lazy(() => import("@/components/product-card"))
const ProductQuickView = lazy(() => import("@/components/product-quick-view"))
const FilterSidebar = lazy(() => import("@/components/filter-sidebar"))
const MobileShopHeader = lazy(() => import("@/components/mobile-shop-header"))

const LoadingPlaceholder = () => <div className="h-80 bg-muted animate-pulse rounded-lg" />

// Memoized product card component
const MemoizedProductCard = memo(ProductCard)

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState([0, 1399990])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const filters: {
          category?: string
          brand?: string
          minPrice?: number
          maxPrice?: number
          search?: string
        } = {}

        if (selectedCategory) {
          // Handle subcategory selection (e.g., "mobile-phones-apple")
          if (selectedCategory.includes("-")) {
            const [category, brand] = selectedCategory.split("-")
            filters.category = category
            filters.brand = brand.charAt(0).toUpperCase() + brand.slice(1)
          } else {
            filters.category = selectedCategory
          }
        }

        if (selectedBrand) {
          filters.brand = selectedBrand
        }

        if (priceRange[0] > 0 || priceRange[1] < 1399990) {
          filters.minPrice = priceRange[0]
          filters.maxPrice = priceRange[1]
        }

        if (searchQuery) {
          filters.search = searchQuery
        }

        // Add a timeout so we don't hang forever if Supabase is unreachable
        const timeoutMs = 20000
        const data = await Promise.race([
          productsService.getAll(filters),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Products request timed out after ${timeoutMs / 1000}s. This usually means Supabase URL/key are incorrect, the project is paused, or there are network issues.`
                  )
                ),
              timeoutMs
            )
          ),
        ])
        setProducts(data || [])
      } catch (error) {
        console.error("Error loading products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [selectedCategory, selectedBrand, priceRange, searchQuery])

  // Optimized filtering with debouncing
  const filteredProducts = useMemo(() => {
    if (loading) return []

    // Additional client-side filtering if needed
    return products.filter((product) => {
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesPrice
    })
  }, [products, searchQuery, priceRange, loading])

  // Memoized callbacks to prevent unnecessary re-renders
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product)
  }, [])

  const handleCloseQuickView = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  // Simplified animation variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02, // Reduced stagger for faster rendering
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 }, // Reduced movement
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }, // Faster animation
    },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Mobile Header - Fixed */}
      <div className="lg:hidden">
        <Suspense fallback={null}>
          <MobileShopHeader
            onMenuClick={() => setShowSidebar(true)}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-2">Shop Smartphones</h1>
          <p className="text-muted-foreground">Browse our collection of new and used phones</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 lg:pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block">
            <Suspense fallback={<LoadingPlaceholder />}>
              <FilterSidebar
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                priceRange={priceRange as [number, number]}
              onCategoryChange={setSelectedCategory}
              onBrandChange={setSelectedBrand}
              onPriceChange={setPriceRange}
            />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Controls */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <button
                onClick={() => setShowSidebar(true)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Show sidebar</span>
              </button>
              <button className="text-gray-700 dark:text-gray-300" aria-label="Sort products">
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-muted-foreground">
              {loading ? "Loading..." : `Showing ${filteredProducts.length} products`}
            </div>

            {/* Products Grid - Mobile First: 2 columns */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredProducts.map((product) => {
                  // Calculate discount if original_price exists
                  let discount: number | undefined = undefined
                  if (product.original_price && product.price) {
                    const originalPrice = Number(product.original_price)
                    const currentPrice = Number(product.price)
                    if (originalPrice > currentPrice) {
                      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                    }
                  }

                  // Convert database product to ProductCard format
                  const productCardProps = {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image || product.images?.[0] || "/placeholder.svg",
                    condition: product.condition,
                    category: product.category,
                    brand: product.brand || undefined,
                    specs: product.specs ? JSON.stringify(product.specs) : undefined,
                    discount: discount,
                  }
                  return (
                    <motion.div key={product.id} variants={itemVariants}>
                      <Suspense fallback={<LoadingPlaceholder />}>
                        <MemoizedProductCard {...productCardProps} onQuickView={() => handleProductClick(product)} />
                      </Suspense>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                    setSelectedBrand(null)
                    setPriceRange([0, 1399990])
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-card z-50 shadow-xl overflow-y-auto lg:hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Suspense fallback={<LoadingPlaceholder />}>
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    selectedBrand={selectedBrand}
                    priceRange={priceRange as [number, number]}
                    onCategoryChange={setSelectedCategory}
                    onBrandChange={setSelectedBrand}
                    onPriceChange={setPriceRange}
                  />
                </Suspense>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      {selectedProduct && <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}
