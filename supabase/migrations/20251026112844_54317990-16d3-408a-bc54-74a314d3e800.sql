-- Add analysis field to data_collection table
ALTER TABLE public.data_collection 
ADD COLUMN analysis jsonb DEFAULT '{}'::jsonb;