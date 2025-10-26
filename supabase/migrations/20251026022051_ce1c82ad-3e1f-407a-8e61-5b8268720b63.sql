-- Add transcript column to conversations table to store conversation messages
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '[]'::jsonb;