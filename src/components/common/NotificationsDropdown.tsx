import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, ShieldCheck, HeartHandshake, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

export const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'RESERVATION':
        return <HeartHandshake className="w-4 h-4 text-purple-600" />;
      case 'ASSIGNMENT':
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'INCIDENT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'FEEDBACK':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notifications-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-purple-50/50 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadNotificationCount > 0 && (
          <span
            id="unread-notifications-count-badge"
            className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold text-white bg-purple-600 rounded-full border-2 border-white shadow-sm"
          >
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notifications-dropdown-menu"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-purple-50/60 border-b border-purple-100/60">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
              {unreadNotificationCount > 0 && (
                <span className="text-xs px-2 py-0.5 font-medium bg-purple-200/80 text-purple-900 rounded-full">
                  {unreadNotificationCount} new
                </span>
              )}
            </div>
            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead()}
                className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {userNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Surplus alerts and dispatch updates will appear here</p>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors ${
                    !notif.isRead ? 'bg-purple-50/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100/80 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-slate-400 hover:text-purple-600 p-0.5"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
