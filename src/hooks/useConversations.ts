import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Call } from "@/types/call";

interface ElevenLabsMessage {
  role: string;
  message: string;
  time_in_call_secs?: number;
}

interface ElevenLabsConversation {
  conversation_id: string;
  agent_id: string;
  agent_name: string;
  status: string;
  call_summary_title?: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  message_count: number;
  call_successful: string;
  direction: string;
  transcript?: ElevenLabsMessage[];
  analysis?: {
    evaluation_criteria_results?: Record<string, {
      result: boolean;
      reason?: string;
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
    
    // Determine sentiment based on call success and evaluation
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (conv.analysis?.evaluation_criteria_results) {
      const results = Object.values(conv.analysis.evaluation_criteria_results);
      const passCount = results.filter(r => r.result).length;
      const passRate = passCount / results.length;
      
      if (passRate >= 0.7) sentiment = 'positive';
      else if (passRate <= 0.3) sentiment = 'negative';
    } else if (conv.call_successful === 'success') {
      sentiment = 'positive';
    } else if (conv.call_successful === 'failed') {
      sentiment = 'negative';
    }

    const transcript = parseTranscript(conv.transcript || []);
    const summary = generateSummary(transcript, conv.call_summary_title);

    return {
      id: conv.conversation_id,
      title: conv.call_summary_title || 'Investor Call',
      participant: conv.agent_name || 'AI Agent',
      date: date.toISOString().split('T')[0],
      duration: conv.call_duration_secs,
      sentiment,
      summary,
      keyMetrics: {
        actionItems: countActionItems(transcript),
        keyTopics: countKeyTopics(transcript),
        decisions: countDecisions(conv.analysis?.evaluation_criteria_results),
      },
      transcript,
    };
  };

  const parseTranscript = (messages: ElevenLabsMessage[]) => {
    return messages.map((msg, index) => ({
      speaker: msg.role === 'user' ? 'Caller' : 'Gary Tan AI',
      timestamp: formatTimestamp(msg.time_in_call_secs || index * 30),
      text: msg.message,
    }));
  };

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateSummary = (transcript: any[], title?: string): string => {
    if (!transcript.length) return title || 'No summary available';
    
    const userMessages = transcript.filter(t => t.speaker === 'Caller');
    if (userMessages.length === 0) return title || 'Call initiated';
    
    const firstUserMessage = userMessages[0].text;
    return firstUserMessage.slice(0, 200) + (firstUserMessage.length > 200 ? '...' : '');
  };

  const countActionItems = (transcript: any[]): number => {
    const actionWords = ['will', 'should', 'need to', 'must', 'todo', 'action', 'follow up', 'next step'];
    return transcript.filter(t => 
      actionWords.some(word => t.text.toLowerCase().includes(word))
    ).length;
  };

  const countKeyTopics = (transcript: any[]): number => {
    const topics = new Set<string>();
    const topicWords = ['market', 'product', 'revenue', 'growth', 'team', 'strategy', 'funding', 'traction', 'customer'];
    
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
