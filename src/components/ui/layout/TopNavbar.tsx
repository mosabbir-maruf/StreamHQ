"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { IoMenuOutline } from "react-icons/io5";
import { useRouter } from "@bprogress/next";
import { useState, useEffect } from "react";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { hasVisitedBefore } from "@/utils/landing";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { User } from "@/utils/icons";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic imports for better performance with proper hydration handling
const SmartBackButton = dynamic(() => import("@/components/ui/button/SmartBackButton"), {
  ssr: false,
  loading: () => null
});
const FullscreenToggleButton = dynamic(() => import("../button/FullscreenToggleButton"), {
  ssr: false,
  loading: () => null
});
const UserProfileButton = dynamic(() => import("../button/UserProfileButton"), {
  ssr: false,
  loading: () => null
});
const SearchInput = dynamic(() => import("../input/SearchInput"), {
  ssr: false,
  loading: () => null
});
const ThemeSwitchDropdown = dynamic(() => import("../input/ThemeSwitchDropdown"), {
  ssr: false,
  loading: () => null
});
const BrandLogo = dynamic(() => import("../other/BrandLogo"), {
  ssr: false,
  loading: () => null
});
const NavbarMenuItems = dynamic(() => import("../other/NavbarMenuItems"), {
  ssr: false,
  loading: () => null
});
const MobileSidebar = dynamic(() => import("./MobileSidebar"), {
  ssr: false,
  loading: () => null
});

const TopNavbar = () => {
  const pathName = usePathname();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [{ y }] = useWindowScroll();
  const { content } = useDiscoverFilters();
  const { data: user, isLoading } = useSupabaseUser();
  const [isHydrated, setIsHydrated] = useState(false);
  const opacity = Math.min((y / 1000) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const extraNavbarPaths = ["/aboutandfaq", "/contact", "/privacy", "/movie-request", "/search", "/profile"];
  const show = hrefs.includes(pathName) || extraNavbarPaths.includes(pathName) || pathName.startsWith("/profile/") || (pathName.includes("/anime/") && pathName.includes("/watch"));
  const tv = pathName.includes("/tv/");
  const anime = pathName.includes("/anime/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");
  
  // Check if landing page should be shown
  const isLandingPage = !isLoading && !user && !hasVisitedBefore() && pathName === "/";

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Determine content type from route or query parameter
  const contentType = (() => {
    if (pathName.startsWith('/tv/')) return 'tv';
    if (pathName.startsWith('/movie/')) return 'movie';
    if (pathName.startsWith('/anime/')) return 'anime';
    
    // For Library page, check sessionStorage for the last content type
    if (pathName === '/library' && typeof window !== 'undefined') {
      const storedContent = sessionStorage.getItem('lastContentType');
      if (storedContent && ['movie', 'tv', 'anime'].includes(storedContent)) {
        return storedContent as 'movie' | 'tv' | 'anime';
      }
    }
    
    return content;
  })();

  if (auth || player) return null;

  // Smart back button logic
  const getBackHref = () => {
    // Default behavior based on content type
    if (tv) return "/?content=tv";
    if (anime) return "/?content=anime";
    return "/";
  };

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{ wrapper: "px-2 md:px-4" }}
      className={cn("relative inset-0 h-min bg-transparent", {
        "bg-background": show,
      })}
    >
      {!show && (
        <div
          className="border-background bg-background absolute inset-0 h-full w-full border-b"
          style={{ opacity: opacity }}
        />
      )}
      <NavbarBrand
        className={cn({
          "mx-auto md:mx-0": show,
          // absolutely center brand on mobile when logo is shown
          "absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0": show,
        })}
      >
        {show ? (
          <Suspense fallback={<div className="w-8 h-8" />}>
            <BrandLogo isLandingPage={isLandingPage} />
          </Suspense>
        ) : (
          <Suspense fallback={<div className="w-8 h-8" />}>
            <SmartBackButton fallbackHref={getBackHref()} />
          </Suspense>
        )}
      </NavbarBrand>
      {/* Mobile: right-side menu trigger */}
      {show && !isLandingPage && isHydrated && (
        <NavbarContent className="md:hidden" justify="end">
          <NavbarItem>
            <Suspense fallback={<div className="w-8 h-8" />}>
              <MobileSidebar
                trigger={
                  <Button isIconOnly variant="light" radius="full" aria-label="Open menu">
                    <IoMenuOutline className="size-6" />
                  </Button>
                }
              />
            </Suspense>
          </NavbarItem>
        </NavbarContent>
      )}
      {show && !isLandingPage && isHydrated && (
        <NavbarContent className="hidden md:flex" justify="center">
          <NavbarItem>
            <Suspense fallback={<div className="w-32 h-8" />}>
              <NavbarMenuItems size="md" variant="underlined" section={contentType as 'movie' | 'tv' | 'anime'} />
            </Suspense>
          </NavbarItem>
        </NavbarContent>
      )}
      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="hidden items-center gap-2 md:flex">
          {!isLandingPage && show && !pathName.startsWith("/search") && isHydrated && (
            <form
              className="w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const q = navSearchQuery.trim();
                if (q.length === 0) return;
                router.push(`/search?q=${encodeURIComponent(q)}&content=${contentType}`);
              }}
            >
              <Suspense fallback={<div className="w-48 h-8" />}>
                <SearchInput
                  size="sm"
                  className="w-48 lg:w-64"
                  placeholder="Search..."
                  value={navSearchQuery}
                  onValueChange={setNavSearchQuery}
                />
              </Suspense>
            </form>
          )}
          {isHydrated && (
            <Suspense fallback={<div className="w-8 h-8" />}>
              <ThemeSwitchDropdown section={contentType as 'movie' | 'tv' | 'anime'} isLandingPage={isLandingPage} />
            </Suspense>
          )}
          {isHydrated && (
            <Suspense fallback={<div className="w-8 h-8" />}>
              <FullscreenToggleButton />
            </Suspense>
          )}
          {!isLandingPage && isHydrated && (
            <Suspense fallback={<div className="w-8 h-8" />}>
              <UserProfileButton />
            </Suspense>
          )}
          {isLandingPage && (
            <Button
              as={Link}
              href="/auth"
              size="sm"
              color="primary"
              className="px-4 py-2.5 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              startContent={<User className="w-3 h-3" />}
            >
              Login
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
