import { Link, useLocation } from "react-router-dom"
import { Home, Store, Heart, ShoppingCart, User } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { motion } from "framer-motion"

export default function BottomNavigation() {
  const location = useLocation()
  const pathname = location.pathname
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  
  // For wishlist count - you can add wishlist store later
  const wishlistCount = 0

  const navItems = [
    { href: "/", icon: Home, label: "Shop" },
    { href: "/shop", icon: Store, label: "Shop" },
    { href: "/wishlist", icon: Heart, label: "Wishlist", showBadge: true, badge: wishlistCount },
    { href: "/cart", icon: ShoppingCart, label: "Cart", showBadge: true, badge: cartCount },
    { href: "/profile", icon: User, label: "My account" },
  ]

  const isActive = (item: typeof navItems[0]) => {
    // Special handling for shop page - only second "Shop" (store icon) should be active
    if (pathname.startsWith("/shop")) {
      return item.href === "/shop"
    }
    // For home page, only first "Shop" (home icon) should be active
    if (pathname === "/") {
      return item.href === "/"
    }
    // For other pages, check if pathname starts with the href
    return pathname.startsWith(item.href.split("?")[0])
  }

  return (
    <>
      {/* Bottom Navigation Bar - Compact Design */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-card border-t border-gray-200 dark:border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-1 py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            const showBadge = item.showBadge && item.badge !== undefined
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center px-2 py-1 relative min-w-[60px]"
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      active 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-400"
                    }`}
                  />
                  {showBadge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center font-semibold min-w-[16px]"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 transition-colors leading-tight ${
                    active 
                      ? "text-blue-600 dark:text-blue-400 font-medium" 
                      : "text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
