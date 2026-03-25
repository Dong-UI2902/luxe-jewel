import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    {
      url: `${baseUrl}/homepage`,
      lastModified: new Date('2026-03-16'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/product-listing`,
      lastModified: new Date('2026-03-16'),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/product-detail`,
      lastModified: new Date('2026-03-16'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shopping-cart-checkout`,
      lastModified: new Date('2026-03-16'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/admin-dashboard`,
      lastModified: new Date('2026-03-16'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}