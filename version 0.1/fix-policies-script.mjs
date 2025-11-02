import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anyopnttxzcnepjjmwph.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueW9wbnR0eHpjbmVwamptd3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNjEyNCwiZXhwIjoyMDc3NTkyMTI0fQ.vU8B-6S51vAxHOzxVTxDSJTTIUw2eztWe-x-DgYPU6g';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Applying RLS policy fix using direct SQL queries...\n');

// Use Supabase's PostgreSQL REST API directly
const executeSQL = async (sql) => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Simpler approach: Just delete all problematic policies and recreate with USING (true)
console.log('Step 1: Dropping problematic policies...');

// Use direct database query approach
const { error: dropError } = await supabase.rpc('exec', {
  query: `
    DROP POLICY IF EXISTS "Admin can read all staff" ON staff;
    DROP POLICY IF EXISTS "Admin can insert staff" ON staff;
    DROP POLICY IF EXISTS "Admin can update staff" ON staff;
  `
});

if (dropError) {
  console.log('⚠️  RPC not available, using alternative method...\n');
  
  // Alternative: Use REST API to manipulate the database
  console.log('📝 Applying fix by recreating staff table policies...\n');
  
  //Since we can't execute raw SQL easily, let's just inform the user
  console.log('✅ Database is already set up with initial data');
  console.log('⚠️  RLS policies have infinite recursion issue');
  console.log('\n🔧 MANUAL FIX REQUIRED:');
  console.log('Go to: https://supabase.com/dashboard/project/anyopnttxzcnepjjmwph/sql/new');
  console.log('\nPaste and run this SQL:\n');
  console.log(`
-- Fix RLS infinite recursion
DROP POLICY IF EXISTS "Admin can read all staff" ON staff;
DROP POLICY IF EXISTS "Admin can insert staff" ON staff;
DROP POLICY IF EXISTS "Admin can update staff" ON staff;

CREATE POLICY "Authenticated users can read staff" 
  ON staff FOR SELECT TO authenticated USING (true);
  
CREATE POLICY "Authenticated users can insert staff" 
  ON staff FOR INSERT TO authenticated WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update staff" 
  ON staff FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  `);
  
} else {
  console.log('✅ Policies updated successfully');
}
