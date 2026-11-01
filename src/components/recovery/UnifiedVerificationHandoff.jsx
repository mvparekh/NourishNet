import { useState, useRef } from "react";
import {
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Copy,
  Check
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const UnifiedVerificationHandoff = ({
  reservation,
  pickup,
  listing,
  onSuccess
}) => {
  const { currentUser, verifyHandoffOtp } = useApp();

  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const inputRefs = useRef([]);

  const isCompleted = pickup?.status === "COMPLETED" || reservation?.status === "COMPLETED";
  const sharedOtp = pickup?.otpCode || reservation?.confirmationCode || "4921";
  const remainingAttempts = Math.max(0, 5 - (pickup?.otpAttemptCount || 0));

  const isDeliveryPartner = currentUser?.role === "VOLUNTEER";
  const isRecipientShelter = currentUser?.role === "NGO";
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const isDonor = currentUser?.role === "DONOR";

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);
    setOtpError(null);
    if (clean && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 4) {
      setOtpError("Please enter the complete 4-digit Handover OTP.");
      return;
    }

    setIsVerifying(true);
    setOtpError(null);
    try {
      const res = await verifyHandoffOtp(pickup.id, fullOtp, "VOLUNTEER_TO_NGO");
      setIsVerifying(false);
      if (res.success) {
        setOtpSuccessMsg("Handover verified successfully! Food recovery marked completed.");
        if (onSuccess) onSuccess();
      } else {
        setOtpError(res.errorMessage || "Incorrect 4-digit verification OTP. Please try again.");
      }
    } catch (err) {
      setIsVerifying(false);
      setOtpError(err.message || "OTP verification failed. Please try again.");
    }
  };

  const handleCopyOtp = () => {
    if (sharedOtp) {
      navigator.clipboard.writeText(sharedOtp);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="card-warm overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2C1810] via-[#3D2319] to-[#2C1810] text-[#FAF7F2] flex flex-wrap items-center justify-between gap-3 border-b border-[#5D4037]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C85A32]/20 border border-[#C85A32]/30 flex items-center justify-center text-[#E07A5F]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>Handover Verification</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C85A32] text-white font-semibold">
                Single OTP Flow
              </span>
            </h3>
            <p className="text-xs text-[#D7CCC8]">
              {isCompleted
                ? "Recovery finalized and logged to audit trail"
                : isDeliveryPartner
                ? "Enter the 4-digit code provided by the recipient shelter"
                : isRecipientShelter
                ? "Provide this 4-digit OTP to the Delivery Partner upon arrival"
                : "Single shared 4-digit verification code between counterparties"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D7CCC8] bg-[#1E110B] border border-[#3D2319] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Order #{reservation?.id?.slice(-6) || pickup?.id?.slice(-6) || "REC"}</span>
          </span>
        </div>
      </div>

      {/* Main Verification Body */}
      <div className="p-5 sm:p-6">
        {isCompleted ? (
          /* Completed State Card */
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-emerald-950">Food Handover Fully Verified</h4>
              <p className="text-sm text-emerald-700 mt-1 max-w-md mx-auto">
                Verified via <strong>Single 4-digit OTP</strong> by{" "}
                <strong>{pickup?.verifiedByName || currentUser?.fullName}</strong>. Ledger finalized and order
                transitioned to <strong>COMPLETED</strong>.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Audit Nonce: {(pickup?.nonce || "VERIFIED").slice(0, 16)}...</span>
            </div>
          </div>
        ) : isDeliveryPartner ? (
          /* --- DELIVERY PARTNER VIEW: Enter Single OTP from Shelter --- */
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20 text-[#C85A32] flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#2C1810]">Enter Shelter Handover OTP</h4>
              <p className="text-xs text-[#5D4037]">
                Ask the staff at <strong>{reservation?.ngoName || "the receiving shelter"}</strong> for their 4-digit code
                to confirm delivery.
              </p>
            </div>

            {/* 4 Digit Boxes */}
            <div className="flex items-center justify-center gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-14 h-16 text-center text-2xl font-black font-mono rounded-xl border-2 border-[#E7DCD5] bg-white text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:border-[#C85A32] shadow-sm transition-all"
                  placeholder="•"
                />
              ))}
            </div>

            {/* Error / Success Alerts */}
            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{otpError}</span>
              </div>
            )}
            {otpSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {/* Verify Action Button */}
            <button
              id="verify-handover-btn"
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otpDigits.join("").length !== 4}
              className="btn-terracotta w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Verify Handover</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-[#8D6E63]">
              {remainingAttempts} verification attempts remaining
            </div>
          </div>
        ) : isRecipientShelter ? (
          /* --- RECIPIENT / SHELTER VIEW: Display Single OTP to share with Delivery Partner --- */
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#FAF7F2] border border-[#E7DCD5] space-y-5">
            <div className="text-center space-y-1.5">
              <span className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
                Handover Verification Code
              </span>
              <h4 className="font-bold text-lg text-[#2C1810]">Your Handover OTP</h4>
              <p className="text-xs text-[#5D4037]">
                Share this 4-digit code with the Delivery Partner (
                <strong>{reservation?.assignedVolunteerName || "assigned courier"}</strong>) upon arrival to verify delivery:
              </p>
            </div>

            {/* Big 4-Digit Display */}
            <div className="flex items-center justify-center py-4 px-6 rounded-2xl bg-white border-2 border-[#C85A32]/40 shadow-inner">
              <span className="tracking-[0.4em] font-mono text-4xl font-black text-[#2C1810] pl-[0.4em]">
                {sharedOtp}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyOtp}
                className="btn-secondary flex-1 py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8D6E63]" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>
              <button
                type="button"
                onClick={() => setManualEntryMode(!manualEntryMode)}
                className="btn-secondary py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{manualEntryMode ? "Hide Entry" : "Verify on This Device"}</span>
              </button>
            </div>

            {manualEntryMode && (
              <div className="pt-4 border-t border-[#E7DCD5] space-y-3">
                <p className="text-xs text-[#5D4037] text-center font-medium">
                  Enter the 4-digit code to finalize handover directly:
                </p>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-xl font-bold font-mono rounded-xl border border-[#E7DCD5] bg-white text-[#2C1810] focus:ring-2 focus:ring-[#C85A32]"
                      placeholder="•"
                    />
                  ))}
                </div>
                {otpError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                    {otpError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpDigits.join("").length !== 4}
                  className="btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  Confirm & Finalize Handover
                </button>
              </div>
            )}
          </div>
        ) : isAdmin ? (
          /* --- ADMIN VIEW: Both reference display and override verification --- */
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-[#5D4037] uppercase tracking-wider">
                Admin Handover Console
              </span>
              <h4 className="font-bold text-base text-[#2C1810]">Assigned Handover OTP: <span className="font-mono text-[#C85A32]">{sharedOtp}</span></h4>
              <p className="text-xs text-[#5D4037]">
                Recipient: <strong>{reservation?.ngoName || "Shelter"}</strong> · Partner: <strong>{reservation?.assignedVolunteerName || "Delivery Partner"}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border border-[#E7DCD5] bg-white text-[#2C1810] focus:ring-2 focus:ring-[#C85A32]"
                  placeholder="•"
                />
              ))}
            </div>

            {otpError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                {otpError}
              </div>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otpDigits.join("").length !== 4}
              className="btn-terracotta w-full py-2.5 text-xs font-semibold"
            >
              Admin Verify Handover
            </button>
          </div>
        ) : (
          /* --- DONOR / OTHER STAKEHOLDER VIEW --- */
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#FAF7F2] border border-[#E7DCD5] text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20 text-[#C85A32] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-[#2C1810]">Handover in Progress</h4>
            <p className="text-xs text-[#5D4037] leading-relaxed">
              Your surplus food is currently with Delivery Partner{" "}
              <strong>{reservation?.assignedVolunteerName || "assigned courier"}</strong> en route to{" "}
              <strong>{reservation?.ngoName || "the shelter"}</strong>. The receiving shelter will verify the handover
              using their 4-digit OTP.
            </p>
            <div className="pt-2 text-[11px] text-[#8D6E63] font-mono">
              Status: {reservation?.status || pickup?.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { UnifiedVerificationHandoff };
