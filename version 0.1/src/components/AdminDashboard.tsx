import { useState } from 'react';
import { BarChart3, DollarSign, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { supabase } from '../lib/supabase';
import { Order, Table, MenuItem, OrderItem, Invoice, User } from '../types';

interface OrderWithDetails extends Order {
  table: Table;
  order_items: (OrderItem & { menu_item: MenuItem })[];
}

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { data: tables } = useRealtimeData<Table>('tables');
  const { data: orders } = useRealtimeData<Order>('orders');
  const { data: orderItems } = useRealtimeData<OrderItem>('order_items');
  const { data: menuItems } = useRealtimeData<MenuItem>('menu_items');
  const { data: invoices } = useRealtimeData<Invoice>('invoices');
  const { data: staff } = useRealtimeData<User>('staff');
  const [activeTab, setActiveTab] = useState<'billing' | 'menu' | 'staff' | 'reports'>('billing');
  const [loading, setLoading] = useState(false);

  const servedTables = tables.filter((t) => t.status === 'served');

  const ordersWithDetails: OrderWithDetails[] = orders.map((o) => ({
    ...o,
    table: tables.find((t) => t.id === o.table_id)!,
    order_items: orderItems
      .filter((oi) => oi.order_id === o.id)
      .map((oi) => ({
        ...oi,
        menu_item: menuItems.find((m) => m.id === oi.menu_item_id)!,
      }))
      .filter((oi) => oi.menu_item),
  }));

  const handleGenerateInvoice = async (tableId: string, paymentMethod: 'cash' | 'upi') => {
    if (!user) return;
    setLoading(true);

    try {
      const order = ordersWithDetails.find((o) => o.table_id === tableId && o.status !== 'billed');
      if (!order) throw new Error('Order not found');

      const totalAmount = order.order_items.reduce(
        (sum, item) => sum + item.menu_item.price * item.quantity,
        0
      );

      const { error } = await supabase.from('invoices').insert({
        table_id: tableId,
        order_id: order.id,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        created_by: user.id,
      });

      if (error) throw error;

      await supabase
        .from('orders')
        .update({ status: 'billed' })
        .eq('id', order.id);

      await supabase
        .from('tables')
        .update({ status: 'free', current_server_id: null })
        .eq('id', tableId);

      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_role: user.role,
        action: 'invoice_created',
        entity_type: 'invoice',
        entity_id: tableId,
        details: { amount: totalAmount, payment_method: paymentMethod },
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const todayInvoices = invoices.filter((inv) =>
    new Date(inv.created_at).toDateString() === new Date().toDateString()
  );
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Restaurant management and control hub</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-3 rounded-lg bg-white/80 hover:bg-white border border-white/20 hover:border-white/40 transition"
          >
            <LogOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-gray-600 text-sm font-medium mb-2">Today's Sales</p>
            <p className="text-3xl font-bold text-emerald-600">₹{todaySales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{todayInvoices.length} invoices</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Sales</p>
            <p className="text-3xl font-bold text-emerald-600">₹{totalSales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{invoices.length} invoices</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-gray-600 text-sm font-medium mb-2">Ready for Billing</p>
            <p className="text-3xl font-bold text-lime-600">{servedTables.length}</p>
            <p className="text-xs text-gray-500 mt-2">tables waiting</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <div className="flex items-center gap-4 p-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                activeTab === 'billing'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Billing Queue
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                activeTab === 'menu'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                activeTab === 'staff'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Staff Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                activeTab === 'reports'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Reports
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'billing' && (
              <div className="space-y-4">
                {servedTables.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tables ready for billing</p>
                ) : (
                  servedTables.map((table) => {
                    const order = ordersWithDetails.find(
                      (o) => o.table_id === table.id && o.status === 'served'
                    );
                    if (!order) return null;

                    const totalAmount = order.order_items.reduce(
                      (sum, item) => sum + item.menu_item.price * item.quantity,
                      0
                    );

                    return (
                      <div
                        key={table.id}
                        className="p-4 bg-gradient-to-r from-emerald-50 to-lime-50 rounded-lg border border-emerald-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">Table {table.table_number}</p>
                          <p className="text-sm text-gray-600">
                            {order.order_items.length} items - ₹{totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGenerateInvoice(table.id, 'cash')}
                            disabled={loading}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
                          >
                            Cash
                          </button>
                          <button
                            onClick={() => handleGenerateInvoice(table.id, 'upi')}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
                          >
                            UPI
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <p className="text-gray-600 mb-4">Total menu items: {menuItems.length}</p>
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-600">{item.category}</span>
                        <span className="text-xs text-gray-600">₹{item.price}</span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            item.is_available
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <p className="text-gray-600 mb-4">Total staff: {staff.length}</p>
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{member.full_name}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-600">{member.email}</span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            member.role === 'server'
                              ? 'bg-blue-100 text-blue-700'
                              : member.role === 'kitchen'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-sm mb-2">Average Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{invoices.length > 0 ? (totalSales / invoices.length).toFixed(2) : '0'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-3">Payment Methods</p>
                  <div className="space-y-2">
                    {['cash', 'upi'].map((method) => {
                      const count = invoices.filter((inv) => inv.payment_method === method).length;
                      const amount = invoices
                        .filter((inv) => inv.payment_method === method)
                        .reduce((sum, inv) => sum + inv.total_amount, 0);

                      return (
                        <div key={method} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900 capitalize">{method}</span>
                            <span className="text-gray-600">
                              ₹{amount.toFixed(2)} ({count} orders)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
