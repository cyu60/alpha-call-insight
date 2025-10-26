-- Create conversations table to store call data
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  participant TEXT NOT NULL,
  duration INTEGER NOT NULL,
  sentiment TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create data_collection table for founder information
CREATE TABLE public.data_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  name TEXT,
  profile TEXT,
  stage TEXT,
  revenue TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create call_metrics table for key metrics
CREATE TABLE public.call_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  action_items INTEGER DEFAULT 0,
  questions INTEGER DEFAULT 0,
  transcript_length INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for now, since there's no auth)
CREATE POLICY "Public read access for conversations"
  ON public.conversations FOR SELECT
  USING (true);

CREATE POLICY "Public read access for data_collection"
  ON public.data_collection FOR SELECT
  USING (true);

CREATE POLICY "Public read access for call_metrics"
  ON public.call_metrics FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_conversations_conversation_id ON public.conversations(conversation_id);
CREATE INDEX idx_data_collection_conversation_id ON public.data_collection(conversation_id);
CREATE INDEX idx_call_metrics_conversation_id ON public.call_metrics(conversation_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();