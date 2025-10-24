-- Add 'anime' to the watchlist type constraint
ALTER TABLE public.watchlist 
DROP CONSTRAINT IF EXISTS watchlist_type_check;

ALTER TABLE public.watchlist 
ADD CONSTRAINT watchlist_type_check CHECK (type IN ('movie', 'tv', 'anime'));
