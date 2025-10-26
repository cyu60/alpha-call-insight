// Check the actual structure of stored analysis
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkStructure() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data } = await supabase
    .from('conversations')
    .select('conversation_id, metadata')
    .eq('conversation_id', 'conv_12345')
    .single();

  if (data?.metadata) {
    console.log('Full metadata structure:');
    console.log(JSON.stringify(data.metadata, null, 2));
    
    if ((data.metadata as any).ai_analysis) {
      console.log('\n\nai_analysis structure:');
      console.log(JSON.stringify((data.metadata as any).ai_analysis, null, 2));
    }
  }
}

checkStructure();

