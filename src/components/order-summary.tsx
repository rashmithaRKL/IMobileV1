"use client"

import { useCartStore } from "@/lib/store"

export default function OrderSummary() {
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  const subtotal = getTotalPrice()
  const shipping = subtotal > 500 ? 0 : 10
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className="bg-muted border border-border rounded-lg p-6 h-fit sticky top-20">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      {/* Items */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold line-clamp-1">{item.name}</p>
              <p className="text-muted-foreground">Qty: {item.quantity}</p>
              <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
