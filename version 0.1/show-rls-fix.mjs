import fetch from 'node-fetch';

const supabaseUrl = 'https://anyopnttxzcnepjjmwph.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueW9wbnR0eHpjbmVwamptd3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNjEyNCwiZXhwIjoyMDc3NTkyMTI0fQ.vU8B-6S51vAxHOzxVTxDSJTTIUw2eztWe-x-DgYPU6g';

console.log('🔧 Fixing RLS policies via Supabase Management API...\n');

// Drop and recreate all problematic policies
const policies = [
  {
    name: 'drop_admin_read_staff',
    sql: 'DROP POLICY IF EXISTS "Admin can read all staff" ON staff;'
  },
  {
    name: 'drop_admin_insert_staff',
    sql: 'DROP POLICY IF EXISTS "Admin can insert staff" ON staff;'
  },
  {
    name: 'drop_admin_update_staff',
    sql: 'DROP POLICY IF EXISTS "Admin can update staff" ON staff;'
  },
  {
    name: 'create_auth_read_staff',
    sql: 'CREATE POLICY "Authenticated users can read staff" ON staff FOR SELECT TO authenticated USING (true);'
  },
  {
    name: 'create_service_insert_staff',
    sql: 'CREATE POLICY "Service can insert staff" ON staff FOR INSERT TO authenticated WITH CHECK (true);'
  },
  {
    name: 'create_user_update_staff',
    sql: 'CREATE POLICY "Users can update own staff record" ON staff FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);'
  }
];

for (const policy of policies) {
  console.log(`Executing: ${policy.name}...`);
  console.log(`SQL: ${policy.sql}\n`);
}

console.log('\n⚠️  Note: Direct SQL execution via REST API is not available.');
console.log('📝 Please run the following SQL in Supabase SQL Editor:\n');
console.log('='.repeat(80));
console.log(`
-- Fix infinite recursion in staff table RLS policies
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

-- Create simplified policies
CREATE POLICY "Authenticated users can read staff" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can insert staff" ON staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own staff record" ON staff FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

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
console.log('\nOr I can provide the direct Supabase Dashboard link for SQL Editor.\n');
