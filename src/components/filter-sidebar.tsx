"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { productsService } from "@/lib/supabase/services/products"

interface SubCategory {
  id: string
  name: string
  count: number
}

interface Category {
  id: string
  name: string
  count: number
  subcategories?: SubCategory[]
}

interface FilterSidebarProps {
  selectedCategory: string | null
  selectedBrand: string | null
  priceRange: [number, number]
  onCategoryChange: (category: string | null) => void
  onBrandChange: (brand: string | null) => void
  onPriceChange: (range: [number, number]) => void
}

export default function FilterSidebar({
  selectedCategory,
  selectedBrand,
  priceRange,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
  })
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "mobile-phones": false,
  })

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        // Add a timeout so we don't hang forever if Supabase is unreachable
        const timeoutMs = 20000
        const data = await Promise.race([
          productsService.getCategoriesWithCounts(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Category request timed out after ${timeoutMs / 1000}s. This usually means Supabase URL/key are incorrect, the project is paused, or there are network issues.`
                  )
                ),
              timeoutMs
            )
          ),
        ])
        setCategories(data)
      } catch (error) {
        // Only log errors in development to reduce console noise
        // MIGRATION: Vite uses import.meta.env.DEV or import.meta.env.MODE
        if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
          console.error("Error loading categories:", error)
        }
        // Fallback to empty array on error
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleCategoryClick = (categoryId: string) => {
    // Convert formatted ID back to database format (e.g., "Mobile Phones" -> "mobile-phones")
    const dbCategoryId = categoryId.toLowerCase().replace(/\s+/g, '-')
    onCategoryChange(dbCategoryId)
  }

  const handleSubCategoryClick = (subCategoryId: string, categoryId: string) => {
    // Convert category ID to database format
    const dbCategoryId = categoryId.toLowerCase().replace(/\s+/g, '-')
    // Set both category and brand for filtering
    onCategoryChange(dbCategoryId)
    onBrandChange(subCategoryId.charAt(0).toUpperCase() + subCategoryId.slice(1))
  }

  return (
    <div className="space-y-6">
      {/* PRODUCT CATEGORIES Section */}
      <div className="border border-border rounded-lg p-4 bg-white dark:bg-card">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full font-bold text-base mb-4 text-gray-900 dark:text-white uppercase"
        >
          PRODUCT CATEGORIES
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              expandedSections.category ? "" : "-rotate-90"
            }`}
          />
        </button>

        {expandedSections.category && (
          <div className="space-y-1 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            {loading ? (
              <div className="text-center py-4 text-sm text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">No categories found</div>
            ) : (
              categories.map((category) => (
              <div key={category.id} className="mb-1">
                {/* Main Category */}
                <div className="flex items-center justify-between group">
                  <button
                    onClick={() => {
                      if (category.subcategories) {
                        toggleCategory(category.id)
                      } else {
                        handleCategoryClick(category.id)
                      }
                    }}
                    className={`flex items-center flex-1 text-left py-2 px-2 rounded transition-colors text-sm ${
                      selectedCategory === category.id.toLowerCase().replace(/\s+/g, '-')
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {category.subcategories && (
                      <ChevronRight
                        className={`w-3 h-3 mr-1 transition-transform duration-200 ${
                          expandedCategories[category.id] ? "rotate-90" : ""
                        }`}
                      />
                    )}
                    <span className="flex-1">{category.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                      ({category.count})
                    </span>
                  </button>
                </div>

                {/* Subcategories */}
                {category.subcategories && expandedCategories[category.id] && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleSubCategoryClick(subcategory.id, category.id)}
                        className={`flex items-center justify-between w-full text-left py-1.5 px-2 rounded transition-colors text-sm ${
                          selectedBrand === subcategory.name || selectedBrand === subcategory.id.charAt(0).toUpperCase() + subcategory.id.slice(1)
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span>{subcategory.name}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">
                          ({subcategory.count})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* FILTER BY PRICE Section */}
      <div className="border border-border rounded-lg p-4 bg-white dark:bg-card">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full font-bold text-base mb-4 text-gray-900 dark:text-white uppercase"
        >
          FILTER BY PRICE
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              expandedSections.price ? "" : "-rotate-90"
            }`}
          />
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            {/* Price Range Display */}
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Price:</span>
              <span className="text-primary font-semibold">
                Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
              </span>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-4">
              <div>
                <label htmlFor="price-min" className="sr-only">
                  Minimum Price
                </label>
                <input
                  id="price-min"
                  type="range"
                  min="0"
                  max="1399990"
                  step="1000"
                  value={priceRange[0]}
                  onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  aria-label="Minimum price range"
                  title={`Minimum price: Rs. ${priceRange[0].toLocaleString()}`}
                />
              </div>
              <div>
                <label htmlFor="price-max" className="sr-only">
                  Maximum Price
                </label>
                <input
                  id="price-max"
                  type="range"
                  min="0"
                  max="1399990"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  aria-label="Maximum price range"
                  title={`Maximum price: Rs. ${priceRange[1].toLocaleString()}`}
                />
              </div>
            </div>

            {/* Filter Button */}
            <Button
              onClick={() => {
                // Filter action - you can add filtering logic here
                // MIGRATION: Vite uses import.meta.env.DEV or import.meta.env.MODE
                if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
                  console.log("Filter applied:", priceRange)
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2"
            >
              FILTER
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
