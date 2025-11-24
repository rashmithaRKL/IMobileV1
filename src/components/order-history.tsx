"use client"

import { motion } from "framer-motion"
import { Package, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const MOCK_ORDERS = [
  {
    id: "PH001",
    date: "2024-01-15",
    total: 1299,
    status: "Delivered",
    items: 1,
  },
  {
    id: "PH002",
    date: "2024-01-10",
    total: 899,
    status: "Delivered",
    items: 1,
  },
  {
    id: "PH003",
    date: "2024-01-05",
    total: 1599,
    status: "In Transit",
    items: 2,
  },
  {
    id: "PH004",
    date: "2023-12-28",
    total: 449,
    status: "Delivered",
    items: 1,
  },
  {
    id: "PH005",
    date: "2023-12-20",
    total: 799,
    status: "Delivered",
    items: 1,
  },
]

export default function OrderHistory() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "In Transit":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {MOCK_ORDERS.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        MOCK_ORDERS.map((order) => (
          <motion.div
            key={order.id}
            variants={itemVariants}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="text-right mr-4">
                <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{order.items} item(s)</p>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  )
}
