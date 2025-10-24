import { siteConfig } from "@/config/site";
import { Link, Tab, Tabs, TabsProps } from "@heroui/react";
import { usePathname } from "next/navigation";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

interface NavbarMenuItemsProps extends TabsProps {
  withIcon?: boolean;
  section?: 'movie' | 'tv' | 'anime';
  menuArray?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
  }[];
}

const NavbarMenuItems: React.FC<NavbarMenuItemsProps> = ({
  menuArray = siteConfig.navItems,
  isVertical,
  withIcon,
  variant = "underlined",
  size = "lg",
  section,
}) => {
  const pathName = usePathname();
  const { content } = useDiscoverFilters();

  // Determine content type from route or query parameter
  const contentType: 'movie' | 'tv' | 'anime' | undefined = (() => {
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

  // Get section-specific color for underline
  const getSectionColor = () => {
    const currentSection = section || contentType;
    switch (currentSection) {
      case 'movie':
        return 'primary'; // Blue for movies
      case 'tv':
        return 'warning'; // Yellow for TV shows
      case 'anime':
        return 'danger'; // Red for anime
      default:
        return 'primary'; // Default blue
    }
  };

  return (
    <Tabs
      size={size}
      variant={variant}
      selectedKey={pathName}
      isVertical={isVertical}
      color={getSectionColor()}
      classNames={{
        tabList: isVertical && "gap-5",
        tab: "h-full w-full",
      }}
    >
      {menuArray.map((item) => {
        const isActive = pathName === item.href;
        let title: React.ReactNode = item.label;

        if (withIcon) {
          title = (
            <div className="flex max-h-[45px] flex-col items-center gap-1">
              {isActive ? item.activeIcon : item.icon}
              <p>{item.label}</p>
            </div>
          );
        }

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
          <Tab as={Link} href={href} key={item.href} className="text-start" title={title} />
        );
      })}
    </Tabs>
  );
};

export default NavbarMenuItems;
