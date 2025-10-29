"use client"

import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { useAuth } from "@/components/auth-context"

const mockWeatherData = {
  current: {
    temp: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    rainfall: 0,
  },
  forecast: [
    {
      day: "Tomorrow",
      high: 32,
      low: 22,
      condition: "Sunny",
      icon: "☀️",
      rainfall: 0,
    },
    {
      day: "Day After",
      high: 30,
      low: 20,
      condition: "Rainy",
      icon: "🌧️",
      rainfall: 25,
    },
    {
      day: "3 Days",
      high: 28,
      low: 19,
      condition: "Cloudy",
      icon: "☁️",
      rainfall: 10,
    },
    {
      day: "4 Days",
      high: 31,
      low: 21,
      condition: "Sunny",
      icon: "☀️",
      rainfall: 0,
    },
    {
      day: "5 Days",
      high: 33,
      low: 23,
      condition: "Hot",
      icon: "🔥",
      rainfall: 0,
    },
  ],
  alerts: [
    {
      type: "Warning",
      message: "Heavy rainfall expected in 2 days. Prepare your crops.",
      icon: "⚠️",
    },
    {
      type: "Advisory",
      message: "High humidity levels. Monitor for fungal diseases.",
      icon: "ℹ️",
    },
  ],
}

function WeatherContent() {
  const { user } = useAuth()

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Weather Forecast</h2>
        <p className="text-muted-foreground mb-8">{user?.district}</p>

        {/* Current Weather */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground mb-2">Current Weather</p>
              <div className="text-6xl font-bold text-foreground mb-4">{mockWeatherData.current.temp}°C</div>
              <p className="text-2xl text-foreground mb-6">{mockWeatherData.current.condition}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Humidity</p>
                <p className="text-2xl font-bold text-foreground">{mockWeatherData.current.humidity}%</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Wind Speed</p>
                <p className="text-2xl font-bold text-foreground">{mockWeatherData.current.windSpeed} km/h</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Rainfall</p>
                <p className="text-2xl font-bold text-foreground">{mockWeatherData.current.rainfall} mm</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">UV Index</p>
                <p className="text-2xl font-bold text-foreground">6</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts */}
        {mockWeatherData.alerts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-4">Weather Alerts</h3>
            <div className="space-y-3">
              {mockWeatherData.alerts.map((alert, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-orange-500">
                  <div className="flex gap-4">
                    <div className="text-2xl">{alert.icon}</div>
                    <div>
                      <p className="font-semibold text-foreground">{alert.type}</p>
                      <p className="text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">5-Day Forecast</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {mockWeatherData.forecast.map((day, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                <p className="font-semibold text-foreground mb-4">{day.day}</p>
                <div className="text-4xl mb-4">{day.icon}</div>
                <p className="text-sm text-muted-foreground mb-4">{day.condition}</p>
                <div className="flex justify-center gap-2 mb-4">
                  <span className="font-bold text-foreground">{day.high}°</span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
                <p className="text-xs text-muted-foreground">Rain: {day.rainfall}mm</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default function WeatherPage() {
  return (
    <ProtectedRoute>
      <WeatherContent />
    </ProtectedRoute>
  )
}
