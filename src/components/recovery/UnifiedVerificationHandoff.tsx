import React, { useState, useEffect, useRef } from 'react';
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
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reservation, Pickup, FoodListing, UserRole, VerificationStage, VerificationMethod } from '../../types';
import { UnifiedVerificationResult } from '../../services/security';

interface UnifiedVerificationHandoffProps {
  reservation: Reservation;
  pickup: Pickup;
  listing: FoodListing;
  onSuccess?: () => void;
}

export const UnifiedVerificationHandoff: React.FC<UnifiedVerificationHandoffProps> = ({
  reservation,
  pickup,
  listing,
  onSuccess,
}) => {
  const {
    currentUser,
    verifyHandoffOtp,
    verifyQrCode,
    regenerateHandoffOtp,
    verificationHistory,
    confirmPickup,
    confirmDelivery,
  } = useApp();

  // Mode selection: OTP or QR
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('OTP');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<UnifiedVerificationResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [qrTokenInput, setQrTokenInput] = useState<string>('');
  const [qrScanMode, setQrScanMode] = useState<boolean>(false);
  const [confirmActionKey, setConfirmActionKey] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isCompleted = pickup.status === 'COMPLETED' || reservation.status === 'COMPLETED';
  const remainingAttempts = Math.max(0, 3 - (pickup.otpAttemptCount || 0));

  // Determine verification stage
  const currentStage: VerificationStage = reservation.assignedVolunteerId
    ? pickup.status === 'PICKUP_STARTED' || pickup.status === 'VOLUNTEER_EN_ROUTE'
      ? 'DONOR_TO_VOLUNTEER'
      : 'VOLUNTEER_TO_NGO'
    : 'DIRECT_DONOR_TO_NGO';

  // Handle OTP digit changes
  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-advance to next input
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter all 6 numeric digits of the OTP.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    setTimeout(() => {
      const res = verifyHandoffOtp(pickup.id, fullOtp, currentStage);
      setVerificationResult(res);
      setIsVerifying(false);

      if (res.success) {
        setOtpSuccessMsg('Handoff verified successfully! Cryptographic ledger updated.');
        if (onSuccess) onSuccess();
      } else {
        setOtpError(res.errorMessage || 'Invalid OTP code. Please verify and retry.');
      }
    }, 450);
  };

  // Submit QR Verification (simulated or manual token parse)
  const handleVerifyQr = (token: string) => {
    setIsVerifying(true);
    setOtpError(null);

    setTimeout(() => {
      const rep = verifyQrCode(token);
      setIsVerifying(false);

      if (rep.success) {
        setOtpSuccessMsg('Cryptographic QR token validated! Handover finalized.');
        if (onSuccess) onSuccess();
      } else {
        setOtpError(rep.errorMessage || 'QR verification failed.');
      }
    }, 450);
  };

  // Regenerate OTP
  const handleRegenerateOtp = () => {
    const res = regenerateHandoffOtp(pickup.id);
    if (res.success) {
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);
      setOtpSuccessMsg('Fresh 6-digit OTP generated (valid for 15 minutes).');
      setTimeout(() => setOtpSuccessMsg(null), 3000);
    }
  };

  // Copy active OTP to clipboard
  const handleCopyOtp = () => {
    if (pickup.otpCode) {
      navigator.clipboard.writeText(pickup.otpCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Relevant verification history for this reservation
  const relevantHistory = verificationHistory.filter(
    (h) => h.reservationId === reservation.id || h.pickupId === pickup.id
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-1.5">
              <span>Dual Unified Verification</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Single-Engine Security
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              {currentStage === 'DONOR_TO_VOLUNTEER'
                ? 'Stage 1: Donor Kitchen → Volunteer Hand-off'
                : currentStage === 'VOLUNTEER_TO_NGO'
                ? 'Stage 2: Volunteer Courier → NGO Shelter Delivery'
                : 'Direct Donor → NGO Hand-off'}
            </p>
          </div>
        </div>

        {/* Method Toggle Buttons (OTP vs QR) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700">
          <button
            type="button"
            onClick={() => setSelectedMethod('OTP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedMethod === 'OTP'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>6-Digit OTP</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('QR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedMethod === 'QR'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
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
          // Completed State Card
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-emerald-950">Food Handover Fully Verified</h4>
              <p className="text-sm text-emerald-700 mt-1 max-w-md mx-auto">
                Verified via <strong>{pickup.verificationMethodUsed || 'OTP/QR'}</strong> by{' '}
                <strong>{pickup.verifiedByName || currentUser?.fullName}</strong>. Cryptographic nonces consumed and
                food ledger finalized.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Audit Hash: {pickup.nonce.slice(0, 16)}...</span>
            </div>
          </div>
        ) : selectedMethod === 'OTP' ? (
          // --- OTP METHOD INTERFACE ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Display Active Code (Show to Counterpart) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Verification Code (Display)
                  </span>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Expires in 15m</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Show this one-time code to the {currentUser?.role === 'DONOR' ? 'volunteer courier' : 'donor/recipient'} to complete verification:
                </p>

                {/* Big OTP Display */}
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-slate-300 shadow-inner tracking-widest font-mono text-3xl font-black text-slate-900">
                  {pickup.otpCode || '849201'}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateOtp}
                  className="py-2 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 flex items-center justify-center gap-1.5 transition-colors"
                  title="Generate fresh code if expired or compromised"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Column 2: Enter & Verify Code (For Receiving Party) */}
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Enter Counterpart's OTP
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {remainingAttempts} tries left
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Type the 6-digit code displayed on the other party's phone:
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
                      className="w-10 sm:w-11 h-12 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                disabled={isVerifying || otpDigits.join('').length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating Authenticity...</span>
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
          // --- QR METHOD INTERFACE ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Show Cryptographic Signed QR */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 flex flex-col items-center justify-center">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Cryptographic Handoff QR
                </span>
                <p className="text-xs text-slate-600">
                  Scan with NourishNet camera scanner on pickup
                </p>
              </div>

              {/* Simulated High-Res QR Visual */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md inline-block">
                <div className="w-44 h-44 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-between text-white font-mono text-[9px] select-none">
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 border-4 border-white bg-slate-900 rounded" />
                    <div className="w-8 h-8 border-4 border-white bg-slate-900 rounded" />
                  </div>
                  <div className="text-center font-bold text-purple-300">
                    NOURISHNET
                    <div className="text-[7px] text-slate-400">HMAC-SHA256 TOKEN</div>
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 border-4 border-white bg-slate-900 rounded" />
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-slate-950 text-[8px] font-bold">
                      ✓
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Nonce: {pickup.nonce.slice(0, 16)}... (Single-Use)
              </div>
            </div>

            {/* Column 2: Scan / Test Scanner */}
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-1">
                  Scan QR Verification
                </span>
                <p className="text-xs text-slate-600 mb-4">
                  Point camera at the donor/volunteer QR code or trigger direct verification:
                </p>

                <div className="p-4 rounded-xl bg-white border border-purple-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                    <Scan className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
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
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
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
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Operational Fallback & Direct Confirmation</span>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                Camera / Battery / Connectivity Fallback
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              If camera scanning fails, phone battery dies, or connectivity is poor, the authenticated receiving or sending party can confirm the physical transaction directly without repeating authentication.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Donor confirming pickup */}
              {((currentUser?.role === 'DONOR' && currentStage === 'DONOR_TO_VOLUNTEER') ||
                currentUser?.role === 'ADMIN' ||
                currentUser?.role === 'SUPER_ADMIN') &&
                pickup.status !== 'IN_TRANSIT' &&
                pickup.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirmActionKey !== 'donor_confirm') {
                        setConfirmActionKey('donor_confirm');
                        setTimeout(() => setConfirmActionKey(null), 3500);
                        return;
                      }
                      setConfirmActionKey(null);
                      await confirmPickup(pickup.id);
                      if (onSuccess) onSuccess();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                      confirmActionKey === 'donor_confirm'
                        ? 'bg-amber-700 ring-2 ring-amber-400'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {confirmActionKey === 'donor_confirm'
                        ? 'Click again: Confirm Handover to Courier'
                        : 'Donor: Confirm Food Handed to Courier'}
                    </span>
                  </button>
                )}

              {/* NGO confirming delivery */}
              {((currentUser?.role === 'NGO' && currentStage === 'VOLUNTEER_TO_NGO') ||
                currentUser?.role === 'ADMIN' ||
                currentUser?.role === 'SUPER_ADMIN') &&
                pickup.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirmActionKey !== 'ngo_confirm') {
                        setConfirmActionKey('ngo_confirm');
                        setTimeout(() => setConfirmActionKey(null), 3500);
                        return;
                      }
                      setConfirmActionKey(null);
                      await confirmDelivery(pickup.id);
                      if (onSuccess) onSuccess();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                      confirmActionKey === 'ngo_confirm'
                        ? 'bg-emerald-700 ring-2 ring-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {confirmActionKey === 'ngo_confirm'
                        ? 'Click again: Confirm Food Safely Received'
                        : 'Shelter: Confirm Food Received'}
                    </span>
                  </button>
                )}

              {/* Courier physical confirmation */}
              {currentUser?.role === 'VOLUNTEER' &&
                pickup.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const actionKey = currentStage === 'DONOR_TO_VOLUNTEER' ? 'courier_collect' : 'courier_deliver';
                      if (confirmActionKey !== actionKey) {
                        setConfirmActionKey(actionKey);
                        setTimeout(() => setConfirmActionKey(null), 3500);
                        return;
                      }
                      setConfirmActionKey(null);
                      if (currentStage === 'DONOR_TO_VOLUNTEER') {
                        await confirmPickup(pickup.id);
                      } else {
                        await confirmDelivery(pickup.id);
                      }
                      if (onSuccess) onSuccess();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                      confirmActionKey?.startsWith('courier_')
                        ? 'bg-purple-900 ring-2 ring-purple-400'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {confirmActionKey?.startsWith('courier_')
                        ? `Click again: Confirm ${currentStage === 'DONOR_TO_VOLUNTEER' ? 'Collection' : 'Delivery'}`
                        : `Courier: Confirm ${currentStage === 'DONOR_TO_VOLUNTEER' ? 'Collection' : 'Delivery'}`}
                    </span>
                  </button>
                )}
            </div>
          </div>
        )}

        {/* --- LIVE 8-POINT VERIFICATION ENGINE EXPLAINER --- */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>Shared Security Rules (OTP & QR)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Correct recovery & active reservation validation</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Stakeholder role & identity authorization</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>15-minute time freshness window</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Single-use anti-replay nonce consumption</span>
            </div>
          </div>
        </div>

        {/* --- AUDIT TRAIL LOGS --- */}
        {relevantHistory.length > 0 && (
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Verification Audit Records ({relevantHistory.length})
            </h5>
            <div className="space-y-2">
              {relevantHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {item.method} VERIFIED
                    </span>
                    <span className="font-semibold text-slate-900">{item.stage}</span>
                    <span className="text-slate-500">by {item.verifiedByUserName} ({item.verifiedByUserRole})</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{item.auditHash}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
