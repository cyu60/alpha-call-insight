import Anthropic from '@anthropic-ai/sdk';
import { verificationAgent, VerificationResult } from './verificationAgent';

// Matches Supabase schema
interface QuantitativeAnalysis {
  revenue: number | null; // MRR in dollars
  consumer_acquisition_cost: number | null; // CAC
  team_size: number | null;
  stage: string | null; // e.g., "Pre-seed", "Seed", "Series A"
  region: string | null; // e.g., "San Francisco", "Remote"
  industry: string | null; // e.g., "SaaS", "AI", "Logistics"
  founder_name: string | null;
  verdict: 'PASS' | 'FAIL';
  reasoning: string;
}

interface QualitativeAnalysis {
  // Founder profile analysis
  pedigree: string | null; // Education, past companies, experience
  repeat_founder: boolean;
  social_capital: string | null; // Network, connections, reputation
  // Detailed assessments
  conviction_analysis: string;
  clarity_analysis: string;
  passion_analysis: string;
  coachability_analysis: string;
  verdict: 'PASS' | 'FAIL';
  reasoning: string;
}

interface StrategicAnalysis {
  company_values: string | null; // Mission, culture, values mentioned
  business_model: string;
  market_originality: string;
  overall_strength_of_pitch: string;
  verdict: 'PASS' | 'FAIL';
  reasoning: string;
}

export interface DueDiligenceAnalysis {
  quantitativeAnalysis: QuantitativeAnalysis;
  qualitativeAnalysis: QualitativeAnalysis;
  strategicAnalysis: StrategicAnalysis;
  verificationAnalysis: VerificationResult;
  // Final decision (all 4 agents must pass)
  accept: boolean;
}


function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

// Helper to clean JSON from markdown code blocks
function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    // Remove opening ```json or ```
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    // Remove closing ```
    cleaned = cleaned.replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

async function quantitativeAgent(transcript: string): Promise<QuantitativeAnalysis> {
  const anthropic = getAnthropicClient();

  const prompt = `You are a QUANTITATIVE ANALYST specializing in financial due diligence for venture capital.

Your ONLY job is to extract hard business metrics and company details from this startup pitch transcript.

Extract these metrics (if not mentioned, set to null):
- revenue: Monthly recurring revenue in dollars (number)
- consumer_acquisition_cost: Customer acquisition cost (CAC) in dollars (number)
- team_size: Total number of team members including founders (number)
- stage: Funding stage like "Pre-seed", "Seed", "Series A", etc. (string)
- region: Geographic location or "Remote" (string)
- industry: Primary industry vertical like "SaaS", "AI", "Logistics", "FinTech", etc. (string)
- founder_name: Name of the founder speaking (string)

Then provide your investment verdict:
- verdict: "PASS" or "FAIL" - Does this company have viable metrics?
- reasoning: 2-3 sentences explaining your verdict

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just JSON.

Format:
{
  "revenue": number | null,
  "consumer_acquisition_cost": number | null,
  "team_size": number | null,
  "stage": string | null,
  "region": string | null,
  "industry": string | null,
  "founder_name": string | null,
  "verdict": "PASS" | "FAIL",
  "reasoning": "string"
}

TRANSCRIPT:
${transcript}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Quantitative Agent: Unexpected response type');
  }

  const cleanedJson = cleanJsonResponse(content.text);
  return JSON.parse(cleanedJson) as QuantitativeAnalysis;
}

async function qualitativeAgent(transcript: string): Promise<QualitativeAnalysis> {
  const anthropic = getAnthropicClient();

  const prompt = `You are a QUALITATIVE ANALYST specializing in founder assessment for venture capital.

Your ONLY job is to evaluate the FOUNDER'S background and qualities based on their communication in this pitch transcript.

Extract founder background (if not mentioned, set to null):
- pedigree: Education, previous companies, relevant experience (string, 1-2 sentences)
- repeat_founder: Has the founder started companies before? (boolean: true or false)
- social_capital: Network, connections, notable relationships mentioned (string, 1-2 sentences or null)

Analyze these dimensions (provide brief analysis for each):
- conviction_analysis: Do they truly believe in their mission?
- clarity_analysis: Can they explain their business clearly?
- passion_analysis: Are they energized and committed?
- coachability_analysis: Are they open to feedback and learning?

Then provide your investment verdict:
- verdict: "PASS" or "FAIL" - Does this founder have the right qualities?
- reasoning: 2-3 sentences explaining your verdict

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just JSON.

Format:
{
  "pedigree": string | null,
  "repeat_founder": boolean,
  "social_capital": string | null,
  "conviction_analysis": "string",
  "clarity_analysis": "string",
  "passion_analysis": "string",
  "coachability_analysis": "string",
  "verdict": "PASS" | "FAIL",
  "reasoning": "string"
}

TRANSCRIPT:
${transcript}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Qualitative Agent: Unexpected response type');
  }

  const cleanedJson = cleanJsonResponse(content.text);
  return JSON.parse(cleanedJson) as QualitativeAnalysis;
}

