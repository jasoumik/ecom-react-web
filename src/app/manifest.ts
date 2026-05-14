import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Prithibee | Baby Care & Skin Care Products',
    short_name: 'Prithibee',
    description: 'Premium baby care and skin care products in Bangladesh',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo2.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo2.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
