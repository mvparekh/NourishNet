import { useState } from "react";
import {
  AlertTriangle,
  X,
  CheckCircle2,
  PhoneCall,
  RefreshCw
} from "lucide-react";
import { useApp } from "../../context/AppContext";
const ISSUE_CATEGORIES = [
  { id: "DONOR_UNAVAILABLE", label: "Donor location closed / unattended", icon: "\u{1F3E2}" },
  { id: "PICKUP_DELAYED", label: "Volunteer vehicle breakdown / transit delay", icon: "\u{1F697}" },
  { id: "FOOD_SAFETY", label: "Food packaging / temperature / hygiene concern", icon: "\u26A0\uFE0F" },
  { id: "INCORRECT_QUANTITY", label: "Surplus quantity significantly different than listed", icon: "\u2696\uFE0F" },
  { id: "NGO_UNAVAILABLE", label: "NGO shelter closed / unable to receive food", icon: "\u{1F512}" },
  { id: "OTHER", label: "Other operational blocker", icon: "\u2753" }
];
const EmergencyIssueModal = ({
  reservation,
  listing,
  onClose
}) => {
  const { currentUser, reportIssue, advanceRecoveryState } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("DONOR_UNAVAILABLE");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmit = () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      reportIssue({
        reservationId: reservation.id,
        category: selectedCategory,
        description: `[${selectedCategory}] ${description.trim()}`
      });
      advanceRecoveryState(
        reservation.id,
        "DELAYED",
        `Incident reported (${selectedCategory}): ${description.slice(0, 60)}`
      );
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };
  return <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {
    /* Header */
  }
        <div className="p-4 sm:p-5 bg-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Something Went Wrong?</h3>
              <p className="text-xs text-rose-200">Incident Escalation & Support</p>
            </div>
          </div>
          <button
    type="button"
    onClick={onClose}
    className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Content */
  }
        <div className="p-5 sm:p-6 space-y-5">
          {isSubmitted ? <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Incident Report Dispatched</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  NourishNet Surat Command Center and all stakeholders have been alerted. Recovery state updated to <strong>DELAYED</strong>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-600" />
                <span>Emergency Helpline: <strong>+91 98240 10003</strong></span>
              </div>
              <button
    type="button"
    onClick={onClose}
    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
  >
                Close & Return to Hub
              </button>
            </div> : <>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select What Happened:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ISSUE_CATEGORIES.map((cat) => <button
    key={cat.id}
    type="button"
    onClick={() => setSelectedCategory(cat.id)}
    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${selectedCategory === cat.id ? "bg-rose-50 border-rose-500 text-rose-900 font-semibold shadow-sm ring-1 ring-rose-500" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
  >
                      <span className="text-base">{cat.icon}</span>
                      <span className="leading-tight">{cat.label}</span>
                    </button>)}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Describe Details & Next Steps Needed:
                </label>
                <textarea
    rows={3}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Provide exact details (e.g. Volunteer Aarav has flat tire near Ghod Dod Rd; need backup rider or extra 15 mins)..."
    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
  />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
  >
                  Cancel
                </button>
                <button
    type="button"
    onClick={handleSubmit}
    disabled={isSubmitting || !description.trim()}
    className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
  >
                  {isSubmitting ? <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Logging Incident...</span>
                    </> : <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Escalate Incident Report</span>
                    </>}
                </button>
              </div>
            </>}
        </div>
      </div>
    </div>;
};
export {
  EmergencyIssueModal
};
