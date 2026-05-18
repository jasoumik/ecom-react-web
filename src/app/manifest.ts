import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Replant Glow | Premium Skincare',
    short_name: 'Replant Glow',
    description: 'Premium skincare for glowing, healthy skin',
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
