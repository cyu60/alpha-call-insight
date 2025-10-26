import { NextRequest, NextResponse } from 'next/server';
import { analyzeCompletedCall } from '../../services/aiService';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, conversation_id } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required and must be a string' },
        { status: 400 }
      );
    }

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'conversation_id is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting due diligence analysis for conversation: ${conversation_id}`);

    // Run the multi-agent analysis
    const analysis = await analyzeCompletedCall(transcript);

    console.log('✅ Analysis complete, storing results in Supabase...');

    // Connect to Supabase using same pattern as other API routes
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase credentials not configured');
      return NextResponse.json(
        { error: 'Supabase not configured', analysis },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch existing conversation to merge metadata
    const { data: existingConv, error: fetchError } = await supabase
      .from('conversations')
      .select('metadata')
      .eq('conversation_id', conversation_id)
      .single();

    if (fetchError) {
      console.error('❌ Conversation not found:', fetchError);
      return NextResponse.json(
        { error: 'Conversation not found in database', conversation_id },
        { status: 404 }
      );
    }

    // Merge with existing metadata (same pattern as update-conversation-metadata route)
    const updatedMetadata = {
      ...(existingConv.metadata || {}),
      ai_analysis: analysis,
      analyzed_at: new Date().toISOString(),
      verdict: analysis.accept ? 'ACCEPT' : 'REJECT',
    };

    // Update conversation
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ metadata: updatedMetadata })
      .eq('conversation_id', conversation_id);

    if (updateError) {
      console.error('❌ Failed to update conversation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update database', analysis },
        { status: 500 }
      );
    }

    console.log(`✅ Results stored for conversation: ${conversation_id}`);
    console.log(`📊 Final verdict: ${analysis.accept ? '✅ ACCEPT' : '❌ REJECT'}`);

    return NextResponse.json({
      success: true,
      conversation_id,
      analysis,
      stored: true,
    });

  } catch (error) {
    console.error('❌ Error in analyze-call API:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
