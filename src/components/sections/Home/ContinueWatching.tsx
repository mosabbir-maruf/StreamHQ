"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import ResumeCard from "./Cards/Resume";
import { useQuery } from "@tanstack/react-query";
import { getUserHistories } from "@/actions/histories";
import { Link } from "@heroui/react";

const ContinueWatching: React.FC = () => {
  const { content } = useDiscoverFilters();
  const { data, isPending, error } = useQuery({
    queryFn: () => getUserHistories(),
    queryKey: ["continue-watching"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (isPending) return null; // Don't render anything while loading
  if (error) return null;
  if (!data?.success) return null;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <section id="continue-watching" className="min-h-[200px] md:min-h-[250px]">
      <div className="z-3 flex flex-col gap-1">
        <div className="flex grow items-center justify-between">
          <SectionTitle color="success">
            Continue Your Journey
          </SectionTitle>
          <Link
            size="sm"
            href="/library"
            isBlock
            color="foreground"
            className="rounded-full"
          >
            See All &gt;
          </Link>
        </div>
        <Carousel>
          {data.data.map((media) => {
            return (
              <div
                key={media.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
              >
                <ResumeCard media={media} />
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
};

export default ContinueWatching;
