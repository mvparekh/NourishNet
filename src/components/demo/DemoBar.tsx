import React, { useState } from 'react';
import {
  Users,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Shield,
  UtensilsCrossed,
  Building2,
  Truck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const DemoBar: React.FC = () => {
  const { demoMode, currentUser, users, switchUser, resetToDefaultData } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || 'DONOR');
  const [resetConfirming, setResetConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!demoMode) return null;

  const roleAccounts = users.filter((u) => u.role === selectedRole);

  const handleResetClick = () => {
    if (!resetConfirming) {
      setResetConfirming(true);
      setTimeout(() => setResetConfirming(false), 4000);
      return;
    }
    resetToDefaultData();
    setResetConfirming(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const handleCopyCredentials = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedNotification(`Copied ${email} (Password: SuratSecure@2026)`);
    setTimeout(() => setCopiedNotification(null), 3500);
  };

  return (
    <aside aria-label="Demo Presentation Controls" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
      <div className="bg-slate-900/95 text-white rounded-2xl border border-purple-500/30 shadow-2xl backdrop-blur-md pointer-events-auto overflow-hidden transition-all duration-200">
        {/* Collapsed Pill View */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-purple-300">
              Demo Switcher
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              (Current: {currentUser ? `${currentUser.fullName.split('·')[0]} [${currentUser.role}]` : 'Guest'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetClick}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 border ${
                resetConfirming
                  ? 'bg-rose-900/80 text-rose-200 border-rose-600 animate-pulse'
                  : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
              title="Reset to default Surat listings & accounts"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{resetDone ? 'Reset!' : resetConfirming ? 'Click to Confirm' : 'Reset Data'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-300 hover:text-white bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] px-2 font-medium"
            >
              <span>{isExpanded ? 'Hide' : 'Switch Account'}</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Temporary Notification Banner */}
        {copiedNotification && (
          <div className="bg-purple-950/90 border-t border-purple-500/40 px-4 py-1.5 flex items-center justify-between text-xs text-purple-200">
            <span className="font-mono text-[11px] truncate">{copiedNotification}</span>
            <button
              type="button"
              onClick={() => setCopiedNotification(null)}
              className="text-slate-400 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Expanded Accounts Drawer */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3 animate-in fade-in duration-150">
            {/* Role Switcher tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 gap-1">
              {(['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    selectedRole === role
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role === 'SUPER_ADMIN' ? 'Super Admin' : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Accounts for Selected Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {roleAccounts.map((u) => {
                const isActive = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-purple-900/40 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
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
                      <p className="text-xs font-semibold truncate">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {u.email} · {u.locality}
                      </p>
                    </button>
                    {isActive ? (
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCredentials(u.email);
                        }}
                        className="text-[10px] font-mono text-purple-300 shrink-0 bg-purple-900/50 hover:bg-purple-800/80 px-2 py-0.5 rounded border border-purple-700/50 transition-colors"
                        title="Copy email to clipboard"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
