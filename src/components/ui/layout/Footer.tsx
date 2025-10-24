"use client";

import Link from "next/link";
import { Github, Send, Globe } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Next } from "@/utils/icons";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic imports for better performance with proper hydration handling
const ThemeToggle = dynamic(() => import("@/components/ui/footer"), {
  ssr: false,
  loading: () => null
});

const navigation = {
  categories: [
    {
      id: "main",
      name: "Main Navigation",
      sections: [
        {
          id: "explore",
          name: "Explore",
          items: [
            { name: "Home", href: "/" },
            { name: "Discover", href: "/discover" },
            { name: "Search", href: "/search", contextAware: true },
          ],
        },
        {
          id: "content",
          name: "Content",
          items: [
            { name: "Movies", href: "/discover?content=movie" },
            { name: "TV Shows", href: "/discover?content=tv" },
            { name: "Anime", href: "/discover?content=anime" },
            { name: "Library", href: "/library" },
          ],
        },
        {
          id: "genres",
          name: "Popular Genres",
          items: [
            { name: "Action", href: "/discover?genre=28" },
            { name: "Comedy", href: "/discover?genre=35" },
            { name: "Drama", href: "/discover?genre=18" },
          ],
        },
        {
          id: "regional",
          name: "Regional",
          items: [
            { name: "Bollywood", href: "/discover?type=bollywood" },
            { name: "Tamil", href: "/discover?type=tamil" },
            { name: "Malayalam", href: "/discover?type=malayalam" },
            { name: "Bangla", href: "/discover?type=bangla" },
          ],
        },
        {
          id: "account",
          name: "Account",
          items: [
            { name: "Login", href: "/auth" },
            { name: "Continue Watching", href: "/" },
            { name: "My Library", href: "/library" },
          ],
        },
        {
          id: "info",
          name: "Information",
          items: [
            { name: "About & FAQ", href: "/aboutandfaq" },
            { name: "Privacy", href: siteConfig.legal.privacyPath },
            { name: "Contact", href: "/contact" },
            { name: "Add/Remove Content", href: "/movie-request" },
          ],
        },
      ],
    },
  ],
};

const Underline = `hover:-translate-y-1 border border-gray-700 dark:border-gray-600 rounded-xl p-2.5 transition-transform hover:bg-gray-800/50 dark:hover:bg-gray-700/50`;

