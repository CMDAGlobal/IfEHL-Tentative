"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Calendar,
  Users,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
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
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Campaigns", href: "/admin/campaigns", icon: Calendar },
    { name: "Registrations", href: "/admin/full-details", icon: Users },
    { name: "Email Settings", href: "/admin/email-settings", icon: Mail },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 md:w-20"
        } bg-white border-r border-gray-200`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
            {sidebarOpen && (
              <Link href="/admin" className="flex items-center gap-3">
                <img 
                  src="/ifehl-logo-new.png" 
                  alt="IfEHL" 
                  className="h-8 w-auto object-contain" 
                />
                <span className="text-sm font-semibold text-gray-800">Admin</span>
              </Link>
            )}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 ${
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
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
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
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 md:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <Link
                href="/"
                target="_blank"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
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
