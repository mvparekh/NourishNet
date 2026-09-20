import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
const ReportIssueModal = ({
  isOpen,
  onClose,
  reservationId,
  listingId,
  reportedAgainstUserId,
  reportedAgainstUserName
}) => {
  const { reportIssue } = useApp();
  const [category, setCategory] = useState("FOOD_SAFETY");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    reportIssue({
      reservationId,
      listingId,
      reportedAgainstUserId,
      reportedAgainstUserName,
      category,
      description
    });
    setIsSubmitted(true);
  };
  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };
  return <Modal
    isOpen={isOpen}
    onClose={handleClose}
    title={isSubmitted ? "Incident Reported" : "Report an Issue to Admin"}
    subtitle={isSubmitted ? "NourishNet Surat operations will investigate immediately" : "Flag food safety violations, severe delays, or coordination disputes"}
    maxWidth="md"
  >
      {isSubmitted ? <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Incident Ticket Created</h4>
            <p className="text-xs text-slate-500 mt-1">
              Surat platform governance lead has been notified. You can track this in moderation logs.
            </p>
          </div>
          <button
    type="button"
    onClick={handleClose}
    className="px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
  >
            Done
          </button>
        </div> : <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Category *
            </label>
            <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600"
  >
              <option value="FOOD_SAFETY">Food Safety / Hygiene Concern</option>
              <option value="INCORRECT_QUANTITY">Incorrect Quantity or Mismatched Items</option>
              <option value="DONOR_UNAVAILABLE">Donor Unavailable at Loading Bay</option>
              <option value="NGO_UNAVAILABLE">NGO Unavailable for Receiving</option>
              <option value="VOLUNTEER_NOSHOW">Volunteer Courier No-Show</option>
              <option value="PICKUP_DELAYED">Excessive Pickup Delay (&gt;45 min)</option>
              <option value="INCORRECT_INFO">Incorrect Location or Contact Information</option>
              <option value="OTHER">Other Operational Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Details & Description *
            </label>
            <textarea
    required
    rows={4}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Describe what occurred, time of arrival, food temperature/condition, or specific discrepancy..."
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600"
  />
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-2 text-[11px] text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              All incident reports are logged permanently with cryptographic timestamps and audited by Surat City Administration.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
    type="button"
    onClick={handleClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
  >
              Submit Incident Report
            </button>
          </div>
        </form>}
    </Modal>;
};
export {
  ReportIssueModal
};
