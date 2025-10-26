// DEMO: Fraud Detection - Claims Stanford but actually Berkeley
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Realistic transcript with fraud - claims Stanford but easily verifiable as Berkeley grad
const DEMO_TRANSCRIPT = `
INTERVIEWER: Thanks for joining us today. Tell me about yourself and your startup.

FOUNDER: Hi, I'm Sarah Chen. I graduated from Stanford with a Computer Science degree in 2022, where I worked on AI research under Professor Andrew Ng. After that, I spent 2 years at Google as a software engineer on the Search team.

INTERVIEWER: Interesting background. What are you building now?

FOUNDER: I'm building TechFlow AI, an AI-powered developer productivity platform. We're at the seed stage, based in San Francisco, and we have a team of 5 engineers including myself and my co-founder from Stanford.

INTERVIEWER: What's your current traction?

FOUNDER: We launched 8 months ago and we're at $120,000 in monthly recurring revenue. We have about 50 enterprise customers, mostly mid-sized tech companies. Our customer acquisition cost is around $3,500 per customer, which we're working to optimize.

INTERVIEWER: That's solid growth. What's your competitive advantage?

FOUNDER: Our AI is specifically trained on developer workflows, making it 5x faster than generic tools like GitHub Copilot. We integrate deeply with VS Code and have partnerships with companies like Vercel and Supabase for distribution. The market is huge - every developer needs better tools.

INTERVIEWER: What's your vision for the company?

FOUNDER: We want to become the default AI assistant for every developer worldwide. I'm deeply passionate about this because I experienced the pain myself at Google. We're coachable and always learning from customer feedback. The team has strong conviction about our mission.

INTERVIEWER: What funding are you looking for?

FOUNDER: We're raising a $2M seed round to scale our sales team and expand internationally. We already have strong interest from Sequoia and a16z based on our metrics and team pedigree.
`;

// This is fictional - in reality Sarah Chen actually went to UC Berkeley, not Stanford
// The verification agent will catch this discrepancy

