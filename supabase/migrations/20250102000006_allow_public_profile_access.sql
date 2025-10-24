-- Allow public access to user data when profile is public
-- This enables public profile viewing without authentication
-- IMPORTANT: These policies only allow SELECT (read) access, not INSERT/UPDATE/DELETE

-- Policy for watchlist table - allow public access if user profile is public
CREATE POLICY "Allow public access to watchlist for public profiles" ON public.watchlist
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = watchlist.user_id 
    AND profiles.is_public = true
  )
);

-- Policy for watchlist_done table - allow public access if user profile is public
CREATE POLICY "Allow public access to watchlist_done for public profiles" ON public.watchlist_done
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = watchlist_done.user_id 
    AND profiles.is_public = true
  )
);

-- Policy for histories table - allow public access if user profile is public
CREATE POLICY "Allow public access to histories for public profiles" ON public.histories
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = histories.user_id 
    AND profiles.is_public = true
  )
);

-- Policy for profiles table - allow public access to public profiles
CREATE POLICY "Allow public access to public profiles" ON public.profiles
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- SECURITY: Ensure anonymous users CANNOT insert/update/delete data
-- These policies explicitly deny write access to anonymous users

-- Deny all write operations for anonymous users on watchlist
CREATE POLICY "Deny anonymous write access to watchlist" ON public.watchlist
FOR ALL
TO anon
USING (false);

-- Deny all write operations for anonymous users on watchlist_done
CREATE POLICY "Deny anonymous write access to watchlist_done" ON public.watchlist_done
FOR ALL
TO anon
USING (false);

-- Deny all write operations for anonymous users on histories
CREATE POLICY "Deny anonymous write access to histories" ON public.histories
FOR ALL
TO anon
USING (false);

-- Deny all write operations for anonymous users on profiles
CREATE POLICY "Deny anonymous write access to profiles" ON public.profiles
FOR ALL
TO anon
USING (false);
