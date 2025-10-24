import { signOut } from "@/actions/auth";
import useBreakpoints from "@/hooks/useBreakpoints";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { DropdownItemProps } from "@/types/component";
import { Gear, User } from "@/utils/icons";
import { IoLogInOutline, IoLogOutOutline } from "react-icons/io5";
import { useRouter } from "@bprogress/next/app";
import {
  addToast,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const UserProfileButton: React.FC = () => {
  const router = useRouter();
  const [logout, setLogout] = useState(false);
  const { data: user, isLoading } = useSupabaseUser();
  const { mobile } = useBreakpoints();
  const { content } = useDiscoverFilters();
  const pathName = usePathname();
  
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

  const ITEMS: DropdownItemProps[] = useMemo(
    () => [
      { label: "Profile", href: "/profile", icon: <User /> },
      { 
        label: "Settings", 
        onClick: () => {
          // Navigate to profile page and trigger settings modal
          router.push("/profile?settings=true");
        }, 
        icon: <Gear /> 
      },
      {
        label: "Logout",
        onClick: async () => {
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
          return router.push("/auth");
        },
        icon: logout ? <Spinner size="sm" color="danger" /> : <IoLogOutOutline className="text-xl" />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [logout],
  );

  if (isLoading) return null;

  const guest = !user;
  const avatar = user?.avatar || undefined;

  const ProfileButton = (
    <Button
      title={guest ? "Login" : user.username}
      variant={guest ? "solid" : "light"}
      color={guest ? (contentType === "movie" ? "primary" : contentType === "tv" ? "warning" : "danger") : undefined}
      href={guest ? "/auth" : undefined}
      as={guest ? Link : undefined}
      isIconOnly={mobile && !guest}
      size={guest ? "sm" : undefined}
      startContent={
        guest ? <User className="w-3 h-3" /> : undefined
      }
      endContent={
        !guest ? (
          <Avatar
            showFallback
            src={avatar}
            className="size-7"
            fallback={<User className="text-xl" />}
          />
        ) : undefined
      }
      className={guest ? "px-4 py-2.5 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300" : "min-w-fit"}
    >
      {guest ? (
        <span className="text-sm font-medium">Login</span>
      ) : (
        <p className="hidden max-w-32 truncate md:block lg:max-w-56">{user.username}</p>
      )}
    </Button>
  );

  if (guest) return ProfileButton;

  return (
    <Dropdown showArrow closeOnSelect={false} className="w-10">
      <DropdownTrigger className="w-10">{ProfileButton}</DropdownTrigger>
      <DropdownMenu
        aria-label="User profile dropdown"
        variant="flat"
        disabledKeys={logout ? ITEMS.map((i) => i.label) : undefined}
      >
        {ITEMS.map(({ label, icon, ...props }) => (
          <DropdownItem key={label} startContent={icon} {...props}>
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserProfileButton;
