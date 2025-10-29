"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

const mockSchemes = [
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme providing financial support to farmers",
    subsidy: "Up to 50% premium subsidy",
    eligibility: "All farmers growing notified crops",
    deadline: "31 Dec 2025",
    icon: "🛡️",
  },
  {
    name: "Soil Health Card Scheme",
    description: "Free soil testing and health cards for farmers",
    subsidy: "100% free",
    eligibility: "All farmers",
    deadline: "Ongoing",
    icon: "🌱",
  },
  {
    name: "Kisan Credit Card",
    description: "Easy credit facility for agricultural needs",
    subsidy: "Interest subsidy up to 4%",
    eligibility: "Farmers with land holdings",
    deadline: "Ongoing",
    icon: "💳",
  },
  {
    name: "PM-KISAN Scheme",
    description: "Direct income support to farmers",
    subsidy: "₹6000 per year in 3 installments",
    eligibility: "Small and marginal farmers",
    deadline: "Ongoing",
    icon: "💰",
  },
  {
    name: "Rashtriya Krishi Vikas Yojana",
    description: "Agricultural development and infrastructure",
    subsidy: "Up to 50% subsidy on equipment",
    eligibility: "Farmers and agricultural groups",
    deadline: "30 Jun 2025",
    icon: "🚜",
  },
  {
    name: "Paramparagat Krishi Vikas Yojana",
    description: "Organic farming promotion scheme",
    subsidy: "₹50,000 per hectare over 3 years",
    eligibility: "Farmers interested in organic farming",
    deadline: "31 Mar 2025",
    icon: "🌾",
  },
]

function SchemesContent() {
  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Government Schemes</h2>
        <p className="text-muted-foreground mb-8">Explore available subsidies and support programs for farmers</p>

        {/* Schemes Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {mockSchemes.map((scheme, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{scheme.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">{scheme.name}</h3>
                  <p className="text-sm text-muted-foreground">{scheme.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Subsidy/Benefit</p>
                  <p className="font-semibold text-foreground">{scheme.subsidy}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Eligibility</p>
                  <p className="text-sm text-foreground">{scheme.eligibility}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Application Deadline</p>
                  <p className="font-semibold text-foreground">{scheme.deadline}</p>
                </div>
              </div>

              <Button className="w-full">Learn More</Button>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}

export default function SchemesPage() {
  return (
    <ProtectedRoute>
      <SchemesContent />
    </ProtectedRoute>
  )
}
