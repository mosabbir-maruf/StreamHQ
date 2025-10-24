"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Divider, ScrollShadow } from "@heroui/react";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import SearchInput from "@/components/ui/input/SearchInput";
import ThemeSwitchDropdown from "@/components/ui/input/ThemeSwitchDropdown";
import FullscreenToggleButton from "@/components/ui/button/FullscreenToggleButton";
import UserProfileButton from "@/components/ui/button/UserProfileButton";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { Avatar } from "@heroui/react";
import { User } from "@/utils/icons";
import { cn } from "@/utils/helpers";
import { GoHome, GoHomeFill } from "react-icons/go";
import { MdOutlineMovie, MdMovie, MdAnimation } from "react-icons/md";
import { PiTelevision, PiTelevisionFill } from "react-icons/pi";
import { IoFlameOutline, IoFlame } from "react-icons/io5";
import { TbFolder, TbFolderFilled } from "react-icons/tb";
import { IoShieldCheckmarkOutline, IoShieldCheckmark } from "react-icons/io5";
import { IoCallOutline, IoCall } from "react-icons/io5";
import { Drawer } from "vaul";
import { useRouter } from "@bprogress/next";
import { useState } from "react";
import { Search } from "@/utils/icons";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { signOut } from "@/actions/auth";
import { addToast } from "@heroui/react";
import { Gear } from "@/utils/icons";
import { IoLogOutOutline } from "react-icons/io5";

interface MobileSidebarProps {
  trigger: React.ReactNode;
}

const menu = [
  { label: "Home", href: "/", icon: GoHome, activeIcon: GoHomeFill },
  { label: "Movies", href: "/discover?content=movie", icon: MdOutlineMovie, activeIcon: MdMovie },
  { label: "TV", href: "/discover?content=tv", icon: PiTelevision, activeIcon: PiTelevisionFill },
  { label: "Anime", href: "/discover?content=anime", icon: MdAnimation, activeIcon: MdAnimation },
  { label: "Most Watched", href: "/discover?type=todayTrending&content=movie", icon: IoFlameOutline, activeIcon: IoFlame },
  { label: "Library", href: "/library", icon: TbFolder, activeIcon: TbFolderFilled },
  { label: "Privacy Policy", href: "/privacy", icon: IoShieldCheckmarkOutline, activeIcon: IoShieldCheckmark },
  { label: "Contact", href: "/contact", icon: IoCallOutline, activeIcon: IoCall },
];

