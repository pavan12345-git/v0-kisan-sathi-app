"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  revenue: number
}

interface User {
  id: string
  name: string
  email: string
  district: string
  joinDate: string
  status: "active" | "inactive"
}

interface Transaction {
  id: string
  user: string
  type: string
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
}

const mockStats: AdminStats = {
  totalUsers: 1250,
  activeUsers: 890,
  totalTransactions: 3420,
  revenue: 245000,
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Ramesh Kumar",
    email: "ramesh@example.com",
    district: "Bengaluru",
    joinDate: "2025-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Priya Singh",
    email: "priya@example.com",
    district: "Mysuru",
    joinDate: "2025-01-20",
    status: "active",
  },
  {
    id: "3",
    name: "Suresh Patel",
    email: "suresh@example.com",
    district: "Hassan",
    joinDate: "2025-01-10",
    status: "inactive",
  },
  {
    id: "4",
    name: "Anita Sharma",
    email: "anita@example.com",
    district: "Belagavi",
    joinDate: "2025-01-25",
    status: "active",
  },
]

const mockTransactions: Transaction[] = [
  {
    id: "1",
    user: "Ramesh Kumar",
    type: "Marketplace Sale",
    amount: 5000,
    date: "2025-01-28",
    status: "completed",
  },
  {
    id: "2",
    user: "Priya Singh",
    type: "Marketplace Purchase",
    amount: 3500,
    date: "2025-01-27",
    status: "completed",
  },
  {
    id: "3",
    user: "Suresh Patel",
    type: "Scheme Application",
    amount: 15000,
    date: "2025-01-26",
    status: "pending",
  },
  {
    id: "4",
    user: "Anita Sharma",
    type: "Marketplace Sale",
    amount: 8000,
    date: "2025-01-25",
    status: "completed",
  },
]

function AdminContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "transactions" | "content">("overview")

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🌾</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Kisan Sathi Admin</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {[
              { id: "overview", label: "Overview" },
              { id: "users", label: "Users" },
              { id: "transactions", label: "Transactions" },
              { id: "content", label: "Content Management" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{mockStats.totalUsers}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">+12% this month</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Active Users</p>
                <p className="text-3xl font-bold text-foreground">{mockStats.activeUsers}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((mockStats.activeUsers / mockStats.totalUsers) * 100)}% active
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Transactions</p>
                <p className="text-3xl font-bold text-foreground">{mockStats.totalTransactions}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">+8% this month</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Revenue</p>
                <p className="text-3xl font-bold text-foreground">₹{mockStats.revenue / 1000}K</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">+15% this month</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {mockUsers.slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.district}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {mockTransactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <p className="font-semibold text-foreground">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.user}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">₹{tx.amount}</p>
                        <p
                          className={`text-xs ${
                            tx.status === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : tx.status === "pending"
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-foreground">User Management</h2>
              <Button>Add New User</Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">District</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Join Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                        <td className="px-6 py-4 text-foreground">{user.email}</td>
                        <td className="px-6 py-4 text-foreground">{user.district}</td>
                        <td className="px-6 py-4 text-foreground">{user.joinDate}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Transaction History</h2>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">User</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{tx.user}</td>
                        <td className="px-6 py-4 text-foreground">{tx.type}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">₹{tx.amount}</td>
                        <td className="px-6 py-4 text-foreground">{tx.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              tx.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : tx.status === "pending"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === "content" && (
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Content Management</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Weather Data</h3>
                <p className="text-muted-foreground mb-4">Manage weather forecasts and alerts</p>
                <Button className="w-full">Manage Weather</Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Mandi Prices</h3>
                <p className="text-muted-foreground mb-4">Update market prices for crops</p>
                <Button className="w-full">Manage Prices</Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Government Schemes</h3>
                <p className="text-muted-foreground mb-4">Add and update scheme information</p>
                <Button className="w-full">Manage Schemes</Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Farming Tips</h3>
                <p className="text-muted-foreground mb-4">Create and publish farming tips</p>
                <Button className="w-full">Manage Tips</Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  )
}
