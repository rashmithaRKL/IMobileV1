"use client"

import { Link } from "react-router-dom"
import { Menu, ShoppingCart, Search, Wifi } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"

interface MobileShopHeaderProps {
  onMenuClick: () => void
  onSearch: (query: string) => void
  searchQuery: string
}

export default function MobileShopHeader({
  onMenuClick,
  onSearch,
  searchQuery,
}: MobileShopHeaderProps) {
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-card border-b border-gray-200 dark:border-border shadow-sm">
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu */}
        <button
          onClick={onMenuClick}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium">MENU</span>
        </button>

        {/* Center: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">I MOBILE</span>
            <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </Link>

        {/* Right: Cart */}
        <Link to="/cart" className="relative">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center font-semibold min-w-[16px]"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for products"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

