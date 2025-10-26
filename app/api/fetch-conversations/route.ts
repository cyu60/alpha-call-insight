import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  metadata?: Record<string, unknown>;
  analysis?: {
    evaluation_criteria_results?: Record<
      string,
      {
        result: boolean;
        reason?: string;
      }
    >;
    data_collection_results?: Record<
      string,
      {
        data_collection_id: string;
        value: string | null;
        rationale?: string;
      }
    >;
  };
}

export async function GET(request: NextRequest) {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Fetching Gary Tan AI conversations from ElevenLabs...");

    // First, get list of conversations with pagination
    const listResponse = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversations?page_size=100",
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error(
        "ElevenLabs list API error:",
        listResponse.status,
        errorText
      );
      throw new Error(`ElevenLabs API error: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    console.log(
      `Fetched ${listData.conversations?.length || 0} total conversations`
    );

    // Filter for Gary Tan AI only
    const garyConversations: ElevenLabsConversation[] =
      listData.conversations?.filter(
        (conv: ElevenLabsConversation) => conv.agent_name === "Gary Tan AI"
      ) || [];

    console.log(`Found ${garyConversations.length} Gary Tan AI conversations`);

    // Fetch full details for each conversation including transcript
    const detailedConversations = await Promise.all(
      garyConversations.map(async (conv: ElevenLabsConversation) => {
        try {
          console.log(
            `Fetching details for conversation ${conv.conversation_id}`
          );

          const detailResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
            {
              method: "GET",
              headers: {
                "xi-api-key": ELEVENLABS_API_KEY,
              },
            }
          );

          if (detailResponse.ok) {
            const details = await detailResponse.json();
            console.log(
              `Successfully fetched details for ${conv.conversation_id}`
            );
            return {
              ...conv,
              transcript: details.transcript,
              metadata: details.metadata,
              analysis: details.analysis,
            };
          } else {
            console.error(
              `Failed to fetch details for ${conv.conversation_id}: ${detailResponse.status}`
            );
            return conv;
          }
        } catch (error) {
          console.error(
            `Exception fetching details for ${conv.conversation_id}:`,
            error
          );
          return conv;
        }
      })
    );

    console.log(
      `Returning ${detailedConversations.length} detailed conversations`
    );

    // Save conversations to database
    for (const conv of detailedConversations) {
      try {
        console.log(`Saving conversation ${conv.conversation_id}`);
        console.log(`Transcript length: ${conv.transcript?.length || 0}`);
        console.log(`Metadata:`, JSON.stringify(conv.metadata || {}));

        // Upsert conversation with transcript and metadata
        const { data: conversationData, error: convError } = await supabase
          .from("conversations")
          .upsert(
            {
              conversation_id: conv.conversation_id,
              title: conv.call_summary_title || "Investor Call",
              participant:
                conv.analysis?.data_collection_results?.name?.value ||
                conv.agent_name ||
                "AI Agent",
              duration: conv.call_duration_secs || 0,
              sentiment: determineSentiment(conv),
              summary: conv.call_summary_title || "No summary available",
              transcript: conv.transcript || [],
              metadata: conv.metadata || {},
            },
            {
              onConflict: "conversation_id",
            }
          )
          .select()
          .single();

        if (convError) {
          console.error(
            `Error saving conversation ${conv.conversation_id}:`,
            convError
          );
          continue;
        }

        console.log(
          `Successfully saved conversation ${conv.conversation_id} to database`
        );

        // Save data collection if available
        if (conv.analysis?.data_collection_results) {
          const dcResults = conv.analysis.data_collection_results;
          const dcPayload = {
            conversation_id: conversationData.id,
            name: dcResults.name?.value || null,
            profile: dcResults.Profile?.value || null,
            stage: dcResults.Stage?.value || null,
            revenue: dcResults.Revenue?.value || null,
            region: dcResults.Region?.value || null,
            analysis: conv.analysis || {},
          };

          const { error: delDcErr } = await supabase
            .from("data_collection")
            .delete()
            .eq("conversation_id", conversationData.id);
          if (delDcErr)
            console.error(
              "Error clearing data_collection for",
              conversationData.id,
              delDcErr
            );

          const { error: insDcErr } = await supabase
            .from("data_collection")
            .insert(dcPayload);
          if (insDcErr)
            console.error(
              "Error inserting data_collection for",
              conversationData.id,
              insDcErr
            );
        }

        // Save metrics
        const actionItems = countActionItems(conv.transcript || []);
        const metricsPayload = {
          conversation_id: conversationData.id,
          action_items: actionItems,
          questions: 0,
          transcript_length: conv.transcript?.length || 0,
        };

        const { error: delMetricsErr } = await supabase
          .from("call_metrics")
          .delete()
          .eq("conversation_id", conversationData.id);
        if (delMetricsErr)
          console.error(
            "Error clearing call_metrics for",
            conversationData.id,
            delMetricsErr
          );

        const { error: insMetricsErr } = await supabase
          .from("call_metrics")
          .insert(metricsPayload);
        if (insMetricsErr)
          console.error(
            "Error inserting call_metrics for",
            conversationData.id,
            insMetricsErr
          );
      } catch (error) {
        console.error(
          `Exception saving conversation ${conv.conversation_id}:`,
          error
        );
      }
    }

    // After syncing, fetch all conversations from database with related data
    console.log("Fetching synced conversations from database...");
    const { data: syncedConversations, error: fetchError } = await supabase
      .from("conversations")
      .select(
        `
        *,
        data_collection(*),
        call_metrics(*)
      `
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching synced conversations:", fetchError);
      throw fetchError;
    }

    console.log(
      `Returning ${
        syncedConversations?.length || 0
      } conversations from database`
    );

    return NextResponse.json({ conversations: syncedConversations || [] });
  } catch (error) {
    console.error("Error in fetch-conversations API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function determineSentiment(conv: ElevenLabsConversation): string {
  let sentiment = "neutral";
  if (conv.analysis?.evaluation_criteria_results) {
    const results = Object.values(conv.analysis.evaluation_criteria_results);
    const passCount = results.filter((r) => r.result).length;
    const passRate = passCount / results.length;

    if (passRate >= 0.7) sentiment = "positive";
    else if (passRate <= 0.3) sentiment = "negative";
  } else if (conv.call_successful === "success") {
    sentiment = "positive";
  } else if (conv.call_successful === "failed") {
    sentiment = "negative";
  }
  return sentiment;
}

function countActionItems(transcript: ElevenLabsMessage[]): number {
  const actionWords = [
    "will",
    "should",
    "need to",
    "must",
    "todo",
    "action",
    "follow up",
    "next step",
  ];
  return transcript.filter((t) =>
    actionWords.some((word) => t.message?.toLowerCase().includes(word))
  ).length;
}
