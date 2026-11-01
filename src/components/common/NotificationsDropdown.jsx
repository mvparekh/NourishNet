import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  Sparkles,
  PackageCheck,
  Truck
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const NotificationsDropdown = () => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    currentUser
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];

  const getIcon = (type) => {
    switch (type) {
      case "RESERVATION":
        return <HeartHandshake className="w-4 h-4 text-[#C85A32]" />;
      case "ASSIGNMENT":
        return <Truck className="w-4 h-4 text-[#5D4037]" />;
      case "DELIVERY":
        return <PackageCheck className="w-4 h-4 text-blue-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "INCIDENT":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "FEEDBACK":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-[#8D6E63]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notifications-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#5D4037] hover:text-[#2C1810] hover:bg-[#FAF3F0] rounded-xl transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-[#2C1810]" />
        {unreadNotificationCount > 0 && (
          <span
            id="unread-notifications-count-badge"
            className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold text-white bg-[#C85A32] rounded-full border-2 border-white shadow-xs"
          >
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notifications-dropdown-menu"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E7DCD5] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FAF7F2] border-b border-[#E7DCD5]">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#2C1810]">Notifications</h4>
              {unreadNotificationCount > 0 && (
                <span className="text-xs px-2 py-0.5 font-bold bg-[#FAF3F0] text-[#C85A32] border border-[#C85A32]/20 rounded-full">
                  {unreadNotificationCount} new
                </span>
              )}
            </div>
            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead()}
                className="inline-flex items-center gap-1 text-xs text-[#C85A32] hover:text-[#B34D28] font-semibold transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E7DCD5]/60">
            {userNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto text-[#D7CCC8] stroke-1 mb-2" />
                <p className="text-sm text-[#5D4037] font-semibold">No notifications yet</p>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Surplus claims and Delivery Partner dispatch updates will appear here
                </p>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) markNotificationRead(notif.id);
                  }}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                    !notif.isRead ? "bg-[#FAF3F0]/60 border-l-2 border-[#C85A32]" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-[#E7DCD5] shrink-0 mt-0.5 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-xs font-semibold ${
                          !notif.isRead ? "text-[#2C1810]" : "text-[#5D4037]"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationRead(notif.id);
                          }}
                          className="text-[#8D6E63] hover:text-[#C85A32] p-0.5 cursor-pointer"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#5D4037] mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#8D6E63] mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
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

export { NotificationsDropdown };
