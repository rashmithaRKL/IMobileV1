"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/lib/order-store"

interface OrderDetailsModalProps {
  orderId: string
  onClose: () => void
}

export default function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const orders = useOrderStore((state) => state.orders)
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus)
  const order = orders.find((o) => o.id === orderId)

  if (!order) return null

  const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Order Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{order.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t border-border pt-6">
            <h3 className="font-bold mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{order.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold">{order.address}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-border pt-6">
            <h3 className="font-bold mb-4">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-border pt-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg font-bold">Total Amount</p>
              <p className="text-2xl font-bold text-primary">${order.total}</p>
            </div>

            {/* Status Update */}
            <div>
              <p className="text-sm font-semibold mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={order.status === status ? "default" : "outline"}
                    onClick={() => updateOrderStatus(order.id, status)}
                    className="bg-transparent"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
