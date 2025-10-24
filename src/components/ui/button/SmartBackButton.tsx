"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";
import useSupabaseUser from "@/hooks/useSupabaseUser";

interface SmartBackButtonProps {
  fallbackHref?: string;
}

const SmartBackButton: React.FC<SmartBackButtonProps> = ({ fallbackHref = "/" }) => {
  const [backHref, setBackHref] = useState<string | undefined>(fallbackHref);
  const router = useRouter();
  const { data: currentUser } = useSupabaseUser();

  useEffect(() => {
    // Check if user came from a profile page using session storage
    if (typeof window !== 'undefined') {
      const profileContext = sessionStorage.getItem('profileContext');
      if (profileContext) {
        // Check if the profile context is the current user's profile
        if (currentUser && profileContext.includes(currentUser.username)) {
          // If it's the current user's profile, redirect to their private profile
          setBackHref('/profile');
        } else {
          // Otherwise, use the stored profile context
          setBackHref(profileContext);
        }
        return;
      }
    }
    
    // Check if user came from a profile page using referrer as fallback
    const referrer = document.referrer;
    if (referrer) {
      // If referrer contains a profile path, go back to that profile
      const profileMatch = referrer.match(/\/profile\/([^\/\?]+)/);
      if (profileMatch) {
        setBackHref(`/profile/${profileMatch[1]}`);
        return;
      }
      
      // If referrer is from the same domain, use browser's back functionality
      try {
        const referrerUrl = new URL(referrer);
        const currentUrl = new URL(window.location.href);
        if (referrerUrl.origin === currentUrl.origin) {
          // Use browser's back functionality by not setting a specific href
          setBackHref(undefined);
          return;
        }
      } catch (e) {
        // Invalid URL, continue with fallback
      }
    }
    
    // Keep the fallback href if no specific referrer found
    setBackHref(fallbackHref);
  }, [fallbackHref, currentUser]);

  return <BackButton href={backHref} />;
};

export default SmartBackButton;
