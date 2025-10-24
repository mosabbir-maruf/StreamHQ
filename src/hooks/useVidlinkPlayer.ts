import { syncHistory } from "@/actions/histories";
import { ContentType } from "@/types";
import { useEffect, useRef, useState, useCallback } from "react";
import useSupabaseUser from "./useSupabaseUser";
import { useDocumentVisibility } from "@mantine/hooks";
import { diff } from "@/utils/helpers";
import useBreakpoints from "./useBreakpoints";

export type VidlinkEventType = "play" | "pause" | "seeked" | "ended" | "timeupdate";

export interface VidlinkEventData {
  type: "PLAYER_EVENT";
  data: {
    event: VidlinkEventType;
    currentTime: number;
    duration: number;
    mtmdbId: number;
    mediaType: ContentType;
    season?: number;
    episode?: number;
  };
}

type Data = VidlinkEventData["data"];

export interface UseVidlinkPlayerOptions {
  metadata?: {
    season?: number;
    episode?: number;
  };
  saveHistory?: boolean;
  onPlay?: (data: Data) => void;
  onPause?: (data: Data) => void;
  onSeeked?: (data: Data) => void;
  onEnded?: (data: Data) => void;
  onTimeUpdate?: (data: Data) => void;
}

export function useVidlinkPlayer(options: UseVidlinkPlayerOptions = {}) {
  const { data: user } = useSupabaseUser();
  const documentState = useDocumentVisibility();
  const { mobile } = useBreakpoints();
  const { metadata, saveHistory, onPlay, onPause, onSeeked, onEnded, onTimeUpdate } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastEvent, setLastEvent] = useState<VidlinkEventType | null>(null);
  const [lastCurrentTime, setLastCurrentTime] = useState(0);
  const eventDataRef = useRef<Data | null>(null);
  const episodeRed = useRef<number | null>(null);
  const seasonRef = useRef<number | null>(null);

  // Throttle timeupdate events on mobile to reduce heat
  const throttledTimeUpdate = useCallback(
    (data: Data) => {
      setCurrentTime(data.currentTime);
      setDuration(data.duration);
      onTimeUpdate?.(data);
    },
    [onTimeUpdate]
  );

  const syncToServer = async (data: Data, completed?: boolean) => {
    if (!saveHistory || !user) return;
    // Increase threshold on mobile to reduce server calls
    const threshold = mobile ? 10 : 5;
    if (diff(data.currentTime, lastCurrentTime) <= threshold) return;

    const dataToSync: Data = {
      ...data,
      season: seasonRef.current || 0,
      episode: episodeRed.current || 0,
    };

    const { success, message } = await syncHistory(dataToSync, completed);

    if (success) {
      setLastCurrentTime(data.currentTime);
      return;
    }

    // Save history failed
  };

  useEffect(() => {
    if (!saveHistory || !user) return;
    if (documentState === "visible") return;
    if (!eventDataRef.current) return;
    syncToServer(eventDataRef.current);
  }, [documentState, lastCurrentTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!saveHistory || !user) return;

      if (eventDataRef.current) {
        const payload = {
          ...eventDataRef.current,
          season: seasonRef.current || 0,
          episode: episodeRed.current || 0,
          completed: eventDataRef.current.event === "ended",
        };

        navigator.sendBeacon("/api/player/save-history", JSON.stringify(payload));
      }
    };

    const handleMessage = (event: MessageEvent) => {
      // Support only sources that actually support watch history
      const supportedOrigins = [
        "https://vidlink.pro",
        "https://www.vidking.net", 
        "https://vidsrcme.ru",
        "https://vidsrcme.su",
        "https://vidsrc-me.ru", 
        "https://vidsrc-me.su",
        "https://vidsrc-embed.ru",
        "https://vidsrc-embed.su",
        "https://vsrc.su"
      ];
      
      if (!supportedOrigins.includes(event.origin)) return;
      const data = event.data as VidlinkEventData;

      if (data?.type === "PLAYER_EVENT") {
        const { event: eventType, currentTime, duration, season, episode } = data.data;

        setLastEvent(eventType);

        if (data.data) {
          eventDataRef.current = data.data;
          seasonRef.current = season || metadata?.season || 0;
          episodeRed.current = episode || metadata?.episode || 0;
        }

        switch (eventType) {
          case "play":
            setIsPlaying(true);
            onPlay?.(data.data);
            break;

          case "pause":
            setIsPlaying(false);
            onPause?.(data.data);
            break;

          case "ended":
            setIsPlaying(false);
            syncToServer(data.data, true);
            onEnded?.(data.data);
            break;

          case "seeked":
            setCurrentTime(currentTime);
            setDuration(duration);
            onSeeked?.(data.data);
            break;

          case "timeupdate":
            // Use throttled version on mobile to reduce heat
            if (mobile) {
              // Throttle to every 2 seconds on mobile instead of every second
              const now = Date.now();
              const lastUpdate = (window as any).__lastTimeUpdate || 0;
              if (now - lastUpdate > 2000) {
                (window as any).__lastTimeUpdate = now;
                throttledTimeUpdate(data.data);
              }
            } else {
              setCurrentTime(currentTime);
              setDuration(duration);
              onTimeUpdate?.(data.data);
            }
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (eventDataRef.current) {
        handleBeforeUnload();
      }

      window.removeEventListener("message", handleMessage);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return { isPlaying, currentTime, duration, lastEvent };
}
