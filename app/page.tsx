import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🌾</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Kisan Sathi</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Your Smart Farming Companion
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Kisan Sathi helps Karnataka farmers make better decisions with real-time weather updates, market prices,
              government schemes, and AI-powered crop health monitoring.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-8 flex items-center justify-center min-h-96">
            <div className="text-6xl">🌾</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Powerful Features for Farmers</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Weather Updates",
              description: "Real-time weather forecasts and alerts for your region",
              icon: "🌤️",
            },
            {
              title: "Mandi Prices",
              description: "Current market prices for crops in Karnataka mandis",
              icon: "📊",
            },
            {
              title: "Government Schemes",
              description: "Information about subsidies and support programs",
              icon: "📋",
            },
            {
              title: "AI Crop Doctor",
              description: "Identify crop diseases with image recognition",
              icon: "🔬",
            },
            {
              title: "Marketplace",
              description: "Buy and sell agricultural products directly",
              icon: "🛒",
            },
            {
              title: "AI Chatbot",
              description: "Get farming advice and tips 24/7",
              icon: "💬",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Farming?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of Karnataka farmers using Kisan Sathi to increase yields and reduce costs.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Kisan Sathi. Empowering Karnataka Farmers.</p>
        </div>
      </footer>
    </main>
  )
}
