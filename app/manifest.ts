import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IfEHL - Institute for Excellence In Healthcare and Leadership',
    short_name: 'IfEHL',
    description: 'Institute for Excellence In Healthcare and Leadership - Register for upcoming campaigns and events',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    categories: ['medical', 'education', 'conferences'],
    icons: [
      {
        src: '/ifehl-logo-new.png',
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