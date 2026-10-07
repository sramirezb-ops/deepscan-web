import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://deepscan.com.co/', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://deepscan.com.co/politica-de-privacidad-y-tratamiento-de-datos/', changeFrequency: 'yearly', priority: 0.2 },
  ];
}
