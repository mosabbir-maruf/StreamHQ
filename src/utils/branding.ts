export type BrandType = 'movie' | 'tv' | 'anime' | 'default';

export interface BrandConfig {
  type: BrandType;
  logo: string;
  color: string;
  name: string;
}

export function detectBrandFromReferrer(): BrandType {
  if (typeof window === 'undefined') return 'default';
  
  const referrer = document.referrer;
  const currentPath = window.location.pathname;
  
  // Check current path first
  if (currentPath.includes('/movie/')) return 'movie';
  if (currentPath.includes('/tv/')) return 'tv';
  if (currentPath.includes('/anime/')) return 'anime';
  
  // Check referrer
  if (referrer.includes('/movie/')) return 'movie';
  if (referrer.includes('/tv/')) return 'tv';
  if (referrer.includes('/anime/')) return 'anime';
  
  return 'default';
}

export function getBrandConfig(type: BrandType): BrandConfig {
  switch (type) {
    case 'movie':
      return {
        type: 'movie',
        logo: '🎬',
        color: 'blue',
        name: 'Movies'
      };
    case 'tv':
      return {
        type: 'tv',
        logo: '📺',
        color: 'yellow',
        name: 'TV Shows'
      };
    case 'anime':
      return {
        type: 'anime',
        logo: '🎌',
        color: 'red',
        name: 'Anime'
      };
    default:
      return {
        type: 'default',
        logo: '🎭',
        color: 'primary',
        name: 'StreamHQ'
      };
  }
}

export function getBrandClasses(color: string): string {
  switch (color) {
    case 'blue':
      return 'text-blue-500 bg-blue-50 border-blue-200';
    case 'yellow':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'red':
      return 'text-red-500 bg-red-50 border-red-200';
    default:
      return 'text-primary bg-primary/10 border-primary/20';
  }
}
