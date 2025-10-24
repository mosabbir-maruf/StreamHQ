"use client";

import AnimePosterCard from "../Cards/Poster";
import Carousel from "@/components/ui/wrapper/Carousel";
import { AnimeMedia } from "@/api/anilist";

interface RelatedListProps {
  anime: AnimeMedia;
  type: "recommendations" | "relations";
}

const RelatedList: React.FC<RelatedListProps> = ({ anime, type }) => {
  if (type === "recommendations") {
    const recommendations = anime.recommendations?.nodes || [];
    const validRecommendations = recommendations
      .filter((rec) => rec.mediaRecommendation)
      .slice(0, 20);

    if (validRecommendations.length === 0) {
      return (
        <div className="flex min-h-32 items-center justify-center">
          <p className="text-default-500">No recommendations available</p>
        </div>
      );
    }

    return (
      <Carousel>
        {validRecommendations.map((rec) => {
          const anime = rec.mediaRecommendation;
          return (
            <div key={`rec-${rec.id}-${anime.id}`} className="flex min-h-fit max-w-fit items-center px-1 py-2">
              <AnimePosterCard
                anime={{
                  id: anime.id,
                  title: {
                    romaji: anime.title.romaji,
                    english: anime.title.english,
                    native: anime.title.romaji, // Fallback
                  },
                  coverImage: {
                    large: anime.coverImage.large,
                    extraLarge: anime.coverImage.large, // Fallback
                    medium: anime.coverImage.medium,
                  },
                  averageScore: anime.averageScore,
                  format: anime.format,
                  startDate: { year: anime.startDate?.year },
                }}
              />
            </div>
          );
        })}
      </Carousel>
    );
  }

  if (type === "relations") {
    const relations = anime.relations?.edges || [];
    const validRelations = relations
      .filter((rel) => rel.node && rel.node.type === "ANIME")
      .slice(0, 20);

    if (validRelations.length === 0) {
      return (
        <div className="flex min-h-32 items-center justify-center">
          <p className="text-default-500">No related anime available</p>
        </div>
      );
    }

    return (
      <Carousel>
        {validRelations.map((rel) => {
          const anime = rel.node;
          return (
            <div key={`rel-${rel.id}-${anime.id}`} className="flex min-h-fit max-w-fit items-center px-1 py-2">
              <AnimePosterCard
                anime={{
                  id: anime.id,
                  title: {
                    romaji: anime.title.romaji,
                    english: anime.title.english,
                    native: anime.title.romaji, // Fallback
                  },
                  coverImage: {
                    large: anime.coverImage.large,
                    extraLarge: anime.coverImage.large, // Fallback
                    medium: anime.coverImage.medium,
                  },
                  averageScore: anime.averageScore,
                  format: anime.format,
                  startDate: { year: anime.startDate?.year },
                }}
              />
            </div>
          );
        })}
      </Carousel>
    );
  }

  return null;
};

export default RelatedList;

