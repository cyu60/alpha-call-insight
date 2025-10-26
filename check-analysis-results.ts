// Check if analysis results are stored in Supabase
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkAnalysisResults() {
  console.log('🔍 Checking for AI analysis results in Supabase...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get all conversations with their metadata
  const { data, error } = await supabase
    .from('conversations')
    .select('conversation_id, title, participant, metadata')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No conversations found');
    return;
  }

  console.log(`📊 Checking ${data.length} conversations...\n`);
  console.log('='.repeat(80));

  let analyzedCount = 0;

  data.forEach((conv, i) => {
    const hasAnalysis = conv.metadata?.ai_analysis !== undefined;
    const verdict = conv.metadata?.verdict;
    const analyzedAt = conv.metadata?.analyzed_at;

    if (hasAnalysis) {
      analyzedCount++;
      const analysis = conv.metadata.ai_analysis;
      
      console.log(`\n${i + 1}. ${conv.title || 'Untitled'}`);
      console.log(`   Participant: ${conv.participant || 'Unknown'}`);
      console.log(`   Conversation ID: ${conv.conversation_id}`);
      console.log(`   ✅ HAS ANALYSIS`);
      console.log(`   Verdict: ${verdict || 'N/A'}`);
      console.log(`   Analyzed: ${analyzedAt ? new Date(analyzedAt).toLocaleString() : 'Unknown'}`);
      console.log(`   Agent Results:`);
      console.log(`     - Quantitative: ${analysis.quantitativeAnalysis?.verdict || 'N/A'}`);
      console.log(`     - Qualitative:  ${analysis.qualitativeAnalysis?.verdict || 'N/A'}`);
      console.log(`     - Strategic:    ${analysis.strategicAnalysis?.verdict || 'N/A'}`);
      console.log(`     - Verification: ${analysis.verificationAnalysis?.verdict || 'N/A'}`);
      console.log(`   Final Decision: ${analysis.accept ? '✅ ACCEPT' : '❌ REJECT'}`);
    } else {
      console.log(`\n${i + 1}. ${conv.title || 'Untitled'} - ⚠️  No analysis yet`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n📈 Summary: ${analyzedCount}/${data.length} conversations have been analyzed`);

  if (analyzedCount === 0) {
    console.log('\n⚠️  No conversations have analysis results yet.');
    console.log('   Run a test: npx tsx test-analyze-call.ts');
  } else {
    console.log('\n✅ Analysis results are being stored correctly!');
  }
}

checkAnalysisResults();

