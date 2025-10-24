# HiAnime Integration Guide

This document explains how the HiAnime API has been integrated into the StreamHQ anime streaming platform.

## Overview

The integration adds HiAnime as a premium streaming source for anime content, providing:
- Multiple quality options (1080p, 720p, 480p, 360p)
- Both sub and dub variants
- Real-time streaming links
- Server selection with different quality options

## Architecture

### API Endpoints

1. **`/api/anime/sources/[anilistId]`** - Get available streaming sources
2. **`/api/anime/hianime/search`** - Search anime in HiAnime by AniList title
3. **`/api/anime/hianime/episodes/[hianimeId]`** - Get episodes for a specific anime
4. **`/api/anime/hianime/servers/[episodeId]`** - Get available servers for an episode
5. **`/api/anime/hianime/stream/[episodeId]`** - Get streaming links for specific server/quality

### Services

- **`HiAnimeService`** - Main service class handling all HiAnime API interactions
- Caching system for improved performance
- Error handling and fallback mechanisms

### Frontend Integration

- Updated `getAnimePlayers()` function to be async and include HiAnime sources
- Enhanced source selection UI with quality and type information
- Loading states for better user experience

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# HiAnime API Configuration
HIANIME_API_URL=http://localhost:3030
NEXT_PUBLIC_HIANIME_API_URL=http://localhost:3030
```

### 2. Start HiAnime API Server

Make sure the HiAnime API server is running on the configured port (default: 3030):

```bash
cd hianime-api
bun install
bun run dev
```

### 3. Deploy Configuration

For production, update the environment variables to point to your deployed HiAnime API instance.

## Features

### Source Selection

The anime watch page now displays:
- **HiAnime sources** with quality indicators (1080p, 720p, etc.)
- **Sub/Dub variants** clearly labeled
- **Provider badges** (HiAnime, VidSrc, NontonGo)
- **Quality indicators** for HiAnime sources

### Streaming Quality

HiAnime provides multiple quality options:
- **1080p** - Highest quality (recommended)
- **720p** - High quality
- **480p** - Medium quality
- **360p** - Lower quality

### Server Options

Each quality level may have multiple servers:
- **HD-1, HD-2, HD-3** - High definition servers
- **SD-1, SD-2** - Standard definition servers

## API Flow

1. **User visits anime page** → Frontend calls `getAnimePlayers()`
2. **Search anime** → `HiAnimeService.searchAnime()` finds anime in HiAnime
3. **Get episodes** → `HiAnimeService.getEpisodes()` fetches episode list
4. **Generate players** → Creates player objects for each quality/type combination
5. **User selects source** → Player loads with HiAnime streaming link

## Error Handling

- **Search failures** → Falls back to other sources (VidSrc, NontonGo)
- **API timeouts** → Graceful degradation with loading states
- **Invalid episodes** → Skips unavailable episodes
- **Server errors** → Retries with different servers

## Caching

The `HiAnimeService` includes intelligent caching:
- **Search results** cached by AniList ID
- **Episode lists** cached by HiAnime ID
- **Server lists** cached by episode ID
- **Cache clearing** available via `HiAnimeService.clearCache()`

## Performance Considerations

- **Async loading** - Sources load in background
- **Progressive enhancement** - Other sources load first
- **Caching** - Reduces API calls
- **Error boundaries** - Prevents crashes

## Troubleshooting

### Common Issues

1. **"No sources available"**
   - Check if HiAnime API is running
   - Verify environment variables
   - Check network connectivity

2. **"Loading sources" stuck**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check CORS configuration

3. **Poor video quality**
   - Try different quality options
   - Check server availability
   - Verify network speed

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG_HIANIME=true
```

## Future Enhancements

- **Quality auto-selection** based on user's connection speed
- **Favorites system** for preferred sources
- **Offline caching** for watched episodes
- **Analytics** for source performance tracking

## Support

For issues related to:
- **HiAnime API** - Check the hianime-api repository
- **Integration** - Check this documentation
- **Frontend** - Check the main StreamHQ repository

---

This integration provides a seamless anime streaming experience with multiple high-quality sources and robust error handling.
