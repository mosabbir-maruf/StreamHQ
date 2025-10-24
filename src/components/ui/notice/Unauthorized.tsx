"use client";

import { Button, Link } from "@heroui/react";
import React from "react";
import { usePathname } from "next/navigation";

interface UnauthorizedNoticeProps {
  title: string;
  description: string;
}

const UnauthorizedNotice: React.FC<UnauthorizedNoticeProps> = ({ title, description }) => {
  const pathname = usePathname();
  
  // Determine content type from current path
  const getContentType = () => {
    if (pathname?.startsWith('/anime/')) return 'anime';
    if (pathname?.startsWith('/tv/')) return 'tv';
    if (pathname?.startsWith('/movie/')) return 'movie';
    return null;
  };
  
  const contentType = getContentType();
  const authUrl = contentType ? `/auth?content=${contentType}` : '/auth';
  const signUpUrl = contentType ? `/auth?content=${contentType}&form=register` : '/auth?form=register';
  
  return (
    <div className="flex h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-default-500">{description}</p>
      <div className="flex gap-2">
        <Button color="primary" as={Link} href={signUpUrl}>
          Sign Up
        </Button>
        <Button color="primary" as={Link} href={authUrl}>
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedNotice;
