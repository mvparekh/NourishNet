import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
const QRScannerModal = ({ isOpen, onClose, onSuccess }) => {
  const { verifyQrCode, pickups, currentUser } = useApp();
  const [tokenInput, setTokenInput] = useState("");
  const [report, setReport] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const handleVerify = (tokenToVerify) => {
    const raw = tokenToVerify || tokenInput;
    if (!raw.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyQrCode(raw.trim());
      setReport(res);
      setIsVerifying(false);
      if (res.success && onSuccess) {
        onSuccess();
      }
    }, 400);
  };
  const handleClose = () => {
    setReport(null);
    setTokenInput("");
    onClose();
  };
  const availableDemoTokens = pickups.filter(
    (p) => p.status === "PENDING" || p.status === "ASSIGNED" || p.status === "IN_TRANSIT"
  );
  return <Modal
    isOpen={isOpen}
    onClose={handleClose}
    title={report?.success ? "Handoff Verified Successfully" : "Verify Pickup QR Code"}
    subtitle={report?.success ? "Transaction recorded & cryptographically signed" : "Scan or input the donor/NGO token to confirm surplus transfer"}
    maxWidth="lg"
  >
      {report?.success ? <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">Cryptographic Verification Passed</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified by: <strong>{currentUser?.fullName}</strong> ({currentUser?.role})
            </p>
          </div>

          {
    /* Verification Checks Checklist */
  }
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-left space-y-2 text-xs">
            {report.checks.map((c, i) => <div key={i} className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">{c.name}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {c.detail}
                </span>
              </div>)}
          </div>

          <button
    type="button"
    onClick={handleClose}
    className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
  >
            Done
          </button>
        </div> : <div className="space-y-4">
          {report && !report.success && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verification Rejected ({report.errorCode})</p>
                  <p className="text-[11px] mt-0.5">{report.errorMessage}</p>
                </div>
              </div>

              {
    /* Failed checks list */
  }
              {report.checks.length > 0 && <div className="pt-2 border-t border-rose-200/60 space-y-1">
                  {report.checks.map((c, idx) => <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span>{c.name}</span>
                      <span className={c.passed ? "text-emerald-700 font-medium" : "text-rose-700 font-bold"}>
                        {c.passed ? "Passed" : c.detail}
                      </span>
                    </div>)}
                </div>}
            </div>}

          {
    /* Input field */
  }
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cryptographic QR Token Payload
            </label>
            <textarea
    rows={3}
    value={tokenInput}
    onChange={(e) => setTokenInput(e.target.value)}
    placeholder="Paste signed token string (or use camera/quick tokens below)..."
    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
          </div>

          {
    /* Quick Token Test Options (Convenient in browser preview) */
  }
          {availableDemoTokens.length > 0 && <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
              <span className="text-[11px] font-semibold text-purple-900 block">
                Active Pending Pickup Tokens in Surat:
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {availableDemoTokens.map((p) => <button
    key={p.id}
    type="button"
    onClick={() => {
      setTokenInput(p.qrToken);
      handleVerify(p.qrToken);
    }}
    className="w-full text-left p-1.5 px-2.5 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-[11px] flex items-center justify-between transition-colors"
  >
                    <span className="truncate max-w-[240px] text-slate-800">
                      Token for Pickup #{p.id.slice(-6)}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Verify This
                    </span>
                  </button>)}
              </div>
            </div>}

          {
    /* Action buttons */
  }
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
    type="button"
    onClick={handleClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
  >
              Cancel
            </button>
            <button
    type="button"
    onClick={() => handleVerify()}
    disabled={isVerifying || !tokenInput.trim()}
    className="px-5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
  >
              {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Verify Single-Use Token</span>
            </button>
          </div>
        </div>}
    </Modal>;
};
export {
  QRScannerModal
};
