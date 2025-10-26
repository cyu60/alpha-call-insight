/**
 * Test script for the automatic feedback system
 *
 * This tests the core functionality locally without requiring
 * full Supabase deployment or database triggers.
 *
 * Run with: npx tsx test-feedback-system.ts
 */

async function testFeedbackSystem() {
  console.log('🧪 Testing ALPHA Automatic Feedback System\n');

  // Sample transcript from a founder pitch
  const testTranscript = `
Gary Tan AI (00:00): Hello! Thanks for taking the time to pitch. Tell me about your startup.

Caller (00:05): Hi! I'm Sarah Chen, founder of DataFlow AI. We're building an AI-powered data pipeline platform for enterprises.

Gary Tan AI (00:15): Interesting. What's your background, Sarah?

Caller (00:20): I studied Computer Science at Stanford and previously worked as a senior engineer at Google for 5 years, where I led the data infrastructure team.

Gary Tan AI (00:35): Great background. Tell me about your business model and traction.

Caller (00:40): We're targeting Fortune 500 companies. Our platform reduces data processing time by 80%. We're currently in beta with 3 pilot customers, generating $15,000 MRR. We have a team of 4 engineers including myself.

Gary Tan AI (00:60): What's your pricing model?

Caller (01:05): We charge $5,000 per month per deployment, with implementation fees. Our customer acquisition cost is around $8,000, but we see a lifetime value of over $200,000 based on our projections.

Gary Tan AI (01:25): How do you differentiate from competitors like Fivetran or Airbyte?

Caller (01:30): Our AI layer automatically optimizes data flows and predicts issues before they happen. Traditional ETL tools are reactive, we're proactive. Plus, our setup time is 10x faster.

Gary Tan AI (01:50): What stage are you at for funding?

Caller (01:55): We're raising a $2M seed round. We're based in San Francisco and have strong conviction this will transform enterprise data infrastructure.

Gary Tan AI (02:10): Thanks for sharing. We'll review your pitch and get back to you soon.
  `.trim();

  console.log('📝 Test Transcript:');
  console.log(testTranscript);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    console.log('🚀 Calling analysis API...\n');

    const response = await fetch('http://localhost:3000/api/analyze-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: testTranscript }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }

    const analysis = await response.json();

    console.log('✅ Analysis Complete!\n');
    console.log('='.repeat(60));
    console.log('📊 RESULTS:\n');

    // Quantitative Analysis
    console.log('💼 QUANTITATIVE ANALYSIS:');
    console.log(`   Founder: ${analysis.quantitativeAnalysis.founder_name || 'Not found'}`);
    console.log(`   Industry: ${analysis.quantitativeAnalysis.industry || 'Not found'}`);
    console.log(`   Stage: ${analysis.quantitativeAnalysis.stage || 'Not found'}`);
    console.log(`   MRR: $${analysis.quantitativeAnalysis.revenue?.toLocaleString() || 'Not found'}`);
    console.log(`   Team Size: ${analysis.quantitativeAnalysis.team_size || 'Not found'}`);
    console.log(`   Region: ${analysis.quantitativeAnalysis.region || 'Not found'}`);
    console.log(`   Verdict: ${analysis.quantitativeAnalysis.verdict}`);
    console.log(`   Reasoning: ${analysis.quantitativeAnalysis.reasoning}\n`);

    // Qualitative Analysis
    console.log('👤 QUALITATIVE ANALYSIS:');
    console.log(`   Pedigree: ${analysis.qualitativeAnalysis.pedigree || 'Not found'}`);
    console.log(`   Repeat Founder: ${analysis.qualitativeAnalysis.repeat_founder}`);
    console.log(`   Conviction: ${analysis.qualitativeAnalysis.conviction_analysis}`);
    console.log(`   Clarity: ${analysis.qualitativeAnalysis.clarity_analysis}`);
    console.log(`   Verdict: ${analysis.qualitativeAnalysis.verdict}`);
    console.log(`   Reasoning: ${analysis.qualitativeAnalysis.reasoning}\n`);

    // Strategic Analysis
    console.log('🚀 STRATEGIC ANALYSIS:');
    console.log(`   Business Model: ${analysis.strategicAnalysis.business_model}`);
    console.log(`   Market Originality: ${analysis.strategicAnalysis.market_originality}`);
    console.log(`   Verdict: ${analysis.strategicAnalysis.verdict}`);
    console.log(`   Reasoning: ${analysis.strategicAnalysis.reasoning}\n`);

    // Verification Analysis
    console.log('✅ VERIFICATION ANALYSIS (MCP):');
    console.log(`   Verified: ${analysis.verificationAnalysis.verified}`);
    console.log(`   Confidence: ${analysis.verificationAnalysis.confidence}`);
    console.log(`   Sources Found: ${analysis.verificationAnalysis.sources_found}`);
    console.log(`   Details: ${analysis.verificationAnalysis.details}`);
    console.log(`   Verdict: ${analysis.verificationAnalysis.verdict}`);
    console.log(`   Reasoning: ${analysis.verificationAnalysis.reasoning}\n`);

    // Final Decision
    console.log('='.repeat(60));
    console.log(`\n🎯 FINAL DECISION: ${analysis.accept ? '✅ ACCEPT' : '❌ REJECT'}\n`);
    console.log('='.repeat(60));

    // Simulate email content
    console.log('\n📧 EMAIL THAT WOULD BE SENT TO FOUNDER:\n');
    console.log('='.repeat(60));
    console.log('Subject: Feedback on your pitch - DataFlow AI\n');
    console.log(`Hi ${analysis.quantitativeAnalysis.founder_name || 'there'},\n`);
    console.log('Thank you for pitching to us! Here\'s some feedback:\n');
    console.log('BUSINESS METRICS:');
    console.log(`- ${analysis.quantitativeAnalysis.reasoning}\n`);
    console.log('FOUNDER ASSESSMENT:');
    console.log(`- ${analysis.qualitativeAnalysis.reasoning}\n`);
    console.log('STRATEGIC INSIGHTS:');
    console.log(`- ${analysis.strategicAnalysis.reasoning}\n`);
    console.log('VERIFICATION NOTES:');
    console.log(`- We reviewed ${analysis.verificationAnalysis.sources_found} sources`);
    console.log(`- ${analysis.verificationAnalysis.details}\n`);
    console.log('Keep building! 🚀');
    console.log('\n' + '='.repeat(60));

    console.log('\n\n✨ TEST COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testFeedbackSystem();
