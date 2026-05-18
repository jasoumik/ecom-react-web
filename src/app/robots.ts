import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/cart/', '/checkout/'],
    },
    sitemap: 'https://replantglow.com/sitemap.xml', // Replace with actual domain
  }
}
