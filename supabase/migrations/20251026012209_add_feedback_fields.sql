-- Add email and feedback tracking fields to conversations table
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS founder_email TEXT,
ADD COLUMN IF NOT EXISTS feedback_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for querying unfeedback conversations
CREATE INDEX IF NOT EXISTS idx_conversations_feedback_sent
ON public.conversations(feedback_sent)
WHERE feedback_sent = false;
