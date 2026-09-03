"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Calendar,
  Users,
  FileText,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = () => {
    // Clear any auth tokens
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Campaigns", href: "/admin/campaigns", icon: Calendar },
    { name: "Registrations", href: "/admin/full-details", icon: Users },
    { name: "Email Settings", href: "/admin/email-settings", icon: Mail },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 md:w-20"
        } bg-gradient-to-b from-purple-900 to-purple-800 shadow-xl`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-purple-700">
            {sidebarOpen && (
              <Link href="/admin" className="flex items-center gap-2">
                <div className="rounded-lg bg-white p-2">
                  <Calendar className="h-5 w-5 text-purple-900" />
                </div>
                <span className="text-lg font-bold text-white">IfEHL Admin</span>
              </Link>
            )}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-white hover:bg-purple-700 transition-colors"
              >
                {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-white text-purple-900 shadow-md"
                      : "text-purple-100 hover:bg-purple-700 hover:text-white"
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-purple-700 p-4">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-purple-100 transition-all hover:bg-purple-700 hover:text-white ${
                !sidebarOpen ? "justify-center" : ""
              }`}
              title={!sidebarOpen ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Admin Portal</span>
              </div>
              <Link
                href="/"
                target="_blank"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
