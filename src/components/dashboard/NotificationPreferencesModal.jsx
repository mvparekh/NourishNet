import { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "../common/Modal";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../../services/dashboardConfig";
const NotificationPreferencesModal = ({
  isOpen,
  onClose,
  initialPreferences = DEFAULT_NOTIFICATION_PREFERENCES,
  onSave
}) => {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const toggleKey = (key) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };
  const handleSave = () => {
    onSave(prefs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Notification Preferences"
    subtitle="Choose what events send alerts to avoid notification overload"
    maxWidth="md"
  >
      <div className="space-y-4">
        <p className="text-xs text-slate-600">
          Separate from your dashboard layout, these settings control mobile and in-app sound and push alerts.
        </p>

        <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:bg-purple-50/30">
            <div>
              <p className="font-bold text-slate-900">Pickup Starting Soon</p>
              <p className="text-slate-500 text-[11px]">Alert 30 minutes before loading bay handoff deadline</p>
            </div>
            <input
    type="checkbox"
    checked={prefs.pickupStartingSoon}
    onChange={() => toggleKey("pickupStartingSoon")}
    className="w-4 h-4 text-purple-600 rounded"
  />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:bg-purple-50/30">
            <div>
              <p className="font-bold text-slate-900">Volunteer Assignment Received</p>
              <p className="text-slate-500 text-[11px]">When an NGO assigns a courier to your surplus batch</p>
            </div>
            <input
    type="checkbox"
    checked={prefs.assignmentReceived}
    onChange={() => toggleKey("assignmentReceived")}
    className="w-4 h-4 text-purple-600 rounded"
  />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:bg-purple-50/30">
            <div>
              <p className="font-bold text-slate-900">Surplus Batch Reserved</p>
              <p className="text-slate-500 text-[11px]">Instant alert when a verified Surat NGO claims your food</p>
            </div>
            <input
    type="checkbox"
    checked={prefs.listingReserved}
    onChange={() => toggleKey("listingReserved")}
    className="w-4 h-4 text-purple-600 rounded"
  />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:bg-purple-50/30">
            <div>
              <p className="font-bold text-slate-900">Expiring Food Emergency</p>
              <p className="text-slate-500 text-[11px]">Surplus food within 2 hours of expiry near your shelter</p>
            </div>
            <input
    type="checkbox"
    checked={prefs.listingExpiringSoon}
    onChange={() => toggleKey("listingExpiringSoon")}
    className="w-4 h-4 text-purple-600 rounded"
  />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:bg-purple-50/30">
            <div>
              <p className="font-bold text-slate-900">Handoff QR Verification Confirmed</p>
              <p className="text-slate-500 text-[11px]">Proof of delivery timestamp recorded cryptographically</p>
            </div>
            <input
    type="checkbox"
    checked={prefs.verificationCompleted}
    onChange={() => toggleKey("verificationCompleted")}
    className="w-4 h-4 text-purple-600 rounded"
  />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:bg-purple-50/30">
            <div>
              <p className="font-bold text-slate-900">Weekly Sustainability Digest</p>
              <p className="text-slate-500 text-[11px]">Summary of meals saved and CO₂ offset in Surat</p>
            </div>
            <input
    type="checkbox"
    checked={prefs.weeklyImpactSummary}
    onChange={() => toggleKey("weeklyImpactSummary")}
    className="w-4 h-4 text-purple-600 rounded"
  />
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
  >
            Cancel
          </button>

          <button
    type="button"
    onClick={handleSave}
    className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
  >
            <Check className="w-4 h-4" />
            <span>{savedSuccess ? "Preferences Saved!" : "Save Preferences"}</span>
          </button>
        </div>
      </div>
    </Modal>;
};
export {
  NotificationPreferencesModal
};
