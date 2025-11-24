"use client"

import { useState, memo } from "react"
import { Link } from "react-router-dom"
import { Plus, Minus } from "lucide-react"
import { useCartStore, type CartItem } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  condition: "new" | "used"
  discount?: number
  specs?: string
  onQuickView?: () => void
}

function ProductCard({ id, name, price, image, condition, discount, specs, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cartItems = useCartStore((state) => state.items)
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)

  const cartItem = cartItems.find((item) => item.id === id)
  const quantity = cartItem?.quantity || 0
  const isInCart = quantity > 0

  const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const item: CartItem = {
      id,
      name,
      price,
      image,
      quantity: 1,
      condition,
    }
    addToCart(item)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItem) {
      updateQuantity(id, quantity + 1)
    } else {
      handleAddToCart(e)
    }
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity > 1) {
      updateQuantity(id, quantity - 1)
    } else {
      removeFromCart(id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="bg-white dark:bg-card rounded-lg overflow-hidden border border-gray-200 dark:border-border hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clickable Link Wrapper */}
      <Link to={`/product/${id}`} className="block">
        {/* Image Container - Full Image View */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-muted dark:to-muted/50 overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full"
          >
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="object-contain w-full h-full"
            />
          </motion.div>

          {/* Condition Badge */}
          <motion.div
            className="absolute top-3 right-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                condition === "new" ? "bg-green-500 text-white" : "bg-amber-500 text-white"
              }`}
            >
              {condition === "new" ? "NEW" : "Used"}
            </span>
          </motion.div>

          {/* Discount Badge */}
          {discount && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-md">
                -{discount}%
              </span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 text-gray-900 dark:text-white"
          >
            {name}
          </motion.h3>

          {/* Specs/Details */}
          {specs && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
            >
              {specs}
            </motion.p>
          )}

          {/* Price */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col gap-1"
          >
            {originalPrice && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-primary">
              ${price.toFixed(2)}
            </span>
          </motion.div>
        </div>
      </Link>

      {/* Add to Cart / Quantity Selector - Hidden on mobile, shown on hover for desktop */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 hidden sm:block">
        <AnimatePresence mode="wait" initial={false}>
          {!isInCart ? (
            <motion.button
              key="add-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isHovered ? 1 : 0.7, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={handleAddToCart}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-4 py-2.5 flex items-center justify-between transition-colors duration-200 group"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add</span>
              <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="quantity-selector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1.5"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Minus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              </motion.button>

              <motion.span
                key={quantity}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold text-gray-900 dark:text-white min-w-[1.5rem] text-center"
              >
                {quantity}
              </motion.span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Export memoized component for better performance
export default memo(ProductCard)
