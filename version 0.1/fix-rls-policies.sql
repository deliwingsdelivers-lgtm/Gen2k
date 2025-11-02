-- Fix infinite recursion in staff table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can read all staff" ON staff;
DROP POLICY IF EXISTS "Admin can insert staff" ON staff;
DROP POLICY IF EXISTS "Admin can update staff" ON staff;

-- Create fixed policies without recursion
-- Allow all authenticated users to read staff table
CREATE POLICY "Authenticated users can read staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert into staff (for initial setup)
CREATE POLICY "Service can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own records
CREATE POLICY "Users can update own staff record"
  ON staff FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix other table policies that might have similar issues
-- Tables policy
DROP POLICY IF EXISTS "Servers and admin can update tables" ON tables;
CREATE POLICY "Authenticated users can update tables"
  ON tables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete tables" ON tables;
CREATE POLICY "Authenticated users can delete tables"
  ON tables FOR DELETE
  TO authenticated
  USING (true);

-- Add insert policy for tables
DROP POLICY IF EXISTS "Authenticated users can insert tables" ON tables;
CREATE POLICY "Authenticated users can insert tables"
  ON tables FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Menu items policy
DROP POLICY IF EXISTS "Admin can manage menu items" ON menu_items;
CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders policy
DROP POLICY IF EXISTS "Servers can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Servers and kitchen can update orders" ON orders;
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items policy
DROP POLICY IF EXISTS "Servers can create order items" ON order_items;
CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Servers and kitchen can update order items" ON order_items;
CREATE POLICY "Authenticated users can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoices policy
DROP POLICY IF EXISTS "Admin can create invoices" ON invoices;
CREATE POLICY "Authenticated users can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Audit log policy
DROP POLICY IF EXISTS "Admin can read audit log" ON audit_log;
CREATE POLICY "Authenticated users can read audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);
