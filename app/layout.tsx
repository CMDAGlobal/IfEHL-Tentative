import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IfEHL - Institute for Excellence In Healthcare and Leadership",
  description: "Institute for Excellence In Healthcare and Leadership - Register for upcoming campaigns and events",
  generator: 'Next.js',
  keywords: ["IFEHL", "IfEHL", "healthcare", "leadership training", "medical conference"],
  authors: [{ name: "IfEHL" }],
  creator: "IfEHL",
  publisher: "IfEHL",
  icons: {
    icon: [
      {
        url: "/ifehl-logo-new.png",
        type: "image/png",
      },
    ],
    shortcut: "/ifehl-logo-new.png",
    apple: "/ifehl-logo-new.png",
  },
  metadataBase: new URL('https://ifehl.cmdanigeria.org'),
  openGraph: {
    title: "IfEHL - Institute for Excellence In Healthcare and Leadership",
    description: "Institute for Excellence In Healthcare and Leadership - Register for upcoming campaigns and events",
    url: 'https://ifehl.cmdanigeria.org',
    siteName: 'IfEHL',
    images: [
      {
        url: "/ifehl-logo-new.png",
        width: 1200,
        height: 630,
        alt: "IfEHL - Institute for Excellence In Healthcare and Leadership"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IfEHL - Institute for Excellence In Healthcare and Leadership",
    description: "Institute for Excellence In Healthcare and Leadership - Register for upcoming campaigns and events",
    images: ["/ifehl-logo-new.png"],
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
