import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anyopnttxzcnepjjmwph.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueW9wbnR0eHpjbmVwamptd3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNjEyNCwiZXhwIjoyMDc3NTkyMTI0fQ.vU8B-6S51vAxHOzxVTxDSJTTIUw2eztWe-x-DgYPU6g';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Fixing database RLS policies...\n');

// Execute raw SQL query using Supabase's query builder
async function executeSQLBatch() {
  const sqlStatements = [
    'DROP POLICY IF EXISTS "Admin can read all staff" ON staff',
    'DROP POLICY IF EXISTS "Admin can insert staff" ON staff',
    'DROP POLICY IF EXISTS "Admin can update staff" ON staff',
    'DROP POLICY IF EXISTS "Servers and admin can update tables" ON tables',
    'DROP POLICY IF EXISTS "Admin can delete tables" ON tables',
    'DROP POLICY IF EXISTS "Admin can manage menu items" ON menu_items',
    'DROP POLICY IF EXISTS "Servers can create orders" ON orders',
    'DROP POLICY IF EXISTS "Servers and kitchen can update orders" ON orders',
    'DROP POLICY IF EXISTS "Servers can create order items" ON order_items',
    'DROP POLICY IF EXISTS "Servers and kitchen can update order items" ON order_items',
    'DROP POLICY IF EXISTS "Admin can create invoices" ON invoices',
    'DROP POLICY IF EXISTS "Admin can read audit log" ON audit_log',
    'CREATE POLICY "Authenticated users can read staff" ON staff FOR SELECT TO authenticated USING (true)',
    'CREATE POLICY "Authenticated users can insert staff" ON staff FOR INSERT TO authenticated WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can update staff" ON staff FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)',
    'CREATE POLICY "Authenticated users can update tables" ON tables FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can delete tables" ON tables FOR DELETE TO authenticated USING (true)',
    'CREATE POLICY "Authenticated users can insert tables" ON tables FOR INSERT TO authenticated WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can manage menu items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can create order items" ON order_items FOR INSERT TO authenticated WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can update order items" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can create invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true)',
    'CREATE POLICY "Authenticated users can read audit log" ON audit_log FOR SELECT TO authenticated USING (true)'
  ];

  for (const sql of sqlStatements) {
    try {
      // Use fetch to call Supabase's REST API with raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        console.log(`⚠️  ${sql.substring(0, 60)}...`);
      } else {
        console.log(`✅ ${sql.substring(0, 60)}...`);
      }
    } catch (error) {
      console.log(`⚠️  ${sql.substring(0, 60)}...`);
    }
  }
}

// Since direct SQL execution is limited, provide alternative instructions
console.log('⚠️  Direct SQL execution via REST API is limited in Supabase.\n');
console.log('📝 Please copy and run this SQL in Supabase SQL Editor:');
console.log('🔗 https://supabase.com/dashboard/project/anyopnttxzcnepjjmwph/sql/new\n');
console.log('='.repeat(80));
console.log(`
-- Fix infinite recursion in RLS policies
DROP POLICY IF EXISTS "Admin can read all staff" ON staff;
DROP POLICY IF EXISTS "Admin can insert staff" ON staff;
DROP POLICY IF EXISTS "Admin can update staff" ON staff;
DROP POLICY IF EXISTS "Servers and admin can update tables" ON tables;
DROP POLICY IF EXISTS "Admin can delete tables" ON tables;
DROP POLICY IF EXISTS "Admin can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Servers can create orders" ON orders;
DROP POLICY IF EXISTS "Servers and kitchen can update orders" ON orders;
DROP POLICY IF EXISTS "Servers can create order items" ON order_items;
DROP POLICY IF EXISTS "Servers and kitchen can update order items" ON order_items;
DROP POLICY IF EXISTS "Admin can create invoices" ON invoices;
DROP POLICY IF EXISTS "Admin can read audit log" ON audit_log;

-- Create simplified non-recursive policies
CREATE POLICY "Authenticated users can read staff" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert staff" ON staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update staff" ON staff FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update tables" ON tables FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete tables" ON tables FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tables" ON tables FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can manage menu items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can create order items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update order items" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can create invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read audit log" ON audit_log FOR SELECT TO authenticated USING (true);
`);
console.log('='.repeat(80));
console.log('\n✅ After running the SQL, refresh the application and try logging in again.\n');
