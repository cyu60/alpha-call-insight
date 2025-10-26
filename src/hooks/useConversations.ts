import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Call } from "@/types/call";

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
    
    // Determine sentiment based on call success
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (conv.call_successful === 'success') {
      sentiment = 'positive';
    } else if (conv.call_successful === 'failed') {
      sentiment = 'negative';
    }

    return {
      id: conv.conversation_id,
      title: conv.call_summary_title || 'Investor Call',
      participant: conv.agent_name || 'AI Agent',
      date: date.toISOString().split('T')[0],
      duration: conv.call_duration_secs,
      sentiment,
      summary: `Call with ${conv.agent_name}. Duration: ${formatCallDuration(conv.call_duration_secs)}. ${conv.message_count} messages exchanged.`,
      keyMetrics: {
        actionItems: Math.floor(conv.message_count / 10), // Rough estimate
        keyTopics: Math.floor(conv.message_count / 8),
        decisions: conv.call_successful === 'success' ? 1 : 0,
      },
      transcript: generateMockTranscript(conv),
    };
  };

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const generateMockTranscript = (conv: ElevenLabsConversation) => {
    return [
      {
        speaker: conv.agent_name,
        timestamp: "00:00",
        text: `Welcome to ${conv.call_summary_title}. How can I help you today?`
      },
      {
        speaker: "Caller",
        timestamp: "00:15",
        text: "Thank you for taking my call. I'd like to discuss our startup opportunity."
      }
    ];
  };


  return { calls, loading, error, refetch: fetchConversations };
};
