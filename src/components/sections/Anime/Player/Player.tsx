"use client";

import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateAnimeTitle } from "@/utils/anime";
import { getAnimePlayers, loadHiAnimePlayers } from "@/utils/players";
import { Card, Skeleton, Spinner } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState, useEffect } from "react";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { AnimeMedia } from "@/api/anilist";
import { PlayersProps } from "@/types";

const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));

interface AnimePlayerProps {
  anime: AnimeMedia;
  episode?: number;
  startAt?: number;
}

const AnimePlayer: React.FC<AnimePlayerProps> = ({ anime, episode = 1, startAt }) => {
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
  const [showHianimeOptions, setShowHianimeOptions] = useState(false);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  useVidlinkPlayer({ 
    saveHistory: true,
    metadata: {
      episode: episode,
    }
  });
  
  useDocumentTitle(`Watch ${title} - Episode ${episode} | ${siteConfig.name}`);

  // Load basic players synchronously
  useEffect(() => {
    const basicPlayers = getAnimePlayers(malId, episode, startAt, title, hasMALId, anime.id);
    setPlayers(basicPlayers);
  }, [malId, episode, startAt, title, hasMALId, anime.id]);

  // Load HiAnime options if a HiAnime source is selected via URL
  useEffect(() => {
    if (selectedSource === 0 && players.length > 0) {
      // HiAnime is at index 0, load its options
      loadHiAnimeOptions();
    } else if (selectedSource >= players.length && players.length > 0) {
      // If selectedSource is beyond basic players, it's a HiAnime option
      // Load HiAnime options first
      loadHiAnimeOptions();
    }
  }, [selectedSource, players.length]);

  // Load HiAnime options when HiAnime is selected
  const loadHiAnimeOptions = async () => {
    if (hianimeLoaded) {
      setShowHianimeOptions(true);
      return;
    }
    
    setLoadingHiAnime(true);
    try {
      const hianimeData = await loadHiAnimePlayers(malId, episode, title, anime.id);
      setHianimeOptions(hianimeData);
      setHianimeLoaded(true);
      setShowHianimeOptions(true);
      } catch (error) {
        // Error loading HiAnime options
    } finally {
      setLoadingHiAnime(false);
    }
  };

  // Handle source selection
  const handleSourceSelection = (index: number) => {
    const selectedPlayer = players[index];
    
    if (selectedPlayer?.provider === "hianime") {
      // If HiAnime is selected, load options
      loadHiAnimeOptions();
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
    // Keep HiAnime options visible so user can switch between them
    setShowHianimeOptions(true);
  };

  // Check if current selection is a HiAnime option
  const isHianimeSelected = selectedSource >= players.length;

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

  // Show loading message if no streaming sources are available
  if (allPlayers.length === 0) {
    return (
      <div className="relative h-full w-full bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <Spinner size="lg" variant="simple" color="danger" className="mb-4" />
          <p className="text-gray-400 text-sm leading-relaxed">
            Loading streaming sources...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdsWarning />

      <div className={cn("relative h-full w-full bg-black")}> 
        <Card 
          shadow="none" 
          radius="none" 
          className="relative h-full w-full bg-black"
        >
          <Skeleton className="absolute h-full w-full" />
          {seen && (
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
    </>
  );
};

AnimePlayer.displayName = "AnimePlayer";

export default AnimePlayer;

