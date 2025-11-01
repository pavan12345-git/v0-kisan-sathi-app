"use client"

import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { useAuth } from "@/components/auth-context"

const mockMandiData = [
  {
    crop: "Tomato",
    minPrice: 1200,
    maxPrice: 1800,
    avgPrice: 1500,
    trend: "up",
    change: 12,
    unit: "₹/quintal",
  },
  {
    crop: "Onion",
    minPrice: 800,
    maxPrice: 1200,
    avgPrice: 1000,
    trend: "down",
    change: -8,
    unit: "₹/quintal",
  },
  {
    crop: "Potato",
    minPrice: 600,
    maxPrice: 900,
    avgPrice: 750,
    trend: "up",
    change: 5,
    unit: "₹/quintal",
  },
  {
    crop: "Rice",
    minPrice: 2000,
    maxPrice: 2800,
    avgPrice: 2400,
    trend: "stable",
    change: 0,
    unit: "₹/quintal",
  },
  {
    crop: "Wheat",
    minPrice: 1800,
    maxPrice: 2400,
    avgPrice: 2100,
    trend: "up",
    change: 3,
    unit: "₹/quintal",
  },
  {
    crop: "Cotton",
    minPrice: 4500,
    maxPrice: 5500,
    avgPrice: 5000,
    trend: "down",
    change: -2,
    unit: "₹/quintal",
  },
]

function MandiContent() {
  const { user } = useAuth()

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Mandi Prices</h2>
        <p className="text-muted-foreground mb-8">Current market prices in {user?.district}</p>

        {/* Price Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMandiData.map((item, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">{item.crop}</h3>
                <div
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    item.trend === "up"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : item.trend === "down"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"} {Math.abs(item.change)}%
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Price</p>
                  <p className="text-2xl font-bold text-foreground">{item.avgPrice}</p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Min</p>
                    <p className="font-semibold text-foreground">{item.minPrice}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Max</p>
                    <p className="font-semibold text-foreground">{item.maxPrice}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Price Table */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-foreground mb-4">Detailed Price List</h3>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Crop</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Min Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Max Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Avg Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMandiData.map((item, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{item.crop}</td>
                      <td className="px-6 py-4 text-foreground">{item.minPrice}</td>
                      <td className="px-6 py-4 text-foreground">{item.maxPrice}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{item.avgPrice}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            item.trend === "up"
                              ? "text-green-600 dark:text-green-400"
                              : item.trend === "down"
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"} {Math.abs(item.change)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}

export default function MandiPricesPage() {
  return (
    <ProtectedRoute>
      <MandiContent />
    </ProtectedRoute>
  )
}
