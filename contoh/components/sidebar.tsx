"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutGrid, BookOpen, Search, Tag, FolderOpen, Building2, Users, Settings, ChevronDown } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const menuSections = [
    {
      icon: <LayoutGrid className="w-4 h-4" />,
      label: "Overview",
      description: "Ringkasan aktivitas & status sistem",
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: "Dashboard",
      description: "Ringkasan KPI & workflow terakhir",
      submenu: ["Dashboard KPI", "Workflow Status", "Team Performance"],
    },
    {
      icon: <Tag className="w-4 h-4" />,
      label: "Material Management",
      description: "Kelola katalog material, search & kategori",
      submenu: ["Search & Discovery", "Material Catalog", "Categories"],
    },
    {
      icon: <FolderOpen className="w-4 h-4" />,
      label: "Project Management",
      description: "Perencanaan dan jadwal proyék",
      submenu: ["Active Projects", "Project Templates", "Create Project", "Schedule Items"],
    },
    {
      icon: <Building2 className="w-4 h-4" />,
      label: "Brand & Supplier",
      description: "Kontak brand + resource supplier",
      submenu: ["Brand Directory", "Contact Management", "Supplier Portal"],
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "Settings",
      description: "Pengaturan sistem & preferensi",
      submenu: ["Preferences", "System Admin", "Admin Panel"],
    },
  ]

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-300 z-50
        ${isOpen ? "w-64" : "w-0"} lg:w-64
      `}
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-foreground rounded text-background flex items-center justify-center text-xs font-bold">
              S
            </div>
            <span className="font-semibold text-sidebar-foreground hidden lg:inline text-sm">Search</span>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-transparent text-sidebar-foreground rounded border border-sidebar-border placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring/30"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <button
                onClick={() => setExpandedMenu(expandedMenu === section.label ? null : section.label)}
                className="w-full px-4 py-2.5 flex items-start gap-3 rounded hover:bg-sidebar-accent transition-colors text-left group"
              >
                <span className="text-sidebar-primary mt-0.5 flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                </div>
                {section.submenu && (
                  <ChevronDown
                    className={`flex-shrink-0 w-3 h-3 text-muted-foreground transition-transform ${
                      expandedMenu === section.label ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {section.submenu && expandedMenu === section.label && (
                <div className="ml-7 space-y-1 border-l border-sidebar-border/50 pl-3 mt-1">
                  {section.submenu.map((item, i) => (
                    <button
                      key={i}
                      className="w-full px-4 py-1.5 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded transition-colors text-left"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Users className="w-3.5 h-3.5 mr-2" />
            Support
          </Button>
        </div>
      </div>
    </aside>
  )
}
