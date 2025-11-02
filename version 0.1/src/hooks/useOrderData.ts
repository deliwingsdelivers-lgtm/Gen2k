import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, MenuItem, Table, User } from '../types';

interface OrderWithDetails extends Order {
  table: Table;
  server: User;
  order_items: (OrderItem & { menu_item: MenuItem })[];
}

export function useOrderData() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*');

        if (ordersError) throw ordersError;

        const { data: tablesData } = await supabase.from('tables').select('*');
        const { data: staffData } = await supabase.from('staff').select('*');
        const { data: itemsData } = await supabase.from('order_items').select('*');
        const { data: menuData } = await supabase.from('menu_items').select('*');

        const tablesMap = new Map(tablesData?.map((t) => [t.id, t]) || []);
        const staffMap = new Map(staffData?.map((s) => [s.id, s]) || []);
        const itemsMap = new Map(menuData?.map((m) => [m.id, m]) || []);

        const ordersWithDetails: OrderWithDetails[] = (ordersData || []).map((order) => ({
          ...order,
          table: tablesMap.get(order.table_id)!,
          server: staffMap.get(order.server_id)!,
          order_items: (itemsData || [])
            .filter((oi) => oi.order_id === order.id)
            .map((oi) => ({
              ...oi,
              menu_item: itemsMap.get(oi.menu_item_id)!,
            }))
            .filter((oi) => oi.menu_item),
        }));

        setOrders(ordersWithDetails);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return { orders, loading, error };
}
