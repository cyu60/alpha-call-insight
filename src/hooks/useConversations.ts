import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Call } from "@/types/call";

interface ElevenLabsConversation {
  conversation_id: string;
  agent_id: string;
  status: string;
  metadata?: {
    title?: string;
    participant_name?: string;
    participant_phone?: string;
  };
  start_time_unix_secs: number;
  transcript?: string;
  analysis?: {
    evaluation_criteria_results?: Record<string, {
      result: boolean;
    }>;
  };
}

export const useConversations = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('fetch-conversations');

      if (fnError) throw fnError;

      if (data?.conversations) {
        const transformedCalls: Call[] = data.conversations.map((conv: ElevenLabsConversation) => 
          transformConversation(conv)
        );
        setCalls(transformedCalls);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const transformConversation = (conv: ElevenLabsConversation): Call => {
    const date = new Date(conv.start_time_unix_secs * 1000);
    const transcript = parseTranscript(conv.transcript || '');
    
    // Calculate sentiment based on evaluation criteria
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (conv.analysis?.evaluation_criteria_results) {
      const results = Object.values(conv.analysis.evaluation_criteria_results);
      const passCount = results.filter(r => r.result).length;
      const passRate = passCount / results.length;
      
      if (passRate >= 0.7) sentiment = 'positive';
      else if (passRate <= 0.3) sentiment = 'negative';
    }

    return {
      id: conv.conversation_id,
      title: conv.metadata?.title || 'Investor Call',
      participant: conv.metadata?.participant_name || 'Unknown Participant',
      date: date.toISOString().split('T')[0],
      duration: calculateDuration(transcript),
      sentiment,
      summary: generateSummary(transcript),
      keyMetrics: {
        actionItems: countActionItems(transcript),
        keyTopics: countKeyTopics(transcript),
        decisions: countDecisions(conv.analysis?.evaluation_criteria_results),
      },
      transcript,
    };
  };

  const parseTranscript = (transcriptText: string) => {
    if (!transcriptText) return [];
    
    // Parse transcript format from ElevenLabs
    const lines = transcriptText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const [speaker, ...textParts] = line.split(':');
      return {
        speaker: speaker?.trim() || 'Speaker',
        timestamp: formatTimestamp(index * 30), // Approximate timestamp
        text: textParts.join(':').trim() || '',
      };
    });
  };

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (transcript: any[]): number => {
    return transcript.length * 30; // Approximate 30 seconds per exchange
  };

  const generateSummary = (transcript: any[]): string => {
    if (!transcript.length) return 'No summary available';
    const firstFewLines = transcript.slice(0, 3).map(t => t.text).join(' ');
    return firstFewLines.slice(0, 200) + (firstFewLines.length > 200 ? '...' : '');
  };

  const countActionItems = (transcript: any[]): number => {
    const actionWords = ['will', 'should', 'need to', 'must', 'todo', 'action'];
    return transcript.filter(t => 
      actionWords.some(word => t.text.toLowerCase().includes(word))
    ).length;
  };

  const countKeyTopics = (transcript: any[]): number => {
    // Count unique topics mentioned
    const topics = new Set<string>();
    const topicWords = ['market', 'product', 'revenue', 'growth', 'team', 'strategy'];
    
    transcript.forEach(t => {
      topicWords.forEach(word => {
        if (t.text.toLowerCase().includes(word)) topics.add(word);
      });
    });
    
    return topics.size;
  };

  const countDecisions = (evaluationResults?: Record<string, { result: boolean }>): number => {
    if (!evaluationResults) return 0;
    return Object.values(evaluationResults).filter(r => r.result).length;
  };

  return { calls, loading, error, refetch: fetchConversations };
};
