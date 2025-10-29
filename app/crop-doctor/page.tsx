"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

interface DiseaseResult {
  disease: string
  confidence: number
  description: string
  treatment: string[]
  severity: "low" | "medium" | "high"
}

function CropDoctorContent() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiseaseResult | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResult: DiseaseResult = {
      disease: "Early Blight",
      confidence: 87,
      description:
        "Early blight is a fungal disease that affects tomato plants, causing brown spots with concentric rings on leaves.",
      treatment: [
        "Remove infected leaves immediately",
        "Apply fungicide spray (Mancozeb or Chlorothalonil)",
        "Improve air circulation by pruning lower branches",
        "Avoid overhead watering",
        "Rotate crops next season",
      ],
      severity: "medium",
    }

    setResult(mockResult)
    setIsAnalyzing(false)
  }

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">AI Crop Doctor</h2>
        <p className="text-muted-foreground mb-8">
          Upload a photo of your crop to identify diseases and get treatment advice
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Upload Crop Image</h3>

              <div className="mb-6">
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected crop"
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null)
                        setResult(null)
                      }}
                      className="absolute top-2 right-2"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors">
                    <div className="text-4xl mb-4">📸</div>
                    <p className="font-semibold text-foreground mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="w-full h-12 text-base font-semibold"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Tip:</strong> Take a clear photo of the affected area in good lighting for best results.
                </p>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {result ? (
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🔬</div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{result.disease}</h3>
                      <p className="text-muted-foreground">Confidence: {result.confidence}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.severity === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : result.severity === "medium"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} Severity
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{result.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Recommended Treatment</h4>
                  <ul className="space-y-2">
                    {result.treatment.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" className="w-full mt-6 bg-transparent">
                  Get Expert Consultation
                </Button>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🌾</div>
                <p className="text-muted-foreground">Upload an image to get started with disease detection</p>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Analyses</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { disease: "Powdery Mildew", date: "2 days ago", status: "Treated" },
              { disease: "Leaf Spot", date: "1 week ago", status: "Monitoring" },
              { disease: "Rust", date: "2 weeks ago", status: "Resolved" },
            ].map((item, idx) => (
              <Card key={idx} className="p-4">
                <p className="font-semibold text-foreground mb-1">{item.disease}</p>
                <p className="text-sm text-muted-foreground mb-3">{item.date}</p>
                <span className="text-xs px-2 py-1 bg-muted rounded-full text-foreground">{item.status}</span>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default function CropDoctorPage() {
  return (
    <ProtectedRoute>
      <CropDoctorContent />
    </ProtectedRoute>
  )
}
