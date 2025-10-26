// Test script: Verify analyze-call API updates Supabase correctly
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testAnalyzeCall() {
  console.log('🧪 Testing /api/analyze-call with Supabase update\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials. Check your .env file.');
    process.exit(1);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Step 1: Get a conversation from database
    console.log('📥 Fetching conversation from database...');
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('conversation_id, transcript')
      .limit(1)
      .single();

    if (fetchError || !conversations) {
      console.error('❌ No conversations found in database.');
      console.error('   Run a call on ElevenLabs first or check your database.');
      process.exit(1);
    }

    const conversationId = conversations.conversation_id;
    console.log(`✅ Found conversation: ${conversationId}\n`);

    // Step 2: Convert transcript to string
    const transcript = Array.isArray(conversations.transcript)
      ? conversations.transcript.map((msg: any) => `${msg.role}: ${msg.message}`).join('\n')
      : 'Test transcript from TestCo';

    if (transcript.length < 50) {
      console.log('⚠️  Transcript is short, using test data instead');
    }

    console.log(`📝 Transcript length: ${transcript.length} characters\n`);

    // Step 3: Call the API
    console.log(`🚀 Calling API: ${API_URL}/api/analyze-call`);
    console.log('⏳ Running 4 AI agents (this takes ~10-20 seconds)...\n');

    const startTime = Date.now();

    const response = await fetch(`${API_URL}/api/analyze-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        transcript: transcript,
      }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', data);
      process.exit(1);
    }

    console.log(`✅ API completed in ${elapsed}s\n`);

    // Step 4: Verify database was updated
    console.log('🔍 Verifying Supabase was updated...');
    const { data: updated, error: verifyError } = await supabase
      .from('conversations')
      .select('metadata')
      .eq('conversation_id', conversationId)
      .single();

    if (verifyError || !updated) {
      console.error('❌ Failed to verify update:', verifyError);
      process.exit(1);
    }

    const hasAnalysis = updated.metadata?.ai_analysis !== undefined;
    const hasVerdict = updated.metadata?.verdict !== undefined;
    const hasTimestamp = updated.metadata?.analyzed_at !== undefined;

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Conversation ID:    ${conversationId}`);
    console.log(`API Response:       ${data.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Stored in DB:       ${data.stored ? '✅ Yes' : '❌ No'}`);
    console.log(`Analysis in DB:     ${hasAnalysis ? '✅ Yes' : '❌ No'}`);
    console.log(`Verdict in DB:      ${hasVerdict ? '✅ Yes' : '❌ No'}`);
    console.log(`Timestamp in DB:    ${hasTimestamp ? '✅ Yes' : '❌ No'}`);

    if (hasAnalysis) {
      const analysis = updated.metadata.ai_analysis;
      console.log('\n' + '-'.repeat(50));
      console.log('📋 AGENT VERDICTS');
      console.log('-'.repeat(50));
      console.log(`Quantitative:  ${analysis.quantitativeAnalysis.verdict}`);
      console.log(`Qualitative:   ${analysis.qualitativeAnalysis.verdict}`);
      console.log(`Strategic:     ${analysis.strategicAnalysis.verdict}`);
      console.log(`Verification:  ${analysis.verificationAnalysis.verdict}`);
      console.log('-'.repeat(50));
      console.log(`FINAL DECISION: ${analysis.accept ? '✅ ACCEPT' : '❌ REJECT'}`);
      console.log('-'.repeat(50));
    }

    console.log('='.repeat(50));

    if (hasAnalysis && hasVerdict && hasTimestamp && data.success && data.stored) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
      console.log('✅ API runs all 4 agents');
      console.log('✅ Results stored in Supabase');
      console.log('✅ Metadata updated correctly');
      console.log('\n💡 Your MagicLoops integration can now call this API!');
      console.log(`   POST ${API_URL}/api/analyze-call`);
      console.log('   Body: { "conversation_id": "...", "transcript": "..." }');
    } else {
      console.error('\n❌ TEST FAILED - Some checks did not pass');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
testAnalyzeCall();

