"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

interface Tip {
  id: string
  title: string
  description: string
  category: string
  season: string
  icon: string
  difficulty: "easy" | "medium" | "hard"
}

const mockTips: Tip[] = [
  {
    id: "1",
    title: "Soil Testing for Better Yields",
    description:
      "Get your soil tested every 2-3 years to understand nutrient levels. This helps you apply the right fertilizers and save money while improving crop yields.",
    category: "soil",
    season: "all",
    icon: "🧪",
    difficulty: "easy",
  },
  {
    id: "2",
    title: "Drip Irrigation Benefits",
    description:
      "Drip irrigation saves 40-60% water compared to flood irrigation. It delivers water directly to plant roots, reducing disease and improving yields.",
    category: "irrigation",
    season: "all",
    icon: "💧",
    difficulty: "medium",
  },
  {
    id: "3",
    title: "Crop Rotation Strategy",
    description:
      "Rotate crops annually to prevent soil depletion and reduce pest buildup. Plant legumes to fix nitrogen naturally and reduce fertilizer costs.",
    category: "farming",
    season: "all",
    icon: "🔄",
    difficulty: "easy",
  },
  {
    id: "4",
    title: "Monsoon Crop Planning",
    description:
      "June-July is ideal for planting rice, sugarcane, and vegetables. Prepare fields with proper drainage and use quality seeds for better germination.",
    category: "seasonal",
    season: "monsoon",
    icon: "🌧️",
    difficulty: "medium",
  },
  {
    id: "5",
    title: "Summer Vegetable Cultivation",
    description:
      "Grow heat-resistant vegetables like okra, bitter gourd, and bottle gourd. Use mulching to retain soil moisture and reduce water requirements.",
    category: "seasonal",
    season: "summer",
    icon: "☀️",
    difficulty: "easy",
  },
  {
    id: "6",
    title: "Organic Pest Management",
    description:
      "Use neem oil, garlic spray, and beneficial insects to control pests naturally. This reduces chemical costs and produces healthier crops.",
    category: "pest-management",
    season: "all",
    icon: "🐛",
    difficulty: "medium",
  },
  {
    id: "7",
    title: "Composting for Soil Health",
    description:
      "Make compost from farm waste to improve soil structure and fertility. Add 5-10 tons per hectare annually for sustainable farming.",
    category: "soil",
    season: "all",
    icon: "♻️",
    difficulty: "easy",
  },
  {
    id: "8",
    title: "Seed Selection Tips",
    description:
      "Choose certified seeds from reliable sources. Check germination rates and expiry dates. Store seeds in cool, dry places for better viability.",
    category: "farming",
    season: "all",
    icon: "🌱",
    difficulty: "easy",
  },
]

function FarmingTipsContent() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSeason, setSelectedSeason] = useState("all")

  const categories = ["all", "soil", "irrigation", "farming", "seasonal", "pest-management"]
  const seasons = ["all", "monsoon", "summer", "winter"]

  const filteredTips = mockTips.filter((tip) => {
    const categoryMatch = selectedCategory === "all" || tip.category === selectedCategory
    const seasonMatch = selectedSeason === "all" || tip.season === selectedSeason || tip.season === "all"
    return categoryMatch && seasonMatch
  })

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Farming Tips & Best Practices</h2>
        <p className="text-muted-foreground mb-8">Learn proven techniques to improve your farming</p>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Category</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Season</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                    selectedSeason === season
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{tip.icon}</div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    tip.difficulty === "easy"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : tip.difficulty === "medium"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{tip.title}</h3>
              <p className="text-muted-foreground mb-4 flex-1">{tip.description}</p>

              <div className="flex gap-2 pt-4 border-t border-border">
                <span className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                  {tip.category.replace("-", " ")}
                </span>
                {tip.season !== "all" && (
                  <span className="text-xs bg-muted px-2 py-1 rounded text-foreground">{tip.season}</span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredTips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tips found for the selected filters.</p>
          </div>
        )}
      </main>
    </>
  )
}

export default function FarmingTipsPage() {
  return (
    <ProtectedRoute>
      <FarmingTipsContent />
    </ProtectedRoute>
  )
}
