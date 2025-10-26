// Quick check: What's in the database?
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials');
    console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_KEY:', SUPABASE_KEY ? '✅ Set' : '❌ Missing');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Check conversations table
  const { data, error, count } = await supabase
    .from('conversations')
    .select('conversation_id, title, participant, created_at', { count: 'exact' });

  if (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }

  console.log(`📊 Found ${count || 0} conversations in database\n`);

  if (data && data.length > 0) {
    console.log('Conversations:');
    console.log('-'.repeat(80));
    data.forEach((conv, i) => {
      console.log(`${i + 1}. ${conv.title || 'Untitled'}`);
      console.log(`   ID: ${conv.conversation_id}`);
      console.log(`   Participant: ${conv.participant || 'Unknown'}`);
      console.log(`   Created: ${conv.created_at}`);
      console.log('');
    });
    console.log('-'.repeat(80));
  } else {
    console.log('⚠️  Database is empty. You need to fetch conversations first:');
    console.log('   curl http://localhost:3000/api/fetch-conversations');
  }
}

checkDatabase();

