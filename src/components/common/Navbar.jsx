import { useState } from "react";
import {
  HeartHandshake,
  LogOut,
  Sparkles,
  User as UserIcon,
  Shield,
  Truck,
  Building2,
  UtensilsCrossed,
  SlidersHorizontal,
  HelpCircle,
  Settings
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ContextualHelpModal } from "../dashboard/ContextualHelpModal";
import { NotificationPreferencesModal } from "../dashboard/NotificationPreferencesModal";
import { useDashboardConfig } from "../../hooks/useDashboardConfig";
const Navbar = ({
  onOpenLogin,
  onOpenApply,
  activeTab = "dashboard",
  setActiveTab
}) => {
  const { currentUser, isAuthenticated, logout, demoMode, setDemoMode } = useApp();
  const { notifPrefs, saveNotificationPreferences } = useDashboardConfig(currentUser);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotifPrefsOpen, setIsNotifPrefsOpen] = useState(false);
  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "DONOR":
        return <UtensilsCrossed className="w-3.5 h-3.5 text-purple-600" />;
      case "NGO":
        return <Building2 className="w-3.5 h-3.5 text-purple-600" />;
      case "VOLUNTEER":
        return <Truck className="w-3.5 h-3.5 text-purple-600" />;
      case "ADMIN":
      case "SUPER_ADMIN":
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <UserIcon className="w-3.5 h-3.5 text-purple-600" />;
    }
  };
  const getRoleLabel = () => {
    if (!currentUser) return "";
    switch (currentUser.role) {
      case "DONOR":
        return "Food Donor";
      case "NGO":
        return "NGO Partner";
      case "VOLUNTEER":
        return "Relief Courier";
      case "ADMIN":
        return "City Admin";
      case "SUPER_ADMIN":
        return "Governance Council";
      default:
        return currentUser.role;
    }
  };
  return <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {
    /* Brand Logo & City Hub */
  }
          <div className="flex items-center gap-4 sm:gap-6">
            <div
    className="flex items-center gap-2.5 cursor-pointer"
    onClick={() => setActiveTab && setActiveTab("dashboard")}
  >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-bold text-lg">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Nourish<span className="text-purple-600">Net</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    Surat
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Surplus Food Recovery & Logistics
                </p>
              </div>
            </div>

          </div>

          {
    /* Right Action Bar */
  }
          <div className="flex items-center gap-2 sm:gap-3">
            {
    /* Demo Mode Toggle Switch */
  }
            <button
    id="demo-mode-toggle-btn"
    type="button"
    onClick={() => setDemoMode(!demoMode)}
    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${demoMode ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
    title="Toggle presentation demo controls"
  >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{demoMode ? "Demo: ON" : "Product Mode"}</span>
            </button>

            {isAuthenticated && currentUser ? <>
                {
    /* Notifications */
  }
                <NotificationsDropdown />

                {
    /* Notification Settings */
  }
                <button
    id="nav-notif-prefs-btn"
    type="button"
    onClick={() => setIsNotifPrefsOpen(true)}
    className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors hidden sm:block"
    title="Notification Preferences"
  >
                  <Settings className="w-4 h-4" />
                </button>

                {
    /* Help Guide */
  }
                <button
    id="nav-help-guide-btn"
    type="button"
    onClick={() => setIsHelpOpen(true)}
    className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
    title="Operating Guide"
  >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {
    /* User Profile Badge */
  }
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-fuchsia-100 border border-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs shadow-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[140px]">
                      {currentUser.fullName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getRoleIcon()}
                      <span className="text-[10px] text-purple-700 font-medium">
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>

                  {
    /* Sign out */
  }
                  <button
    id="user-sign-out-btn"
    type="button"
    onClick={logout}
    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
    title="Sign Out"
  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </> : <div className="flex items-center gap-2">
                <button
    id="apply-to-join-nav-btn"
    type="button"
    onClick={onOpenApply}
    className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
  >
                  Apply to Join
                </button>
                <button
    id="sign-in-nav-btn"
    type="button"
    onClick={onOpenLogin}
    className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm shadow-purple-500/20 transition-all flex items-center gap-1.5"
  >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sign In
                </button>
              </div>}
          </div>
        </div>
      </div>

      {
    /* Help Modal */
  }
      {currentUser && <ContextualHelpModal
    isOpen={isHelpOpen}
    onClose={() => setIsHelpOpen(false)}
    role={currentUser.role}
  />}

      {
    /* Notification Preferences Modal */
  }
      <NotificationPreferencesModal
    isOpen={isNotifPrefsOpen}
    onClose={() => setIsNotifPrefsOpen(false)}
    initialPreferences={notifPrefs}
    onSave={saveNotificationPreferences}
  />
    </header>;
};
export {
  Navbar
};
