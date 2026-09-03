import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IFEHL 2025 (03) - Christian Medical Leadership Training",
  description: "Join us for a transformative experience of practical management and learning for Christian doctors - IFEHL 2025, November 16-23rd at Wholeness House, Gwagalada, Abuja",
  generator: 'Next.js',
  keywords: ["IFEHL", "IfEHL", "Christian medical", "leadership training", "medical conference", "Abuja 2025"],
  authors: [{ name: "IfEHL" }],
  creator: "IfEHL",
  publisher: "IfEHL",
  icons: {
    icon: [
      {
        url: "/IfHEL. Logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/IfHEL. Logo.png",
    apple: "/IfHEL. Logo.png",
  },
  metadataBase: new URL('https://ifehl.cmdanigeria.org'), // Replace with your actual domain
  openGraph: {
    title: "IFEHL 2025 (03) - Christian Medical Leadership Training",
    description: "Join us for a transformative experience of practical management and learning for Christian doctors - IFEHL 2025, November 16-23rd at Wholeness House, Gwagalada, Abuja",
    url: 'https://ifehl.cmdanigeria.org',
    siteName: 'IFEHL 2025',
    images: [
      {
        url: "/IfHEL. Logo.png",
        width: 1200,
        height: 630,
        alt: "IFEHL 2025 (03) - Christian Medical Leadership Training"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IFEHL 2025 (03) - Christian Medical Leadership Training",
    description: "Join us for a transformative experience of practical management and learning for Christian doctors - IFEHL 2025, November 16-23rd at Wholeness House, Gwagalada, Abuja",
    images: ["/IfHEL. Logo.png"],
    creator: "@cmdanigeria",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
