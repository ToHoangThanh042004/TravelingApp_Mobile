"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Send, Hotel, User } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

interface Message {
  id: string
  sender: "user" | "hotel"
  content: string
  timestamp: string
}

interface HotelChatPageProps {
  onBack: () => void
  hotelName: string
}

export function HotelChatPage({ onBack, hotelName }: HotelChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Dữ liệu khởi tạo
  useEffect(() => {
    const dummyMessages: Message[] = [
      {
        id: "1",
        sender: "hotel",
        content: `Xin chào! Tôi là lễ tân khách sạn ${hotelName}. Bạn cần hỗ trợ gì ạ?`,
        timestamp: "09:00",
      },
      {
        id: "2",
        sender: "user",
        content: "Chào bạn, mình muốn hỏi phòng view biển còn trống không?",
        timestamp: "09:01",
      },
      {
        id: "3",
        sender: "hotel",
        content: "Dạ, hiện tại còn 2 phòng view biển vào ngày 12-14/11 ạ 🌊",
        timestamp: "09:02",
      },
    ]
    setMessages(dummyMessages)
  }, [hotelName])

  // Tự động cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: String(Date.now()),
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")

    // Giả lập khách sạn đang gõ và phản hồi
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "hotel",
          content: "Cảm ơn bạn! Chúng tôi sẽ giữ phòng và gửi xác nhận ngay nhé 💌",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border shadow-sm z-10">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Hotel className="w-5 h-5 text-primary" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{hotelName}</h2>
              <p className="text-xs text-green-600">Đang trực tuyến</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Khu vực tin nhắn */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-md mx-auto w-full">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "hotel" && (
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Hotel className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              {msg.content}
              <div className="text-[10px] text-muted-foreground mt-1 text-right">{msg.timestamp}</div>
            </div>
            {msg.sender === "user" && (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Hiển thị khi khách sạn đang gõ */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-end gap-2 justify-start"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Hotel className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted px-4 py-2 rounded-2xl text-sm text-muted-foreground rounded-bl-none">
              <span className="flex gap-1">
                <motion.span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                />
                <motion.span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                />
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
