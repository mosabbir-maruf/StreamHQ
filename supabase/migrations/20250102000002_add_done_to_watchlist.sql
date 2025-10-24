-- Add done status to watchlist table
ALTER TABLE public.watchlist 
ADD COLUMN done boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering by done status
CREATE INDEX watchlist_done_idx ON public.watchlist (user_id, done);

-- Add index for combined filtering (type + done status)
CREATE INDEX watchlist_type_done_idx ON public.watchlist (user_id, type, done);
