import { tmdb } from "@/api/tmdb";
import { anilist } from "@/api/anilist";
import { ContentType } from "@/types";
import { cn } from "@/utils/helpers";
import { Select, SelectItem, SelectProps } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

interface GenresSelectProps extends Omit<SelectProps, "children" | "selectionMode"> {
  type?: ContentType;
  onGenreChange?: (genres: Set<string> | null) => void;
}

const getQuery = async (type: ContentType) => {
  if (type === "anime") {
    // Return a mock response with common anime genres
    return {
      genres: [
        { id: "Action", name: "Action" },
        { id: "Adventure", name: "Adventure" },
        { id: "Comedy", name: "Comedy" },
        { id: "Drama", name: "Drama" },
        { id: "Ecchi", name: "Ecchi" },
        { id: "Fantasy", name: "Fantasy" },
        { id: "Horror", name: "Horror" },
        { id: "Mahou Shoujo", name: "Mahou Shoujo" },
        { id: "Mecha", name: "Mecha" },
        { id: "Music", name: "Music" },
        { id: "Mystery", name: "Mystery" },
        { id: "Psychological", name: "Psychological" },
        { id: "Romance", name: "Romance" },
        { id: "Sci-Fi", name: "Sci-Fi" },
        { id: "Slice of Life", name: "Slice of Life" },
        { id: "Sports", name: "Sports" },
        { id: "Supernatural", name: "Supernatural" },
        { id: "Thriller", name: "Thriller" },
      ]
    };
  }
  const result = type === "movie" ? await tmdb.genres.movies() : await tmdb.genres.tvShows();
  return {
    genres: result.genres.map(genre => ({
      id: genre.id.toString(),
      name: genre.name
    }))
  };
};

const GenresSelect: React.FC<GenresSelectProps> = ({
  type = "movie",
  onGenreChange,
  isLoading,
  ...props
}) => {
  const { data, isPending } = useQuery({
    queryFn: () => getQuery(type),
    queryKey: ["get-genre-select", type],
  });

  const GENRES = data?.genres || [];

  return (
    <Select
      {...props}
      size="sm"
      isLoading={isPending || isLoading}
      selectionMode="multiple"
      label={props.label ?? "Genres"}
      placeholder={props.placeholder ?? "Select genres"}
      className={cn("max-w-xs", props.className)}
      onChange={({ target }) =>
        onGenreChange?.(
          target.value === ""
            ? null
            : new Set(target.value.split(",").filter((genre) => genre !== "")),
        )
      }
    >
      {GENRES.map(({ id, name }: { id: string; name: string }) => {
        return <SelectItem key={id}>{name}</SelectItem>;
      })}
    </Select>
  );
};

export default GenresSelect;
