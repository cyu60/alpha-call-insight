import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body - supports both insert and update
    const body = await request.json();
    const {
      conversation_id,
      title,
      participant,
      duration,
      sentiment,
      summary,
      transcript,
      metadata,
    } = body;

    // Validate required fields
    if (!conversation_id) {
      return NextResponse.json(
        { error: "conversation_id is required" },
        { status: 400 }
      );
    }

    console.log(`Processing conversation data for: ${conversation_id}`);

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("*")
      .eq("conversation_id", conversation_id)
      .single();

    let result;

    if (existingConv) {
      // Update existing conversation
      console.log(`Updating existing conversation: ${conversation_id}`);

      // Prepare update payload (only include provided fields)
      const updatePayload: Record<string, unknown> = {};

      if (title !== undefined) updatePayload.title = title;
      if (participant !== undefined) updatePayload.participant = participant;
      if (duration !== undefined) updatePayload.duration = duration;
      if (sentiment !== undefined) updatePayload.sentiment = sentiment;
      if (summary !== undefined) updatePayload.summary = summary;
      if (transcript !== undefined) updatePayload.transcript = transcript;

      // Merge metadata if provided
      if (metadata !== undefined) {
        updatePayload.metadata = {
          ...(existingConv.metadata || {}),
          ...metadata,
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from("conversations")
        .update(updatePayload)
        .eq("conversation_id", conversation_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating conversation:", error);
        throw error;
      }

      result = data;
    } else {
      // Insert new conversation
      console.log(`Creating new conversation: ${conversation_id}`);

      // Validate required fields for insert
      if (!title || !participant || duration === undefined || !sentiment) {
        return NextResponse.json(
          {
            error:
              "For new conversations, title, participant, duration, and sentiment are required",
          },
          { status: 400 }
        );
      }

      const insertPayload = {
        conversation_id,
        title,
        participant,
        duration,
        sentiment,
        summary: summary || "",
        transcript: transcript || [],
        metadata: {
          ...(metadata || {}),
          created_at: new Date().toISOString(),
        },
      };

      const { data, error } = await supabase
        .from("conversations")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting conversation:", error);
        throw error;
      }

      result = data;
    }

    console.log(`Successfully processed conversation: ${conversation_id}`);

    return NextResponse.json({
      success: true,
      action: existingConv ? "updated" : "created",
      data: result,
    });
  } catch (error) {
    console.error("Error in update-conversation-metadata API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
