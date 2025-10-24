-- Add privacy setting to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_public boolean DEFAULT true;

-- Update existing profiles to be public by default
UPDATE public.profiles 
SET is_public = true 
WHERE is_public IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.is_public IS 'Whether the profile is visible to unauthenticated users';
