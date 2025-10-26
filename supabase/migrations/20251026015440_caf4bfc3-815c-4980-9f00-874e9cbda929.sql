-- Add metadata column to conversations table for flexible additional data
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_conversations_metadata ON public.conversations USING GIN (metadata);

-- Create policy for updating conversations
CREATE POLICY "Public can update conversations"
  ON public.conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy for inserting conversations
CREATE POLICY "Public can insert conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);