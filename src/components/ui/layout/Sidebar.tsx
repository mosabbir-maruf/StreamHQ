"use client";

import NavbarMenuItems from "../other/NavbarMenuItems";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathName = usePathname();
  const { content } = useDiscoverFilters();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const extraNavbarPaths = ["/aboutandfaq", "/contact", "/privacy"];
  const shouldShowSidebar = hrefs.includes(pathName) || extraNavbarPaths.includes(pathName);

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
    <div className="flex h-full">
      {shouldShowSidebar && (
        <div className="hidden md:block">
          <div className="left-0 top-0 w-20" />
          <aside className="fixed left-0 top-0 h-screen w-fit">
            <nav className="flex h-full flex-col justify-center bg-background pl-2 text-foreground">
              <NavbarMenuItems size="sm" isVertical withIcon variant="light" section={contentType as 'movie' | 'tv' | 'anime'} />
            </nav>
          </aside>
        </div>
      )}
      {children}
    </div>
  );
};

export default Sidebar;
