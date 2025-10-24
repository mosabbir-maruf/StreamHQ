import { Metadata } from "next";
import { notFound } from "next/navigation";
import { anilist } from "@/api/anilist";
import { siteConfig } from "@/config/site";
import AnimeDetailClient from "./AnimeDetailClient";

// Cache the page for 1 hour (3600 seconds)
export const revalidate = 3600;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
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
      : "Watch this anime on StreamHQ";
    const image = anime.bannerImage || anime.coverImage?.large || anime.coverImage?.medium || 
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`;
    
    return {
      title: title,
      description,
      openGraph: {
        title: title,
        description,
        type: "video.tv_show",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/anime/${id}`,
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
        title: title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: "Anime Not Found",
      description: "The requested anime could not be found.",
      openGraph: {
        title: "Anime Not Found",
        description: "The requested anime could not be found.",
        type: "website",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/anime/${id}`,
        siteName: siteConfig.name,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`,
            width: 1280,
            height: 720,
            alt: "StreamHQ",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Anime Not Found",
        description: "The requested anime could not be found.",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
      },
    };
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id)) {
    notFound();
  }


  return <AnimeDetailClient id={id} />;
}

