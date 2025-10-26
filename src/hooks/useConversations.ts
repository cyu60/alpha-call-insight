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
  metadata?: any;
  analysis?: {
    evaluation_criteria_results?: Record<string, {
      result: boolean;
      reason?: string;
    }>;
    data_collection_results?: Record<string, {
      data_collection_id: string;
      value: string | null;
      rationale?: string;
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

      // Fetch from database
      const { data: dbData, error: dbError } = await supabase
        .from('conversations')
        .select(`
          *,
          data_collection(*),
          call_metrics(*)
        `)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      if (dbData && dbData.length > 0) {
        // Transform database data to Call format
        const transformedCalls: Call[] = dbData.map((conv: any) => ({
          id: conv.conversation_id,
          title: conv.title,
          participant: conv.participant,
          date: new Date(conv.created_at).toISOString().split('T')[0],
          duration: conv.duration,
          sentiment: conv.sentiment as 'positive' | 'neutral' | 'negative',
          summary: conv.summary,
          keyMetrics: {
            actionItems: conv.call_metrics?.[0]?.action_items || 0,
            keyTopics: 0,
            decisions: 0,
          },
          dataCollection: {
            name: conv.data_collection?.[0]?.name,
            profile: conv.data_collection?.[0]?.profile,
            stage: conv.data_collection?.[0]?.stage,
            revenue: conv.data_collection?.[0]?.revenue,
            region: conv.data_collection?.[0]?.region,
          },
          metadata: conv.metadata || undefined,
          transcript: [],
        }));
        setCalls(transformedCalls);
      } else {
        setCalls([]);
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
    const dataCollection = extractDataCollection(conv.analysis?.data_collection_results);

    return {
      id: conv.conversation_id,
      title: conv.call_summary_title || 'Investor Call',
      participant: dataCollection.name || conv.agent_name || 'AI Agent',
      date: date.toISOString().split('T')[0],
      duration: conv.call_duration_secs,
      sentiment,
      summary,
      keyMetrics: {
        actionItems: countActionItems(transcript),
        keyTopics: countKeyTopics(transcript),
        decisions: countDecisions(conv.analysis?.evaluation_criteria_results),
      },
      dataCollection,
      metadata: conv.metadata || undefined,
      transcript,
    };
  };

  const extractDataCollection = (results?: Record<string, any>) => {
    if (!results) return {};
    
    return {
      profile: results.Profile?.value || undefined,
      revenue: results.Revenue?.value || undefined,
      stage: results.Stage?.value || undefined,
      region: results.Region?.value || undefined,
      name: results.name?.value || undefined,
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
