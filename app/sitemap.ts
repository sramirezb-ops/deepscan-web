import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: 'https://deepscan.com.co/', changeFrequency: 'monthly', priority: 1 }];
}
