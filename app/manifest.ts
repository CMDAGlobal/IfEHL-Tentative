import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IFEHL 2025 (03) - Christian Medical Leadership Training',
    short_name: 'IFEHL 2025',
    description: 'Join us for a transformative experience of practical management and learning for Christian doctors - IFEHL 2025, November 16-23rd at Wholeness House, Gwagalada, Abuja',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    categories: ['medical', 'education', 'conferences'],
    icons: [
      {
        src: '/IfHEL. Logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}