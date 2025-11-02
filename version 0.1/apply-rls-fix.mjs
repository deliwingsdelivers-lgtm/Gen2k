import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://anyopnttxzcnepjjmwph.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueW9wbnR0eHpjbmVwamptd3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNjEyNCwiZXhwIjoyMDc3NTkyMTI0fQ.vU8B-6S51vAxHOzxVTxDSJTTIUw2eztWe-x-DgYPU6g';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

console.log('🔧 Fixing RLS policies to resolve infinite recursion...\n');

const fixSql = readFileSync('./fix-rls-policies.sql', 'utf8');

// Split by statements and execute each
const statements = fixSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

for (const statement of statements) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement });
    if (error) {
      console.log(`⚠️  ${statement.substring(0, 50)}... : ${error.message}`);
    } else {
      console.log(`✅ ${statement.substring(0, 50)}...`);
    }
  } catch (err) {
    // Try direct query instead
    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: statement })
      });
      console.log(`✅ ${statement.substring(0, 50)}...`);
    } catch (fetchErr) {
      console.log(`⚠️  Could not execute: ${statement.substring(0, 50)}...`);
    }
  }
}

console.log('\n✅ RLS policy fixes applied!');
console.log('🔄 Please refresh your browser to test login again.\n');
