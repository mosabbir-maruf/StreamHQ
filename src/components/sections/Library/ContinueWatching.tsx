"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import ResumeCard from "@/components/sections/Home/Cards/Resume";
import { useQuery } from "@tanstack/react-query";
import { getUserHistories } from "@/actions/histories";
import { Spinner } from "@heroui/react";
import { useMemo } from "react";

const LibraryContinueWatching: React.FC = () => {
  const { data, isPending, error } = useQuery({
    queryFn: () => getUserHistories(50), // Get more items for library view
    queryKey: ["library-continue-watching"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Group content by type for better organization
  const groupedContent = useMemo(() => {
    if (!data?.data) return { movies: [], tv: [], anime: [] };
    
    return data.data.reduce((acc, item) => {
      if (item.type === "movie") acc.movies.push(item);
      else if (item.type === "tv") acc.tv.push(item);
      else if (item.type === "anime") acc.anime.push(item);
      return acc;
    }, { movies: [] as typeof data.data, tv: [] as typeof data.data, anime: [] as typeof data.data });
  }, [data?.data]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" color="primary" variant="simple" />
      </div>
    );
  }

  if (error || !data?.success) {
    return null; // Don't show anything if there's an error
  }

  if (!data.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No Watch History Yet</h3>
          <p className="text-default-500">
            Start watching movies, TV shows, or anime to see your progress here.
          </p>
        </div>
      </div>
    );
  }

  const totalItems = data.data.length;
  const hasMovies = groupedContent.movies.length > 0;
  const hasTV = groupedContent.tv.length > 0;
  const hasAnime = groupedContent.anime.length > 0;

  return (
    <section id="library-continue-watching" className="w-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SectionTitle color="success">
            Continue Your Journey
          </SectionTitle>
          <span className="text-sm text-default-500">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* All content in one unified view */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {data.data.map((media) => {
            return (
              <div key={media.id} className="w-full">
                <ResumeCard media={media} />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default LibraryContinueWatching;
