import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tmdb } from "@/api/tmdb";
import { siteConfig } from "@/config/site";
import MovieDetailClient from "./MovieDetailClient";

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
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
    };
  }

  try {
    const movie = await tmdb.movies.details(id, ["images"]);
    
    const title = movie.title || "Unknown Movie";
    const description = movie.overview || "Watch this movie on StreamHQ";
    const image = movie.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`;
    
    return {
      title: title,
      description,
      openGraph: {
        title: title,
        description,
        type: "video.movie",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/movie/${id}`,
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
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
      openGraph: {
        title: "Movie Not Found",
        description: "The requested movie could not be found.",
        type: "website",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/movie/${id}`,
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
        title: "Movie Not Found",
        description: "The requested movie could not be found.",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
      },
    };
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id)) {
    notFound();
  }


  return <MovieDetailClient id={id} />;
}
