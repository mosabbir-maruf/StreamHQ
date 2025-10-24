import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'
  const currentDate = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/aboutandfaq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/movie-request`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/auth/reset-password`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  // Dynamic discover pages for movies
  const movieCategories = [
    'popular',
    'thisWeekTrending', 
    'topRated',
    'nowPlaying',
    'bollywood',
    'tamil',
    'telugu',
    'kannada',
    'malayalam',
    'bangla'
  ]

  const moviePages = movieCategories.map(category => ({
    url: `${baseUrl}/discover?type=movies&category=${category}`,
    lastModified: currentDate,
    changeFrequency: category === 'thisWeekTrending' || category === 'nowPlaying' ? 'daily' as const : 'weekly' as const,
    priority: category === 'popular' || category === 'thisWeekTrending' ? 0.8 : 0.6,
  }))

  // Dynamic discover pages for TV shows
  const tvCategories = [
    'popular',
    'thisWeekTrending',
    'topRated', 
    'onTheAir',
    'bollywoodTv',
    'banglaTv',
    'tamilTv'
  ]

  const tvPages = tvCategories.map(category => ({
    url: `${baseUrl}/discover?type=tvShows&category=${category}`,
    lastModified: currentDate,
    changeFrequency: category === 'thisWeekTrending' || category === 'onTheAir' ? 'daily' as const : 'weekly' as const,
    priority: category === 'popular' || category === 'thisWeekTrending' ? 0.8 : 0.6,
  }))

  // Dynamic discover pages for anime
  const animeCategories = [
    'trending',
    'popular',
    'topRated',
    'airing',
    'upcoming',
    'animeMovies'
  ]

  const animePages = animeCategories.map(category => ({
    url: `${baseUrl}/discover?type=anime&category=${category}`,
    lastModified: currentDate,
    changeFrequency: category === 'trending' || category === 'airing' ? 'daily' as const : 'weekly' as const,
    priority: category === 'trending' || category === 'popular' ? 0.8 : 0.6,
  }))

  return [...staticPages, ...moviePages, ...tvPages, ...animePages]
}
