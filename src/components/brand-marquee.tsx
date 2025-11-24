"use client"

import { motion } from "framer-motion"

const BRANDS = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme"]

export default function BrandMarquee() {
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-12"
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...BRANDS, ...BRANDS].map((brand, i) => (
          <div
            key={i}
            className="flex items-center justify-center min-w-max px-8 py-4 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {brand}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
