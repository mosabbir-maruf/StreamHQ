"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import { Tabs, Tab } from "@heroui/react";
import { Suspense } from "react";
import RelatedList from "./RelatedList";
import { AnimeMedia } from "@/api/anilist";

interface RelatedSectionProps {
  anime: AnimeMedia;
}

const RelatedSection: React.FC<RelatedSectionProps> = ({ anime }) => {
  const hasRelations = anime.relations?.edges && anime.relations.edges.length > 0;
  const hasRecommendations = anime.recommendations?.nodes && anime.recommendations.nodes.length > 0;

  if (!hasRelations && !hasRecommendations) return null;

  return (
    <section id="related" className="z-3">
      <SectionTitle color="danger" className="mb-2 sm:mb-0 sm:translate-y-10">
        You may like
      </SectionTitle>
      <Tabs
        aria-label="Related content"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: "bg-danger h-1 rounded-full" }}
      >
        {hasRecommendations && (
          <Tab key="recommendations" title="Recommendations">
            <Suspense fallback={<div className="h-32" />}>
              <RelatedList type="recommendations" anime={anime} />
            </Suspense>
          </Tab>
        )}
        {hasRelations && (
          <Tab key="relations" title="Similar">
            <Suspense fallback={<div className="h-32" />}>
              <RelatedList type="relations" anime={anime} />
            </Suspense>
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default RelatedSection;

