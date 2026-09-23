import React from 'react';
import { X, Bell, Check, Info } from 'lucide-react';
import { getLocalNotifications, saveLocalNotifications } from '../../services/storageService';

export const NotificationDrawer = ({ isOpen, onClose, notifications, onUpdate }) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    saveLocalNotifications(updated);
    if (onUpdate) onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#F7F9FC] border-b border-[#E0E6EF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Notifications</h3>
                <p className="text-[11px] text-[#94A3B8]">
                  {notifications.filter((n) => !n.is_read).length} unread alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#008F8F] hover:underline px-2 py-1"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-[#94A3B8]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    notif.is_read
                      ? 'bg-white border-[#E0E6EF] opacity-75'
                      : 'bg-[#FFF0F0]/40 border-[#E3060B]/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#E3060B]" />
                      )}
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#94A3B8] shrink-0">
                      {new Date(notif.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#111827]/80 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
