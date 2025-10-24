import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Poppins } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import { Footer } from "@/components/ui/layout/Footer";
// Sidebar removed in favor of top navigation menu
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: siteConfig.favicon,
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`,
        width: 1280,
        height: 720,
        alt: siteConfig.name,
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0C0F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://s4.anilist.co" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://graphql.anilist.co" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://s4.anilist.co" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://graphql.anilist.co" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        
        {/* Preload critical images for better LCP - removed meta.jpeg as it's only used for social sharing and fallbacks */}
        
        {/* Fonts are handled by Next.js font optimization - no manual preloading needed */}
        
        {/* Preload critical API endpoints */}
        <link rel="prefetch" href="/api/anime/sources/1" />
        
        {/* Preload critical pages for faster navigation */}
        <link rel="prefetch" href="/discover" />
        <link rel="prefetch" href="/search" />
        
        {/* Performance hints */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Critical resource hints for better performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D0C0F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={cn(
          "bg-background min-h-dvh antialiased select-none flex flex-col",
          Poppins.className,
        )}
      >
        <Suspense>
          <NuqsAdapter>
            <Providers>
              {IS_PRODUCTION && <Disclaimer />}
              <TopNavbar />
              <main className={cn("container mx-auto max-w-full flex-1 min-h-dvh", SpacingClasses.main)}>
                {children}
              </main>
              <Footer />
              <BottomNavbar />
            </Providers>
          </NuqsAdapter>
        </Suspense>
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
        
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Monitor Core Web Vitals
              if ('web-vital' in window) {
                import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                  getCLS((metric) => {
                    if (process.env.NODE_ENV === 'development') {
                    }
                  });
                  getFID((metric) => {
                    if (process.env.NODE_ENV === 'development') {
                    }
                  });
                  getFCP((metric) => {
                    if (process.env.NODE_ENV === 'development') {
                    }
                  });
                  getLCP((metric) => {
                    if (process.env.NODE_ENV === 'development') {
                    }
                  });
                  getTTFB((metric) => {
                    if (process.env.NODE_ENV === 'development') {
                    }
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
