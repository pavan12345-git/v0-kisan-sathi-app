"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"

export function LoginForm() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(phone, password)
      router.push("/dashboard")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +919876543210 or 9876543210"
            required
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full h-12 text-base"
          />
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </Card>
  )
}
