import { NextRequest, NextResponse } from "next/server";
import { analyzeCompletedCall } from "../../services/aiService";
import { createSupabaseClient } from "../../../lib/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required and must be a string" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseClient();

    console.log("🚀 Starting due diligence analysis via API...");

    // Run the multi-agent analysis
    const analysis = await analyzeCompletedCall(transcript);

    console.log("✅ Analysis complete, returning results");

    await supabase
      .from("data_collection")
      .update({
        analysis: analysis,
      })
      .eq("conversation_id", conversation_id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("❌ Error in analyze-call API:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze call",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
