import { useState } from "react";
import {
  Lock,
  Mail,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
const LoginModal = ({ isOpen, onClose, onOpenApply }) => {
  const { login, resetPasswordRequest, setupAccountViaToken, users, demoMode } = useApp();
  const [activeTab, setActiveTab] = useState("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const [selectedDemoRoleTab, setSelectedDemoRoleTab] = useState("DONOR");
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
  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("SuratSecure@2026");
    setErrorMessage("");
  };
  const demoAccountsByRole = (role) => {
    return users.filter((u) => u.role === role);
  };
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isForgotView ? "Reset Password" : activeTab === "ACTIVATE" ? "Activate Account" : "Sign in to NourishNet"}
    subtitle={isForgotView ? "Enter your registered email to receive reset instructions" : activeTab === "ACTIVATE" ? "Enter your invitation token and create your password" : "Surat Surplus Food Recovery Network"}
    maxWidth="lg"
  >
      {isForgotView ? <form onSubmit={handleForgotPassword} className="space-y-4">
          {forgotSuccessMessage ? <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
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
    className="mt-3 text-xs font-semibold text-emerald-900 underline"
  >
                  Return to Sign In
                </button>
              </div>
            </div> : <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
    type="email"
    required
    value={forgotEmail}
    onChange={(e) => setForgotEmail(e.target.value)}
    placeholder="e.g. jignesh@kansarthali.com"
    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
    type="button"
    onClick={() => setIsForgotView(false)}
    className="text-xs text-slate-500 hover:text-slate-900 font-medium"
  >
                  Back to Sign In
                </button>
                <button
    type="submit"
    className="px-5 py-2.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all shadow-sm"
  >
                  Send Reset Link
                </button>
              </div>
            </>}
        </form> : <div className="space-y-4">
          {
    /* Mode Switcher Tabs */
  }
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
    type="button"
    onClick={() => {
      setActiveTab("LOGIN");
      setErrorMessage("");
      setSuccessMessage("");
    }}
    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "LOGIN" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
  >
              Sign In
            </button>
            <button
    type="button"
    onClick={() => {
      setActiveTab("ACTIVATE");
      setErrorMessage("");
      setSuccessMessage("");
    }}
    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "ACTIVATE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
  >
              Activate Account / Set Password
            </button>
          </div>

          {
    /* Feedback Messages */
  }
          {errorMessage && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{isLocked ? "Security Lockout" : "Notice"}:</span>{" "}
                {errorMessage}
              </div>
            </div>}

          {successMessage && <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>}

          {activeTab === "LOGIN" ? (
    /* Sign-in Form */
    <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
      id="login-email-input"
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="name@organization.com"
      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
    />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
      type="button"
      onClick={() => setIsForgotView(true)}
      className="text-[11px] text-purple-700 hover:text-purple-900 font-medium"
    >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
      id="login-password-input"
      type="password"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
    />
                </div>
              </div>

              <button
      id="login-submit-btn"
      type="submit"
      disabled={isLoading || isLocked}
      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
    >
                {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>}
              </button>
            </form>
  ) : (
    /* Account Activation / Set Password Form */
    <form onSubmit={handleSetupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invitation / Activation Token
                </label>
                <input
      id="setup-token-input"
      type="text"
      required
      value={setupToken}
      onChange={(e) => setSetupToken(e.target.value)}
      placeholder="Paste your token (e.g. SETUP_...)"
      className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
    />
                <p className="text-[11px] text-slate-500 mt-1">
                  Check your approval notification or admin invitation for your token.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Set Your Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
      id="setup-password-input"
      type="password"
      required
      minLength={8}
      value={setupPassword}
      onChange={(e) => setSetupPassword(e.target.value)}
      placeholder="Create a secure password"
      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
      id="setup-confirm-input"
      type="password"
      required
      minLength={8}
      value={setupConfirmPassword}
      onChange={(e) => setSetupConfirmPassword(e.target.value)}
      placeholder="Re-enter your password"
      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
    />
                </div>
              </div>

              <button
      id="setup-submit-btn"
      type="submit"
      disabled={isLoading}
      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
    >
                {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <>
                    <span>Activate Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>}
              </button>
            </form>
  )}

          {
    /* Demo Mode Quick Accounts Picker (Hidden when Demo Mode is OFF) */
  }
          {demoMode && <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sample Presentation Accounts (Surat)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Demo Mode</span>
              </div>

              {
    /* Role Tabs */
  }
              <div className="flex rounded-lg bg-slate-100 p-1 mb-2.5 gap-1">
                {["DONOR", "NGO", "VOLUNTEER", "ADMIN", "SUPER_ADMIN"].map((role) => <button
    key={role}
    type="button"
    onClick={() => setSelectedDemoRoleTab(role)}
    className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${selectedDemoRoleTab === role ? "bg-white text-purple-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
  >
                    {role === "SUPER_ADMIN" ? "Super" : role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>)}
              </div>

              {
    /* 5 Accounts List per role */
  }
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {demoAccountsByRole(selectedDemoRoleTab).map((u) => <button
    key={u.id}
    type="button"
    onClick={() => fillDemoAccount(u.email)}
    className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 flex items-center justify-between text-xs transition-colors"
  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-slate-900 truncate">{u.fullName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email} · {u.locality}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded shrink-0">
                      Use
                    </span>
                  </button>)}
              </div>
            </div>}

          {
    /* Footer Call to Action */
  }
          <div className="pt-3 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Not registered with NourishNet yet?{" "}
              <button
    type="button"
    onClick={() => {
      onClose();
      onOpenApply();
    }}
    className="text-purple-700 font-semibold hover:underline"
  >
                Apply to Join
              </button>
            </p>
          </div>
        </div>}
    </Modal>;
};
export {
  LoginModal
};
