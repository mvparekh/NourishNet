import React, { useState } from 'react';
import {
  Users,
  KeyRound,
  RotateCcw,
  X,
  Sparkles,
  Check,
  Shield,
  Truck,
  Building2,
  UtensilsCrossed,
  Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';

export const DemoDrawer = ({ isOpen, onClose, onSelectCredentials }) => {
  const { users, login, resetToDefaultData, demoMode } = useApp();
  const [selectedRole, setSelectedRole] = useState('DONOR');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activeLoggingInId, setActiveLoggingInId] = useState(null);

  if (!demoMode || !isOpen) return null;

  // Filter 25 demo accounts (5 per role)
  const demoUsers = users.filter(u => u.id && u.id.startsWith('u-demo-'));
  const accountsForRole = demoUsers.filter(u => u.role === selectedRole);

  const roleMeta = {
    DONOR: {
      label: 'Donors',
      icon: UtensilsCrossed,
      color: 'text-[#C85A32]',
      bg: 'bg-[#C85A32]/10',
      description: 'Restaurants, banquets, bakeries listing surplus'
    },
    NGO: {
      label: 'NGOs & Kitchens',
      icon: Building2,
      color: 'text-[#795548]',
      bg: 'bg-[#795548]/10',
      description: 'Community kitchens, shelters reserving meals'
    },
    VOLUNTEER: {
      label: 'Couriers',
      icon: Truck,
      color: 'text-[#8D6E63]',
      bg: 'bg-[#8D6E63]/10',
      description: 'Field volunteers handling transit & verification'
    },
    ADMIN: {
      label: 'City Admins',
      icon: Shield,
      color: 'text-[#5D4037]',
      bg: 'bg-[#5D4037]/10',
      description: 'Surat hub operators, verifying orgs & moderating'
    },
    SUPER_ADMIN: {
      label: 'Super Admins',
      icon: Crown,
      color: 'text-[#2C1810]',
      bg: 'bg-[#2C1810]/10',
      description: 'Platform governors & council authority'
    }
  };

  const handleQuickLogin = async (user) => {
    setActiveLoggingInId(user.id);
    try {
      const res = await login(user.email, 'SuratSecure@2026');
      if (res.success) {
        onClose();
      }
    } catch (e) {
      console.error('Quick demo login error', e);
    } finally {
      setActiveLoggingInId(null);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await ApiService.resetDemo().catch(() => null);
      if (resetToDefaultData) {
        resetToDefaultData();
      }
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to reset demo data', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#FAF7F2] h-full shadow-2xl flex flex-col border-l border-[#E7DCD5] animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Demo Mode Accounts Drawer"
      >
        {/* Drawer Header */}
        <div className="bg-[#2C1810] text-[#FAF7F2] p-5 flex items-center justify-between border-b border-[#3D2319]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                NourishNet Demo Environment
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#C85A32] text-white">
                  25 Accounts
                </span>
              </h2>
              <p className="text-xs text-[#D7CCC8]">
                Surat Food Recovery & Redistribution Network · Press Ctrl to close
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#D7CCC8] hover:text-white hover:bg-white/10 transition-colors"
            title="Close Demo Drawer (Ctrl)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Reset & Info */}
        <div className="bg-[#F5EFEB] px-5 py-3 border-b border-[#E7DCD5] flex items-center justify-between">
          <div className="text-xs text-[#5D4037]">
            Universal Demo Password: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#C85A32] border border-[#E7DCD5]">SuratSecure@2026</code>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Restore all 25 accounts, listings, and pickups to initial demo state"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#C85A32]' : ''}`} />
            <span>{resetSuccess ? 'Restored!' : isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>

        {/* Role Tabs */}
        <div className="px-5 pt-4 pb-2 bg-[#FAF7F2]">
          <div className="grid grid-cols-5 gap-1.5 bg-[#E7DCD5]/60 p-1 rounded-xl">
            {['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN', 'SUPER_ADMIN'].map(role => {
              const meta = roleMeta[role];
              const Icon = meta.icon;
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-[#2C1810] shadow-sm ring-1 ring-[#C85A32]'
                      : 'text-[#5D4037] hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-0.5 ${isSelected ? meta.color : 'text-[#8D6E63]'}`} />
                  <span className="text-[11px] truncate">{meta.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#8D6E63] mt-2 px-1">
            {roleMeta[selectedRole].description}
          </p>
        </div>

        {/* Accounts List (5 accounts for the role) */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {accountsForRole.map(user => {
            const isLoggingIn = activeLoggingInId === user.id;
            return (
              <div
                key={user.id}
                className="card-warm p-4 hover:border-[#C85A32]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#2C1810] truncate">
                      {user.fullName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EFEB] text-[#5D4037] border border-[#E7DCD5]">
                      {user.locality}
                    </span>
                  </div>
                  <p className="text-xs text-[#5D4037] font-mono truncate">
                    {user.email}
                  </p>
                  <p className="text-[11px] text-[#8D6E63] truncate">
                    {user.orgName || user.orgType || 'Surat Food Recovery'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  {onSelectCredentials && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCredentials(user.email, 'SuratSecure@2026');
                        onClose();
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#5D4037] bg-[#F5EFEB] hover:bg-[#E7DCD5] rounded-lg border border-[#E7DCD5] transition-colors"
                      title="Fill email and password into login inputs"
                    >
                      Fill Form
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    disabled={isLoggingIn}
                    className="btn-terracotta text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm"
                    title="Authenticate instantly with this demo user"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isLoggingIn ? 'Logging In...' : '1-Click Login'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {accountsForRole.length === 0 && (
            <div className="text-center py-8 text-[#8D6E63] text-xs">
              No accounts loaded for {selectedRole}. Click "Reset Demo Data" above.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#F5EFEB] border-t border-[#E7DCD5] text-center text-xs text-[#5D4037]">
          <span>Tip: You can press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#E7DCD5] rounded shadow-xs font-bold text-[#2C1810]">Ctrl</kbd> anywhere on the login/landing screen to toggle this drawer.</span>
        </div>
      </div>
    </div>
  );
};
