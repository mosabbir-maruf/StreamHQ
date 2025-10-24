# MAL Fallback Implementation

This document describes the MyAnimeList (MAL) fallback system implemented to handle AniList API rate limiting issues.

## Overview

When AniList API hits rate limits (429 errors), the system automatically falls back to the MyAnimeList API via Jikan to ensure uninterrupted anime data access.

## Architecture

### 1. MAL API Service (`src/api/mal.ts`)
- **Purpose**: Direct interface to MyAnimeList API using Jikan
- **Features**:
  - Built-in rate limiting (1 second delay between requests)
  - Proper error handling for 429 responses
  - Support for all anime discovery endpoints
  - Safe-for-work content filtering

### 2. Data Transformer (`src/utils/malTransformer.ts`)
- **Purpose**: Converts MAL API responses to AniList format
- **Features**:
  - Maintains compatibility with existing components
  - Handles title mapping (English, Japanese, Romaji)
  - Transforms status, format, and genre data
  - Maps MAL studio data to AniList format

### 3. Updated Hooks and Components

#### `useFetchDiscoverAnime` Hook
- **Location**: `src/hooks/useFetchDiscoverAnime.ts`
- **Changes**: Added MAL fallback for all discovery types
- **Fallback Logic**: Only triggers on rate limit errors (429/RATE_LIMIT)

#### `useAnimeDetail` Hook
- **Location**: `src/hooks/useAnimeDetail.ts`
- **Purpose**: New hook for anime detail with MAL fallback
- **Features**: Requires MAL ID for fallback functionality

#### Search Functionality
- **Location**: `src/components/sections/Search/List.tsx`
- **Changes**: Added MAL fallback for anime search
- **Fallback Logic**: Same rate limit detection as other components

## Implementation Details

### Rate Limit Detection
The system detects AniList rate limits by checking:
1. HTTP status code 429
2. Error messages containing "RATE_LIMIT"
3. Error messages containing "Too many" or "429"

### Fallback Flow
```
AniList API Call
       ↓
   Rate Limited?
       ↓ (Yes)
   MAL API Call
       ↓
   Transform Data
       ↓
   Return AniList Format
```

### Data Compatibility
- All MAL responses are transformed to match AniList data structure
- Existing components work without modification
- Maintains all required fields and relationships

## Supported Endpoints

### Discovery Endpoints
- **Trending**: `mal.getTopAnime()`
- **Popular**: `mal.getPopular()`
- **Top Rated**: `mal.getTopRated()`
- **Currently Airing**: `mal.getCurrentlyAiring()`
- **Upcoming**: `mal.getUpcoming()`
- **Movies**: `mal.getMovies()`
- **Genre Filtering**: `mal.getAnimeByGenre()`

### Search Endpoints
- **Anime Search**: `mal.searchAnime()`

### Detail Endpoints
- **Anime by ID**: `mal.getAnimeById()`

## Error Handling

### Primary API (AniList)
- Rate limit errors trigger fallback
- Other errors are re-thrown immediately
- Maintains original error context

### Fallback API (MAL)
- If MAL also fails, original AniList error is thrown
- Logs both AniList and MAL errors for debugging
- Graceful degradation to error states

## Configuration

### Rate Limiting
- **MAL API**: 1 second delay between requests
- **AniList API**: Uses existing rate limit detection

### Content Filtering
- **MAL API**: Safe-for-work content only (`sfw: true`)
- **AniList API**: No changes to existing filtering

## Testing

### Test File
- **Location**: `src/utils/__tests__/malFallback.test.ts`
- **Coverage**: Data transformation and basic functionality
- **Mock Data**: Comprehensive MAL response examples

### Manual Testing
1. Trigger AniList rate limits
2. Verify MAL fallback activation
3. Check data format compatibility
4. Test error handling scenarios

## Benefits

### User Experience
- **Seamless**: No visible interruption when rate limited
- **Consistent**: Same UI and data format
- **Reliable**: Multiple data sources reduce downtime

### Developer Experience
- **Non-Breaking**: No changes to existing components
- **Maintainable**: Clear separation of concerns
- **Debuggable**: Comprehensive logging and error handling

## Limitations

### Data Differences
- **Characters**: MAL doesn't provide character data in basic responses
- **Relations**: MAL doesn't provide relation data in basic responses
- **Recommendations**: MAL doesn't provide recommendation data
- **Banner Images**: MAL doesn't provide banner images
- **Color Information**: MAL doesn't provide cover color data

### API Limitations
- **MAL Rate Limits**: 3 requests per second (handled with delays)
- **MAL ID Required**: Fallback only works when MAL ID is available
- **Data Completeness**: Some AniList features not available in MAL

## Future Improvements

### Potential Enhancements
1. **Caching**: Add Redis caching for MAL responses
2. **Retry Logic**: Implement exponential backoff for both APIs
3. **Health Checks**: Monitor API availability and performance
4. **Load Balancing**: Distribute requests across multiple APIs
5. **Data Enrichment**: Combine data from multiple sources

### Monitoring
1. **Fallback Metrics**: Track fallback usage frequency
2. **Performance Monitoring**: Monitor response times
3. **Error Tracking**: Log and analyze failure patterns
4. **User Impact**: Measure user experience during fallbacks

## Usage Examples

### Basic Discovery
```typescript
// This will automatically fall back to MAL if AniList is rate limited
const animeData = await useFetchDiscoverAnime({
  type: 'trending',
  page: 1
});
```

### Anime Detail
```typescript
// Requires MAL ID for fallback functionality
const { data: anime } = useAnimeDetail({ 
  id: anilistId, 
  malId: malId 
});
```

### Search
```typescript
// Search will fall back to MAL if AniList is rate limited
const searchResults = await fetchData({
  type: 'anime',
  query: 'One Piece',
  page: 1
});
```

## Conclusion

The MAL fallback system provides a robust solution for handling AniList rate limiting while maintaining full compatibility with existing code. The implementation is transparent to users and developers, ensuring a seamless experience even when the primary API is unavailable.
