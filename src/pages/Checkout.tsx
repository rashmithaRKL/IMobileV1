"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store"
import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          <div className="bg-muted border border-border rounded-lg p-6 mb-8 text-left">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="font-bold text-lg mb-4">#PH{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground mb-2">Estimated Delivery</p>
            <p className="font-semibold">3-5 Business Days</p>
          </div>

          <div className="space-y-3">
            <Link to="/profile" className="block">
              <Button className="w-full">View Order Details</Button>
            </Link>
            <Link to="/shop" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </motion.div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${s < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? "font-semibold" : "text-muted-foreground"}>Shipping</span>
            <span className={step >= 2 ? "font-semibold" : "text-muted-foreground"}>Payment</span>
            <span className={step >= 3 ? "font-semibold" : "text-muted-foreground"}>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CheckoutForm
                step={step}
                onNext={() => setStep(step + 1)}
                onPrevious={() => setStep(step - 1)}
                onComplete={() => {
                  setOrderPlaced(true)
                  clearCart()
                }}
              />
            </motion.div>
          </div>

          {/* Order Summary */}
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
