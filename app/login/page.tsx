import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Kisan Sathi</h1>
        </Link>
        <LoginForm />
      </div>
    </main>
  )
}
