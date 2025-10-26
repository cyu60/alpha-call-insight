import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Automatic Founder Feedback System
 *
 * This function is triggered when a call ends and:
 * 1. Runs 4 AI agents to analyze the pitch
 * 2. Sends constructive feedback email to founder (NO verdict)
 * 3. Stores analysis results for VC dashboard
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id } = await req.json();

    if (!conversation_id) {
      throw new Error('conversation_id is required');
    }

    console.log(`🎯 Processing feedback for conversation: ${conversation_id}`);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch conversation from database
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', conversation_id)
      .single();

    if (fetchError || !conversation) {
      throw new Error(`Failed to fetch conversation: ${fetchError?.message}`);
    }

    // Check if feedback already sent
    if (conversation.feedback_sent) {
      console.log(`⚠️ Feedback already sent for ${conversation_id}`);
      return new Response(
        JSON.stringify({ message: 'Feedback already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if founder email is available
    if (!conversation.founder_email) {
      console.log(`⚠️ No founder email for ${conversation_id}, skipping feedback`);
      return new Response(
        JSON.stringify({ message: 'No founder email available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Sending feedback to: ${conversation.founder_email}`);

    // Convert transcript to text format
    const transcriptText = conversation.transcript
      ?.map((msg: any) => `${msg.role === 'user' ? 'You' : 'Gary Tan AI'}: ${msg.message}`)
      .join('\n') || '';

    if (!transcriptText) {
      throw new Error('No transcript available for analysis');
    }

    // Call our Next.js API to run analysis
    const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
    const analysisResponse = await fetch(`${APP_URL}/api/analyze-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: transcriptText }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`Analysis failed: ${analysisResponse.statusText}`);
    }

    const analysis = await analysisResponse.json();
    console.log(`✅ Analysis complete`);

    // Generate founder-friendly email (NO VERDICT)
    const emailHtml = generateFeedbackEmail(
      conversation.participant,
      analysis
    );

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ALPHA FOUNDRY<feedback@alphafoundery.com>',
        to: [conversation.founder_email],
        subject: `Feedback on your pitch - ${conversation.title}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log(`✅ Email sent successfully`);

    // Mark feedback as sent
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        feedback_sent: true,
        feedback_sent_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversation_id);

    if (updateError) {
      console.error('Failed to update feedback status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback sent successfully',
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in send-founder-feedback:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Generate founder-friendly feedback email
 * NO VERDICT - just constructive insights
 */
function generateFeedbackEmail(founderName: string, analysis: any): string {
  const {
    quantitativeAnalysis,
    qualitativeAnalysis,
    strategicAnalysis,
    verificationAnalysis
  } = analysis;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
    .section h2 { margin-top: 0; color: #667eea; }
    .insight { margin: 15px 0; padding: 10px; background: white; border-radius: 6px; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">Thank you for your pitch, ${founderName}!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Here's some constructive feedback from our analysis</p>
  </div>

  <div class="section">
    <h2>💼 Business Metrics Feedback</h2>
    ${quantitativeAnalysis.founder_name ? `<p><strong>Founder:</strong> ${quantitativeAnalysis.founder_name}</p>` : ''}
    ${quantitativeAnalysis.industry ? `<p><strong>Industry:</strong> ${quantitativeAnalysis.industry}</p>` : ''}
    ${quantitativeAnalysis.stage ? `<p><strong>Stage:</strong> ${quantitativeAnalysis.stage}</p>` : ''}
    <div class="insight">
      <strong>Our thoughts:</strong>
      <p>${quantitativeAnalysis.reasoning}</p>
    </div>
  </div>

  <div class="section">
    <h2>👤 Founder Assessment</h2>
    ${qualitativeAnalysis.pedigree ? `<p><strong>Background:</strong> ${qualitativeAnalysis.pedigree}</p>` : ''}
    <div class="insight">
      <strong>Conviction:</strong>
      <p>${qualitativeAnalysis.conviction_analysis}</p>
    </div>
    <div class="insight">
      <strong>Clarity:</strong>
      <p>${qualitativeAnalysis.clarity_analysis}</p>
    </div>
    <div class="insight">
      <strong>Passion:</strong>
      <p>${qualitativeAnalysis.passion_analysis}</p>
    </div>
    <div class="insight">
      <strong>Overall thoughts:</strong>
      <p>${qualitativeAnalysis.reasoning}</p>
    </div>
  </div>

  <div class="section">
    <h2>🚀 Strategic Insights</h2>
    <div class="insight">
      <strong>Business Model:</strong>
      <p>${strategicAnalysis.business_model}</p>
    </div>
    <div class="insight">
      <strong>Market Position:</strong>
      <p>${strategicAnalysis.market_originality}</p>
    </div>
    <div class="insight">
      <strong>Pitch Effectiveness:</strong>
      <p>${strategicAnalysis.overall_strength_of_pitch}</p>
    </div>
    <div class="insight">
      <strong>Our thoughts:</strong>
      <p>${strategicAnalysis.reasoning}</p>
    </div>
  </div>

  <div class="section">
    <h2>✅ Verification Notes</h2>
    <p><strong>Sources reviewed:</strong> ${verificationAnalysis.sources_found}</p>
    <p><strong>Confidence level:</strong> ${verificationAnalysis.confidence.replace('_', ' ')}</p>
    <div class="insight">
      <p>${verificationAnalysis.details}</p>
    </div>
  </div>

  <div class="footer">
    <p>This feedback is provided to help you refine your pitch and grow your business.</p>
    <p style="margin-top: 20px;">
      <strong>ALPHA</strong> - AI-Powered VC Analysis<br>
      Keep building! 🚀
    </p>
  </div>
</body>
</html>
  `.trim();
}
