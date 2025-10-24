"use client";

import { Button, Link, Spinner, Tooltip, Chip } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import CopyButton from "@/components/ui/button/CopyButton";
import IconButton from "@/components/ui/button/IconButton";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { FaMagnet } from "react-icons/fa6";

type Torrent = {
  title: string;
  quality?: string;
  size?: string;
  seeds?: number;
  peers?: number;
  magnet: string;
  torrentUrl?: string;
  source: "yts" | "torrentio";
};

// Update these labels if you want a different provider suffix in filenames
const PROVIDER_LABELS: Record<Torrent["source"], string> = {
  yts: "StreamHQ",
  torrentio: "StreamHQ",
};

export default function Torrents({ tmdbId }: { tmdbId: number }) {
  const [opened, handlers] = useDisclosure(false);

  const { data, isFetching, refetch, isError } = useQuery<{ torrents: Torrent[]; title: string; year?: string }>(
    {
      queryKey: ["movie-torrents", tmdbId],
      queryFn: async () => {
        const res = await fetch(`/api/torrents/movie/${tmdbId}`);
        if (!res.ok) throw new Error("failed");
        return res.json();
      },
      enabled: false,
      staleTime: 1000 * 60 * 10,
    },
  );

  const openAndFetch = async () => {
    handlers.open();
    await refetch();
  };

  const torrents = data?.torrents || [];

  return (
    <>
      <Button
        color="secondary"
        variant="shadow"
        onPress={openAndFetch}
        className="rounded-full px-4"
        startContent={<FaMagnet size={18} />}
      >
        Torrents
      </Button>
      <VaulDrawer
        open={opened}
        onOpenChange={(o) => (o ? handlers.open() : handlers.close())}
        title={
          <div className="flex w-full items-center gap-2 pr-10">
            <span className="truncate text-medium font-semibold">
              {data?.title ? `${data.title}${data.year ? ` (${data.year})` : ""}` : "Torrents"}
            </span>
            {torrents.length > 0 && (
              <Chip size="sm" variant="flat" color="default">{torrents.length}</Chip>
            )}
          </div>
        }
        backdrop="blur"
        withCloseButton
        hiddenHandler
        classNames={{
          content: "px-4 md:px-6",
          childrenWrapper: "w-full",
        }}
      >
        {isFetching && (
          <div className="flex items-center gap-2 px-1 text-small opacity-80">
            <Spinner size="sm" /> Fetching torrents...
          </div>
        )}
        {!isFetching && isError && (
          <div className="px-1 text-small text-danger">Failed to load torrents. Try again later.</div>
        )}
        {!isFetching && !isError && torrents.length === 0 && (
          <div className="px-1 text-small opacity-80">No torrents found.</div>
        )}

        <div className="mt-2 flex flex-col gap-2">
          {torrents.map((t, idx) => (
            <div
              key={`${t.magnet}-${idx}`}
              className="rounded-2xl border border-content3/20 bg-content1/60 p-3 text-small shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{t.title}</span>
                    {t.quality && <Chip size="sm" variant="flat" color="primary">{t.quality}</Chip>}
                    {t.source && <Chip size="sm" variant="flat" color="secondary">{t.source}</Chip>}
                  </div>
                  <div className="opacity-70">
                    {t.size ? `${t.size}` : ""}
                    {typeof t.seeds === "number" ? `${t.size ? " • " : ""}⬆ ${t.seeds}` : ""}
                    {typeof t.peers === "number" ? ` • ⬇ ${t.peers}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {t.torrentUrl && (
                    <Tooltip content="Download .torrent" placement="top">
                      <IconButton
                        as={Link as any}
                        href={`/api/torrents/download?url=${encodeURIComponent(t.torrentUrl)}&filename=${encodeURIComponent(`${data?.title || 'StreamHQ'}${data?.year ? ` (${data.year})` : ''}${t.quality ? ` [${t.quality}]` : ''} [WEBRip] [${PROVIDER_LABELS[t.source] || 'PROVIDER'}].torrent`)}`}
                        icon="mdi:download"
                        aria-label="Download .torrent"
                        className="h-8 w-8 min-w-8 bg-transparent border-transparent hover:bg-white/5"
                      />
                    </Tooltip>
                  )}
                  <Tooltip content="Copy magnet" placement="top">
                    <div>
                      <CopyButton text={t.magnet} className="h-8 w-8 min-w-8" />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </VaulDrawer>
    </>
  );
}


