import { useState } from "react";
import {
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Navigation,
  PackageCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { LiveRecoveryRouteMap } from "./LiveRecoveryRouteMap";
import { UnifiedVerificationHandoff } from "./UnifiedVerificationHandoff";
import { RecoveryCommunicationModal } from "./RecoveryCommunicationModal";
import { EmergencyIssueModal } from "./EmergencyIssueModal";
import { StatusBadge } from "../common/StatusBadge";
const LIFECYCLE_STEPS = [
  { key: "CONFIRMED", label: "Reserved", icon: "\u{1F4DD}" },
  { key: "VOLUNTEER_ASSIGNED", label: "Courier Assigned", icon: "\u{1F464}" },
  { key: "VOLUNTEER_EN_ROUTE", label: "En Route to Donor", icon: "\u{1F697}" },
  { key: "PICKUP_STARTED", label: "At Loading Bay", icon: "\u{1F4E6}" },
  { key: "COMPLETED", label: "Verified & Delivered", icon: "\u2705" }
];
const ActiveRecoveryView = ({
  reservationId,
  onBack
}) => {
  const {
    reservations,
    pickups,
    foodListings,
    currentUser,
    advanceRecoveryState
  } = useApp();
  const [showMap, setShowMap] = useState(true);
  const [commModalMode, setCommModalMode] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const reservation = reservations.find((r) => r.id === reservationId);
  const pickup = pickups.find((p) => p.reservationId === reservationId);
  const listing = foodListings.find((l) => l.id === reservation?.listingId);
  if (!reservation || !listing || !pickup) {
    return <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Recovery Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested recovery session may have expired or been completed.
        </p>
        {onBack && <button
      type="button"
      onClick={onBack}
      className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
    >
            Return to Dashboard
          </button>}
      </div>;
  }
  const isVolunteer = currentUser?.role === "VOLUNTEER";
  const isDonor = currentUser?.role === "DONOR";
  const isNgo = currentUser?.role === "NGO";
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const currentStatus = reservation.status;
  const stepOrder = ["CONFIRMED", "VOLUNTEER_ASSIGNED", "VOLUNTEER_EN_ROUTE", "PICKUP_STARTED", "COMPLETED"];
  let currentStepIdx = stepOrder.indexOf(currentStatus);
  if (currentStepIdx === -1) {
    currentStepIdx = currentStatus === "COMPLETED" || currentStatus === "VERIFIED" ? 4 : 1;
  }
  const handleAdvanceState = (target, note) => {
    advanceRecoveryState(reservation.id, target, note);
  };
  return <div className="space-y-6 max-w-6xl mx-auto">
      {
    /* Top Breadcrumb & Status Hub Header */
  }
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && <button
    type="button"
    onClick={onBack}
    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
  >
                ← Back
              </button>}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">#{reservation.id}</span>
                <StatusBadge status={reservation.status} />
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {listing.category.replace("_", " ")}
                </span>
              </div>
              <h2 className="font-extrabold text-xl text-slate-900 mt-1">
                {listing.title}
              </h2>
            </div>
          </div>

          {
    /* Quick Communication & Emergency Actions */
  }
          <div className="flex items-center gap-2">
            <button
    type="button"
    onClick={() => setCommModalMode("MESSAGE")}
    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
  >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>Message</span>
            </button>

            <button
    type="button"
    onClick={() => setCommModalMode("CALL")}
    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
  >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call</span>
            </button>

            <button
    type="button"
    onClick={() => setShowEmergencyModal(true)}
    className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-all"
    title="Report blocker or emergency"
  >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Issue?</span>
            </button>
          </div>
        </div>

        {
    /* 5-Step Lifecycle Stepper */
  }
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
    const isPast = idx < currentStepIdx;
    const isCurrent = idx === currentStepIdx;
    return <div
      key={step.key}
      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${isCurrent ? "bg-purple-50 border-purple-500 shadow-sm text-purple-950 font-bold ring-1 ring-purple-500" : isPast ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white border-slate-100 text-slate-400 opacity-60"}`}
    >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{step.icon}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />}
                  </div>
                  <span className="mt-2 text-[11px] leading-tight">{step.label}</span>
                </div>;
  })}
          </div>
        </div>

        {
    /* Role-Specific Action Bar (State Machine Advance) */
  }
        {reservation.status !== "COMPLETED" && <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                Current Operational State: <strong className="text-white">{reservation.status}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isVolunteer && reservation.status === "VOLUNTEER_ASSIGNED" && <button
    type="button"
    onClick={() => handleAdvanceState("VOLUNTEER_EN_ROUTE", "Volunteer started trip to donor")}
    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
  >
                  🚗 Start Trip to Donor
                </button>}

              {isVolunteer && reservation.status === "VOLUNTEER_EN_ROUTE" && <button
    type="button"
    onClick={() => handleAdvanceState("PICKUP_STARTED", "Volunteer arrived at donor loading dock")}
    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
  >
                  📍 I Have Arrived at Donor
                </button>}

              <button
    type="button"
    onClick={() => setShowMap(!showMap)}
    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors flex items-center gap-1.5"
  >
                <Navigation className="w-3.5 h-3.5 text-purple-400" />
                <span>{showMap ? "Hide Route Map" : "Track Pickup Route"}</span>
              </button>
            </div>
          </div>}
      </div>

      {
    /* Task-Specific Route Map (Conditional on active movement) */
  }
      {showMap && <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-purple-600" />
              <span>Active Recovery Route & Transit Radar</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Live updates every 1.2s · Surat Corridor
            </span>
          </div>
          <LiveRecoveryRouteMap
    reservation={reservation}
    pickup={pickup}
    listing={listing}
    viewerRole={currentUser?.role || "DONOR"}
  />
        </div>}

      {
    /* Core Dual Unified Verification Engine */
  }
      <UnifiedVerificationHandoff
    reservation={reservation}
    pickup={pickup}
    listing={listing}
  />

      {
    /* Food Package & Logistics Breakdown */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {
    /* Donor Kitchen Card */
  }
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Donor Loading Location</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{listing.donorName}</h4>
            <p className="text-xs text-slate-600 mt-1">{listing.pickupAddress}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Locality: {listing.donorLocality}, Surat</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Pickup Window:</span>
            <strong className="text-slate-700">
              {new Date(listing.pickupWindowStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
              {new Date(listing.pickupWindowEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </strong>
          </div>
        </div>

        {
    /* Receiving Organization Card */
  }
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Receiving NGO Shelter</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{reservation.ngoName}</h4>
            <p className="text-xs text-slate-600 mt-1">Plot 42, Seva Marg, Someshwar Square, Vesu, Surat</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Locality: Vesu Relief Center</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Assigned Courier:</span>
            <strong className="text-slate-700">
              {reservation.assignedVolunteerName || "Self-Pickup by NGO"}
            </strong>
          </div>
        </div>

        {
    /* Food Safety & Condition Specs */
  }
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <PackageCheck className="w-4 h-4 text-purple-500" />
            <span>Food Packaging & Storage</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Quantity:</span>
              <strong className="text-slate-900 font-mono">
                {listing.quantity} {listing.unit}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Storage Required:</span>
              <strong className="text-purple-700">{listing.storageCondition}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Packaging Type:</span>
              <strong className="text-slate-700">{listing.packagingStatus}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dietary Standard:</span>
              <strong className="text-emerald-700">{listing.dietaryType}</strong>
            </div>
          </div>
        </div>
      </div>

      {
    /* Communication Modal */
  }
      {commModalMode && <RecoveryCommunicationModal
    reservation={reservation}
    listing={listing}
    initialMode={commModalMode}
    onClose={() => setCommModalMode(null)}
  />}

      {
    /* Emergency Escalation Modal */
  }
      {showEmergencyModal && <EmergencyIssueModal
    reservation={reservation}
    listing={listing}
    onClose={() => setShowEmergencyModal(false)}
  />}
    </div>;
};
export {
  ActiveRecoveryView
};
