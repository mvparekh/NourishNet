import { useState } from "react";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Check
} from "lucide-react";
import { useApp } from "../../context/AppContext";
const DemoBar = () => {
  const { demoMode, currentUser, users, switchUser, resetToDefaultData } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || "DONOR");
  const [resetConfirming, setResetConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(null);
  if (!demoMode) return null;
  const roleAccounts = users.filter((u) => u.role === selectedRole && (u.id?.startsWith('u-demo-') || !u.id?.startsWith('u-demo-'))).slice(0, 5);
  const handleResetClick = () => {
    if (!resetConfirming) {
      setResetConfirming(true);
      setTimeout(() => setResetConfirming(false), 4e3);
      return;
    }
    resetToDefaultData();
    setResetConfirming(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };
  const handleCopyCredentials = (email) => {
    navigator.clipboard?.writeText(email);
    setCopiedNotification(`Copied ${email} (Password: SuratSecure@2026)`);
    setTimeout(() => setCopiedNotification(null), 3500);
  };
  return <aside aria-label="Demo Presentation Controls" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
      <div className="bg-[#2C1810] text-[#FAF7F2] rounded-2xl border border-[#5D4037] shadow-2xl backdrop-blur-md pointer-events-auto overflow-hidden transition-all duration-200">
        {/* Collapsed Pill View */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-white">
              Demo Environment (25 Accounts)
            </span>
            <span className="text-[10px] text-[#D7CCC8] font-mono hidden sm:inline">
              (Current: {currentUser ? `${currentUser.fullName.split("\xB7")[0]} [${currentUser.role}]` : "Guest"})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetClick}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 border ${resetConfirming ? "bg-rose-900/80 text-rose-200 border-rose-600 animate-pulse" : "text-[#D7CCC8] hover:text-white bg-[#5D4037] hover:bg-[#795548] border-[#795548]"}`}
              title="Reset all demo accounts and records"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{resetDone ? "Restored!" : resetConfirming ? "Click to Confirm" : "Reset Demo Data"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-white bg-[#C85A32] hover:bg-[#B34D28] rounded-lg transition-colors flex items-center gap-1 text-[11px] px-2.5 font-medium shadow-xs"
            >
              <span>{isExpanded ? "Hide" : "Switch Demo User"}</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Temporary Notification Banner */}
        {copiedNotification && <div className="bg-[#3D2319] border-t border-[#5D4037] px-4 py-1.5 flex items-center justify-between text-xs text-[#FAF7F2]">
            <span className="font-mono text-[11px] truncate">{copiedNotification}</span>
            <button
              type="button"
              onClick={() => setCopiedNotification(null)}
              className="text-[#D7CCC8] hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>}

        {/* Expanded Accounts Drawer */}
        {isExpanded && <div className="p-4 border-t border-[#3D2319] bg-[#1E110B] space-y-3 animate-in fade-in duration-150">
            {/* Role Switcher tabs */}
            <div className="flex rounded-xl bg-[#2C1810] p-1 border border-[#3D2319] gap-1">
              {["DONOR", "NGO", "VOLUNTEER", "ADMIN", "SUPER_ADMIN"].map((role) => <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${selectedRole === role ? "bg-[#C85A32] text-white shadow-xs" : "text-[#D7CCC8] hover:text-white"}`}
              >
                  {role === "SUPER_ADMIN" ? "Super Admin" : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>)}
            </div>

            {/* Accounts for Selected Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {roleAccounts.map((u) => {
                const isActive = currentUser?.id === u.id;
                return <div
                  key={u.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${isActive ? "bg-[#5D4037] border-[#C85A32] text-white ring-1 ring-[#C85A32]" : "bg-[#2C1810] border-[#3D2319] text-[#FAF7F2] hover:border-[#5D4037] hover:bg-[#3D2319]"}`}
                >
                    <button
                      type="button"
                      onClick={() => {
                        switchUser(u.id);
                        setIsExpanded(false);
                      }}
                      className="truncate pr-2 text-left flex-1"
                      title="Switch to this account"
                    >
                      <p className="text-xs font-semibold truncate text-white">{u.fullName}</p>
                      <p className="text-[10px] text-[#D7CCC8] truncate">
                        {u.email} · {u.locality}
                      </p>
                    </button>
                    {isActive ? <Check className="w-4 h-4 text-[#C85A32] shrink-0" /> : <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCredentials(u.email);
                      }}
                      className="text-[10px] font-mono text-[#FAF7F2] shrink-0 bg-[#5D4037] hover:bg-[#795548] px-2 py-0.5 rounded border border-[#795548] transition-colors"
                      title="Copy email to clipboard"
                    >
                        Copy
                      </button>}
                  </div>;
              })}
            </div>
          </div>}
      </div>
    </aside>;
};
export {
  DemoBar
};
