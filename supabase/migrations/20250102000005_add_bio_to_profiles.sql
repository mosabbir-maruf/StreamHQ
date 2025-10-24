-- Add bio field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN bio text;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.bio IS 'User bio/description text';
