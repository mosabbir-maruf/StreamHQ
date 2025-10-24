"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { hasVisitedBefore } from "@/utils/landing";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic imports for better performance with proper hydration handling
const UserProfileButton = dynamic(() => import("../button/UserProfileButton"), {
  ssr: false,
  loading: () => null
});

const BottomNavbar = () => {
  const pathName = usePathname();
  const { content } = useDiscoverFilters();
  const { data: user, isLoading } = useSupabaseUser();

  // Determine content type from route or query parameter
  const contentType = (() => {
    if (!pathName) return content;
    // Check if we're on a TV page
    if (pathName.startsWith('/tv/')) return 'tv';
    // Check if we're on a movie page
    if (pathName.startsWith('/movie/')) return 'movie';
    // Check if we're on an anime page
    if (pathName.startsWith('/anime/')) return 'anime';
    
    // For Library page, check sessionStorage for the last content type
    if (pathName === '/library' && typeof window !== 'undefined') {
      const storedContent = sessionStorage.getItem('lastContentType');
      if (storedContent && ['movie', 'tv', 'anime'].includes(storedContent)) {
        return storedContent as 'movie' | 'tv' | 'anime';
      }
    }
    
    // Fall back to query parameter
    return content;
  })();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const extraNavbarPaths = ["/aboutandfaq", "/contact", "/privacy", "/search"];
  const show = hrefs.includes(pathName) || extraNavbarPaths.includes(pathName);
  
  // Check if landing page should be shown
  const isLandingPage = !isLoading && !user && !hasVisitedBefore() && pathName === "/";
  const colorByHref: Record<string, { text: string; activeText: string; activeBg: string }> = {
    "/": { text: "text-blue-500", activeText: "text-blue-600", activeBg: "bg-blue-500/15" },
    "/discover": { text: "text-rose-500", activeText: "text-rose-600", activeBg: "bg-rose-500/15" },
    "/library": { text: "text-emerald-500", activeText: "text-emerald-600", activeBg: "bg-emerald-500/15" },
  };

  const [isHidden, setIsHidden] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Detect iOS Safari (including standalone/PWA and iPadOS masquerading as Mac)
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || "";
      const platform = (navigator.platform || "").toLowerCase();
      const maxTouchPoints = (navigator as any).maxTouchPoints || 0;

      const isiOSDevice = /iP(ad|hone|od)/.test(ua) || (platform.includes("mac") && maxTouchPoints > 1);
      const hasSafariToken = /Safari\//.test(ua) && !/(CriOS|FxiOS|EdgiOS)/.test(ua);
      const isStandalone = typeof (navigator as any).standalone === "boolean" && (navigator as any).standalone === true;

      // Treat iOS Safari and iOS standalone web app similarly for safe-area handling
      setIsIOSSafari(isiOSDevice && (hasSafariToken || isStandalone));
    }

    // Always keep navbar visible
    setIsHidden(false);
  }, [pathName]);

  useEffect(() => {
    // Stabilize fixed bottom position on iOS Safari when URL/tool bars show/hide
    if (!isIOSSafari || typeof window === "undefined") return;

    const el = containerRef.current;
    if (!el) return;

    const updateTransform = () => {
      const vv = (window as any).visualViewport as VisualViewport | undefined;
      if (!vv) {
        // Fallback: no adjustment if VisualViewport unsupported
        el.style.transform = "translate3d(0,0,0)";
        return;
      }

      // Positive when the layout viewport is taller than the visual viewport (iOS toolbars visible)
      const bottomGap = Math.max(0, window.innerHeight - (vv.pageTop + vv.height));
      // Move UP by the gap so the bar stays attached to the visual viewport bottom
      el.style.transform = `translate3d(0, ${-bottomGap}px, 0)`;
    };

    updateTransform();

    const vv = (window as any).visualViewport as VisualViewport | undefined;
    vv?.addEventListener("resize", updateTransform);
    vv?.addEventListener("scroll", updateTransform);

    // Also listen to window scroll/resize as some iOS versions only fire those
    window.addEventListener("resize", updateTransform, { passive: true } as any);
    window.addEventListener("scroll", updateTransform, { passive: true } as any);

    return () => {
      vv?.removeEventListener("resize", updateTransform);
      vv?.removeEventListener("scroll", updateTransform);
      window.removeEventListener("resize", updateTransform as any);
      window.removeEventListener("scroll", updateTransform as any);
    };
  }, [isIOSSafari]);

  return (
    show && !isLandingPage && (
      <>
        <div
          className="h-24 md:hidden"
          style={{ paddingBottom: isIOSSafari ? "calc(env(safe-area-inset-bottom, 0px))" : undefined }}
        />
        <div
          ref={containerRef}
          className={clsx(
            "fixed inset-x-0 z-50 block w-full transform-gpu will-change-transform ease-out md:hidden",
            isIOSSafari ? "" : "bottom-2"
          )}
          suppressHydrationWarning
          style={isIOSSafari ? { bottom: "calc(env(safe-area-inset-bottom, 0px) - 2px)" } : undefined}
        >
          <nav
            aria-label="Primary"
            className="relative mx-auto w-[min(92%,560px)] overflow-hidden rounded-full bg-background px-2 py-2 shadow-lg ring-1 ring-zinc-300/50 ring-inset dark:ring-zinc-700/60 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/40 after:ring-inset after:opacity-[0.04] dark:after:ring-black/60"
          >
            <ul className="grid grid-flow-col auto-cols-fr">
              {siteConfig.navItems.map((item) => {
                const isActive = pathName === item.href;
                const palette = colorByHref[item.href] ?? { text: "text-foreground", activeText: "text-foreground", activeBg: "bg-foreground/10" };
                
                // Make Discover link context-aware
                let href = item.href;
                if (item.href === '/discover' && contentType === 'anime') {
                  href = '/discover?content=anime';
                } else if (item.href === '/discover' && contentType === 'tv') {
                  href = '/discover?content=tv';
                } else if (item.href === '/discover' && contentType === 'movie') {
                  href = '/discover?content=movie';
                }

                return (
                  <li key={item.href} className="flex items-center justify-center">
                    <Link
                      href={href}
                      aria-label={item.label}
                      className="group flex w-full flex-col items-center justify-center py-1 text-foreground"
                    >
                      <div
                        className={clsx(
                          "flex size-10 items-center justify-center rounded-full transition-all duration-200 will-change-transform group-active:scale-95",
                          {
                            [palette.activeBg]: isActive,
                            [palette.activeText]: isActive,
                            "bg-transparent text-foreground/70 group-active:bg-foreground/10": !isActive,
                          }
                        )}
                      >
                        <span
                          className={clsx("grid place-items-center text-[24px] leading-none", {
                            [palette.text]: !isActive,
                            [palette.activeText]: isActive,
                          })}
                        >
                          {isActive ? item.activeIcon : item.icon}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "mt-1 h-1.5 w-1.5 rounded-full transition-opacity",
                          { "opacity-100": isActive, "opacity-0": !isActive }
                        )}
                        style={{ backgroundColor: isActive ? "currentColor" : undefined }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div
            className={"pointer-events-none mt-2"}
            style={{
              paddingBottom: isIOSSafari ? "0px" : "calc(env(safe-area-inset-bottom, 0px))",
            }}
          />
        </div>
      </>
    )
  );
};

export default BottomNavbar;
