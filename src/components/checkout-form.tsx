"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CheckoutFormProps {
  step: number
  onNext: () => void
  onPrevious: () => void
  onComplete: () => void
}

export default function CheckoutForm({ step, onNext, onPrevious, onComplete }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    alternateNumber: "",
    paymentMethod: "cash",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 3) {
      onComplete()
    } else {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
            <Input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Address Line 1</label>
            <Input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Address Line 2 (Optional)</label>
            <Input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Apt 4B"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Postal Code</label>
            <Input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="10001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Alternate Number (Optional)</label>
            <Input
              type="tel"
              name="alternateNumber"
              value={formData.alternateNumber}
              onChange={handleChange}
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

          <div className="space-y-3">
            <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === "cash"}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="ml-3">
                <span className="font-semibold">Cash on Delivery</span>
                <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
              </span>
            </label>

            <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="shop"
                checked={formData.paymentMethod === "shop"}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="ml-3">
                <span className="font-semibold">Book & Pay at Shop</span>
                <p className="text-sm text-muted-foreground">Reserve and pay at our store</p>
              </span>
            </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-6">Order Confirmation</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{formData.fullName}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold">{formData.email}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-semibold text-right">
                {formData.addressLine1}, {formData.postalCode}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-border">
              <span className="text-muted-foreground">Payment:</span>
              <span className="font-semibold capitalize">
                {formData.paymentMethod === "cash" ? "Cash on Delivery" : "Book & Pay at Shop"}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            By placing this order, you agree to our terms and conditions. You will receive a confirmation email shortly.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        {step > 1 && (
          <Button type="button" onClick={onPrevious} variant="outline" className="flex-1 bg-transparent">
            Previous
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {step === 3 ? "Place Order" : "Next"}
        </Button>
      </div>
    </form>
  )
}
