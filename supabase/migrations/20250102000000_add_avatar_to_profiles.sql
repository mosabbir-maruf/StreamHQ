-- Add avatar field to profiles table
alter table public.profiles add column avatar text;

-- Update existing profiles to have a random avatar
update public.profiles 
set avatar = '/avatar/avatar' || (floor(random() * 100) + 1) || '.png'
where avatar is null;
