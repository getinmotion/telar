-- Add dane_city column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN dane_city integer NULL;