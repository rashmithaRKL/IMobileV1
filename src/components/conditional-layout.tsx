import { useLocation } from "react-router-dom"
import { lazy, Suspense } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

// Lazy load components for code splitting
const PageLoadAnimation = lazy(() => import("@/components/page-load-animation"))
const ScrollToTop = lazy(() => import("@/components/scroll-to-top"))
const ScrollToTopOnNavigation = lazy(() => import("@/components/scroll-to-top-on-navigation"))
const PerformanceMonitor = lazy(() => import("@/components/performance-monitor"))
const BottomNavigation = lazy(() => import("@/components/bottom-navigation"))

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const location = useLocation()
  
  // For admin pages, only render the children (no navbar/footer)
  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>
  }
  
  // For regular pages, render with navbar, footer, and other client-side components
  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTopOnNavigation />
        <PageLoadAnimation />
      </Suspense>
      <Navbar />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <ScrollToTop />
        <PerformanceMonitor />
      </Suspense>
      
      {/* Floating WhatsApp Button - Mobile Only */}
      <motion.a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center text-white lg:hidden"
        aria-label="Contact via WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.a>

      {/* Bottom Navigation - Mobile Only */}
      <div className="lg:hidden">
        <Suspense fallback={null}>
          <BottomNavigation />
        </Suspense>
      </div>
    </>
  )
}
