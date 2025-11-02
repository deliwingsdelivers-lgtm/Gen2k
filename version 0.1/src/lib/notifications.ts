import { supabase } from './supabase';
import { UserRole } from '../types';

export async function createNotification(
  recipientRole: UserRole,
  type: string,
  title: string,
  message: string,
  referenceId?: string,
  recipientId?: string
) {
  const { error } = await supabase.from('notifications').insert({
    recipient_role: recipientRole,
    recipient_id: recipientId || null,
    type,
    title,
    message,
    reference_id: referenceId || null,
    is_read: false,
  });

  if (error) throw error;
}

export async function notifyOrderCreated(
  orderId: string,
  tableNumber: number,
  serverName: string
) {
  await createNotification(
    'kitchen',
    'order_created',
    `New Order: Table ${tableNumber}`,
    `${serverName} placed a new order`,
    orderId
  );
}

export async function notifyItemPrepared(
  itemId: string,
  itemName: string,
  tableNumber: number,
  serverId: string
) {
  await createNotification(
    'server',
    'item_prepared',
    `${itemName} Ready`,
    `Table ${tableNumber} - ${itemName} is prepared`,
    itemId,
    serverId
  );
}

export async function notifyTableServed(
  tableId: string,
  tableNumber: number,
  _serverId: string
) {
  await createNotification(
    'admin',
    'table_served',
    `Table ${tableNumber} Ready for Billing`,
    `Table ${tableNumber} is ready for billing`,
    tableId,
    undefined
  );
}

export async function markNotificationsAsRead(notificationIds: string[]) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', notificationIds);

  if (error) throw error;
}
