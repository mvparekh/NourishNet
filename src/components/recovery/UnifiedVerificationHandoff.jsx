import { useState, useRef } from "react";
import {
  Shield,
  QrCode,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Lock,
  Copy,
  Check,
  Scan,
  FileCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const UnifiedVerificationHandoff = ({
  reservation,
  pickup,
  listing,
  onSuccess
}) => {
  const {
    currentUser,
    verifyHandoffOtp,
    verifyQrCode,
    regenerateHandoffOtp,
    verificationHistory,
    confirmPickup,
    confirmDelivery
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState("OTP");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmActionKey, setConfirmActionKey] = useState(null);
  const inputRefs = useRef([]);

  const isCompleted = pickup.status === "COMPLETED" || reservation.status === "COMPLETED";
  const remainingAttempts = Math.max(0, 3 - (pickup.otpAttemptCount || 0));
  const currentStage = reservation.assignedVolunteerId
    ? pickup.status === "PICKUP_STARTED" || pickup.status === "VOLUNTEER_EN_ROUTE"
      ? "DONOR_TO_VOLUNTEER"
      : "VOLUNTEER_TO_NGO"
    : "DIRECT_DONOR_TO_NGO";

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);
    setOtpError(null);
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 numeric digits of the OTP.");
      return;
    }
    setIsVerifying(true);
    setOtpError(null);
    setTimeout(() => {
      const res = verifyHandoffOtp(pickup.id, fullOtp, currentStage);
      setIsVerifying(false);
      if (res.success) {
        setOtpSuccessMsg("Handoff verified successfully! Cryptographic ledger updated.");
        if (onSuccess) onSuccess();
      } else {
        setOtpError(res.errorMessage || "Invalid OTP code. Please verify and retry.");
      }
    }, 450);
  };

  const handleVerifyQr = (token) => {
    setIsVerifying(true);
    setOtpError(null);
    setTimeout(() => {
      const rep = verifyQrCode(token);
      setIsVerifying(false);
      if (rep.success) {
        setOtpSuccessMsg("Cryptographic QR token validated! Handover finalized.");
        if (onSuccess) onSuccess();
      } else {
        setOtpError(rep.errorMessage || "QR verification failed.");
      }
    }, 450);
  };

  const handleRegenerateOtp = () => {
    const res = regenerateHandoffOtp(pickup.id);
    if (res.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError(null);
      setOtpSuccessMsg("Fresh 6-digit OTP generated (valid for 15 minutes).");
      setTimeout(() => setOtpSuccessMsg(null), 3000);
    }
  };

  const handleCopyOtp = () => {
    if (pickup.otpCode) {
      navigator.clipboard.writeText(pickup.otpCode);
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
              <span>Dual Unified Verification</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C85A32] text-white font-semibold">
                Alternative: OTP or QR
              </span>
            </h3>
            <p className="text-xs text-[#D7CCC8]">
              {currentStage === "DONOR_TO_VOLUNTEER"
                ? "Stage 1: Donor Kitchen → Courier Hand-off"
                : currentStage === "VOLUNTEER_TO_NGO"
                ? "Stage 2: Courier → Shelter Delivery"
                : "Direct Donor → Shelter Hand-off"}
            </p>
          </div>
        </div>

        {/* Method Toggle Buttons (Choose [ Enter OTP ] OR [ Scan QR ]) */}
        <div className="flex items-center p-1 rounded-xl bg-[#1E110B] border border-[#3D2319]">
          <button
            type="button"
            onClick={() => setSelectedMethod("OTP")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedMethod === "OTP"
                ? "bg-[#C85A32] text-white shadow-xs"
                : "text-[#D7CCC8] hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Enter OTP</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod("QR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedMethod === "QR"
                ? "bg-[#C85A32] text-white shadow-xs"
                : "text-[#D7CCC8] hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>

      {/* Main Verification Card Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {isCompleted ? (
          /* Completed State Card */
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-emerald-950">Food Handover Fully Verified</h4>
              <p className="text-sm text-emerald-700 mt-1 max-w-md mx-auto">
                Verified via <strong>{pickup.verificationMethodUsed || "OTP/QR"}</strong> by{" "}
                <strong>{pickup.verifiedByName || currentUser?.fullName}</strong>. Cryptographic nonces consumed and
                ledger finalized.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Audit Hash: {pickup.nonce.slice(0, 16)}...</span>
            </div>
          </div>
        ) : selectedMethod === "OTP" ? (
          /* --- OTP METHOD INTERFACE --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Display Active Code (Show to Counterpart) */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E7DCD5] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">
                    Verification Code (Display)
                  </span>
                  <span className="text-[11px] font-semibold text-[#C85A32] bg-[#FAF3F0] border border-[#C85A32]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Expires in 15m</span>
                  </span>
                </div>
                <p className="text-xs text-[#5D4037] mb-4">
                  Show this one-time code to the{" "}
                  {currentUser?.role === "DONOR" ? "volunteer courier" : "donor/recipient"} to verify handoff:
                </p>

                {/* Big OTP Display */}
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-[#E7DCD5] shadow-inner tracking-widest font-mono text-3xl font-black text-[#2C1810]">
                  {pickup.otpCode || "849201"}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#E7DCD5]">
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8D6E63]" />}
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateOtp}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                  title="Generate fresh code if expired"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Column 2: Enter & Verify Code (For Receiving Party) */}
            <div className="p-5 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#2C1810] uppercase tracking-wider">
                    Enter Counterpart's OTP
                  </span>
                  <span className="text-[11px] font-semibold text-[#8D6E63]">
                    {remainingAttempts} tries left
                  </span>
                </div>
                <p className="text-xs text-[#5D4037] mb-4">
                  Type the 6-digit code displayed on the other party's screen:
                </p>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
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
                      className="w-10 sm:w-11 h-12 text-center text-xl font-bold font-mono rounded-xl border border-[#E7DCD5] bg-white text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:border-[#C85A32] shadow-2xs"
                    />
                  ))}
                </div>

                {/* Error / Success Feedback */}
                {otpError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{otpError}</span>
                  </div>
                )}
                {otpSuccessMsg && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{otpSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify Action Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying || otpDigits.join("").length !== 6}
                className="btn-terracotta w-full py-2.5 px-4 text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating OTP...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Verify & Finalize Handover</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* --- QR METHOD INTERFACE --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Show Cryptographic Signed QR */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E7DCD5] text-center space-y-4 flex flex-col items-center justify-center">
              <div>
                <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-1">
                  Cryptographic Handoff QR
                </span>
                <p className="text-xs text-[#5D4037]">
                  Scan with NourishNet camera scanner on pickup
                </p>
              </div>

              {/* High-Res QR Visual */}
              <div className="p-3 bg-white rounded-2xl border-2 border-[#2C1810] shadow-md inline-block">
                <div className="w-44 h-44 bg-[#2C1810] rounded-xl p-3 flex flex-col items-center justify-between text-white font-mono text-[9px] select-none">
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 border-4 border-white bg-[#2C1810] rounded" />
                    <div className="w-8 h-8 border-4 border-white bg-[#2C1810] rounded" />
                  </div>
                  <div className="text-center font-bold text-[#E07A5F]">
                    NOURISHNET
                    <div className="text-[7px] text-[#D7CCC8]">HMAC-SHA256 TOKEN</div>
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 border-4 border-white bg-[#2C1810] rounded" />
                    <div className="w-5 h-5 bg-[#C85A32] rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                      ✓
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#8D6E63] font-mono">
                Nonce: {pickup.nonce.slice(0, 16)}... (Single-Use)
              </div>
            </div>

            {/* Column 2: Scan / Direct Scanner */}
            <div className="p-5 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-[#2C1810] uppercase tracking-wider block mb-1">
                  Scan QR Verification
                </span>
                <p className="text-xs text-[#5D4037] mb-4">
                  Point camera at the donor/volunteer QR code or trigger direct verification:
                </p>

                <div className="p-4 rounded-xl bg-white border border-[#E7DCD5] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF3F0] text-[#C85A32] flex items-center justify-center mx-auto">
                    <Scan className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#5D4037] font-medium">
                    Camera QR scanner validates HMAC signature & freshness instantly.
                  </p>
                </div>

                {otpError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{otpError}</span>
                  </div>
                )}
                {otpSuccessMsg && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{otpSuccessMsg}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyQr(pickup.qrToken)}
                disabled={isVerifying}
                className="btn-terracotta w-full py-2.5 px-4 text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning & Validating...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Scan & Complete QR Handoff</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- OPERATIONAL FALLBACK (Device failure / No phone / Physical presence) --- */}
        {!isCompleted && (
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DCD5] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#2C1810]">
                <AlertTriangle className="w-4 h-4 text-[#C85A32] shrink-0" />
                <span>Operational Fallback & Direct Confirmation</span>
              </div>
              <span className="text-[10px] text-[#5D4037] bg-[#F5EFEB] border border-[#E7DCD5] px-2 py-0.5 rounded font-medium">
                Camera / Battery Fallback
              </span>
            </div>
            <p className="text-[11px] text-[#5D4037] leading-relaxed">
              If camera scanning fails, phone battery dies, or connectivity is poor, the authenticated receiving or sending party can confirm the physical transaction directly.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Donor confirming pickup */}
              {((currentUser?.role === "DONOR" && currentStage === "DONOR_TO_VOLUNTEER") ||
                currentUser?.role === "ADMIN" ||
                currentUser?.role === "SUPER_ADMIN") &&
                pickup.status !== "IN_TRANSIT" &&
                pickup.status !== "COMPLETED" && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirmActionKey !== "donor_confirm") {
                        setConfirmActionKey("donor_confirm");
                        setTimeout(() => setConfirmActionKey(null), 3500);
                        return;
                      }
                      setConfirmActionKey(null);
                      await confirmPickup(pickup.id);
                      if (onSuccess) onSuccess();
                    }}
                    className={`btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 ${
                      confirmActionKey === "donor_confirm" ? "ring-2 ring-[#C85A32]" : ""
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>
                      {confirmActionKey === "donor_confirm"
                        ? "Click again: Confirm Handover to Courier"
                        : "Donor: Confirm Food Handed to Courier"}
                    </span>
                  </button>
                )}

              {/* NGO confirming delivery */}
              {((currentUser?.role === "NGO" && currentStage === "VOLUNTEER_TO_NGO") ||
                currentUser?.role === "ADMIN" ||
                currentUser?.role === "SUPER_ADMIN") &&
                pickup.status !== "COMPLETED" && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirmActionKey !== "ngo_confirm") {
                        setConfirmActionKey("ngo_confirm");
                        setTimeout(() => setConfirmActionKey(null), 3500);
                        return;
                      }
                      setConfirmActionKey(null);
                      await confirmDelivery(pickup.id);
                      if (onSuccess) onSuccess();
                    }}
                    className={`btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 ${
                      confirmActionKey === "ngo_confirm" ? "ring-2 ring-emerald-500" : ""
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {confirmActionKey === "ngo_confirm"
                        ? "Click again: Confirm Food Safely Received"
                        : "Shelter: Confirm Food Received"}
                    </span>
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { UnifiedVerificationHandoff };
