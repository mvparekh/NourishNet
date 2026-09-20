import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  Copy
} from "lucide-react";
import { Modal } from "../common/Modal";
const QRDisplayModal = ({
  isOpen,
  onClose,
  reservation,
  pickup,
  listing
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  useEffect(() => {
    if (!pickup?.qrExpiresAt) return;
    const calculateSeconds = () => {
      const diff = Math.max(0, Math.floor((new Date(pickup.qrExpiresAt).getTime() - Date.now()) / 1e3));
      setSecondsRemaining(diff);
    };
    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1e3);
    return () => clearInterval(interval);
  }, [pickup]);
  const handleCopy = () => {
    navigator.clipboard.writeText(pickup.qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? "0" : ""}${s}s`;
  };
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Single-Use Pickup Token"
    subtitle="Present this cryptographic QR to the courier at loading bay for verified handoff"
    maxWidth="md"
  >
      <div className="text-center space-y-4">
        {/* QR Canvas Box */}
        <div className="p-6 bg-white rounded-2xl border-2 border-[#E7DCD5] inline-block shadow-sm relative group">
          <QRCodeSVG
            value={pickup.qrToken}
            size={200}
            level="H"
            includeMargin={true}
            className="mx-auto"
          />
          <div className="absolute top-2 right-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
          </div>
        </div>

        {/* Expiry & Nonce info */}
        <div className="flex items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Valid for: {formatCountdown(secondsRemaining)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F2] border border-[#E7DCD5] text-[#2C1810] rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Single-Use Nonce</span>
          </div>
        </div>

        {/* Assigned Courier & Listing Summary */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD5] text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#5D4037] font-medium">Surplus Item:</span>
            <span className="font-bold text-[#2C1810] truncate max-w-[200px]">{listing.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5D4037] font-medium">Quantity:</span>
            <span className="font-bold text-[#C85A32]">
              {reservation.requestedQuantity} {listing.unit.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5D4037] font-medium">Authorized Courier:</span>
            <span className="font-bold text-[#2C1810]">
              {reservation.assignedVolunteerName || reservation.ngoName}
            </span>
          </div>
        </div>

        {/* Token String Fallback */}
        <div className="pt-2 border-t border-[#E7DCD5] flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-[#8D6E63] truncate max-w-[220px]">
            Token: {pickup.qrToken.substring(0, 24)}...
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 text-xs font-semibold text-[#C85A32] hover:bg-[#FAF7F2] border border-[#E7DCD5] rounded-lg flex items-center gap-1 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Token"}</span>
          </button>
        </div>
      </div>
    </Modal>;
};
export {
  QRDisplayModal
};
