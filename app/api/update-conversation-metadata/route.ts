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

    // Parse request body
    const { conversation_id, metadata } = await request.json();

    // Validate input
    if (!conversation_id) {
      return NextResponse.json(
        { error: "conversation_id is required" },
        { status: 400 }
      );
    }

    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json(
        { error: "metadata must be a valid object" },
        { status: 400 }
      );
    }

    console.log(`Updating metadata for conversation: ${conversation_id}`);

    // Get existing conversation
    const { data: existingConv, error: fetchError } = await supabase
      .from("conversations")
      .select("metadata")
      .eq("conversation_id", conversation_id)
      .single();

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Merge existing metadata with new metadata
    const updatedMetadata = {
      ...(existingConv.metadata || {}),
      ...metadata,
      updated_at: new Date().toISOString(),
    };

    // Update conversation with merged metadata
    const { data, error } = await supabase
      .from("conversations")
      .update({ metadata: updatedMetadata })
      .eq("conversation_id", conversation_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating conversation:", error);
      throw error;
    }

    console.log(
      `Successfully updated metadata for conversation: ${conversation_id}`
    );

    return NextResponse.json({
      success: true,
      conversation_id,
      metadata: updatedMetadata,
      data,
    });
  } catch (error) {
    console.error("Error in update-conversation-metadata API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
