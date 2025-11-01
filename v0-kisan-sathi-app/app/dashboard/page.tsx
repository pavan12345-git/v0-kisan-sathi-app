"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { useAuth } from "@/components/auth-context"

const features = [
  {
    title: "Weather Updates",
    description: "Real-time weather forecasts and alerts",
    icon: "🌤️",
    href: "/weather",
    color: "bg-blue-50 dark:bg-blue-950",
  },
  {
    title: "Mandi Prices",
    description: "Current market prices for crops",
    icon: "📈",
    href: "/mandi-prices",
    color: "bg-green-50 dark:bg-green-950",
  },
  {
    title: "Government Schemes",
    description: "Subsidies and support programs",
    icon: "📋",
    href: "/schemes",
    color: "bg-purple-50 dark:bg-purple-950",
  },
  {
    title: "AI Crop Doctor",
    description: "Identify crop diseases with AI",
    icon: "🔬",
    href: "/crop-doctor",
    color: "bg-orange-50 dark:bg-orange-950",
  },
  {
    title: "Marketplace",
    description: "Buy and sell agricultural products",
    icon: "🛒",
    href: "/marketplace",
    color: "bg-red-50 dark:bg-red-950",
  },
  {
    title: "AI Assistant",
    description: "Get farming advice 24/7",
    icon: "💬",
    href: "/chatbot",
    color: "bg-indigo-50 dark:bg-indigo-950",
  },
]

function DashboardContent() {
  const { user } = useAuth()

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">You're farming in {user?.district}. Here's what you can do today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-4xl mb-2">🌾</div>
            <p className="text-sm text-muted-foreground mb-1">Active Crops</p>
            <p className="text-2xl font-bold text-foreground">3</p>
          </Card>
          <Card className="p-6">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-muted-foreground mb-1">Market Updates</p>
            <p className="text-2xl font-bold text-foreground">12</p>
          </Card>
          <Card className="p-6">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm text-muted-foreground mb-1">Alerts</p>
            <p className="text-2xl font-bold text-foreground">2</p>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Explore Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className={`p-6 h-full hover:shadow-lg transition-shadow cursor-pointer ${feature.color}`}>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h4>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="outline" size="sm">
                    Explore
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h3>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <div className="text-2xl">🌤️</div>
                <div>
                  <p className="font-semibold text-foreground">Weather Alert</p>
                  <p className="text-sm text-muted-foreground">Heavy rainfall expected in your region tomorrow</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <div className="text-2xl">📈</div>
                <div>
                  <p className="font-semibold text-foreground">Market Update</p>
                  <p className="text-sm text-muted-foreground">Tomato prices increased by 15% in your mandi</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="font-semibold text-foreground">Farming Tip</p>
                  <p className="text-sm text-muted-foreground">Best time to plant rice in your region is next week</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
