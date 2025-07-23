
import { surahs } from '@/lib/quran';
import type { MetadataRoute } from 'next';

const URL = 'https://tadber.youssef-ait-lahcen.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const surahUrls = surahs.map((surah) => ({
    url: `${URL}/surah/${surah.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${URL}/spiritual-clinic`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${URL}/record`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${URL}/settings`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...surahUrls];
}
