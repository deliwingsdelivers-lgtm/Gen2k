import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { supabase } from '../lib/supabase';
import { Table, MenuItem } from '../types';
import { notifyOrderCreated } from '../lib/notifications';

export function ServerDashboard() {
  const { user } = useAuth();
  const { data: tables } = useRealtimeData<Table>('tables');
  const { data: menuItems } = useRealtimeData<MenuItem>('menu_items');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number; notes: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Appetizers');
  const [loading, setLoading] = useState(false);

  const categories = Array.from(new Set(menuItems.map((item) => item.category))).sort();

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory && item.is_available);

  const handleAddItem = (itemId: string) => {
    const existing = selectedItems.find((i) => i.itemId === itemId);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { itemId, quantity: 1, notes: '' }]);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
    } else {
      setSelectedItems(
        selectedItems.map((i) =>
          i.itemId === itemId ? { ...i, quantity } : i
        )
      );
    }
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, notes } : i
      )
    );
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable || selectedItems.length === 0 || !user) return;

    setLoading(true);
    try {
      const table = tables.find((t) => t.id === selectedTable);
      if (!table) throw new Error('Table not found');

      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', selectedTable)
        .neq('status', 'billed')
        .maybeSingle();

      if (fetchError) throw fetchError;

      let orderId: string;

      if (existingOrder) {
        orderId = existingOrder.id;
      } else {
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert({
            table_id: selectedTable,
            server_id: user.id,
            status: 'pending',
          })
          .select('id')
          .single();

        if (createError) throw createError;
        orderId = newOrder.id;

        await supabase
          .from('tables')
          .update({ status: 'active', current_server_id: user.id })
          .eq('id', selectedTable);

        await notifyOrderCreated(orderId, table.table_number, user.full_name);
      }

      for (const item of selectedItems) {
        const { error: itemError } = await supabase.from('order_items').insert({
          order_id: orderId,
          menu_item_id: item.itemId,
          quantity: item.quantity,
          notes: item.notes || null,
          status: 'pending',
        });

        if (itemError) throw itemError;
      }

      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_role: user.role,
        action: 'order_items_added',
        entity_type: 'order',
        entity_id: orderId,
        details: { items_count: selectedItems.length },
      });

      setSelectedItems([]);
      setShowOrderPanel(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTableGlowClass = (status: string) => {
    if (status === 'occupied' || status === 'active') {
      return 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-200';
    }
    return 'ring-1 ring-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Tables</h1>
          <p className="text-gray-600 mt-1">Manage your tables and orders</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => {
                setSelectedTable(table.id);
                setShowOrderPanel(true);
              }}
              className={`p-6 rounded-2xl backdrop-blur-lg bg-white/80 border border-white/20 hover:border-white/40 transition transform hover:scale-105 ${getTableGlowClass(table.status)}`}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {table.table_number}
              </div>
              <div className={`text-sm font-medium ${
                table.status === 'free'
                  ? 'text-gray-500'
                  : table.status === 'occupied'
                    ? 'text-emerald-600'
                    : 'text-emerald-600 animate-pulse'
              }`}>
                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showOrderPanel && selectedTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto md:rounded-3xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-lime-50 p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Table {tables.find((t) => t.id === selectedTable)?.table_number}
              </h2>
              <button
                onClick={() => {
                  setShowOrderPanel(false);
                  setSelectedTable(null);
                  setSelectedItems([]);
                }}
                className="p-2 hover:bg-white/50 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Menu Items</h3>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {filteredItems.map((item) => {
                    const selectedItem = selectedItems.find((i) => i.itemId === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item.id)}
                        className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                        </div>
                        {selectedItem && (
                          <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg font-medium">
                            {selectedItem.quantity}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Items</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedItems.map((item) => {
                      const menuItem = menuItems.find((m) => m.id === item.itemId);
                      return (
                        <div key={item.itemId} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">{menuItem?.name}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                                className="px-2 py-1 bg-white rounded border border-gray-200 hover:bg-gray-50"
                              >
                                −
                              </button>
                              <span className="px-3 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                                className="px-2 py-1 bg-white rounded border border-gray-200 hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="Add notes (e.g., extra spicy, no ice)"
                            value={item.notes}
                            onChange={(e) => handleUpdateNotes(item.itemId, e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOrderPanel(false);
                    setSelectedTable(null);
                    setSelectedItems([]);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={selectedItems.length === 0 || loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 disabled:opacity-50 text-white font-semibold rounded-xl transition"
                >
                  {loading ? 'Submitting...' : `Submit Order (${selectedItems.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
