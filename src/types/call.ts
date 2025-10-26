export interface UserEnrichment {
  company_name?: string | null;
  context?: string | null;
  industry?: string | null;
}

export interface ConversationMetadata {
  follow_up_date?: string;
  lead_score?: number;
  updated_at?: string;
  user_enrichment?: UserEnrichment;
}

export interface DataCollection {
  profile?: string;
  revenue?: string;
  stage?: string;
  region?: string;
  name?: string;
}

export interface Call {
  id: string;
  title: string;
  participant: string;
  date: string;
  duration: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  keyMetrics: {
    actionItems: number;
    keyTopics: number;
    decisions: number;
  };
  dataCollection?: DataCollection;
  metadata?: ConversationMetadata;
  transcript: TranscriptLine[];
}

export interface TranscriptLine {
  speaker: string;
  timestamp: string;
  text: string;
}
