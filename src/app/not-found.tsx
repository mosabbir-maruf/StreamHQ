"use client";

import { siteConfig } from "@/config/site";
import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/utils/helpers";
import BrandLogo from "@/components/ui/other/BrandLogo";
import { Grid, Movie, TV, Play, Star, Home, ArrowLeft } from "@/utils/icons";
import { useRouter } from "next/navigation";
import "../styles/404.css";

export default function NotFound() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    document.title = `404 Not Found | ${siteConfig.name}`;
  }, []);

  const handleGoBack = () => {
    if (isClient) {
      router.back();
    }
  };

  const quickLinks = [
    { label: "Movies", href: "/discover?content=movie&type=thisWeekTrending", icon: Movie },
    { label: "TV Shows", href: "/discover?content=tv&type=popular", icon: TV },
    { label: "My Library", href: "/library", icon: Grid },
  ];

  const actionButtons = [
    { label: "Go Home", href: "/", icon: Home },
    { label: "Go Back", href: "#", icon: ArrowLeft, onClick: handleGoBack },
  ];

  return (
    <div className="not-found-page dark flex flex-col items-center justify-start px-4 pt-24 pb-8 bg-background">
        {/* Modern background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary-background/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-warning/5 via-transparent to-transparent" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Brand logo with reduced spacing */}
        <div className="mb-4 -mt-2">
          <BrandLogo animate={false} className="text-5xl" />
        </div>

        {/* 404 Number with modern glassmorphism effect */}
        <div className="relative mb-4">
          <div className="relative">
            <h1 className="text-7xl font-black bg-gradient-to-r from-primary via-warning to-primary bg-clip-text text-transparent animate-shine leading-none">
              404
            </h1>
            <div className="absolute -top-2 -right-2">
              <Chip
                size="sm"
                color="primary"
                variant="solid"
                className="px-3 py-1 text-sm font-semibold shadow-lg"
                startContent={<Movie size={16} />}
              >
                Oops!
              </Chip>
            </div>
          </div>
        </div>

        {/* Error message with modern typography */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Page Not Found
          </h2>
        </div>

        {/* Modern quote card */}
        <div className="relative group max-w-2xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-warning/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative p-6 bg-background/40 backdrop-blur-md border border-divider/30 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                <Star size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-foreground/90 italic text-lg leading-relaxed mb-2">
                  "The show must go on!"
                </p>
                <p className="text-foreground/70 text-base">
                  But first, let's find you the right page. Our collection of movies and TV shows is vast, 
                  and we're sure you'll find something amazing to watch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick navigation with modern cards */}
        <div className="mb-6 w-full max-w-6xl">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Quick Navigation
          </h3>
          
          {/* First row: Navigation links (3 items) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-warning/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative p-4 bg-background/60 backdrop-blur-md border border-divider/50 rounded-xl hover:bg-background/80 hover:border-primary/50 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                        <link.icon size={24} className="text-primary" />
                      </div>
                      <span className="text-lg font-medium text-foreground">
                        {link.label}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Second row: Action buttons (2 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionButtons.map((button) => {
              if (button.onClick) {
                return (
                  <button
                    key={button.label}
                    onClick={button.onClick}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-warning/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                    <div className="relative p-4 bg-background/60 backdrop-blur-md border border-divider/50 rounded-xl hover:bg-background/80 hover:border-primary/50 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                          <button.icon size={24} className="text-primary" />
                        </div>
                        <span className="text-lg font-medium text-foreground">
                          {button.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              }
              
              return (
                <Link key={button.href} href={button.href}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-warning/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                    <div className="relative p-4 bg-background/60 backdrop-blur-md border border-divider/50 rounded-xl hover:bg-background/80 hover:border-primary/50 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                          <button.icon size={24} className="text-primary" />
                        </div>
                        <span className="text-lg font-medium text-foreground">
                          {button.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-20">
        <Movie size={60} className="text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-20">
        <TV size={60} className="text-warning animate-pulse delay-1000" />
      </div>
      <div className="absolute top-1/3 right-20 opacity-5 dark:opacity-10">
        <Play size={40} className="text-primary animate-bounce delay-500" />
      </div>
    </div>
  );
}
