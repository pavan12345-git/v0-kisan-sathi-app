"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const mockResponses: { [key: string]: string } = {
  "how to grow tomatoes":
    "To grow tomatoes successfully: 1) Plant in well-draining soil with pH 6.0-6.8, 2) Provide 6-8 hours of sunlight daily, 3) Water regularly but avoid waterlogging, 4) Use stakes or cages for support, 5) Fertilize every 2-3 weeks. Harvest when fully red.",
  "best time to plant rice":
    "The best time to plant rice in Karnataka is June-July during the monsoon season. Prepare fields with proper water management, use quality seeds, and maintain 5-10cm water depth. Harvest after 120-150 days depending on variety.",
  "how to prevent crop diseases":
    "Prevent crop diseases by: 1) Using disease-resistant varieties, 2) Practicing crop rotation, 3) Maintaining proper spacing for air circulation, 4) Avoiding overhead watering, 5) Removing infected plants immediately, 6) Using organic fungicides when needed.",
  "what is soil health":
    "Soil health refers to the soil's ability to support plant growth. Improve it by: 1) Adding organic matter/compost, 2) Avoiding excessive tilling, 3) Using crop rotation, 4) Reducing chemical inputs, 5) Getting soil tested regularly. Healthy soil increases yields and reduces costs.",
  default:
    "I'm here to help with farming questions! Ask me about crop cultivation, disease prevention, soil health, irrigation, or any other farming topic. How can I assist you today?",
}

function ChatbotContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI farming assistant. Ask me anything about farming, crops, diseases, or best practices. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate bot response delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get mock response
    const lowerInput = inputValue.toLowerCase()
    let botResponse = mockResponses.default

    for (const [key, value] of Object.entries(mockResponses)) {
      if (key !== "default" && lowerInput.includes(key)) {
        botResponse = value
        break
      }
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
    setIsLoading(false)
  }

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-4xl mx-auto px-4 py-8 h-screen flex flex-col">
        <h2 className="text-3xl font-bold text-foreground mb-2">AI Farming Assistant</h2>
        <p className="text-muted-foreground mb-6">Get instant answers to your farming questions</p>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden mb-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about farming, crops, diseases..."
                disabled={isLoading}
                className="flex-1 h-12"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()} className="h-12 px-6">
                Send
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Questions */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Quick questions:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "How to grow tomatoes",
              "Best time to plant rice",
              "How to prevent crop diseases",
              "What is soil health",
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(question)
                  setTimeout(() => {
                    const form = document.querySelector("form") as HTMLFormElement
                    form?.dispatchEvent(new Event("submit", { bubbles: true }))
                  }, 0)
                }}
                className="text-xs p-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default function ChatbotPage() {
  return (
    <ProtectedRoute>
      <ChatbotContent />
    </ProtectedRoute>
  )
}
