import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/utils/supabase/server";
import PublicProfileClient from "./PublicProfileClient";

interface PublicUser {
  id: string;
  username: string;
  avatar: string | null;
  is_public: boolean;
  bio: string | null;
}

type Props = {
  params: Promise<{ userId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  
  try {
    const supabase = await createClient();
    
    // Check if userId looks like a UUID (starts with letters/numbers and has dashes)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, username, avatar, is_public, bio")
      .eq(isUUID ? "id" : "username", userId)
      .single();

    if (userError || !userData) {
      return {
        title: "User Not Found",
        description: "The requested user profile could not be found.",
        openGraph: {
          title: "User Not Found",
          description: "The requested user profile could not be found.",
          type: "profile",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/profile/${userId}`,
          siteName: siteConfig.name,
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`,
              width: 1280,
              height: 720,
              alt: "User Not Found",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "User Not Found",
          description: "The requested user profile could not be found.",
          images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
        },
      };
    }

    // Check if profile is public (default to true if column doesn't exist yet)
    const isPublic = (userData as any).is_public ?? true;
    
    if (isPublic === false) {
      return {
        title: "Private Profile",
        description: "This profile is private and cannot be viewed.",
        openGraph: {
          title: "Private Profile",
          description: "This profile is private and cannot be viewed.",
          type: "profile",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/profile/${userId}`,
          siteName: siteConfig.name,
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`,
              width: 1280,
              height: 720,
              alt: "Private Profile",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "Private Profile",
          description: "This profile is private and cannot be viewed.",
          images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
        },
      };
    }

    const username = (userData as any).username || "User";
    const bio = (userData as any).bio || "Check out my profile on StreamHQ";
    const avatar = (userData as any).avatar;
    
    // Use user avatar if available, otherwise fallback to default meta image
    const image = avatar 
      ? avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}${avatar}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`;
    
    return {
      title: username,
      description: bio,
      openGraph: {
        title: username,
        description: bio,
        type: "profile",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/profile/${userId}`,
        siteName: siteConfig.name,
        images: [
          {
            url: image,
            width: 400,
            height: 400,
            alt: `${username}'s profile`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: username,
        description: bio,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: "User Profile",
      description: "View user profile on StreamHQ",
      openGraph: {
        title: "User Profile",
        description: "View user profile on StreamHQ",
        type: "profile",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/profile/${userId}`,
        siteName: siteConfig.name,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`,
            width: 1280,
            height: 720,
            alt: "User Profile",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "User Profile",
        description: "View user profile on StreamHQ",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streamhq.vercel.app'}/images/meta.jpeg`],
      },
    };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;
  
  return <PublicProfileClient userId={userId} />;
}