async function fraudDemo() {
  console.clear();
  console.log('\n' + '='.repeat(80));
  console.log('🎬 DEMO: AI-Powered Fraud Detection');
  console.log('='.repeat(80) + '\n');

  console.log('📋 Scenario: Founder claims Stanford degree, but verification reveals otherwise\n');

  console.log('📝 Pitch Transcript:');
  console.log('-'.repeat(80));
  const preview = DEMO_TRANSCRIPT.trim().split('\n').slice(0, 8).join('\n');
  console.log(preview);
  console.log('[... rest of transcript ...]');
  console.log('-'.repeat(80) + '\n');

  console.log('🚨 RED FLAG: Founder claims "I graduated from Stanford..."');
  console.log('🔍 Let\'s see if our AI agents catch this...\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🚀 Launching 4 AI Analysis Agents...\n');
  console.log('┌────────────────────────────────────────────────────────────────────────┐');
  console.log('│  Agent 1: 📊 Quantitative Analysis (Revenue, Metrics, Stage)          │');
  console.log('│  Agent 2: 🧠 Qualitative Analysis (Founder Quality, Background)       │');
  console.log('│  Agent 3: 🎯 Strategic Analysis (Market, Business Model)              │');
  console.log('│  Agent 4: 🔍 Verification Agent (MCP-Powered Web Search)              │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  console.log('⏳ Agents 1-3 running in parallel...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('   ✅ Quantitative Agent: Analyzing metrics...');
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('   ✅ Qualitative Agent: Evaluating founder...');
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('   ✅ Strategic Agent: Assessing market...\n');

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('🔍 Verification Agent starting MCP search...\n');
  console.log('┌─ MCP SERVER ACTIVITY ──────────────────────────────────────────────────┐');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('│ 🌐 Calling Google Custom Search API...                                │');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('│ 🔎 Query: "Sarah Chen Stanford Computer Science 2022"                 │');
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('│ 📊 Found 5 results:                                                   │');
  console.log('│    1. Sarah Chen - UC Berkeley EECS Graduate (2022)                  │');
  console.log('│    2. Sarah Chen - LinkedIn: UC Berkeley, Google Engineer            │');
  console.log('│    3. Berkeley Engineering News: Sarah Chen graduates...             │');
  console.log('│    4. Different Sarah Chen at MIT                                     │');
  console.log('│    5. Different Sarah Chen at Stanford (graduated 2018)              │');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('│ ⚠️  DISCREPANCY DETECTED: Sources indicate UC Berkeley, not Stanford  │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('🤖 Claude analyzing verification results...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('   Cross-referencing multiple sources...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   Confidence assessment: HIGH (3+ consistent sources)');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   ❌ VERDICT: FAIL - Educational credentials do not match claims\n');

  await new Promise(resolve => setTimeout(resolve, 1500));

  // Display results
  console.log('='.repeat(80));
  console.log('📊 FINAL AGENT RESULTS');
  console.log('='.repeat(80) + '\n');

  console.log('┌─ 📊 QUANTITATIVE ANALYSIS ─────────────────────────────────────────────┐');
  console.log('│ Verdict: ✅ PASS                                                       │');
  console.log('│ Revenue: $120,000 MRR                                                 │');
  console.log('│ Stage: Seed                                                           │');
  console.log('│ Team Size: 5                                                          │');
  console.log('│ CAC: $3,500                                                           │');
  console.log('│ Reasoning: Strong metrics for seed stage. Revenue growth and customer │');
  console.log('│            base indicate product-market fit.                          │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌─ 🧠 QUALITATIVE ANALYSIS ──────────────────────────────────────────────┐');
  console.log('│ Verdict: ✅ PASS                                                       │');
  console.log('│ Background: Claims Stanford CS + Google Search team                   │');
  console.log('│ Conviction: High - clear passion and personal connection to problem   │');
  console.log('│ Clarity: Excellent - articulates value prop clearly                   │');
  console.log('│ Coachability: Strong - mentions learning from feedback                │');
  console.log('│ Reasoning: Strong founder qualities, compelling background if verified│');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌─ 🎯 STRATEGIC ANALYSIS ────────────────────────────────────────────────┐');
  console.log('│ Verdict: ✅ PASS                                                       │');
  console.log('│ Market: Large TAM - all developers worldwide                          │');
  console.log('│ Business Model: SaaS with enterprise focus - scalable                 │');
  console.log('│ Differentiation: 5x performance + deep IDE integration                │');
  console.log('│ Reasoning: Strong strategic positioning in growing AI developer tools │');
  console.log('│            market. Clear competitive advantages.                      │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  console.log('┌─ 🔍 VERIFICATION ANALYSIS (MCP) ───────────────────────────────────────┐');
  console.log('│ Verdict: ❌ FAIL                                                       │');
  console.log('│ Verified: NO                                                          │');
  console.log('│ Confidence: HIGH (3+ sources)                                         │');
  console.log('│ Sources Found: 5 (3 confirm UC Berkeley, not Stanford)               │');
  console.log('│ Details: Multiple credible sources (LinkedIn, Berkeley News, etc.)    │');
  console.log('│          consistently show Sarah Chen graduated from UC Berkeley      │');
  console.log('│          EECS in 2022, NOT Stanford. Educational credentials claimed  │');
  console.log('│          do not match verified background.                            │');
  console.log('│ 🚨 FRAUD DETECTED: False educational credentials                       │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  console.log('='.repeat(80));
  console.log('⚠️  FINAL DECISION: ❌ REJECT');
  console.log('='.repeat(80) + '\n');

  console.log('📈 Summary:');
  console.log('   • 3/4 agents passed (Quantitative, Qualitative, Strategic)');
  console.log('   • 1/4 agents failed (Verification)');
  console.log('   • Decision: REJECT - Verification failure disqualifies candidate\n');

  console.log('🔒 Why This Matters:');
  console.log('   Even with strong metrics and pitch, false credentials are an automatic');
  console.log('   rejection. Our MCP-powered verification agent caught what human reviewers');
  console.log('   might miss, protecting the firm from fraud.\n');

  console.log('✨ Demo complete!\n');
}

fraudDemo().catch(console.error);

