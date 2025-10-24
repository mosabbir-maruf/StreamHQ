"use client";

import { Image } from "@heroui/react";
import { AnimeMedia } from "@/api/anilist";
import Carousel from "@/components/ui/wrapper/Carousel";
import SectionTitle from "@/components/ui/other/SectionTitle";

interface TopCastsSectionProps {
  anime: AnimeMedia;
}

const TopCastsSection: React.FC<TopCastsSectionProps> = ({ anime }) => {
  if (!anime.characters?.edges || anime.characters.edges.length === 0) return null;

  // Filter to only main characters and get their voice actors
  const mainCharacters = anime.characters.edges
    .filter((c) => c.role === "MAIN")
    .slice(0, 6); // Limit to 6 for the horizontal scroll

  return (
    <section id="top-casts" className="z-3 flex flex-col gap-2">
      <SectionTitle color="danger">Top Casts</SectionTitle>
      <Carousel classNames={{ container: "gap-5" }}>
        {mainCharacters.map((character) => {
          const voiceActor = character.voiceActors?.[0]; // Get first (Japanese) voice actor
          
          // Use voice actor if available, otherwise use character
          const displayName = voiceActor?.name.full || character.node.name.full;
          const displayImage = voiceActor?.image.large || character.node.image.large;
          const characterName = character.node.name.full;

          return (
            <div key={character.id} className="flex max-w-fit items-center px-1 py-2">
              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <Image
                  isBlurred
                  alt={displayName}
                  className="h-16 w-16 object-cover"
                  src={displayImage}
                  radius="full"
                  classNames={{
                    wrapper: "bg-gray-800 border-2 border-gray-700"
                  }}
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0QjU1NjMiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUI5QkE1Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5Ljc5MDg2IDE0IDggMTUuNzkwOSA4IDE4VjIwSDE2VjE4QzE2IDE1Ljc5MDkgMTQuMjA5MSAxNCAxMiAxNFoiIGZpbGw9IiM5QjlCQTUiLz4KPC9zdmc+Cjwvc3ZnPgo="
                />
                <div className="flex flex-col items-center gap-1 text-center min-w-[100px]">
                  <p className="text-white text-sm font-medium leading-tight text-center">
                    {displayName}
                  </p>
                  <p className="text-gray-400 text-xs leading-tight text-center">
                    {characterName}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default TopCastsSection;
