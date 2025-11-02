export type UserRole = 'server' | 'kitchen' | 'admin';
export type TableStatus = 'free' | 'occupied' | 'active' | 'served';
export type OrderStatus = 'pending' | 'in_progress' | 'prepared' | 'served' | 'completed' | 'billed';
export type OrderItemStatus = 'pending' | 'in_progress' | 'prepared' | 'served';
export type PaymentMethod = 'cash' | 'upi';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  table_number: number;
  status: TableStatus;
  current_server_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  table_id: string;
  server_id: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  notes: string | null;
  status: OrderItemStatus;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  table_id: string;
  order_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_role: UserRole;
  recipient_id: string | null;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  table: Table;
  server: User;
}

export interface TableWithOrder extends Table {
  order?: OrderWithItems;
}
