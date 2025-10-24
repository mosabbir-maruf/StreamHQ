import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../env";

const PROTECTED_PATHS = env.PROTECTED_PATHS?.split(",") ?? [];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow public profile access (profile/[userId] routes)
  const isPublicProfile = pathname.startsWith('/profile/') && pathname !== '/profile';
  
  // Allow public access to movie/TV/anime detail pages (but not player pages)
  const isPublicContentPage = (
    pathname.startsWith('/movie/') || 
    pathname.startsWith('/tv/') || 
    pathname.startsWith('/anime/')
  ) && !pathname.includes('/player/');
  
  // Allow public access to home page and other public routes
  const isPublicRoute = (
    pathname === '/' || 
    pathname.startsWith('/discover') || 
    pathname.startsWith('/search') ||
    pathname.startsWith('/aboutandfaq') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/movie-request')
  );
  
  // Check if user is navigating back from a public route (back button)
  const referer = request.headers.get('referer');
  const isBackNavigation = referer && (
    referer.includes('/movie/') || 
    referer.includes('/tv/') || 
    referer.includes('/anime/') ||
    referer.includes('/discover') ||
    referer.includes('/search')
  );
  
  // if user is not logged in and the current pathname is protected, redirect to login page
  if (!user && PROTECTED_PATHS.some((url) => pathname.startsWith(url)) && !isPublicProfile && !isPublicContentPage && !isPublicRoute && !isBackNavigation) {
    const url = request.nextUrl.clone();
    
    // If it's back navigation, redirect to home instead of auth
    if (isBackNavigation) {
      url.pathname = "/";
    } else {
      url.pathname = "/auth";
      
      // Add content type parameter based on the current path
      if (pathname.startsWith('/anime/')) {
        url.searchParams.set('content', 'anime');
      } else if (pathname.startsWith('/tv/')) {
        url.searchParams.set('content', 'tv');
      } else if (pathname.startsWith('/movie/')) {
        url.searchParams.set('content', 'movie');
      }
    }

    const redirectRes = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectRes;
  }

  // if user is logged in and the current pathname is auth, redirect to home page
  if (user && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/";

    const redirectRes = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectRes;
  }

  return supabaseResponse;
}
