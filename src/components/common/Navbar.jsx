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
  onOpenDemo,
  activeTab = "dashboard",
  setActiveTab
}) => {
  const { currentUser, isAuthenticated, logout, demoMode } = useApp();
  const { notifPrefs, saveNotificationPreferences } = useDashboardConfig(currentUser);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotifPrefsOpen, setIsNotifPrefsOpen] = useState(false);

  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "DONOR":
        return <UtensilsCrossed className="w-3.5 h-3.5 text-[#C85A32]" />;
      case "NGO":
        return <Building2 className="w-3.5 h-3.5 text-[#5D4037]" />;
      case "VOLUNTEER":
        return <Truck className="w-3.5 h-3.5 text-[#8D6E63]" />;
      case "ADMIN":
      case "SUPER_ADMIN":
        return <Shield className="w-3.5 h-3.5 text-[#2C1810]" />;
      default:
        return <UserIcon className="w-3.5 h-3.5 text-[#5D4037]" />;
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

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7DCD5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & City Hub */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab && setActiveTab("dashboard")}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2C1810] via-[#5D4037] to-[#C85A32] flex items-center justify-center shadow-md text-white font-bold text-lg">
                <HeartHandshake className="w-5 h-5 text-[#FAF7F2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-[#2C1810]">
                    Nourish<span className="text-[#C85A32]">Net</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#F5EFEB] text-[#5D4037] border border-[#E7DCD5]">
                    Surat
                  </span>
                </div>
                <p className="text-[11px] text-[#8D6E63] font-medium hidden sm:block">
                  Surplus Food Recovery & Redistribution Network
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Subtle Demo Indicator if active */}
            {demoMode && (
              <button
                type="button"
                onClick={onOpenDemo}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F5EFEB] text-[#C85A32] border border-[#E7DCD5] hover:bg-[#E7DCD5]/70 transition-all cursor-pointer"
                title="Demo Mode active. Press Ctrl on login page or click here to view demo accounts."
              >
                <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
                <span className="hidden sm:inline">Demo Active (Ctrl)</span>
              </button>
            )}

            {isAuthenticated && currentUser ? (
              <>
                {/* Notifications */}
                <NotificationsDropdown />

                {/* Notification Settings */}
                <button
                  id="nav-notif-prefs-btn"
                  type="button"
                  onClick={() => setIsNotifPrefsOpen(true)}
                  className="p-2 text-[#8D6E63] hover:text-[#2C1810] hover:bg-[#F5EFEB] rounded-lg transition-colors hidden sm:block"
                  title="Notification Preferences"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Help Guide */}
                <button
                  id="nav-help-guide-btn"
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="p-2 text-[#8D6E63] hover:text-[#2C1810] hover:bg-[#F5EFEB] rounded-lg transition-colors"
                  title="Operating Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* User Profile Badge */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-[#E7DCD5]">
                  <div className="w-8 h-8 rounded-full bg-[#F5EFEB] border border-[#E7DCD5] flex items-center justify-center text-[#5D4037] font-semibold text-xs shadow-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#2C1810] leading-none truncate max-w-[140px]">
                      {currentUser.fullName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getRoleIcon()}
                      <span className="text-[10px] text-[#C85A32] font-medium">
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>

                  {/* Sign out */}
                  <button
                    id="user-sign-out-btn"
                    type="button"
                    onClick={logout}
                    className="p-1.5 text-[#8D6E63] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="apply-to-join-nav-btn"
                  type="button"
                  onClick={onOpenApply}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Apply to Join
                </button>
                <button
                  id="sign-in-nav-btn"
                  type="button"
                  onClick={onOpenLogin}
                  className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {currentUser && (
        <ContextualHelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          role={currentUser.role}
        />
      )}

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isNotifPrefsOpen}
        onClose={() => setIsNotifPrefsOpen(false)}
        initialPreferences={notifPrefs}
        onSave={saveNotificationPreferences}
      />
    </header>
  );
};

export { Navbar };
