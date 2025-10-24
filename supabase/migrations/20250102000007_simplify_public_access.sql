-- Simplify public profile access
-- Allow public access to all profile data for now
-- This ensures public profiles work without complex RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public access to watchlist for public profiles" ON public.watchlist;
DROP POLICY IF EXISTS "Allow public access to watchlist_done for public profiles" ON public.watchlist_done;
DROP POLICY IF EXISTS "Allow public access to histories for public profiles" ON public.histories;
DROP POLICY IF EXISTS "Allow public access to public profiles" ON public.profiles;

-- Create simpler policies that allow public access
CREATE POLICY "Allow public read access to watchlist" ON public.watchlist
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to watchlist_done" ON public.watchlist_done
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to histories" ON public.histories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to profiles" ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Keep the security policies for write access
-- These remain unchanged to prevent anonymous users from modifying data
