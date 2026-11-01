import { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  UtensilsCrossed,
  Building2,
  Truck,
  HeartHandshake
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";

const NAMED_DEMO_ACCOUNTS = [
  {
    roleLabel: "Administrator",
    roleKey: "ADMIN",
    username: "admin.demo",
    name: "City Operations Admin",
    badgeClass: "bg-[#5D4037]/10 text-[#5D4037] border-[#5D4037]/20",
    destDashboard: "Admin Dashboard",
    icon: Shield
  },
  {
    roleLabel: "Food Donor",
    roleKey: "DONOR",
    username: "donor.demo",
    name: "Kansar Dining Donor",
    badgeClass: "bg-[#C85A32]/10 text-[#C85A32] border-[#C85A32]/20",
    destDashboard: "Donor Dashboard",
    icon: UtensilsCrossed
  },
  {
    roleLabel: "NGO / Shelter",
    roleKey: "NGO",
    username: "shelter.demo",
    name: "Surat Food Relief Shelter",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    destDashboard: "NGO / Shelter Dashboard",
    icon: Building2
  },
  {
    roleLabel: "Delivery Partner",
    roleKey: "VOLUNTEER",
    username: "deliverypartner.demo",
    name: "Rapid Relief Delivery Partner",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    destDashboard: "Delivery Partner Dashboard",
    icon: Truck
  },
  {
    roleLabel: "Recipient",
    roleKey: "NGO",
    username: "recipient.demo",
    name: "Ashram Community Recipient",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    destDashboard: "Recipient Kitchen Dashboard",
    icon: HeartHandshake
  }
];

const LoginModal = ({ isOpen, onClose, onOpenApply, onOpenDemo, prefillEmail, prefillPassword }) => {
  const { login, resetPasswordRequest, setupAccountViaToken, demoMode } = useApp();
  const [activeTab, setActiveTab] = useState("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [setupToken, setSetupToken] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirmPassword, setSetupConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");
  const [quickLoggingInUser, setQuickLoggingInUser] = useState(null);

  // Prefill credentials if passed from DemoDrawer
  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillPassword) setPassword(prefillPassword);
  }, [prefillEmail, prefillPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.errorMessage || "Invalid email or password.");
      setIsLocked(!!res.isLocked);
    }
  };

  const handleQuickLogin = async (acc) => {
    setQuickLoggingInUser(acc.username);
    setErrorMessage("");
    try {
      const res = await login(acc.username, "SuratSecure@2026");
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.errorMessage || "Quick demo authentication failed.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to sign in demo account.");
    } finally {
      setQuickLoggingInUser(null);
    }
  };

  const handlePrefill = (acc) => {
    setEmail(acc.username);
    setPassword("SuratSecure@2026");
    setErrorMessage("");
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (setupPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    const res = await setupAccountViaToken(setupToken.trim(), setupPassword);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage("Account password set up successfully! You are now signed in.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.error || "Setup token is invalid or expired.");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const res = resetPasswordRequest(forgotEmail);
    setForgotSuccessMessage(res.message);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isForgotView ? "Reset Password" : activeTab === "ACTIVATE" ? "Activate Account" : "Sign in to NourishNet"}
      subtitle={isForgotView ? "Enter your registered email to receive reset instructions" : activeTab === "ACTIVATE" ? "Enter your invitation token and create your password" : "Surat Surplus Food Recovery & Redistribution Network"}
      maxWidth="xl"
    >
      {isForgotView ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          {forgotSuccessMessage ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reset Dispatched</p>
                <p className="mt-0.5 text-xs text-emerald-700">{forgotSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotView(false);
                    setForgotSuccessMessage("");
                  }}
                  className="mt-3 text-xs font-semibold text-[#C85A32] underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8D6E63] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. donor01@nourishnet.demo"
                    className="input-warm w-full pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotView(false)}
                  className="text-xs text-[#5D4037] hover:text-[#2C1810] font-medium cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2.5 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#F5EFEB] p-1 border border-[#E7DCD5]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("LOGIN");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "LOGIN"
                  ? "bg-white text-[#2C1810] shadow-xs"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              Registered Account Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("ACTIVATE");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "ACTIVATE"
                  ? "bg-white text-[#2C1810] shadow-xs"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              Token Activation
            </button>
          </div>

          {/* Feedback & Error Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isLocked ? "Account Locked" : "Authentication Failed"}</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {activeTab === "LOGIN" ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8D6E63] absolute left-3.5 top-3" />
                  <input
                    id="login-email-input"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. donor.demo or donor01@nourishnet.demo"
                    className="input-warm w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2C1810]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotView(true)}
                    className="text-[11px] text-[#C85A32] hover:text-[#B34D28] font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8D6E63] absolute left-3.5 top-3" />
                  <input
                    id="login-password-input"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. SuratSecure@2026)"
                    className="input-warm w-full pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#8D6E63] hover:text-[#2C1810] p-0.5 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading || isLocked}
                className="btn-primary w-full py-2.5 px-4 text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 flex items-center justify-between text-xs text-[#5D4037]">
                <span>Need an organization account?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApply();
                  }}
                  className="font-semibold text-[#C85A32] hover:underline cursor-pointer"
                >
                  Apply to Join Network
                </button>
              </div>
            </form>
          ) : (
            /* Account Activation / Set Password Form */
            <form onSubmit={handleSetupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                  Invitation / Activation Token
                </label>
                <input
                  id="setup-token-input"
                  type="text"
                  required
                  value={setupToken}
                  onChange={(e) => setSetupToken(e.target.value)}
                  placeholder="Paste your token (e.g. SETUP_...)"
                  className="input-warm w-full font-mono text-xs"
                />
                <p className="text-[11px] text-[#8D6E63] mt-1">
                  Check your approval notification or admin invitation for your token.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                  Set Your Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8D6E63] absolute left-3.5 top-3" />
                  <input
                    id="setup-password-input"
                    type="password"
                    required
                    minLength={8}
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="input-warm w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8D6E63] absolute left-3.5 top-3" />
                  <input
                    id="setup-confirm-input"
                    type="password"
                    required
                    minLength={8}
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="input-warm w-full pl-10"
                  />
                </div>
              </div>

              <button
                id="setup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn-terracotta w-full py-2.5 px-4 text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Activate Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* CLEAR DEMO ACCOUNTS SECTION */}
          {demoMode && (
            <div className="pt-4 border-t border-[#E7DCD5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C1810]">
                  <Sparkles className="w-4 h-4 text-[#C85A32]" />
                  <span>Named Demo Accounts (1-Click Login)</span>
                </div>
                <div className="text-[11px] text-[#5D4037]">
                  Password: <code className="bg-[#FAF3F0] text-[#C85A32] font-mono font-bold px-1.5 py-0.5 rounded border border-[#C85A32]/20">SuratSecure@2026</code>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="demo-accounts-grid">
                {NAMED_DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isCurrentQuick = quickLoggingInUser === acc.username;
                  return (
                    <div
                      key={acc.username}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD5] hover:border-[#C85A32]/40 transition-all flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white border border-[#E7DCD5] flex items-center justify-center text-[#C85A32] shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeClass}`}>
                                {acc.roleLabel}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#2C1810] font-mono mt-0.5">
                              {acc.username}
                            </p>
                            <p className="text-[10px] text-[#8D6E63] truncate max-w-[170px]">
                              {acc.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-[#E7DCD5]/60">
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(acc)}
                          disabled={isCurrentQuick}
                          className="btn-primary flex-1 py-1 px-2 text-[11px] flex items-center justify-center gap-1 cursor-pointer font-semibold"
                        >
                          {isCurrentQuick ? (
                            <Clock className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          <span>Sign In</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrefill(acc)}
                          className="btn-secondary py-1 px-2 text-[11px] cursor-pointer"
                          title="Pre-fill into form fields"
                        >
                          Fill
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-[#8D6E63]">
                <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E7DCD5] font-bold text-[#2C1810] shadow-2xs">Ctrl</kbd> to toggle full drawer</span>
                {onOpenDemo && (
                  <button
                    type="button"
                    onClick={onOpenDemo}
                    className="font-semibold text-[#C85A32] hover:text-[#B34D28] underline cursor-pointer"
                  >
                    View 25 Accounts Drawer →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export { LoginModal };