const MobileSidebar: React.FC<MobileSidebarProps> = ({ trigger }) => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const { content } = useDiscoverFilters();
  const { data: user, isLoading } = useSupabaseUser();
  
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

  return (
    <div className="md:hidden">
      <VaulDrawer
        trigger={trigger}
        title={<span className="font-semibold">Menu</span>}
        direction="right"
        backdrop="blur"
        withCloseButton
        scrollable
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        classNames={{
          content: "p-4",
          childrenWrapper: "w-full",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <form
              className="flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                const q = mobileSearchQuery.trim();
                if (q.length === 0) {
                  router.push(`/search?content=${contentType}`);
                } else {
                  router.push(`/search?q=${encodeURIComponent(q)}&content=${contentType}`);
                }
                setDrawerOpen(false);
                setMobileSearchQuery("");
              }}
            >
              <SearchInput
                size="sm"
                className="w-full"
                placeholder="Search..."
                value={mobileSearchQuery}
                onValueChange={setMobileSearchQuery}
              />
            </form>
            <Drawer.Close asChild>
              <Button
                isIconOnly
                aria-label="Search"
                type="button"
                onPress={() => {
                  const q = mobileSearchQuery.trim();
                  if (q.length === 0) {
                    router.push(`/search?content=${contentType}`);
                  } else {
                    router.push(`/search?q=${encodeURIComponent(q)}&content=${contentType}`);
                  }
                  setMobileSearchQuery("");
                }}
                radius="full"
                variant="flat"
                color={contentType === "movie" ? "primary" : contentType === "tv" ? "warning" : "danger"}
              >
                <Search />
              </Button>
            </Drawer.Close>
            <ThemeSwitchDropdown section={contentType as 'movie' | 'tv' | 'anime'} />
            <FullscreenToggleButton />
            {!isLoading && user && (
              <Drawer.Close asChild>
                <Button
                  as={Link}
                  href="/profile"
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="p-0 min-w-0 w-8 h-8"
                >
                  <Avatar
                    showFallback
                    src={user.avatar || undefined}
                    className="size-8"
                    fallback={<User className="text-lg" />}
                  />
                </Button>
              </Drawer.Close>
            )}
          </div>

          <Divider className="my-1" />

          <ScrollShadow className="max-h-[70vh] pr-1">
            <nav className="flex flex-col">
              {menu.map(({ label, href, icon: Icon, activeIcon: ActiveIcon }) => {
                // Determine active state by matching both pathname and query params
                let computedHref = href;
                // Append content to info pages to keep theme context
                if (href === '/privacy' || href === '/contact') {
                  computedHref = `${href}?content=${contentType}`;
                }
                const url = new URL(computedHref, "http://localhost");
                const targetPath = url.pathname;
                const targetParams = url.searchParams;
                const baseMatch = pathName === targetPath;
                let queryMatch = true;
                if (targetParams && targetParams.toString().length > 0) {
                  targetParams.forEach((value, key) => {
                    if (searchParams?.get(key) !== value) {
                      queryMatch = false;
                    }
                  });
                }
                const isActive = baseMatch && queryMatch;
                return (
                  <Drawer.Close asChild key={href}>
                    <Button
                      as={Link}
                      href={computedHref}
                      radius="sm"
                      variant={isActive ? "flat" : "light"}
                      className={cn(
                        "justify-start h-12 px-3 transition-transform duration-200 active:scale-[0.98]",
                        isActive ? "bg-primary/10" : "",
                      )}
                      startContent={
                        <span className="grid place-items-center size-6">
                          {isActive ? <ActiveIcon className="size-5" /> : <Icon className="size-5" />}
                        </span>
                      }
                    >
                      <span className="text-base">{label}</span>
                    </Button>
                  </Drawer.Close>
                );
              })}
            </nav>
          </ScrollShadow>

          <Divider className="my-2" />
          
          {/* Authentication Options */}
          {!isLoading && !user && (
            <div className="flex flex-col gap-2">
              <Drawer.Close asChild>
                <Button
                  as={Link}
                  href="/auth"
                  size="lg"
                  color={contentType === "movie" ? "primary" : contentType === "tv" ? "warning" : "danger"}
                  className="px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  startContent={<User className="w-4 h-4" />}
                >
                  Login
                </Button>
              </Drawer.Close>
            </div>
          )}
          
          {/* Profile Options */}
          {!isLoading && user && (
            <div className="flex flex-col gap-2">
              <Drawer.Close asChild>
                <Button
                  as={Link}
                  href="/profile"
                  radius="sm"
                  variant="light"
                  className="justify-start h-12 px-3 transition-transform duration-200 active:scale-[0.98]"
                  startContent={
                    <span className="grid place-items-center size-6">
                      <User className="size-5" />
                    </span>
                  }
                >
                  <span className="text-base">Profile</span>
                </Button>
              </Drawer.Close>
              
              <Button
                radius="sm"
                variant="light"
                className="justify-start h-12 px-3 transition-transform duration-200 active:scale-[0.98]"
                startContent={
                  <span className="grid place-items-center size-6">
                    <Gear className="size-5" />
                  </span>
                }
                onPress={() => {
                  router.push("/profile?settings=true");
                  setDrawerOpen(false);
                }}
              >
                <span className="text-base">Settings</span>
              </Button>
              
              <Button
                radius="sm"
                variant="light"
                className="justify-start h-12 px-3 transition-transform duration-200 active:scale-[0.98] text-danger"
                startContent={
                  <span className="grid place-items-center size-6">
                    {logout ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-danger border-t-transparent" />
                    ) : (
                      <IoLogOutOutline className="size-5" />
                    )}
                  </span>
                }
                onPress={async () => {
                  if (logout) return;
                  setLogout(true);
                  const { success, message } = await signOut();
                  addToast({
                    title: message,
                    color: success ? "primary" : "danger",
                  });
                  if (!success) {
                    return setLogout(false);
                  }
                  setDrawerOpen(false);
                  return router.push("/auth");
                }}
              >
                <span className="text-base">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </VaulDrawer>
    </div>
  );
};

export default MobileSidebar;


