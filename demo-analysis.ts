// DEMO: Show AI agents working in real-time
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get conversation_id from command line or use default
const conversationId = process.argv[2];

async function demo() {
  console.clear();
  console.log('\n' + '='.repeat(80));
  console.log('🎬 DEMO: Multi-Agent AI Due Diligence Analysis');
  console.log('='.repeat(80) + '\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Step 1: Get conversation
  let convId = conversationId;
  let transcript = '';

  if (!convId) {
    console.log('📥 Fetching a conversation from database...');
    const { data } = await supabase
      .from('conversations')
      .select('conversation_id, title, transcript')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      console.error('❌ No conversations found');
      process.exit(1);
    }

    convId = data.conversation_id;
    console.log(`✅ Selected: "${data.title}" (${convId})\n`);

    transcript = Array.isArray(data.transcript)
      ? data.transcript.map((msg: any) => `${msg.role}: ${msg.message}`).join('\n')
      : 'Test transcript';
  }

  // Step 2: Show what we're analyzing
  console.log('📝 Transcript Preview:');
  console.log('-'.repeat(80));
  console.log(transcript.substring(0, 300) + '...');
  console.log('-'.repeat(80) + '\n');

  // Step 3: Call the API
  console.log('🚀 Launching 4 AI Agents...\n');
  console.log('┌────────────────────────────────────────────────────────────────────────┐');
  console.log('│  Agent 1: 📊 Quantitative Analysis (Revenue, Metrics, Stage)          │');
  console.log('│  Agent 2: 🧠 Qualitative Analysis (Founder, Passion, Clarity)         │');
  console.log('│  Agent 3: 🎯 Strategic Analysis (Market, Business Model)              │');
  console.log('│  Agent 4: 🔍 Verification Agent (MCP-Powered Web Search)              │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  console.log('⏳ Running agents in parallel...\n');

  const startTime = Date.now();

  const response = await fetch(`${API_URL}/api/analyze-call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: convId, transcript }),
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!response.ok) {
    const error = await response.json();
    console.error('\n❌ Analysis Failed:', error);
    process.exit(1);
  }

  const data = await response.json();
  const analysis = data.analysis;

  console.log(`✅ All agents completed in ${elapsed}s\n`);

  // Step 4: Display results
  console.log('='.repeat(80));
  console.log('📊 AGENT RESULTS');
  console.log('='.repeat(80) + '\n');

  // Quantitative
  console.log('┌─ 📊 QUANTITATIVE ANALYSIS ─────────────────────────────────────────────┐');
  console.log(`│ Verdict: ${analysis.quantitativeAnalysis.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`│ Revenue: ${analysis.quantitativeAnalysis.revenue || 'N/A'}`);
  console.log(`│ Stage: ${analysis.quantitativeAnalysis.stage || 'N/A'}`);
  console.log(`│ Team Size: ${analysis.quantitativeAnalysis.team_size || 'N/A'}`);
  console.log(`│ Region: ${analysis.quantitativeAnalysis.region || 'N/A'}`);
  console.log(`│ Reasoning: ${analysis.quantitativeAnalysis.reasoning.substring(0, 60)}...`);
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  // Qualitative
  console.log('┌─ 🧠 QUALITATIVE ANALYSIS ──────────────────────────────────────────────┐');
  console.log(`│ Verdict: ${analysis.qualitativeAnalysis.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`│ Repeat Founder: ${analysis.qualitativeAnalysis.repeat_founder ? 'Yes' : 'No'}`);
  console.log(`│ Pedigree: ${analysis.qualitativeAnalysis.pedigree?.substring(0, 50) || 'N/A'}...`);
  console.log(`│ Conviction: ${analysis.qualitativeAnalysis.conviction_analysis.substring(0, 50)}...`);
  console.log(`│ Clarity: ${analysis.qualitativeAnalysis.clarity_analysis.substring(0, 50)}...`);
  console.log(`│ Reasoning: ${analysis.qualitativeAnalysis.reasoning.substring(0, 60)}...`);
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  // Strategic
  console.log('┌─ 🎯 STRATEGIC ANALYSIS ────────────────────────────────────────────────┐');
  console.log(`│ Verdict: ${analysis.strategicAnalysis.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`│ Business Model: ${analysis.strategicAnalysis.business_model.substring(0, 50)}...`);
  console.log(`│ Market Originality: ${analysis.strategicAnalysis.market_originality.substring(0, 45)}...`);
  console.log(`│ Reasoning: ${analysis.strategicAnalysis.reasoning.substring(0, 60)}...`);
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  // Verification
  console.log('┌─ 🔍 VERIFICATION ANALYSIS (MCP) ───────────────────────────────────────┐');
  console.log(`│ Verdict: ${analysis.verificationAnalysis.verdict === 'PASS' ? '✅ PASS' : analysis.verificationAnalysis.verdict === 'SKIP' ? '⏭️  SKIP' : '❌ FAIL'}`);
  console.log(`│ Verified: ${analysis.verificationAnalysis.verified ? 'Yes' : 'No'}`);
  console.log(`│ Confidence: ${analysis.verificationAnalysis.confidence}`);
  console.log(`│ Sources Found: ${analysis.verificationAnalysis.sources_found}`);
  console.log(`│ Details: ${analysis.verificationAnalysis.details.substring(0, 55)}...`);
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  // Final Decision
  console.log('='.repeat(80));
  if (analysis.accept) {
    console.log('🎉 FINAL DECISION: ✅ ACCEPT - All agents passed!');
  } else {
    console.log('⚠️  FINAL DECISION: ❌ REJECT - One or more agents failed');
  }
  console.log('='.repeat(80) + '\n');

  // Summary
  const passCount = [
    analysis.quantitativeAnalysis.verdict === 'PASS',
    analysis.qualitativeAnalysis.verdict === 'PASS',
    analysis.strategicAnalysis.verdict === 'PASS',
    analysis.verificationAnalysis.verdict === 'PASS' || analysis.verificationAnalysis.verdict === 'SKIP'
  ].filter(Boolean).length;

  console.log(`📈 Summary: ${passCount}/4 agents passed`);
  console.log(`⏱️  Total time: ${elapsed}s`);
  console.log(`💾 Results stored in Supabase\n`);

  console.log('✨ Demo complete! Check your dashboard at ' + API_URL + '/dashboard\n');
}

demo().catch(console.error);

