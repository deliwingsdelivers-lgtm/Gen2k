import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

interface Toast extends Notification {
  display: boolean;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Toast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadNotifications() {
      if (!user) return;
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipient_id.eq.${user.id},and(recipient_id.is.null,recipient_role.eq.${user.role})`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(
          data.map((n) => ({
            ...n,
            display: false,
          }))
        );
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    }

    loadNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          const notification = payload.new as Notification;
          const oldNotification = payload.old as Partial<Notification> | undefined;

          const isForMe =
            notification.recipient_id === user.id ||
            (notification.recipient_id === null && notification.recipient_role === user.role);

          if (isForMe && notification.created_at !== oldNotification?.created_at) {
            setNotifications((prev) => [
              {
                ...notification,
                display: true,
              },
              ...prev,
            ]);
            setUnreadCount((prev) => prev + 1);

            playNotificationSound();

            setTimeout(() => {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === notification.id
                    ? { ...n, display: false }
                    : n
                )
              );
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const displayNotifications = notifications.filter((n) => n.display);

  return (
    <div className="fixed z-40">
      <div className="fixed top-4 right-4 space-y-2 pointer-events-none">
        {displayNotifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-white/20 max-w-xs animate-in slide-in-from-top-2 duration-300"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed top-4 left-4 pointer-events-auto">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-3 rounded-xl bg-white/80 backdrop-blur-lg hover:bg-white border border-white/20 hover:border-white/40 transition"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {Math.min(unreadCount, 9)}
            </div>
          )}
        </button>

        {showPanel && (
          <div className="absolute top-14 left-0 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-h-96 overflow-y-auto mt-2">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No notifications</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
