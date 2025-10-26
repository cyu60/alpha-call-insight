// Test with a REAL verifiable founder to see PASS case

import { config } from 'dotenv';
config({ path: '.env.local' });

import { analyzeCompletedCall } from './app/services/aiService';

// Transcript with Chinat Yu - a REAL, VERIFIABLE person
const testTranscript = `
INTERVIEWER: Thanks for joining us today. Tell me about yourself.

FOUNDER: Hi, I'm Chinat Yu. I was named one of MLH's Top 50 Hackers in 2023, and I'm currently pursuing my Master's at Stanford's Graduate School of Education. Before this, I got my CS degree from Johns Hopkins in 2023. I've been really passionate about using AI and hackathons to transform education.

INTERVIEWER: That's impressive. What are you building?

FOUNDER: We're building EduAI - an AI-powered platform that helps students learn through interactive coding challenges. We're targeting the ed-tech space, specifically helping bootcamps and universities create personalized learning paths. Right now we're at $15K MRR with about 8 customers, mostly coding bootcamps.

INTERVIEWER: What's your traction?

FOUNDER: We launched 4 months ago and we're growing about 25% month-over-month. We have around 5,000 students using our platform across our partner institutions. Our customer acquisition cost is around $3,000, which we're working to bring down. We're a team of 3 right now - me and two other engineers from my Stanford cohort.

INTERVIEWER: Have you raised capital?

FOUNDER: We did a pre-seed round of $200K from angels and some education-focused funds. We're now raising a $1.2M seed round to expand our sales team and build more AI features.

INTERVIEWER: What makes your approach unique?

FOUNDER: Our AI adapts to each student's learning style in real-time. Unlike traditional LMS platforms, we use reinforcement learning to identify exactly where students struggle and provide targeted interventions. The feedback from students has been incredible - we're seeing 40% faster completion rates compared to traditional coursework.

INTERVIEWER: What's your long-term vision?

FOUNDER: We want to make quality CS education accessible to everyone. I've seen firsthand through my work with Major League Hacking how powerful hands-on learning can be. Our goal is to be the AI tutor that every student has access to, regardless of their background or resources.
`;

async function runTest() {
  console.log('🧪 Testing Verification with REAL, Verifiable Founder (Chinat Yu)...\n');
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
    console.log(`Details: ${result.verificationAnalysis.details}`);
    console.log(`Reasoning: ${result.verificationAnalysis.reasoning}`);
    console.log(`Verdict: ${result.verificationAnalysis.verdict}\n`);
    
    console.log('='.repeat(80));
    console.log('📋 FINAL COMMITTEE VERDICT:');
    console.log('='.repeat(80));
    console.log(`Quant:        ${result.quantitativeAnalysis.verdict}`);
    console.log(`Qual:         ${result.qualitativeAnalysis.verdict}`);
    console.log(`Strat:        ${result.strategicAnalysis.verdict}`);
    console.log(`Verification: ${result.verificationAnalysis.verdict}`);
    console.log(`\n🏆 FINAL DECISION: ${result.accept ? '✅ ACCEPT - All 4 agents passed!' : '❌ REJECT - Not all agents passed'}\n`);
    
    console.log('='.repeat(80));
    if (result.verificationAnalysis.verified) {
      console.log('✅ VERIFICATION AGENT SUCCESSFULLY VERIFIED REAL FOUNDER!');
    } else {
      console.log('ℹ️  Note: Verification may require more specific claims in transcript');
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

