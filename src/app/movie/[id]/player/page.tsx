"use client";

import { tmdb } from "@/api/tmdb";
import { getMovieLastPosition } from "@/actions/histories";
import MoviePlayer from "@/components/sections/Movie/Player/Player";
import { Params } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import { notFound } from "next/navigation";
import { use, useEffect } from "react";

const MoviePlayerPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const {
    data: movie,
    isPending,
    error,
  } = useQuery({
    queryFn: () => tmdb.movies.details(id),
    queryKey: ["movie-player-detail", id],
  });

  const { data: startAt, isPending: isPendingStartAt } = useQuery({
    queryFn: () => getMovieLastPosition(id),
    queryKey: ["movie-player-start-at", id],
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (isPending || isPendingStartAt) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center">
        <Spinner size="lg" variant="simple" color="primary" />
      </div>
    );
  }

  if (error || isEmpty(movie)) return notFound();

  return (
    <div className="fixed inset-0 z-[1]">
      <MoviePlayer movie={movie} startAt={startAt} />
    </div>
  );
};

export default MoviePlayerPage;
