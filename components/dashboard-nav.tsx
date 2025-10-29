"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/weather", label: "Weather", icon: "🌤️" },
  { href: "/mandi-prices", label: "Mandi Prices", icon: "📈" },
  { href: "/schemes", label: "Schemes", icon: "📋" },
  { href: "/crop-doctor", label: "Crop Doctor", icon: "🔬" },
  { href: "/marketplace", label: "Marketplace", icon: "🛒" },
  { href: "/chatbot", label: "AI Assistant", icon: "💬" },
  { href: "/farming-tips", label: "Tips", icon: "💡" },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto gap-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
