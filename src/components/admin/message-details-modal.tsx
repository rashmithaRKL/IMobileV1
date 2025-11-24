"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMessageStore } from "@/lib/message-store"

interface MessageDetailsModalProps {
  messageId: string
  onClose: () => void
}

export default function MessageDetailsModal({ messageId, onClose }: MessageDetailsModalProps) {
  const messages = useMessageStore((state) => state.messages)
  const updateMessageStatus = useMessageStore((state) => state.updateMessageStatus)
  const message = messages.find((m) => m.id === messageId)

  if (!message) return null

  const statuses = ["Unread", "Read", "Replied"] as const

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
          <h2 className="text-2xl font-bold">Message Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Sender Info */}
          <div className="border-b border-border pb-6">
            <h3 className="font-bold mb-4">From</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{message.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${message.email}`} className="text-primary hover:underline font-semibold">
                  {message.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{message.date}</p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="border-b border-border pb-6">
            <h3 className="font-bold mb-4">Message</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold mb-2">{message.subject}</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-sm font-semibold mb-3">Update Status</p>
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={message.status === status ? "default" : "outline"}
                  onClick={() => updateMessageStatus(message.id, status)}
                  className="bg-transparent"
                >
                  {status}
                </Button>
              ))}
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
