import { useState } from 'react';
import { Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, MenuItem, Table, User } from '../types';
import { createNotification } from '../lib/notifications';

interface OrderWithDetails extends Order {
  table: Table;
  server: User;
  order_items: (OrderItem & { menu_item: MenuItem })[];
}

export function KitchenDashboard() {
  const { user } = useAuth();
  const { data: orders } = useRealtimeData<Order>('orders');
  const { data: tables } = useRealtimeData<Table>('tables');
  const { data: orderItems } = useRealtimeData<OrderItem>('order_items');
  const { data: menuItems } = useRealtimeData<MenuItem>('menu_items');
  const { data: staff } = useRealtimeData<User>('staff');
  const [viewMode, setViewMode] = useState<'table-wise' | 'item-wise'>('table-wise');
  const [loading, setLoading] = useState(false);

  const ordersWithDetails: OrderWithDetails[] = orders
    .filter((o) => ['pending', 'in_progress', 'prepared'].includes(o.status))
    .map((o) => ({
      ...o,
      table: tables.find((t) => t.id === o.table_id)!,
      server: staff.find((s) => s.id === o.server_id)!,
      order_items: orderItems
        .filter((oi) => oi.order_id === o.id)
        .map((oi) => ({
          ...oi,
          menu_item: menuItems.find((m) => m.id === oi.menu_item_id)!,
        }))
        .filter((oi) => oi.menu_item),
    }))
    .filter((o) => o.table && o.server && o.order_items.length > 0);

  const handleUpdateItemStatus = async (itemId: string, newStatus: OrderItem['status']) => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      if (newStatus === 'prepared') {
        const item = orderItems.find((oi) => oi.id === itemId);
        if (item) {
          const order = orders.find((o) => o.id === item.order_id);
          const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
          const table = tables.find((t) => t.id === order?.table_id);

          if (order && menuItem && table) {
            await createNotification(
              'server',
              'item_prepared',
              `${menuItem.name} Ready`,
              `Table ${table.table_number} - ${menuItem.name} is prepared`,
              itemId,
              order.server_id
            );
          }
        }
      }

      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_role: user.role,
        action: `item_${newStatus}`,
        entity_type: 'order_item',
        entity_id: itemId,
      });
    } catch (error) {
      console.error('Error updating item status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'in_progress':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'prepared':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusButton = (status: OrderItem['status'], itemId: string) => {
    const nextStatus = status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'prepared' : null;

    if (!nextStatus) return null;

    return (
      <button
        onClick={() => handleUpdateItemStatus(itemId, nextStatus)}
        disabled={loading}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          nextStatus === 'in_progress'
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } disabled:opacity-50`}
      >
        {nextStatus === 'in_progress' ? 'Start' : 'Mark Ready'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-emerald-600" />
              Kitchen
            </h1>
            <p className="text-gray-600 mt-1">Manage food preparation</p>
          </div>

          <div className="flex gap-2 bg-white/80 backdrop-blur-lg rounded-lg p-1 border border-white/20">
            <button
              onClick={() => setViewMode('table-wise')}
              className={`px-4 py-2 rounded font-medium transition ${
                viewMode === 'table-wise'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Table Wise
            </button>
            <button
              onClick={() => setViewMode('item-wise')}
              className={`px-4 py-2 rounded font-medium transition ${
                viewMode === 'item-wise'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Item Wise
            </button>
          </div>
        </div>

        {viewMode === 'table-wise' ? (
          <div className="grid gap-4">
            {ordersWithDetails.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20">
                <p className="text-lg">No active orders</p>
              </div>
            ) : (
              ordersWithDetails.map((order) => {
                const createdTime = new Date(order.created_at);
                const elapsed = Math.floor((Date.now() - createdTime.getTime()) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;

                return (
                  <div
                    key={order.id}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="bg-gradient-to-r from-emerald-50 to-lime-50 p-4 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Table {order.table.table_number}
                        </h3>
                        <p className="text-sm text-gray-600">{order.server.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Clock className="w-4 h-4" />
                        {minutes}:{String(seconds).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(item.status)}`}
                        >
                          <div className="flex-1">
                            <p className="font-semibold">
                              {item.quantity}x {item.menu_item.name}
                            </p>
                            {item.notes && (
                              <p className="text-sm opacity-75">Note: {item.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {getStatusButton(item.status, item.id)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {Array.from(
              new Map(
                ordersWithDetails
                  .flatMap((order) =>
                    order.order_items.map((item) => ({
                      ...item,
                      tableNumber: order.table.table_number,
                      serverName: order.server.full_name,
                    }))
                  )
                  .map((item) => [item.menu_item_id, item])
              ).values()
            ).map((item) => {
              const allInstances = ordersWithDetails
                .flatMap((order) =>
                  order.order_items
                    .filter((oi) => oi.menu_item_id === item.menu_item_id)
                    .map((oi) => ({
                      ...oi,
                      tableNumber: order.table.table_number,
                      serverName: order.server.full_name,
                    }))
                );

              return (
                <div
                  key={item.menu_item_id}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 overflow-hidden hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {item.menu_item.name} ({allInstances.length})
                  </h3>

                  <div className="space-y-2">
                    {allInstances.map((instance) => (
                      <div
                        key={instance.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(instance.status)}`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold">
                            Table {instance.tableNumber} - {instance.quantity}x
                          </p>
                          {instance.notes && (
                            <p className="text-sm opacity-75">Note: {instance.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {getStatusButton(instance.status, instance.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
