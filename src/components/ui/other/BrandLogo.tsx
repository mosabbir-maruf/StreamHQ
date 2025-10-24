"use client";

import Link from "next/link";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import { Next } from "@/utils/icons";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
  isLandingPage?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = false, className, isLandingPage = false }) => {
  const { content } = useDiscoverFilters();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [referrerContent, setReferrerContent] = useState<string | null>(null);

  // Check referrer for content type when on auth page
  useEffect(() => {
    if (pathname === '/auth' && typeof window !== 'undefined') {
      const referrer = document.referrer;
      const urlParams = new URLSearchParams(window.location.search);
      const urlContent = urlParams.get('content');
      
      // First check URL parameters (most reliable)
      if (urlContent && ['movie', 'tv', 'anime'].includes(urlContent)) {
        setReferrerContent(urlContent);
        return;
      }
      
      // Then check referrer
      if (referrer) {
        if (referrer.includes('/anime/')) {
          setReferrerContent('anime');
        } else if (referrer.includes('/tv/')) {
          setReferrerContent('tv');
        } else if (referrer.includes('/movie/')) {
          setReferrerContent('movie');
        }
      }
      
      // If still no content type detected, check if we can get it from sessionStorage
      // This is a fallback for cases where referrer might not work
      const storedContent = sessionStorage.getItem('lastContentType');
      if (storedContent && ['movie', 'tv', 'anime'].includes(storedContent)) {
        setReferrerContent(storedContent);
      }
    }
  }, [pathname]);

  // Determine content type from route, query parameter, or referrer
  const contentType = (() => {
    if (!pathname) return content;
    
    // Check if we're on an anime page (including watch pages)
    if (pathname.startsWith('/anime/')) return 'anime';
    // Check if we're on a TV page
    if (pathname.startsWith('/tv/')) return 'tv';
    // Check if we're on a movie page
    if (pathname.startsWith('/movie/')) return 'movie';
    
    // For auth page, prioritize referrer content
    if (pathname === '/auth') {
      if (referrerContent) {
        return referrerContent as 'movie' | 'tv' | 'anime';
      }
      
      // Check URL parameters as fallback
      const urlContent = searchParams.get('content');
      if (urlContent && ['movie', 'tv', 'anime'].includes(urlContent)) {
        return urlContent as 'movie' | 'tv' | 'anime';
      }
    }
    
    // Check URL parameters for content type (for other pages)
    const urlContent = searchParams.get('content');
    if (urlContent && ['movie', 'tv', 'anime'].includes(urlContent)) {
      return urlContent as 'movie' | 'tv' | 'anime';
    }
    
    // Fall back to query parameter
    return content;
  })();

  // Determine the appropriate home URL based on content type
  const getHomeUrl = () => {
    if (contentType === 'anime') return '/?content=anime';
    if (contentType === 'tv') return '/?content=tv';
    if (contentType === 'movie') return '/?content=movie';
    return '/';
  };

  return (
    <Link href={getHomeUrl()} className="group">
      <span
        className={cn(
          "flex items-center bg-linear-to-r from-transparent from-80% via-white to-transparent bg-size-[200%_100%] bg-clip-text bg-position-[40%] text-2xl font-semibold text-foreground/60 md:text-3xl",
          "tracking-widest transition-[letter-spacing] group-hover:tracking-[0.2em]",
          {
            "animate-shine": animate,
            "text-foreground": !animate,
          },
          Saira.className,
          className,
        )}
      >
        Stream{" "}
        <span>
          <Next
            className={cn("size-full px-[2px] transition-colors", {
              "text-primary": isLandingPage || contentType === "movie",
              "text-warning": !isLandingPage && contentType === "tv",
              "text-danger": !isLandingPage && contentType === "anime",
            })}
          />
        </span>{" "}
        HQ
      </span>
    </Link>
  );
};

export default BrandLogo;
