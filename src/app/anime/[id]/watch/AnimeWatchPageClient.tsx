"use client";

import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { 
  mutateAnimeTitle, 
  getAnimeCoverUrl, 
  cleanAnimeDescription,
  normalizeAnimeScore,
  getAnimeYear,
  formatAnimeStatus,
  animeDurationString,
  formatAnimeFormat
} from "@/utils/anime";
import { getAnimePlayers, loadHiAnimePlayers } from "@/utils/players";
import { Card, Skeleton, Image, Chip, Button, Divider, Spinner } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { AnimeMedia } from "@/api/anilist";
import { PlayersProps } from "@/types";
import { List, Calendar, Clock } from "@/utils/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dynamic imports for better performance - split large component
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const EpisodeSelection = dynamic(() => import("@/components/sections/Anime/Player/EpisodeSelection"));
const ActionButton = dynamic(() => import("@/components/sections/Movie/Player/ActionButton"));
const BackButton = dynamic(() => import("@/components/ui/button/BackButton"));
const Genres = dynamic(() => import("@/components/ui/other/Genres"));
const Rating = dynamic(() => import("@/components/ui/other/Rating"));

interface AnimeWatchPageClientProps {
  anime: AnimeMedia;
  episode: number;
  startAt?: number;
}

const AnimeWatchPageClient: React.FC<AnimeWatchPageClientProps> = ({ anime, episode, startAt }) => {
  const router = useRouter();
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const malId = anime.idMal || anime.id; // Prefer MAL ID, fallback to AniList ID
  const hasMALId = Boolean(anime.idMal);
  const title = mutateAnimeTitle(anime);
  const [players, setPlayers] = useState<PlayersProps[]>([]);
  const [hianimeOptions, setHianimeOptions] = useState<PlayersProps[]>([]);
  const [loadingHiAnime, setLoadingHiAnime] = useState(false);
  const [hianimeLoaded, setHianimeLoaded] = useState(false);
  const [hianimeError, setHianimeError] = useState(false);
  const [hianimeCurrentSourceIndex, setHianimeCurrentSourceIndex] = useState(0);
  const [hianimeAllSourcesFailed, setHianimeAllSourcesFailed] = useState(false);
  const [hianimeVideoPlaying, setHianimeVideoPlaying] = useState(false);
  const [showHianimeOptions, setShowHianimeOptions] = useState(false);
  const [showSourcesList, setShowSourcesList] = useState(true);
  const [autoLoadHiAnime, setAutoLoadHiAnime] = useState(true);
  const [backgroundLoadingActive, setBackgroundLoadingActive] = useState(false);
  const priorityLoggedRef = useRef(false);
  const bgPreloadStartedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const { mobile } = useBreakpoints();

  // Initialize a stable session id and persisted guards to avoid duplicate logs across remounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // session id
      let sid = window.sessionStorage.getItem("ogm_log_session_id");
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.sessionStorage.setItem("ogm_log_session_id", sid);
      }
      sessionIdRef.current = sid;

      // persisted guards
      priorityLoggedRef.current = window.sessionStorage.getItem("ogm_priority_logged") === "1";
      bgPreloadStartedRef.current = window.sessionStorage.getItem("ogm_bg_preload_started") === "1";
    }
  }, []);
  const idle = useIdle(3000);
  const [episodeMenuOpened, episodeMenuHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  // Refs for episode scrolling
  const episodeListRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLAnchorElement>(null);

  // Stop background loading when video starts playing
  useEffect(() => {
    if (hianimeVideoPlaying && backgroundLoadingActive) {
      stopBackgroundLoading();
    }
  }, [hianimeVideoPlaying, backgroundLoadingActive]);

  // Server logging helper: only logs critical events to reduce API calls and terminal clutter
  const logToServer = useCallback(
    async (
      level: "info" | "warn" | "error",
      message: string,
      context?: Record<string, any>
    ) => {
      try {
        // Only log critical events to server terminal
        const criticalEvents = [
          "PRIORITY 1",
          "SUCCESS",
          "FAILED",
          "FALLBACK",
          "USER SELECTION",
          "BACKGROUND.*interrupted",
          "BACKGROUND.*completed"
        ];
        
        const isCritical = criticalEvents.some(pattern => 
          new RegExp(pattern, "i").test(message)
        );
        
        if (!isCritical) {
          // Non-critical events only go to browser console (if needed for debugging)
          return;
        }

        // Send critical events to server terminal
        await fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            level, 
            message, 
            context: { 
              ...(context || {}), 
              path: typeof window !== "undefined" ? window.location.pathname : undefined,
              sessionId: sessionIdRef.current || undefined,
            }
          }),
          keepalive: true,
        });
      } catch {
        // Swallow errors; logging must never break playback flow
      }
    },
    []
  );

  // Guarded logger: ensure a specific message key logs only once per session
  const logOnce = useCallback(
    (key: string, level: "info" | "warn" | "error", message: string, context?: Record<string, any>) => {
      try {
        if (typeof window !== "undefined") {
          const storageKey = `ogm_log_once_${key}`;
          if (window.sessionStorage.getItem(storageKey) === "1") {
            return;
          }
          window.sessionStorage.setItem(storageKey, "1");
        }
      } catch {}
      logToServer(level, message, context);
    },
    [logToServer]
  );

  // Debug logger: no-op (no browser console logs)
  const debugLog = useCallback(
    (message: string, context?: any) => {
      // No-op: suppress all browser console output
    },
    []
  );

  // Generate episodes array - only for released/airing anime
  const episodes = useMemo(() => {
    // Don't generate episodes for anime that hasn't been released yet
    if (anime.status === 'NOT_YET_RELEASED') {
      return [];
    }
    return Array.from({ length: anime.episodes || 1 }, (_, i) => i + 1);
  }, [anime.status, anime.episodes]);

  useVidlinkPlayer({ 
    saveHistory: true,
    metadata: {
      episode: episode,
    }
  });
  
  useDocumentTitle(`Watch ${title} - Episode ${episode} | ${siteConfig.name}`);

  // Scroll the episode list to the active episode on non-mobile only
  useEffect(() => {
    // Avoid any auto-scroll on mobile to keep the viewport stable on the player
    if (mobile) return;

    const scrollToActiveEpisode = () => {
      if (!episodeListRef.current) return;
      const episodeList = episodeListRef.current;

      // Resolve the active episode element
      let activeEpisode = activeEpisodeRef.current as HTMLAnchorElement | null;
      if (!activeEpisode) {
        const activeEpisodeElement = episodeList.querySelector(`[data-episode="${episode}"]`);
        if (activeEpisodeElement) {
          activeEpisode = activeEpisodeElement as HTMLAnchorElement;
        }
      }

      if (!activeEpisode) return;

      // Manually scroll the container without affecting page scroll
      const scrollTop = activeEpisode.offsetTop - episodeList.offsetTop - (episodeList.clientHeight / 2) + (activeEpisode.clientHeight / 2);
      episodeList.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    };

    const timeoutId = setTimeout(scrollToActiveEpisode, 100);
    return () => clearTimeout(timeoutId);
  }, [episode, mobile]);

  // Handle browser back button to go to anime detail page
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Navigate to anime detail page when browser back is pressed
      router.push(`/anime/${anime.id}`);
    };

    // Add the popstate event listener
    window.addEventListener('popstate', handlePopState);

    // Replace current history entry to prevent going back to watch page
    // This ensures that when user presses back, they go to anime detail page
    const currentUrl = window.location.href;
    const animeDetailUrl = `${window.location.origin}/anime/${anime.id}`;
    
    // Only replace if we're not already on the anime detail page
    if (!currentUrl.includes(animeDetailUrl)) {
      window.history.replaceState(
        { ...window.history.state, fromWatch: true },
        '',
        currentUrl
      );
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, anime.id]);

  // Load basic players synchronously
  useEffect(() => {
    const basicPlayers = getAnimePlayers(malId, episode, startAt, title, hasMALId, anime.id);
    setPlayers(basicPlayers);
    
    // Reset HiAnime states when episode changes
    setHianimeVideoPlaying(false);
    setHianimeError(false);
    setHianimeAllSourcesFailed(false);
    setHianimeCurrentSourceIndex(0);
    setHianimeLoaded(false);
    setHianimeOptions([]);
  }, [malId, episode, startAt, title, hasMALId]);

  // Auto-load HiAnime as default source when page loads
  useEffect(() => {
    if (autoLoadHiAnime && players.length > 0 && !hianimeLoaded && !hianimeError) {
      loadHiAnimeOptions();
    }
  }, [players.length, autoLoadHiAnime, hianimeLoaded, hianimeError]);

  // Load HiAnime options if a HiAnime source is selected via URL
  // Auto-selection now works on all devices (mobile, PC, tablets, etc.)
  useEffect(() => {
    if (selectedSource === 0 && players.length > 0) {
      // HiAnime is at index 0, load its options
      loadHiAnimeOptions();
    } else if (selectedSource >= players.length && players.length > 0) {
      // If selectedSource is beyond basic players, it's a HiAnime option
      // Load HiAnime options first
      loadHiAnimeOptions();
    }
  }, [selectedSource, players.length, autoLoadHiAnime]);

  // Validate if a HiAnime source is working by checking if it loads
  const validateHiAnimeSource = (source: PlayersProps): Promise<boolean> => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.src = source.source;
      iframe.style.display = 'none';
      
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false); // Timeout after 15 seconds
      }, 15000);
      
      iframe.onload = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(true);
      };
      
      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(false);
      };
      
      document.body.appendChild(iframe);
    });
  };

  // Try next HiAnime source following the specific fallback chain
  const tryNextHiAnimeSource = async () => {
    // Don't switch if video is already playing
    if (hianimeVideoPlaying) {
      return;
    }

    if (hianimeCurrentSourceIndex < hianimeOptions.length - 1) {
      const nextIndex = hianimeCurrentSourceIndex + 1;
      const nextSource = hianimeOptions[nextIndex];
      
      setHianimeCurrentSourceIndex(nextIndex);
      
      // Update selected source to the new HiAnime option
      const actualIndex = players.length + nextIndex;
      setSelectedSource(actualIndex);
      
      // Determine priority level for logging
      const isMegaPlay = nextSource.serverType === "MegaPlay";
      const priorityLevel = isMegaPlay ? "1️⃣" : "2️⃣";
      const serverType = isMegaPlay ? "MegaPlay" : "VidWish";
      
      logOnce(`fallback_${serverType}_${nextSource.quality}`, "info", `🔄 [FALLBACK] ${priorityLevel} Trying ${serverType} ${nextSource.quality}: ${nextSource.title}`);
      
      // Validate the new source
      const isValid = await validateHiAnimeSource(nextSource);
      if (isValid) {
        setHianimeError(false);
        setHianimeAllSourcesFailed(false);
        setHianimeVideoPlaying(true); // Mark as playing to prevent further auto-switching
        logToServer("info", `✅ [SUCCESS] Loaded: ${nextSource.title}`);
        logToServer("info", "🎯 Playback stabilized - no more auto-switching");
      } else {
        logToServer("warn", `❌ [FAILED] ${nextSource.title} - Continuing fallback chain...`);
        // Try next source recursively with shorter delay for faster fallback
        setTimeout(() => tryNextHiAnimeSource(), 1500);
      }
    } else {
      // All HiAnime sources failed, fallback to NontonGo
      setHianimeAllSourcesFailed(true);
      setHianimeError(true);
      setAutoLoadHiAnime(false);
      
      logToServer("warn", "=".repeat(50));
      logToServer("warn", "❌ [FALLBACK] All HiAnime sources exhausted");
      logToServer("warn", "🔄 [FALLBACK] Switching to alternative sources (NontonGo)");
      logToServer("warn", "=".repeat(50));
      
      if (players.length > 1) {
        const fallbackIndex = 1; // NontonGo is at index 1
        const fallbackSource = players[fallbackIndex];
        setSelectedSource(fallbackIndex);
        logToServer("info", `🎬 [ALTERNATIVE] Loaded: ${fallbackSource.title}`);
      }
    }
  };

  // Stop all background loading processes
  const stopBackgroundLoading = () => {
    setBackgroundLoadingActive(false);
      // terminal-only: mirrored via logToServer elsewhere
  };

  // Background load VidWish sources while MegaPlay is playing
  // Optimize background loading on mobile to reduce heat and battery usage
  const backgroundLoadVidWish = async (hianimeData: any[]) => {
    if (mobile) {
      debugLog("📱 [MOBILE] Using optimized background loading to reduce heat");
      // On mobile, only preload the first VidWish source for faster fallback
      const vidWishSources = hianimeData.filter(source => source.serverType === "VidWish");
      if (vidWishSources.length > 0) {
        const firstVidWish = vidWishSources[0];
        debugLog(`🔄 [MOBILE PRELOAD] Testing VidWish ${firstVidWish.quality}: ${firstVidWish.title}`);
        try {
          await validateHiAnimeSource(firstVidWish);
          debugLog(`✅ [MOBILE PRELOAD SUCCESS] VidWish ${firstVidWish.quality} ready for instant switching`);
        } catch (error) {
          debugLog(`⚠️ [MOBILE PRELOAD FAILED] VidWish ${firstVidWish.quality} not available`);
        }
      }
      return;
    }
    
    // Set background loading as active
    setBackgroundLoadingActive(true);

    // Auto-stop background process after 10 seconds to prevent long-running processes
    const autoStopTimeout = setTimeout(() => {
      if (backgroundLoadingActive) {
        setBackgroundLoadingActive(false);
        debugLog("🛑 [BACKGROUND] Auto-stopped after 10 seconds");
      }
    }, 10000);

    // Find VidWish sources to preload
    const vidWishSources = hianimeData.filter(source => source.serverType === "VidWish");
    
    if (vidWishSources.length > 0) {
      debugLog("🔄 [BACKGROUND] Preloading VidWish sources for instant fallback");
      debugLog(`📊 Found ${vidWishSources.length} VidWish sources to preload`);
      
      // Preload VidWish sources in background with interruption checks
      for (const source of vidWishSources) {
        // Check if video started playing or background loading was stopped
        if (hianimeVideoPlaying || !backgroundLoadingActive) {
          // terminal-only: mirrored via logToServer elsewhere
          break;
        }

        try {
          debugLog(`🔄 [PRELOAD] Testing VidWish ${source.quality}: ${source.title}`);
          await validateHiAnimeSource(source);
          
          // Check again after validation
          if (hianimeVideoPlaying || !backgroundLoadingActive) {
            logToServer("warn", "🛑 [BACKGROUND] Video started playing during preload - stopping");
            break;
          }
          
          debugLog(`✅ [PRELOAD SUCCESS] VidWish ${source.quality} ready for instant switching`);
        } catch (error) {
          logToServer("warn", `⚠️ [PRELOAD FAILED] VidWish ${source.quality} not available`);
        }
      }
      
      if (!hianimeVideoPlaying && backgroundLoadingActive) {
        logToServer("info", "🎯 [BACKGROUND] VidWish preload completed - fallback sources ready");
      } else {
        logToServer("warn", "🛑 [BACKGROUND] Preload interrupted - video is now playing");
      }
    }

    // Clear the auto-stop timeout since we're done
    clearTimeout(autoStopTimeout);
    
    // Mark background loading as inactive
    setBackgroundLoadingActive(false);
  };

  // Load HiAnime options when HiAnime is selected
  const loadHiAnimeOptions = async () => {
    if (hianimeLoaded) {
      setShowHianimeOptions(true);
      return;
    }
    
    setLoadingHiAnime(true);
    setHianimeError(false);
    
    try {
      const hianimeData = await loadHiAnimePlayers(malId, episode, title, anime.id);
      
      if (hianimeData.length === 0) {
        // terminal-only: mirrored via logToServer elsewhere
        setHianimeError(true);
        setHianimeAllSourcesFailed(true);
        setAutoLoadHiAnime(false);
        
        // Fallback to first available source if this was an auto-load attempt
        if (autoLoadHiAnime && players.length > 1) {
          const fallbackIndex = 1; // NontonGo is at index 1
          const fallbackSource = players[fallbackIndex];
          setSelectedSource(fallbackIndex);
        }
        return;
      }
      
      setHianimeOptions(hianimeData);
      setHianimeLoaded(true);
      setShowHianimeOptions(true);
      setHianimeCurrentSourceIndex(0);
      setHianimeAllSourcesFailed(false);
      
      // Auto-select the first HiAnime option (MegaPlay 1080p)
      if (autoLoadHiAnime) {
        const firstHiAnimeIndex = players.length; // First HiAnime option index
        setSelectedSource(firstHiAnimeIndex);
        
        // Log the complete fallback chain
        if (!priorityLoggedRef.current) {
          priorityLoggedRef.current = true;
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem("ogm_priority_logged", "1");
          }
          logOnce("priority_chain_header", "info", "🎯 PLAYBACK PRIORITY CHAIN (All Devices):");
          logOnce("priority_chain_mega", "info", "1️⃣ MegaPlay: 1080p → 720p → 480p");
          logOnce("priority_chain_vidwish", "info", `2️⃣ VidWish: 1080p → 720p → 480p (${mobile ? 'mobile optimized' : 'background loaded'})`);
          logOnce("priority_chain_alt", "info", "3️⃣ Alternative: NontonGo, VidSrc");
          logOnce("priority_chain_sep", "info", "=".repeat(50));
        }
        
        // Start validation of the first source (MegaPlay 1080p)
        const firstSource = hianimeData[0];
        if (firstSource) {
          logOnce("attempt_mega_1080p", "info", `🎬 [PRIORITY 1] Attempting to load: ${firstSource.title}`);
          const isValid = await validateHiAnimeSource(firstSource);
          if (isValid) {
            setHianimeError(false);
            setHianimeVideoPlaying(true); // Mark as playing to prevent further auto-switching
            logToServer("info", `✅ [SUCCESS] Loaded: ${firstSource.title}`);
            if (!bgPreloadStartedRef.current) {
              bgPreloadStartedRef.current = true;
              if (typeof window !== "undefined") {
                window.sessionStorage.setItem("ogm_bg_preload_started", "1");
              }
              debugLog("🔄 Starting background VidWish preload...");
              // Start background process - it will auto-stop after completion
              backgroundLoadVidWish(hianimeData);
            }
          } else {
            setHianimeError(true);
            logToServer("warn", `❌ [FAILED] ${firstSource.title} - Starting fallback chain...`);
            // Start trying next sources
            setTimeout(() => tryNextHiAnimeSource(), 1500);
          }
        }
      }
    } catch (error) {
      // terminal-only: mirrored via logToServer elsewhere
      setHianimeError(true);
      setHianimeAllSourcesFailed(true);
      setAutoLoadHiAnime(false); // Stop trying to auto-load
      
      // If this was an auto-load attempt, fallback to first available source
      // Fallback order: SenpaiPlay (0) → NontonGo (1) → VidSrc Sub (2) → VidSrc Dub (3) → etc.
      if (autoLoadHiAnime && players.length > 1) {
        const fallbackIndex = 1; // NontonGo is at index 1
        const fallbackSource = players[fallbackIndex];
        setSelectedSource(fallbackIndex);
      }
    } finally {
      setLoadingHiAnime(false);
    }
  };

  // Check if current selection is a HiAnime option
  const isHianimeSelected = selectedSource >= players.length;

  // Handle source selection
  const handleSourceSelection = (index: number) => {
    const inPlayersRange = index < players.length;
    const selectedFromPlayers = inPlayersRange ? players[index] : hianimeOptions[index - players.length];

    // Reset video playing state when user manually changes source
    setHianimeVideoPlaying(false);
    setAutoLoadHiAnime(false); // Stop auto-loading when user manually selects
    stopBackgroundLoading(); // Stop any ongoing background processes

    logToServer("info", "=".repeat(50));
    logToServer("info", `🎯 [USER SELECTION] Manual source change detected`);
    logToServer("info", `📺 Selected: ${selectedFromPlayers?.title || 'Unknown source'}`);
    if (selectedFromPlayers?.serverType) {
      logToServer("info", `🏷️ Server: ${selectedFromPlayers.serverType} | Quality: ${selectedFromPlayers.quality}`);
    }
    logToServer("warn", "🛑 Auto-switching disabled - user has manual control");
    logToServer("warn", "🛑 Background loading stopped - user has manual control");
    logToServer("info", "=".repeat(50));

    if (selectedFromPlayers?.provider === "hianime") {
      // If HiAnime base or option is selected
      if (inPlayersRange) {
        // Base HiAnime placeholder was clicked → ensure options are loaded
        if (hianimeError) {
          setHianimeError(false);
          setHianimeAllSourcesFailed(false);
          setAutoLoadHiAnime(true);
        }
        loadHiAnimeOptions();
      }
      setSelectedSource(index);
      setShowHianimeOptions(true);
    } else {
      // For other sources, select normally
      setSelectedSource(index);
      setShowHianimeOptions(false);
    }
  };

  // Handle HiAnime option selection
  const handleHianimeOptionSelection = (hianimeIndex: number) => {
    // Calculate the actual index in the combined list
    const actualIndex = players.length + hianimeIndex;
    setSelectedSource(actualIndex);
    setHianimeCurrentSourceIndex(hianimeIndex);
    
    // Reset video playing state when user manually selects a different HiAnime option
    setHianimeVideoPlaying(false);
    setHianimeError(false);
    setHianimeAllSourcesFailed(false);
    
    // Keep HiAnime options visible so user can switch between them
    setShowHianimeOptions(true);
    
  };

  // Combine all players for display
  const allPlayers = useMemo(() => {
    return [...players, ...hianimeOptions];
  }, [players, hianimeOptions]);

  const PLAYER = useMemo(() => {
    // If selectedSource is out of bounds, fallback to first available player
    if (selectedSource >= allPlayers.length || selectedSource < 0) {
      return allPlayers[0];
    }
    return allPlayers[selectedSource];
  }, [allPlayers, selectedSource]);

  // Compute display order: SenpaiPlay Sub options first, then others, then SenpaiPlay Dub
  const displayOrderIndices = useMemo(() => {
    const total = allPlayers.length;
    let baseIndices = Array.from({ length: total }, (_, i) => i);
    const isHiAnimeOption = (i: number) => i >= players.length && allPlayers[i]?.provider === "hianime";
    const isSub = (i: number) => allPlayers[i]?.type === "sub";
    const isDub = (i: number) => allPlayers[i]?.type === "dub";
    const isBaseHiAnime = (i: number) => i < players.length && allPlayers[i]?.provider === "hianime";

    // Hide the base SenpaiPlay placeholder once options are loaded
    if (hianimeLoaded && hianimeOptions.length > 0) {
      baseIndices = baseIndices.filter((i) => !isBaseHiAnime(i));
    }

    const hiSub = baseIndices.filter((i) => isHiAnimeOption(i) && isSub(i));
    const hiDub = baseIndices.filter((i) => isHiAnimeOption(i) && isDub(i));
    const others = baseIndices.filter((i) => !hiSub.includes(i) && !hiDub.includes(i));

    // Sort HiAnime options by server priority (MegaPlay first) then quality (1080p, 720p, 480p)
    const getSortPriority = (i: number) => {
      const player = allPlayers[i];
      const serverType = player?.serverType;
      const quality = String(player?.quality || "").toLowerCase();
      
      // Server priority: MegaPlay first (0), VidWish second (1)
      const serverPriority = serverType === "MegaPlay" ? 0 : 1;
      
      // Quality priority: 1080p (4), 720p (3), 480p (2), 360p (1)
      const qualityOrder = { "1080p": 4, "720p": 3, "480p": 2, "360p": 1 };
      const qualityPriority = qualityOrder[quality as keyof typeof qualityOrder] || 0;
      
      return serverPriority * 100 + qualityPriority; // Server priority is more important
    };

    hiSub.sort((a, b) => getSortPriority(a) - getSortPriority(b));
    hiDub.sort((a, b) => getSortPriority(a) - getSortPriority(b));

    return [...hiSub, ...hiDub, ...others];
  }, [allPlayers, players.length, hianimeLoaded, hianimeOptions.length]);

  // Check if current player is a HiAnime placeholder
  const isHiAnimePlaceholder = PLAYER?.provider === "hianime" && PLAYER?.source?.startsWith("hianime://");

  // Show loading message if no streaming sources are available
  if (!allPlayers || allPlayers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground-700 mb-4">Loading Sources</h2>
          <p className="text-foreground-500 mb-6">
            Please wait while we load available streaming sources for this anime.
          </p>
        </div>
      </div>
    );
  }

  // Prepare anime data for display
  const coverImage = getAnimeCoverUrl(anime.coverImage?.large);
  const description = cleanAnimeDescription(anime.description);
  const genres = anime.genres?.map((g, i) => ({ id: i, name: g })) || [];
  const releaseYear = getAnimeYear(anime.startDate);
  const studioNames = Array.from(
    new Set(
      (anime.studios?.nodes || [])
        .filter((s) => s.isAnimationStudio)
        .map((s) => s.name)
    )
  ).join(", ");


  return (
    <>
      <style jsx>{`
        .episode-list-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .episode-list-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .episode-list-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .episode-list-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      <AdsWarning />

      {/* Mobile Back Button - Only visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <BackButton href={`/anime/${anime.id}`} />
      </div>

      <div className="mx-auto max-w-[1600px] px-3 sm:px-6 pt-2 pb-4 sm:pt-3 sm:pb-6">
        {/* Three Column Layout - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Left Column - Anime Details */}
          <div className="md:col-span-1 lg:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6 order-3 md:order-1">
            {/* Anime Poster and Basic Info */}
            <Card 
              className="p-8 sm:p-4" 
              shadow="md"
              classNames={{
                base: "bg-background border-2 border-foreground-200"
              }}
            >
              <div className="flex flex-col sm:flex-col lg:flex-col items-center text-center space-y-8 sm:space-y-4">
                <div className="flex flex-row sm:flex-col lg:flex-col items-start sm:items-center lg:items-center gap-4 sm:gap-4">
                  <Image
                    src={coverImage}
                    alt={title}
                    className="w-32 h-44 sm:w-24 sm:h-32 lg:w-full lg:max-w-[200px] lg:h-auto aspect-[2/3] object-cover rounded-lg flex-shrink-0"
                    isBlurred
                  />
                  <div className="space-y-5 sm:space-y-2 flex-1 lg:flex-none text-left sm:text-center lg:text-center flex flex-col justify-center">
                    <h1 className="text-lg sm:text-lg lg:text-xl font-bold line-clamp-2">{title}</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-foreground-500 sm:justify-center lg:justify-center">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>{animeDurationString(anime.duration, anime.episodes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>{releaseYear}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:justify-center">
                      <Rating rate={normalizeAnimeScore(anime.averageScore)} />
                      <span className="text-xs sm:text-sm text-foreground-500">
                        {formatAnimeStatus(anime.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Genres */}
            {genres.length > 0 && (
              <Card 
                className="p-3 sm:p-4" 
                shadow="md"
                classNames={{
                  base: "bg-background border-2 border-foreground-200"
                }}
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Genres</h3>
                <Genres genres={genres} />
              </Card>
            )}

            {/* Synopsis */}
            <Card 
              className="p-3 sm:p-4" 
              shadow="md"
              classNames={{
                base: "bg-background border-2 border-foreground-200"
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Synopsis</h3>
              <p className="text-xs sm:text-sm text-foreground-600 line-clamp-4 sm:line-clamp-6">{description}</p>
            </Card>

            {/* Additional Info */}
            <Card 
              className="p-3 sm:p-4" 
              shadow="md"
              classNames={{
                base: "bg-background border-2 border-foreground-200"
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Details</h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-500">Type:</span>
                  <span>{formatAnimeFormat(anime.format)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-500">Episodes:</span>
                  <span>{anime.episodes || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-500">Duration:</span>
                  <span>{anime.duration ? `${anime.duration}m` : 'Unknown'}</span>
                </div>
                {studioNames && (
                  <div className="flex justify-between">
                    <span className="text-foreground-500">Studio:</span>
                    <span className="text-right max-w-[120px] sm:max-w-[150px] truncate">{studioNames}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Center Column - Player */}
          <div className="md:col-span-1 lg:col-span-6 space-y-3 sm:space-y-4 order-first md:order-2">
            {/* Player Section */}
            <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] w-full bg-black rounded-lg overflow-hidden">
              <Card 
                shadow="none" 
                radius="none" 
                className="relative h-full w-full bg-black"
              >
                {/* Loading State */}
                {(loadingHiAnime || (isHiAnimePlaceholder && !hianimeLoaded)) && !hianimeAllSourcesFailed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                    <Spinner size="lg" variant="simple" color="danger" className="mb-3" />
                    <p className="text-sm text-gray-300">Loading sources...</p>
                  </div>
                )}

                {/* Error State */}
                {hianimeError && isHiAnimePlaceholder && hianimeAllSourcesFailed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-3">Sources Unavailable</h3>
                      <p className="text-gray-300 mb-4 text-sm">Switching to alternative sources...</p>
                      <Button
                        color="primary"
                        variant="solid"
                        onClick={() => {
                          setHianimeError(false);
                          setHianimeAllSourcesFailed(false);
                          setAutoLoadHiAnime(false);
                          setSelectedSource(1); // Switch to NontonGo (index 1)
                        }}
                        className="px-4 py-2 text-sm"
                      >
                        Try Alternatives
                      </Button>
                    </div>
                  </div>
                )}

                {/* Skeleton for other sources */}
                {!loadingHiAnime && !hianimeError && !isHiAnimePlaceholder && (
                  <Skeleton className="absolute h-full w-full" />
                )}

                {/* Video Player */}
                {seen && !isHiAnimePlaceholder && !hianimeError && (
                  <iframe
                    allowFullScreen
                    key={PLAYER.title}
                    src={PLAYER.source}
                    className={cn("z-10 block h-full w-full", { "pointer-events-none": idle && !mobile })}
                    style={{
                      pointerEvents: idle && !mobile ? 'none' : 'auto'
                    }}
                  />
                )}
              </Card>
            </div>

            {/* Episode Title and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <h2 className="text-lg sm:text-lg lg:text-xl font-bold truncate">{title}</h2>
                <span className="text-xs sm:text-sm text-foreground-500 whitespace-nowrap">Episode {episode}</span>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {anime.episodes && anime.episodes > 1 && mobile && (
                  <ActionButton label="Episodes" tooltip="Episodes" onClick={episodeMenuHandlers.open}>
                    <List size={18} className="sm:w-5 sm:h-5" />
                  </ActionButton>
                )}
              </div>
            </div>

            {/* Source Selection */}
            <Card 
              className="p-3 sm:p-4" 
              shadow="md"
              classNames={{
                base: "bg-background border-2 border-foreground-200"
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Available Sources</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSourcesList(!showSourcesList)}
                  className="text-xs sm:text-sm"
                >
                  {showSourcesList ? 'Hide Sources' : 'Show Sources'}
                </Button>
              </div>

              {showSourcesList && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {displayOrderIndices.map((idx) => {
                    const { title: sourceTitle, provider, quality, type, serverType } = allPlayers[idx];
                    const isSelected = selectedSource === idx;
                    const isHianime = provider === "hianime";
                    
                    // Create display title without server names
                    const getDisplayTitle = () => {
                      if (isHianime && idx < players.length) {
                        return "SenpaiPlay";
                      }
                      // For HiAnime sub-sources, show "SenpaiPlay" instead of full titles
                      if (isHianime && idx >= players.length) {
                        return "SenpaiPlay";
                      }
                      // Remove server type from title for display
                      return sourceTitle.replace(/\s*(MegaPlay|VidWish|SenpaiPlay)\s*/gi, '').trim();
                    };
                    
                    // Create description with quality, type, and server name
                    const getDescription = () => {
                      if (isHianime && idx < players.length) {
                        return loadingHiAnime ? "Loading…" : hianimeAllSourcesFailed ? "Unavailable" : hianimeLoaded ? "Select quality" : "Load options";
                      }
                      
                      let desc = "";
                      
                      // Special handling for NekoFlix and SakuraPlay sources - show type in description
                      if (sourceTitle === "NekoFlix" || sourceTitle === "SakuraPlay") {
                        if (type) {
                          desc = String(type).toUpperCase();
                        }
                        // Add AniList to description for SakuraPlay sources that use AniList-prefixed URLs
                        if (sourceTitle === "SakuraPlay" && allPlayers[idx]?.source?.includes('/anime/anilist-')) {
                          desc = desc ? `${desc} AniList` : "AniList";
                        }
                        return desc;
                      }
                      
                      if (quality && type) {
                        desc = `${quality} ${String(type).toUpperCase()}`;
                      }
                      
                      // Add server type to description if available
                      if (serverType) {
                        const serverShort = serverType === "MegaPlay" ? "Mega" : 
                                          serverType === "VidWish" ? "Vid" : 
                                          serverType;
                        desc += desc ? ` ${serverShort}` : serverShort;
                      }
                      
                      return desc;
                    };
                    
                    return (
                      <button
                        key={`source-${idx}`}
                        onClick={() => handleSourceSelection(idx)}
                        className={cn(
                          "w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors border-2 touch-manipulation",
                          isSelected
                            ? "bg-danger text-danger-foreground border-danger"
                            : "hover:bg-default-100 border-foreground-200 active:bg-default-200"
                        )}
                      >
                        <div className="min-w-0">
                          <div className={cn("text-xs sm:text-sm truncate", isSelected ? "font-semibold" : "font-medium")}>
                            {getDisplayTitle()}
                          </div>
                          <div className="mt-0.5 text-[11px] text-foreground-500 truncate">
                            {getDescription()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Episode List */}
          <div className="md:col-span-2 lg:col-span-3 order-2 md:order-3">
            <Card 
              className="p-3 sm:p-4" 
              shadow="md"
              classNames={{
                base: "bg-background border-2 border-foreground-200"
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Episodes</h3>
                <span className="text-xs sm:text-sm text-foreground-500">
                  {episode} of {anime.episodes || 1}
                </span>
              </div>
              
              <div 
                ref={episodeListRef}
                className="episode-list-scrollbar space-y-1.5 sm:space-y-2 max-h-[40vh] sm:max-h-[99vh] lg:max-h-[100vh] overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#6b7280 transparent',
                }}
              >
                {episodes.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold text-foreground-700 mb-2">Coming Soon</h3>
                    <p className="text-foreground-500 text-sm">This anime hasn't been released yet. Episodes will be available once it starts airing.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-1 gap-1.5 sm:gap-2">
                    {episodes.map((episodeNum) => {
                      const isCurrentEpisode = episodeNum === episode;
                      const href = `/anime/${anime.id}/watch?episode=${episodeNum}`;
                      
                      return (
                        <Link
                          key={episodeNum}
                          ref={isCurrentEpisode ? activeEpisodeRef : null}
                          href={href}
                          data-episode={episodeNum}
                          className={cn(
                            "block p-2 sm:p-2.5 lg:p-3 rounded-lg border-2 transition-colors touch-manipulation",
                            isCurrentEpisode
                              ? "bg-danger text-danger-foreground border-danger"
                              : "hover:bg-default-100 border-foreground-200 active:bg-default-200"
                          )}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                            <div className={cn(
                              "w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs sm:text-xs lg:text-sm font-semibold flex-shrink-0",
                              isCurrentEpisode
                                ? "bg-danger-foreground text-danger"
                                : "bg-default-200 text-default-600"
                            )}>
                              {episodeNum}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm lg:text-base truncate">Episode {episodeNum}</p>
                              <p className="text-xs text-foreground-500 hidden lg:block">Click to play</p>
                            </div>
                            {isCurrentEpisode && (
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-danger-foreground rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <EpisodeSelection
        opened={episodeMenuOpened}
        onClose={episodeMenuHandlers.close}
        animeId={anime.id}
        currentEpisode={episode}
        totalEpisodes={anime.episodes || 1}
        banner={anime.bannerImage || anime.coverImage?.large}
        duration={anime.duration || undefined}
      />
    </>
  );
};

export default AnimeWatchPageClient;
