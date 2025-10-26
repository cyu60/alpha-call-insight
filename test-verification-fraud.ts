// Test: Impostor claims to be Chinat Yu but says WRONG school (Berkeley instead of Johns Hopkins)
// The verification agent should CATCH this discrepancy!

import { config } from 'dotenv';
config({ path: '.env.local' });

import { analyzeCompletedCall } from './app/services/aiService';

// Someone claiming to be Chinat Yu but with FALSE information
const testTranscript = `
INTERVIEWER: Thanks for joining us today. Tell me about yourself.

FOUNDER: Hi, I'm Chinat Yu. I was named one of MLH's Top 50 Hackers in 2023, and I'm currently pursuing my Master's at Stanford's Graduate School of Education. Before this, I got my CS degree from UC Berkeley in 2023. I've been really passionate about using AI and hackathons to transform education.

INTERVIEWER: That's impressive. What are you building?

FOUNDER: We're building EduAI - an AI-powered platform that helps students learn through interactive coding challenges. We're targeting the ed-tech space, specifically helping bootcamps and universities create personalized learning paths. Right now we're at $18K MRR with about 10 customers, mostly coding bootcamps.

INTERVIEWER: What's your traction?

FOUNDER: We launched 5 months ago and we're growing about 30% month-over-month. We have around 6,000 students using our platform across our partner institutions. Our customer acquisition cost is around $2,500, which we're working to bring down. We're a team of 4 right now - me and three other engineers from Berkeley.

INTERVIEWER: Have you raised capital?

FOUNDER: We did a pre-seed round of $250K from angels and some education-focused funds. We're now raising a $1.5M seed round to expand our sales team and build more AI features.

INTERVIEWER: What makes your approach unique?

FOUNDER: Our AI adapts to each student's learning style in real-time. Unlike traditional LMS platforms, we use reinforcement learning to identify exactly where students struggle and provide targeted interventions. The feedback from students has been incredible - we're seeing 45% faster completion rates compared to traditional coursework.

INTERVIEWER: What's your long-term vision?

FOUNDER: We want to make quality CS education accessible to everyone. I've seen firsthand through my work with Major League Hacking and my time at Berkeley how powerful hands-on learning can be. Our goal is to be the AI tutor that every student has access to, regardless of their background or resources.
`;

async function runTest() {
  console.log('🔴 FRAUD DETECTION TEST 🔴');
  console.log('Testing: Claims to be Chinat Yu but says UC BERKELEY (should be Johns Hopkins)');
  console.log('Expected: Verification should FAIL due to discrepancy\n');
  console.log('='.repeat(80));
  
  try {
    const startTime = Date.now();
    const result = await analyzeCompletedCall(testTranscript);
    const endTime = Date.now();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Time: ${((endTime - startTime) / 1000).toFixed(2)}s\n`);
    
    console.log('🔍 VERIFICATION ANALYSIS (via MCP):');
    console.log('='.repeat(80));
    console.log(`Verified: ${result.verificationAnalysis.verified ? '✅ YES' : '❌ NO'}`);
    console.log(`Confidence: ${result.verificationAnalysis.confidence.toUpperCase()}`);
    console.log(`Sources Found: ${result.verificationAnalysis.sources_found}`);
    console.log(`\nDetails:\n${result.verificationAnalysis.details}\n`);
    console.log(`Reasoning:\n${result.verificationAnalysis.reasoning}\n`);
    console.log(`Verdict: ${result.verificationAnalysis.verdict}\n`);
    
    console.log('='.repeat(80));
    console.log('📋 FINAL COMMITTEE VERDICT:');
    console.log('='.repeat(80));
    console.log(`Quant:        ${result.quantitativeAnalysis.verdict}`);
    console.log(`Qual:         ${result.qualitativeAnalysis.verdict}`);
    console.log(`Strat:        ${result.strategicAnalysis.verdict}`);
    console.log(`Verification: ${result.verificationAnalysis.verdict}`);
    console.log(`\n🏆 FINAL DECISION: ${result.accept ? '✅ ACCEPT' : '❌ REJECT'}\n`);
    
    console.log('='.repeat(80));
    if (!result.verificationAnalysis.verified) {
      console.log('✅ SUCCESS! Verification agent caught the FALSE CLAIM!');
      console.log('🛡️  System protected against impostor claiming wrong credentials!');
    } else {
      console.log('❌ FAILED! Verification agent missed the discrepancy!');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  } finally {
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

runTest();

