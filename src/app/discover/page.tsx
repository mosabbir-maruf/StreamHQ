import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Cache the page for 15 minutes (900 seconds)
export const revalidate = 900;

const DiscoverListGroup = dynamic(() => import("@/components/sections/Discover/ListGroup"));

export const metadata: Metadata = {
  title: `Discover Movies & TV Shows | ${siteConfig.name}`,
  description: "Discover trending movies, TV shows, and anime. Find your next favorite entertainment on StreamHQ.",
  openGraph: {
    title: `Discover Movies & TV Shows | ${siteConfig.name}`,
    description: "Discover trending movies, TV shows, and anime. Find your next favorite entertainment on StreamHQ.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/discover`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`,
        width: 1280,
        height: 720,
        alt: "Discover Movies & TV Shows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Discover Movies & TV Shows | ${siteConfig.name}`,
    description: "Discover trending movies, TV shows, and anime. Find your next favorite entertainment on StreamHQ.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
  },
};

const DiscoverPage: NextPage = () => {
  return (
    <Suspense>
      <DiscoverListGroup />
    </Suspense>
  );
};

export default DiscoverPage;
