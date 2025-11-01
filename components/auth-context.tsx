"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  phone?: string
  district?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  signup: (
    email: string,
    password: string,
    name: string,
    phone: string,
    district: string,
    taluk: string,
    village: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("kisan-sathi-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"

  const login = async (phone: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ phone, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = typeof err?.errors === "string" ? err.errors : JSON.stringify(err?.errors ?? {})
        throw new Error(msg || "Login failed")
      }
      const json = await res.json()
      const { access_token, refresh_token, farmer } = json.data

      const authedUser: User = {
        id: String(farmer.id),
        email: farmer.email,
        name: farmer.name,
        phone: farmer.phone,
        district: farmer.district,
      }

      setUser(authedUser)
      localStorage.setItem("kisan-sathi-user", JSON.stringify(authedUser))
      localStorage.setItem("kisan-sathi-access", access_token)
      localStorage.setItem("kisan-sathi-refresh", refresh_token)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    district: string,
    taluk: string,
    village: string
  ) => {
    setIsLoading(true)
    try {
      const [first_name, ...rest] = name.trim().split(" ")
      const last_name = rest.join(" ") || ""
      const payload = {
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
        email,
        first_name,
        last_name,
        password,
        password2: password,
        district,
        taluk,
        village,
      }
      const res = await fetch(`${API_BASE}/api/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = typeof err?.errors === "string" ? err.errors : JSON.stringify(err?.errors ?? {})
        throw new Error(msg || "Signup failed")
      }
      // Do not auto-login; backend requires OTP verification
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("kisan-sathi-user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
