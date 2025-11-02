/*
  # Bhairuha Restaurant OMS - Complete Schema

  ## Summary
  Creates a comprehensive real-time order management system for restaurants with:
  - Role-based staff management (server, kitchen, admin)
  - Table status tracking with real-time updates
  - Menu management with availability control
  - Order and order items with sequential status tracking
  - Invoice generation with sequential numbering
  - Real-time notification system for role-based alerts
  - Complete audit logging for accountability

  ## New Tables

  1. **staff** - User accounts with role-based access
  2. **tables** - Restaurant tables with status tracking
  3. **menu_items** - Menu items with availability
  4. **orders** - Master order records per table
  5. **order_items** - Individual items in orders
  6. **invoices** - Generated invoices with sequential numbering
  7. **notifications** - Real-time alerts for all roles
  8. **audit_log** - Complete action audit trail

  ## Security
  - RLS enabled on all tables with role-based policies
  - Authentication required via Supabase Auth
  - Audit logging for all state changes
  - Notifications are recipient-only (never sender)

  ## Real-time
  - All tables enabled for Supabase Realtime subscriptions
  - Automatic timestamp updates on modifications
  - Sequential invoice numbering via triggers
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== STAFF TABLE ====================
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('server', 'kitchen', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read own data"
  ON staff FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== TABLES TABLE ====================
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number integer UNIQUE NOT NULL,
  status text DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'active', 'served')),
  current_server_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read tables"
  ON tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Servers and admin can update tables"
  ON tables FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'admin')
    )
  );

CREATE POLICY "Admin can delete tables"
  ON tables FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== MENU ITEMS TABLE ====================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  description text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id uuid NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  server_id uuid NOT NULL REFERENCES staff(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'prepared', 'served', 'completed', 'billed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Servers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'admin')
    )
  );

CREATE POLICY "Servers and kitchen can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'kitchen', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'kitchen', 'admin')
    )
  );

-- ==================== ORDER ITEMS TABLE ====================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'prepared', 'served')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Servers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'admin')
    )
  );

CREATE POLICY "Servers and kitchen can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'kitchen', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role IN ('server', 'kitchen', 'admin')
    )
  );

-- ==================== INVOICES TABLE ====================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number text UNIQUE NOT NULL,
  table_id uuid NOT NULL REFERENCES tables(id),
  order_id uuid NOT NULL REFERENCES orders(id),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'upi')),
  created_by uuid NOT NULL REFERENCES staff(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_role text NOT NULL CHECK (recipient_role IN ('server', 'kitchen', 'admin')),
  recipient_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  reference_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid() OR
    (recipient_id IS NULL AND EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = recipient_role
    ))
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    recipient_id = auth.uid() OR
    (recipient_id IS NULL AND EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = recipient_role
    ))
  )
  WITH CHECK (
    recipient_id = auth.uid() OR
    (recipient_id IS NULL AND EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = recipient_role
    ))
  );

CREATE POLICY "All authenticated users can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==================== AUDIT LOG TABLE ====================
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES staff(id),
  user_role text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can create audit log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==================== TRIGGERS ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sequential invoice numbering
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number integer;
  invoice_prefix text;
  invoice_date text;
BEGIN
  invoice_date := to_char(now(), 'YYYYMMDD');
  invoice_prefix := 'INV-' || invoice_date || '-';
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM LENGTH(invoice_prefix) + 1) AS integer)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE invoice_prefix || '%';
  
  NEW.invoice_number := invoice_prefix || LPAD(next_number::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ==================== REALTIME PUBLICATIONS ====================
ALTER PUBLICATION supabase_realtime ADD TABLE staff, tables, menu_items, orders, order_items, invoices, notifications, audit_log;
