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

    console.log('Fetching conversations from ElevenLabs...');

    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched conversations list');

    // Filter for Gary Tan AI only
    const garyConversations = data.conversations?.filter((conv: any) => 
      conv.agent_name === 'Gary Tan AI'
    ) || [];

    console.log(`Found ${garyConversations.length} Gary Tan AI conversations`);

    // Fetch full details for each conversation including transcript
    const detailedConversations = await Promise.all(
      garyConversations.map(async (conv: any) => {
        try {
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
            return { ...conv, ...details };
          }
          return conv;
        } catch (error) {
          console.error(`Failed to fetch details for ${conv.conversation_id}:`, error);
          return conv;
        }
      })
    );

    console.log('Successfully fetched detailed conversations');

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
