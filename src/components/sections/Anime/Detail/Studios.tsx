"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import { Chip } from "@heroui/react";
import { AnimeMedia } from "@/api/anilist";

interface StudiosSectionProps {
  anime: AnimeMedia;
}

const StudiosSection: React.FC<StudiosSectionProps> = ({ anime }) => {
  const allStudios = anime.studios?.nodes?.filter((s) => s.isAnimationStudio) || [];
  
  // Remove duplicate studio names while keeping the first occurrence
  const uniqueStudios = allStudios.filter(
    (studio, index, self) =>
      index === self.findIndex((s) => s.name === studio.name)
  );
  
  if (uniqueStudios.length === 0) return null;

  return (
    <section id="studios" className="flex flex-col gap-2">
      <SectionTitle>Studios</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {uniqueStudios.map((studio) => (
          <Chip key={studio.id} variant="flat" size="sm">
            {studio.name}
          </Chip>
        ))}
      </div>
    </section>
  );
};

export default StudiosSection;
