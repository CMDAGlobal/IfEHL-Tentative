import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Main domain - this serves the main site / homepage
const MAIN_SUBDOMAIN = 'ifehl'

// Reserved subdomains that should not be treated as campaigns
const RESERVED_SUBDOMAINS = [
  'www',
  'admin',
  'api',
  'app',
  'mail',
  'staging',
  'dev',
  'test',
  'ifehl',  // Main site
]

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain from hostname
  // e.g., ifehl-2025-03.cmdanigeria.org -> ifehl-2025-03
  // e.g., ifehl.cmdanigeria.org -> ifehl (main site)
  let subdomain: string | null = null
  
  // Handle production domains
  if (hostname.endsWith('.cmdanigeria.org')) {
    subdomain = hostname.replace('.cmdanigeria.org', '')
  }
  // Handle Vercel preview domains (e.g., ifehl-2025-03.project-name.vercel.app)
  else if (hostname.includes('.vercel.app') && hostname.split('.').length > 3) {
    subdomain = hostname.split('.')[0]
  }
  // Handle localhost with port (e.g., ifehl-2025-03.localhost:3000)
  else if (hostname.includes('localhost')) {
    const parts = hostname.split('.')
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0]
    }
  }

  // If subdomain is 'ifehl' or 'www' or no subdomain, serve the main site
  if (!subdomain || subdomain === MAIN_SUBDOMAIN || subdomain === 'www') {
    // Continue to main site - check admin auth below
  }
  // If we have a campaign subdomain (not reserved), rewrite to campaign page
  else if (!RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    // Don't rewrite if already on a campaign path, admin path, or API
    if (
      !url.pathname.startsWith('/campaigns/') &&
      !url.pathname.startsWith('/admin') &&
      !url.pathname.startsWith('/api') &&
      !url.pathname.startsWith('/_next') &&
      !url.pathname.includes('.')  // Skip static files
    ) {
      // Rewrite to the campaign page
      // e.g., ifehl-2025-03.cmdanigeria.org/ -> /campaigns/ifehl-2025-03
      // e.g., ifehl-2025-03.cmdanigeria.org/success -> /campaigns/ifehl-2025-03/success
      
      const newPath = url.pathname === '/' 
        ? `/campaigns/${subdomain}`
        : `/campaigns/${subdomain}${url.pathname}`
      
      url.pathname = newPath
      return NextResponse.rewrite(url)
    }
  }

  // Check if the request is for the admin page, but not the login page
  if (
    url.pathname.startsWith("/admin") &&
    url.pathname !== "/admin/login"
  ) {
    const authToken = request.cookies.get("admin_token")
    // If no token is present, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
