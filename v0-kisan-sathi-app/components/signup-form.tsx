"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"

const KARNATAKA_DISTRICTS = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Belagavi",
  "Ballari",
  "Bidar",
  "Bijapur",
  "Chikballapur",
  "Chikmagalur",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Gulbarga",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumkur",
  "Udupi",
  "Uttara Kannada",
  "Yadgir",
]

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: "",
    taluk: "",
    village: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.district,
        formData.taluk,
        formData.village
      )
      router.push("/login")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Create Your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Full Name</label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Email Address</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +919876543210 or 9876543210"
            required
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">District</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            className="w-full h-12 px-3 border border-input rounded-md bg-background text-foreground text-base"
          >
            <option value="">Select your district</option>
            {KARNATAKA_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Taluk</label>
          <Input
            type="text"
            name="taluk"
            value={formData.taluk}
            onChange={handleChange}
            placeholder="Your taluk"
            required
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Village</label>
          <Input
            type="text"
            name="village"
            value={formData.village}
            onChange={handleChange}
            placeholder="Your village"
            required
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            className="w-full h-12 text-base"
          />
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </Card>
  )
}