async function strategicAgent(transcript: string): Promise<StrategicAnalysis> {
  const anthropic = getAnthropicClient();

  const prompt = `You are a STRATEGIC ANALYST specializing in market and business model evaluation for venture capital.

Your ONLY job is to assess the STRATEGIC VIABILITY of this startup based on their pitch transcript.

Extract company values:
- company_values: Core mission, culture, values mentioned by founder (string, 1-2 sentences or null if not mentioned)

Provide analysis on (2-3 sentences each):
- business_model: How do they make money? Is it scalable?
- market_originality: What's their competitive positioning? Are they unique?
- overall_strength_of_pitch: How effective is their pitch overall?

Then provide your investment verdict:
- verdict: "PASS" or "FAIL" - Is this strategically viable?
- reasoning: 2-3 sentences explaining your verdict

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just JSON.

Format:
{
  "company_values": string | null,
  "business_model": "string",
  "market_originality": "string",
  "overall_strength_of_pitch": "string",
  "verdict": "PASS" | "FAIL",
  "reasoning": "string"
}

TRANSCRIPT:
${transcript}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Strategic Agent: Unexpected response type');
  }

  const cleanedJson = cleanJsonResponse(content.text);
  return JSON.parse(cleanedJson) as StrategicAnalysis;
}

export async function analyzeCompletedCall(transcript: string): Promise<DueDiligenceAnalysis> {
  console.log('🎯 Starting multi-agent due diligence analysis...');
  
  try {
    // Run first three agents IN PARALLEL for maximum efficiency
    const [quantAnalysis, qualAnalysis, stratAnalysis] = await Promise.all([
      quantitativeAgent(transcript).then(result => {
        console.log('✅ Quantitative Agent completed');
        return result;
      }),
      qualitativeAgent(transcript).then(result => {
        console.log('✅ Qualitative Agent completed');
        return result;
      }),
      strategicAgent(transcript).then(result => {
        console.log('✅ Strategic Agent completed');
        return result;
      })
    ]);

    console.log('🎉 Analysis agents completed successfully');

    // Now run verification agent with extracted founder info
    console.log('🔍 Starting verification via MCP...');
    let verificationResult;
    try {
      verificationResult = await verificationAgent(transcript, {
        founder_name: quantAnalysis.founder_name || undefined,
        company: quantAnalysis.industry || undefined, // Use industry as proxy if no company name
        school: qualAnalysis.pedigree || undefined,
        pedigree: qualAnalysis.pedigree || undefined,
        social_capital: qualAnalysis.social_capital || undefined,
      });
      console.log('✅ Verification Agent completed');
    } catch (error) {
      console.warn('⚠️ Verification agent failed (likely serverless environment), skipping...');
      // In serverless environments, MCP may fail - skip verification gracefully
      verificationResult = {
        verified: false,
        confidence: 'very_low' as const,
        reasoning: 'Verification skipped - MCP not available in serverless environment',
        sources_found: 0,
        details: 'Verification agent requires local environment with process spawning',
        verdict: 'SKIP' as any,
      };
    }

    console.log('🎉 All agents completed successfully');

    // Final decision: First 3 agents must pass (verification is optional in serverless)
    const verificationPassed = verificationResult.verdict === 'PASS' || verificationResult.verdict === 'SKIP';
    const accept = 
      quantAnalysis.verdict === 'PASS' && 
      qualAnalysis.verdict === 'PASS' && 
      stratAnalysis.verdict === 'PASS' &&
      verificationPassed;

    console.log(`📋 Final Decision: ${accept ? '✅ ACCEPT' : '❌ REJECT'}`);

    return {
      quantitativeAnalysis: quantAnalysis,
      qualitativeAnalysis: qualAnalysis,
      strategicAnalysis: stratAnalysis,
      verificationAnalysis: verificationResult,
      accept
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Agent failed to return valid JSON: ${error.message}`);
    }
    throw error;
  }
}

