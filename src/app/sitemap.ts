import { MetadataRoute } from 'next'
import { API_URL } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://prithibee.com' // Replace with actual domain

  // Static routes
  const routes = [
    '',
    '/products',
    '/about',
    '/contact',
    '/brands',
    '/bundles',
    '/offer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic routes (Products)
  let products = []
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`)
    const data = await res.json()
    const productList = Array.isArray(data) ? data : (data.data || [])
    
    products = productList.map((product: any) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at || product.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Failed to fetch products for sitemap', error)
  }

  return [...routes, ...products]
}
