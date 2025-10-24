import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tmdb } from "@/api/tmdb";
import { siteConfig } from "@/config/site";
import TVShowDetailClient from "./TVShowDetailClient";

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
      title: "TV Show Not Found",
      description: "The requested TV show could not be found.",
    };
  }

  try {
    const tv = await tmdb.tvShows.details(id, ["images"]);
    
    const title = tv.name || "Unknown TV Show";
    const description = tv.overview || "Watch this TV show on StreamHQ";
    const image = tv.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`;
    
    return {
      title: title,
      description,
      openGraph: {
        title: title,
        description,
        type: "video.tv_show",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/tv/${id}`,
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
      title: "TV Show Not Found",
      description: "The requested TV show could not be found.",
      openGraph: {
        title: "TV Show Not Found",
        description: "The requested TV show could not be found.",
        type: "website",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/tv/${id}`,
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
        title: "TV Show Not Found",
        description: "The requested TV show could not be found.",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
      },
    };
  }
}

export default async function TVShowDetailPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id)) {
    notFound();
  }


  return <TVShowDetailClient id={id} />;
}
