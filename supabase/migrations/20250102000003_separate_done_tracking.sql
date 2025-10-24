-- Remove done column and related indexes from watchlist table
ALTER TABLE public.watchlist DROP COLUMN IF EXISTS done;
DROP INDEX IF EXISTS public.watchlist_done_idx;
DROP INDEX IF EXISTS public.watchlist_type_done_idx;

-- Create new watchlist_done table for tracking completed items
CREATE TABLE public.watchlist_done (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id integer NOT NULL,
  type text NOT NULL CHECK (type IN ('movie','tv','anime')),
  adult boolean NOT NULL,
  backdrop_path text,
  poster_path text,
  release_date date NOT NULL,
  title text NOT NULL,
  vote_average numeric(4,1) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id, type)
);

-- Enable RLS on watchlist_done table
ALTER TABLE public.watchlist_done ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlist_done table
CREATE POLICY "Users can view their own completed items"
ON public.watchlist_done
FOR SELECT
TO authenticated
USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can insert their own completed items"
ON public.watchlist_done
FOR INSERT
TO authenticated
WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can delete their own completed items"
ON public.watchlist_done
FOR DELETE
TO authenticated
USING ((( SELECT auth.uid() AS uid) = user_id));

-- Create indexes for better performance
CREATE INDEX watchlist_done_user_id_idx ON public.watchlist_done (user_id);
CREATE INDEX watchlist_done_type_idx ON public.watchlist_done (user_id, type);
CREATE INDEX watchlist_done_completed_at_idx ON public.watchlist_done (user_id, completed_at);
