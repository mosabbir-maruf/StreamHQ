import { anilist } from "@/api/anilist";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimeWatchPageClient from "./AnimeWatchPageClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id: idParam } = await params;
  const { episode: episodeParam } = await searchParams;
  const id = parseInt(idParam);
  const episode = parseInt(episodeParam || "1");
  
  if (isNaN(id)) {
    return {
      title: "Anime Not Found",
      description: "The requested anime could not be found.",
    };
  }

  try {
    const anime = await anilist.getAnimeById(id);
    
    const title = anime.title?.english || anime.title?.romaji || anime.title?.native || "Unknown Anime";
    const description = anime.description 
      ? anime.description.replace(/<[^>]*>/g, '').substring(0, 200) + "..."
      : `Watch ${title} Episode ${episode} on StreamHQ`;
    const image = anime.bannerImage || anime.coverImage?.large || anime.coverImage?.medium || 
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`;
    
    return {
      title: `Watch ${title} - Episode ${episode}`,
      description,
      openGraph: {
        title: `Watch ${title} - Episode ${episode}`,
        description,
        type: "video.tv_show",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/anime/${id}/watch?episode=${episode}`,
        siteName: siteConfig.name,
        images: [
          {
            url: image,
            width: 1280,
            height: 720,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Watch ${title} - Episode ${episode}`,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: "Anime Not Found",
      description: "The requested anime could not be found.",
    };
  }
}

export default async function AnimeWatchPage({ params, searchParams }: Props) {
  const { id: idParam } = await params;
  const { episode: episodeParam } = await searchParams;
  const id = parseInt(idParam);
  const episode = parseInt(episodeParam || "1");
  
  if (isNaN(id)) return notFound();

  try {
    const anime = await anilist.getAnimeById(id);
    return <AnimeWatchPageClient anime={anime} episode={episode} />;
  } catch (error) {
    return notFound();
  }
}
