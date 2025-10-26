import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    console.log('Fetching Gary Tan AI conversations from ElevenLabs...');

    // First, get list of conversations with pagination
    const listResponse = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversations?page_size=100',
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('ElevenLabs list API error:', listResponse.status, errorText);
      throw new Error(`ElevenLabs API error: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    console.log(`Fetched ${listData.conversations?.length || 0} total conversations`);

    // Filter for Gary Tan AI only
    const garyConversations = listData.conversations?.filter((conv: any) => 
      conv.agent_name === 'Gary Tan AI'
    ) || [];

    console.log(`Found ${garyConversations.length} Gary Tan AI conversations`);

    // Fetch full details for each conversation including transcript
    const detailedConversations = await Promise.all(
      garyConversations.map(async (conv: any) => {
        try {
          console.log(`Fetching details for conversation ${conv.conversation_id}`);
          
          const detailResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
            {
              method: 'GET',
              headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
              },
            }
          );

          if (detailResponse.ok) {
            const details = await detailResponse.json();
            console.log(`Successfully fetched details for ${conv.conversation_id}`);
            return { 
              ...conv, 
              transcript: details.transcript,
              metadata: details.metadata,
              analysis: details.analysis
            };
          } else {
            console.error(`Failed to fetch details for ${conv.conversation_id}: ${detailResponse.status}`);
            return conv;
          }
        } catch (error) {
          console.error(`Exception fetching details for ${conv.conversation_id}:`, error);
          return conv;
        }
      })
    );

    console.log(`Returning ${detailedConversations.length} detailed conversations`);

    return new Response(
      JSON.stringify({ conversations: detailedConversations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-conversations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
