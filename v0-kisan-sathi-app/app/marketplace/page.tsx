"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

interface Product {
  id: string
  name: string
  seller: string
  price: number
  quantity: string
  location: string
  image: string
  rating: number
  reviews: number
  type: "buy" | "sell"
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    seller: "Farmer Ramesh",
    price: 1500,
    quantity: "50 kg",
    location: "Bengaluru",
    image: "🍅",
    rating: 4.8,
    reviews: 24,
    type: "buy",
  },
  {
    id: "2",
    name: "Fresh Onions",
    seller: "Farmer Priya",
    price: 1000,
    quantity: "100 kg",
    location: "Mysuru",
    image: "🧅",
    rating: 4.6,
    reviews: 18,
    type: "buy",
  },
  {
    id: "3",
    name: "Premium Rice",
    seller: "Farmer Kumar",
    price: 2400,
    quantity: "200 kg",
    location: "Mandya",
    image: "🌾",
    rating: 4.9,
    reviews: 42,
    type: "buy",
  },
  {
    id: "4",
    name: "Potatoes",
    seller: "Farmer Suresh",
    price: 750,
    quantity: "75 kg",
    location: "Hassan",
    image: "🥔",
    rating: 4.5,
    reviews: 15,
    type: "buy",
  },
  {
    id: "5",
    name: "Cotton",
    seller: "Farmer Anita",
    price: 5000,
    quantity: "50 kg",
    location: "Belagavi",
    image: "🌾",
    rating: 4.7,
    reviews: 12,
    type: "sell",
  },
  {
    id: "6",
    name: "Wheat",
    seller: "Farmer Rajesh",
    price: 2100,
    quantity: "150 kg",
    location: "Kolar",
    image: "🌾",
    rating: 4.4,
    reviews: 8,
    type: "sell",
  },
]

function MarketplaceContent() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredProducts = mockProducts.filter((p) => p.type === activeTab)

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Marketplace</h2>
        <p className="text-muted-foreground mb-8">Buy and sell agricultural products directly with other farmers</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "buy"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Buy Products
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "sell"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Sell Products
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {["all", "vegetables", "grains", "fruits", "spices"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="bg-muted p-8 flex items-center justify-center text-6xl">{product.image}</div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{product.seller}</p>

                <div className="mb-4 flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-foreground">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.location}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Price per unit</p>
                  <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.quantity}</p>
                </div>

                <Button className="w-full">{activeTab === "buy" ? "Contact Seller" : "View Offer"}</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Sell Product CTA */}
        {activeTab === "sell" && (
          <div className="mt-12 bg-primary text-primary-foreground p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to sell your produce?</h3>
            <p className="mb-6">List your products and connect with buyers directly</p>
            <Button variant="secondary">Create New Listing</Button>
          </div>
        )}
      </main>
    </>
  )
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <MarketplaceContent />
    </ProtectedRoute>
  )
}
