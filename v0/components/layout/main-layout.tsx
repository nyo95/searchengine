"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Package, Building2, Calendar, Menu, X } from "lucide-react"
import { useState } from "react"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Search", icon: Search },
    { href: "/products", label: "Products", icon: Package },
    { href: "/brands", label: "Brands", icon: Building2 },
    { href: "/scheduler", label: "Scheduler", icon: Calendar },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
        transition-transform duration-200 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
      `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-semibold tracking-tight">Catalog</h1>
            <p className="text-xs text-muted-foreground mt-1">Material Management</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                      transition-colors duration-150
                      ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border text-xs text-muted-foreground">
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b border-border bg-card h-16 flex items-center px-4 md:px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-muted rounded-md">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
