"use client";

import { PropsWithChildren, Suspense, useEffect } from "react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { usePathname, useRouter } from "next/navigation";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { preloadCriticalData } from "@/utils/apiCache";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduced retries for faster failure
      retryDelay: 500, // Faster retry
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Optimize for better performance
      networkMode: 'online',
      refetchOnReconnect: 'always',
      // Add performance optimizations
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

export default function Providers({ children }: PropsWithChildren) {
  const { push } = useRouter();
  const pathName = usePathname();
  const { content } = useDiscoverFilters();

  // Preload critical data on app initialization
  useEffect(() => {
    // Only preload on client side and not during SSR
    if (typeof window !== 'undefined') {
      preloadCriticalData().catch((error) => {
        if (process.env.NODE_ENV === 'development') {
        }
      });
    }
  }, []);

  // Determine progress bar color based on content type
  const getProgressBarColor = () => {
    // Check URL path first for more specific detection
    if (pathName.includes("/anime/") || content === "anime") {
      return "#ef4444"; // Red for anime
    } else if (pathName.includes("/tv/") || content === "tv") {
      return "#eab308"; // Yellow for TV shows
    } else if (pathName.includes("/movie/") || content === "movie") {
      return "#3b82f6"; // Blue for movies
    }
    
    // Default fallback based on content
    switch (content) {
      case "anime":
        return "#ef4444"; // Red
      case "tv":
        return "#eab308"; // Yellow
      case "movie":
        return "#3b82f6"; // Blue
      default:
        return "#3b82f6"; // Default to blue for movies
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={push}>
        <ToastProvider
          placement="top-right"
          maxVisibleToasts={1}
          toastOffset={10}
          toastProps={{
            shouldShowTimeoutProgress: true,
            timeout: 5000,
            classNames: {
              content: "mr-7",
              closeButton:
                "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto",
            },
          }}
        />
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* https://github.com/vercel/next.js/discussions/61654#discussioncomment-8480088 */}
          <Suspense>
            <ProgressProvider
              options={{ showSpinner: false }}
              color={getProgressBarColor()}
            >
              {children}
            </ProgressProvider>
          </Suspense>
        </NextThemesProvider>
      </HeroUIProvider>
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden md:block">
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      )}
    </QueryClientProvider>
  );
}
