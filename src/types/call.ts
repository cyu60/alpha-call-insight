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
  transcript: TranscriptLine[];
}

export interface TranscriptLine {
  speaker: string;
  timestamp: string;
  text: string;
}
