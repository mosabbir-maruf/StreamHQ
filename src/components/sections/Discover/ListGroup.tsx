"use client";

import MovieDiscoverList from "./MovieList";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import DiscoverFilters from "./Filters";
import TvShowDiscoverList from "./TvShowList";
import AnimeDiscoverList from "./AnimeList";
import { MdAnimation } from "react-icons/md";
import { cn } from "@/utils/helpers";
import { Saira } from "@/utils/fonts";

const DiscoverListGroup = () => {
  const { content } = useDiscoverFilters();

  return (
    <div className="flex flex-col gap-10">
      <DiscoverFilters />
      {content === "movie" && <MovieDiscoverList />}
      {content === "tv" && <TvShowDiscoverList />}
      {content === "anime" && <AnimeDiscoverList />}
    </div>
  );
};

export default DiscoverListGroup;
