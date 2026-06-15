'use client';

import { Bell, Check, Users, Store, Star, Eye } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from '@/lib/utils/format';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'neighbor_verification':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'new_checkin':
        return <Store className="w-4 h-4 text-purple-600" />;
      case 'new_review':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'pet_scan':
        return <Eye className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#86868b]" />
          <span className="text-[13px] font-medium text-[#1d1d1f]">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[11px] text-[#0071e3] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-4">
          <Bell className="w-6 h-6 text-gray-300 mx-auto mb-1" />
          <p className="text-xs text-[#86868b]">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={`p-2 rounded-lg transition-colors ${
                !notification.is_read ? 'bg-blue-50' : 'hover:bg-gray-50'
              } cursor-pointer`}
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#1d1d1f] line-clamp-1">
                    {notification.title}
                  </p>
                  <p className="text-[11px] text-[#86868b] line-clamp-1">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-[#a1a1a6] mt-0.5">
                    {formatDistanceToNow(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
