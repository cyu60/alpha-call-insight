// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { analyzeCompletedCall } from './app/services/aiService';

// Split decision transcript - good founder/metrics, but fatal strategic flaw
const testTranscript = `
INTERVIEWER: Thanks for joining us today. Tell me about your company.

FOUNDER: Thanks for having me. We're building SocialCred - it's an NFT-based professional credentialing platform. We help companies issue verified credentials as NFTs on the blockchain - things like course completions, certifications, work experience badges. Think of it as LinkedIn credentials but actually verifiable and owned by the user, not locked in a centralized database.

INTERVIEWER: Interesting timing given the crypto market. What's your background?

FOUNDER: I was at Coinbase for 3 years as a product lead on their institutional products. Before that I did a masters in computer science at Stanford focusing on distributed systems. My co-founder was an early engineer at OpenSea - he built a lot of their NFT minting infrastructure. We're both deep in the crypto space and believe strongly in user-owned identity.

INTERVIEWER: Tell me about your traction.

FOUNDER: We launched 6 months ago and we're at $22,000 in MRR. We have 11 enterprise customers - mostly ed-tech companies and corporate training platforms. They pay us between $1,500 and $3,500 per month to issue credentials to their users. We've issued about 45,000 NFT credentials so far, and we're growing around 30% month-over-month.

INTERVIEWER: What's the value proposition for the end users who receive these NFT credentials?

FOUNDER: They truly own their credentials - they can display them in their crypto wallets, showcase them on NFT-gated communities, and most importantly, the credentials can't be taken away or manipulated by the issuing organization. We've also built tools for verifying authenticity, so employers can instantly verify someone's credentials on-chain without calling the university or previous employer.

INTERVIEWER: How does pricing work? What's your customer acquisition cost?

FOUNDER: We charge a flat platform fee plus a per-credential minting fee. Our CAC is around $4,000 through outbound sales, which is similar to other B2B SaaS in the ed-tech space. Margins are healthy - about 70% gross margin since blockchain minting costs have come way down. Retention has been solid - we've only lost one customer who went out of business.

INTERVIEWER: Have you raised capital?

FOUNDER: We raised $300K from crypto-focused angels including someone from a16z crypto and a couple of early Coinbase employees. We're now raising a $1.8M seed round to expand our sales team and build more features around credential verification and discovery.

INTERVIEWER: What's the adoption like from the recipient side? Are people actually using their NFT credentials?

FOUNDER: That's definitely our biggest challenge. Most credential recipients just get an email saying they earned something, but only about 15% actually claim their NFT and put it in a wallet. The others don't really understand NFTs or don't have crypto wallets set up. We're working on making the onboarding more seamless and educating users on the benefits.

INTERVIEWER: Do employers actually check these blockchain credentials?

FOUNDER: It's early days, but we're starting to see some adoption. We have a Chrome extension that highlights blockchain-verified credentials on LinkedIn profiles. A few web3 companies are using it in their hiring process. The thesis is that as more people have crypto wallets and blockchain literacy improves, this becomes the standard way to issue and verify credentials.

INTERVIEWER: What about competitors?

FOUNDER: There's Accredible which does digital credentials but they're not blockchain-based. There's also Blockcerts from MIT which is open-source but hard to use. We're the only ones really making it turnkey for enterprises. That said, LinkedIn could obviously do this if they wanted to, which is a risk. But we think being crypto-native and interoperable is our moat.

INTERVIEWER: What's your long-term vision?

FOUNDER: We want to be the standard for verifiable credentials globally. Education, professional experience, skills, achievements - everything should be user-owned and cryptographically verifiable. Eventually this could extend to things like identity documents, health records, and more. The market for credentialing is huge and blockchain is the obvious infrastructure layer for it.

INTERVIEWER: Why should we invest in you and this market right now?

FOUNDER: The team is world-class - we have deep crypto expertise and execution experience from Coinbase and OpenSea. The early traction is real - we're growing 30% MoM with strong gross margins. And while crypto has had a tough year, we actually think this is the perfect time to build infrastructure that will power the next cycle. When the market turns around, we'll be the credentialing standard. We're playing the long game here.
`;

async function runTest() {
  console.log('🧪 Testing AI Service with sample transcript...\n');
  console.log('='.repeat(80));
  console.log('TRANSCRIPT BEING ANALYZED:');
  console.log('='.repeat(80));
  console.log(testTranscript.substring(0, 500) + '...\n');
  
  try {
    const startTime = Date.now();
    const result = await analyzeCompletedCall(testTranscript);
    const endTime = Date.now();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Time: ${((endTime - startTime) / 1000).toFixed(2)}s\n`);
    
    console.log('📊 QUANTITATIVE ANALYSIS:');
    console.log('-'.repeat(80));
    console.log(`Founder Name: ${result.quantitativeAnalysis.founder_name ?? 'N/A'}`);
    console.log(`Revenue (MRR): $${result.quantitativeAnalysis.revenue?.toLocaleString() ?? 'N/A'}`);
    console.log(`CAC: $${result.quantitativeAnalysis.consumer_acquisition_cost?.toLocaleString() ?? 'N/A'}`);
    console.log(`Team Size: ${result.quantitativeAnalysis.team_size ?? 'N/A'}`);
    console.log(`Stage: ${result.quantitativeAnalysis.stage ?? 'N/A'}`);
    console.log(`Region: ${result.quantitativeAnalysis.region ?? 'N/A'}`);
    console.log(`Industry: ${result.quantitativeAnalysis.industry ?? 'N/A'}`);
    console.log(`Verdict: ${result.quantitativeAnalysis.verdict}`);
    console.log(`Reasoning: ${result.quantitativeAnalysis.reasoning}\n`);
    
    console.log('👤 QUALITATIVE ANALYSIS:');
    console.log('-'.repeat(80));
    console.log(`Pedigree: ${result.qualitativeAnalysis.pedigree ?? 'N/A'}`);
    console.log(`Repeat Founder: ${result.qualitativeAnalysis.repeat_founder ? 'Yes' : 'No'}`);
    console.log(`Social Capital: ${result.qualitativeAnalysis.social_capital ?? 'N/A'}`);
    console.log(`Conviction: ${result.qualitativeAnalysis.conviction_analysis}`);
    console.log(`Clarity: ${result.qualitativeAnalysis.clarity_analysis}`);
    console.log(`Passion: ${result.qualitativeAnalysis.passion_analysis}`);
    console.log(`Coachability: ${result.qualitativeAnalysis.coachability_analysis}`);
    console.log(`Verdict: ${result.qualitativeAnalysis.verdict}`);
    console.log(`Reasoning: ${result.qualitativeAnalysis.reasoning}\n`);
    
    console.log('🎯 STRATEGIC ANALYSIS:');
    console.log('-'.repeat(80));
    console.log(`Company Values: ${result.strategicAnalysis.company_values ?? 'N/A'}`);
    console.log(`Business Model: ${result.strategicAnalysis.business_model}`);
    console.log(`Market Originality: ${result.strategicAnalysis.market_originality}`);
    console.log(`Pitch Strength: ${result.strategicAnalysis.overall_strength_of_pitch}`);
    console.log(`Verdict: ${result.strategicAnalysis.verdict}`);
    console.log(`Reasoning: ${result.strategicAnalysis.reasoning}\n`);
    
    console.log('🔍 VERIFICATION ANALYSIS (via MCP):');
    console.log('-'.repeat(80));
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
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  } finally {
    // Ensure clean exit
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

runTest();