export function Footer() {
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState(2025);
  const { content } = useDiscoverFilters();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const hideFooter = (() => {
    if (!pathname) return false;
    // Hide on movie, tv and anime player routes
    if (/^\/movie\/\d+\/player$/.test(pathname)) return true;
    if (/^\/tv\/\d+\/\d+\/\d+\/player$/.test(pathname)) return true;
    if (/^\/anime\/\d+\/player$/.test(pathname)) return true;
    return false;
  })();

  // Determine content type from route or query parameter
  const contentType = (() => {
    if (!pathname) return content;
    // Check if we're on a TV page
    if (pathname.startsWith('/tv/')) return 'tv';
    // Check if we're on a movie page
    if (pathname.startsWith('/movie/')) return 'movie';
    // Check if we're on an anime page
    if (pathname.startsWith('/anime/')) return 'anime';
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

  if (hideFooter) return null;

  return (
    <footer className="mx-auto w-full border-t border-default-200 px-2 md:px-4">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-4 p-6 pb-0 md:flex">
        <Link href={getHomeUrl()} className="flex items-center justify-center group">
          <span
            className={cn(
              "flex items-center text-2xl font-semibold text-foreground md:text-3xl",
              "tracking-widest transition-[letter-spacing] group-hover:tracking-[0.2em]",
              Saira.className,
            )}
          >
            Stream{" "}
            <span className="inline-flex">
              <Next 
                className={cn(
                  "h-8 w-8 px-[2px] transition-colors md:h-9 md:w-9",
                  {
                    "text-primary": contentType === "movie",
                    "text-warning": contentType === "tv",
                    "text-danger": contentType === "anime",
                  }
                )}
              />
            </span>{" "}
            Go
          </span>
        </Link>
        <p className="bg-transparent text-center text-sm leading-5 text-slate-400 dark:text-slate-400 md:text-left">
          Welcome to {siteConfig.name}, your ultimate destination for streaming movies, TV shows, and anime.
          Discover the latest releases, trending content, and timeless classics all in one place.
          Whether you're looking for Bollywood hits, Hollywood blockbusters, regional cinema, or anime,
          we've got you covered. Create your library, track your watch history, and enjoy
          seamless streaming across all your devices. {siteConfig.name} - {siteConfig.description}
        </p>
      </div>

      <div className="mx-auto w-full max-w-full px-6 py-6 lg:max-w-[90%] xl:max-w-[85%]">
        <div className="border-b border-default-200"> </div>
        <div className="pt-2 pb-1 mt-2">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-3 flex-row justify-between gap-10 leading-6 md:flex md:gap-16 lg:gap-24 xl:gap-32"
            >
              {category.sections.map((section) => (
                <div key={section.name} className="flex-1">
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                    className="flex flex-col space-y-2"
                  >
                    {section.items
                      .filter((item) => {
                        // Hide Malayalam in TV section
                        if (item.name === 'Malayalam' && contentType === 'tv') {
                          return false;
                        }
                        return true;
                      })
                      .map((item) => {
                        // Make links context-aware based on current content type
                        let href = item.href;
                        
                      // Handle Discover link
                      if (item.href === '/discover' && contentType === 'anime') {
                        href = '/discover?content=anime';
                      } else if (item.href === '/discover' && contentType === 'tv') {
                        href = '/discover?content=tv';
                      } else if (item.href === '/discover' && contentType === 'movie') {
                        href = '/discover?content=movie';
                      }
                      
                      // Handle Search link to be context-aware
                      if (item.href === '/search') {
                        href = `/search?content=${contentType}`;
                      }
                        
                        // Handle regional links (Bollywood, Tamil, Malayalam) with type parameter
                        if (item.href.includes('type=')) {
                          const urlParams = new URLSearchParams(item.href.split('?')[1]);
                          const type = urlParams.get('type');
                          
                          if (contentType === 'tv') {
                            // For TV shows: /discover?type=bollywoodTv&content=tv
                            href = `/discover?type=${type}Tv&content=tv`;
                          } else if (contentType === 'anime') {
                            // For Anime: /discover?type=bollywoodAnime&content=anime
                            href = `/discover?type=${type}Anime&content=anime`;
                          } else {
                            // For movies: /discover?type=bollywood
                            href = `/discover?type=${type}`;
                          }
                        }
                        
                        // Handle genre links (Action, Comedy, Drama)
                        if (item.href.includes('genre=') && !item.href.includes('content=')) {
                          const urlParams = new URLSearchParams(item.href.split('?')[1]);
                          const genre = urlParams.get('genre');
                          
                          if (contentType === 'tv') {
                            href = `/discover?content=tv&genre=${genre}`;
                          } else if (contentType === 'anime') {
                            href = `/discover?content=anime&genre=${genre}`;
                          } else {
                            // Default to movie
                            href = `/discover?content=movie&genre=${genre}`;
                          }
                        }

                        // Ensure info pages carry current section context
                        if (
                          item.href === '/aboutandfaq' ||
                          item.href === siteConfig.legal.privacyPath ||
                          item.href === '/contact' ||
                          item.href === '/movie-request'
                        ) {
                          const base = item.href;
                          href = `${base}?content=${contentType}`;
                        }

                        return (
                          <li key={item.name} className="flow-root">
                            <Link
                              href={href}
                              className="text-base text-slate-600 hover:text-black dark:text-slate-400 hover:dark:text-white md:text-sm"
                            >
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-y-4 pt-1 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-4 gap-y-3 px-6">
          {siteConfig.socials.github && (
            <Link
              aria-label="GitHub"
              href={siteConfig.socials.github}
              rel="noreferrer"
              target="_blank"
              className={Underline}
            >
              <Github strokeWidth={1.5} className="h-5 w-5" />
            </Link>
          )}
          {siteConfig.socials.telegram && (
            <Link
              aria-label="Telegram"
              href={siteConfig.socials.telegram}
              rel="noreferrer"
              target="_blank"
              className={Underline}
            >
              <Send className="h-5 w-5" />
            </Link>
          )}
          {siteConfig.socials.website && (
            <Link
              aria-label="Website"
              href={siteConfig.socials.website}
              rel="noreferrer"
              target="_blank"
              className={Underline}
            >
              <Globe className="h-5 w-5" />
            </Link>
          )}
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto mb-6 mt-4 flex flex-col justify-between text-center text-sm md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
          <span>©</span>
          <span>{currentYear}</span>
          <span className="cursor-pointer text-black hover:text-red-600 dark:text-white dark:hover:text-red-600">
            <Link
              aria-label="Developer"
              className="font-bold"
              href={siteConfig.socials.github}
              target="_blank"
            >
              Mosabbir Maruf
            </Link>
          </span>
          -
          <span className="cursor-pointer text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-600">
            <Link aria-label="Home" href="/">
              {siteConfig.name}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

