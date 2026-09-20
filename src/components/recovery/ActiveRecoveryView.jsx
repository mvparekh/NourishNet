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

// 7-Stage Order Timeline
const LIFECYCLE_STEPS = [
  { key: "RESERVED", label: "Reserved", icon: "📝" },
  { key: "ASSIGNED", label: "Assigned", icon: "👤" },
  { key: "SCHEDULED", label: "Scheduled", icon: "🕒" },
  { key: "PICKED_UP", label: "Picked Up", icon: "📦" },
  { key: "IN_TRANSIT", label: "In Transit", icon: "🚗" },
  { key: "DELIVERED", label: "Delivered", icon: "🏢" },
  { key: "COMPLETED", label: "Completed", icon: "✅" }
];

const ActiveRecoveryView = ({ reservationId, onBack }) => {
  const {
    reservations,
    pickups,
    foodListings,
    currentUser,
    advanceRecoveryState
  } = useApp();

  const [showMap, setShowMap] = useState(false);
  const [commModalMode, setCommModalMode] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const reservation = reservations.find((r) => r.id === reservationId);
  const pickup = pickups.find((p) => p.reservationId === reservationId);
  const listing = foodListings.find((l) => l.id === reservation?.listingId);

  if (!reservation || !listing || !pickup) {
    return (
      <div className="p-8 text-center card-warm space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#C85A32] mx-auto" />
        <h3 className="font-bold text-[#2C1810]">Recovery Record Not Found</h3>
        <p className="text-xs text-[#5D4037]">
          The requested recovery session may have expired or been completed.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn-primary text-xs px-4 py-2"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  const isVolunteer = currentUser?.role === "VOLUNTEER";

  // Calculate 7-step timeline position
  const getTimelineStepIndex = () => {
    if (reservation.status === "COMPLETED" || pickup.status === "COMPLETED") return 6;
    if (pickup.status === "DELIVERED") return 5;
    if (pickup.status === "IN_TRANSIT" || reservation.status === "IN_TRANSIT") return 4;
    if (pickup.status === "PICKED_UP" || reservation.status === "PICKUP_STARTED") return 3;
    if (reservation.status === "SCHEDULED" || reservation.status === "VOLUNTEER_EN_ROUTE") return 2;
    if (reservation.assignedVolunteerId || reservation.status === "VOLUNTEER_ASSIGNED") return 1;
    return 0; // RESERVED
  };

  const currentStepIdx = getTimelineStepIndex();

  const handleAdvanceState = (target, note) => {
    advanceRecoveryState(reservation.id, target, note);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Status Hub Header */}
      <div className="card-warm p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
              >
                ← Back
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8D6E63]">#{reservation.id.slice(-6)}</span>
                <StatusBadge status={reservation.status} />
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5EFEB] text-[#5D4037] font-bold border border-[#E7DCD5]">
                  {listing.category.replace("_", " ")}
                </span>
              </div>
              <h2 className="font-extrabold text-xl text-[#2C1810] mt-1">
                {listing.title}
              </h2>
            </div>
          </div>

          {/* Quick Communication & Emergency Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCommModalMode("MESSAGE")}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-[#5D4037]" />
              <span>Message</span>
            </button>

            <button
              type="button"
              onClick={() => setCommModalMode("CALL")}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-[#C85A32]" />
              <span>Call</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Report blocker or emergency"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* 7-Step Order Timeline Stepper (Reserved → Assigned → Scheduled → Picked Up → In Transit → Delivered → Completed) */}
        <div className="pt-2 border-t border-[#E7DCD5]">
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    isCurrent
                      ? "bg-[#FAF3F0] border-[#C85A32] shadow-xs text-[#2C1810] font-bold ring-1 ring-[#C85A32]"
                      : isPast
                      ? "bg-[#F5EFEB] border-[#E7DCD5] text-[#5D4037]"
                      : "bg-white border-[#E7DCD5] text-[#8D6E63] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{step.icon}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-ping" />}
                  </div>
                  <span className="mt-2 text-[11px] leading-tight font-semibold">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar (State Machine Advance) */}
        {reservation.status !== "COMPLETED" && (
          <div className="p-3.5 rounded-xl bg-[#2C1810] text-[#FAF7F2] flex flex-wrap items-center justify-between gap-3 text-xs border border-[#5D4037]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
              <span className="text-[#D7CCC8]">
                Recovery State: <strong className="text-white">{reservation.status}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isVolunteer && reservation.status === "VOLUNTEER_ASSIGNED" && (
                <button
                  type="button"
                  onClick={() => handleAdvanceState("VOLUNTEER_EN_ROUTE", "Volunteer started trip to donor")}
                  className="btn-terracotta text-xs px-3 py-1.5"
                >
                  🚗 Start Trip to Donor
                </button>
              )}

              {isVolunteer && reservation.status === "VOLUNTEER_EN_ROUTE" && (
                <button
                  type="button"
                  onClick={() => handleAdvanceState("PICKUP_STARTED", "Volunteer arrived at donor loading dock")}
                  className="btn-terracotta text-xs px-3 py-1.5"
                >
                  📍 Arrived at Donor Dock
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 bg-[#5D4037] text-white border-[#795548] hover:bg-[#795548]"
              >
                <Navigation className="w-3.5 h-3.5 text-[#E07A5F]" />
                <span>{showMap ? "Hide Route Map" : "Track Recovery Map"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Track Recovery Modal / Route Map (Triggered on demand, not permanently occupying screen) */}
      {showMap && (
        <div className="space-y-2 card-warm p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-[#2C1810] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#C85A32]" />
              <span>Active Recovery Route & Transit Radar</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-xs text-[#5D4037] hover:text-[#2C1810] underline"
            >
              Close Map
            </button>
          </div>
          <LiveRecoveryRouteMap
            reservation={reservation}
            pickup={pickup}
            listing={listing}
            viewerRole={currentUser?.role || "DONOR"}
          />
        </div>
      )}

      {/* Core Dual Unified Verification Engine (Alternative: Enter OTP OR Scan QR) */}
      <UnifiedVerificationHandoff
        reservation={reservation}
        pickup={pickup}
        listing={listing}
      />

      {/* Food Package & Logistics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Donor Kitchen Card */}
        <div className="card-warm p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#C85A32]" />
            <span>Donor Loading Location</span>
          </div>
          <div>
            <h4 className="font-bold text-[#2C1810]">{listing.donorName}</h4>
            <p className="text-xs text-[#5D4037] mt-1">{listing.pickupAddress}</p>
            <p className="text-xs text-[#8D6E63] mt-0.5">Locality: {listing.donorLocality}, Surat</p>
          </div>
          <div className="pt-2 border-t border-[#E7DCD5] text-xs text-[#5D4037] flex justify-between">
            <span>Pickup Window:</span>
            <strong className="text-[#2C1810]">
              {new Date(listing.pickupWindowStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
              {new Date(listing.pickupWindowEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </strong>
          </div>
        </div>

        {/* Receiving Shelter Card */}
        <div className="card-warm p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#5D4037]" />
            <span>Destination Shelter</span>
          </div>
          <div>
            <h4 className="font-bold text-[#2C1810]">{reservation.ngoName}</h4>
            <p className="text-xs text-[#5D4037] mt-1">{reservation.ngoLocality || "Surat"}, Surat</p>
            <p className="text-xs text-[#8D6E63] mt-0.5">Beneficiaries: {reservation.requestedQuantity} portions</p>
          </div>
          <div className="pt-2 border-t border-[#E7DCD5] text-xs text-[#5D4037] flex justify-between">
            <span>Status:</span>
            <strong className="text-[#2C1810]">{reservation.status}</strong>
          </div>
        </div>

        {/* Assigned Courier Card */}
        <div className="card-warm p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8D6E63] uppercase tracking-wider">
            <PackageCheck className="w-4 h-4 text-[#795548]" />
            <span>Assigned Courier</span>
          </div>
          <div>
            <h4 className="font-bold text-[#2C1810]">
              {reservation.assignedVolunteerName || "Courier Dispatch Pending"}
            </h4>
            <p className="text-xs text-[#5D4037] mt-1">
              {reservation.assignedVolunteerName ? "Verified Relief Courier" : "Automatic matching in progress"}
            </p>
          </div>
          <div className="pt-2 border-t border-[#E7DCD5] text-xs text-[#5D4037] flex justify-between">
            <span>Verification:</span>
            <strong className="text-[#2C1810]">Single-Use OTP / QR</strong>
          </div>
        </div>
      </div>

      {/* Communication Modal */}
      {commModalMode && (
        <RecoveryCommunicationModal
          isOpen={true}
          onClose={() => setCommModalMode(null)}
          reservation={reservation}
          mode={commModalMode}
        />
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyIssueModal
          isOpen={true}
          onClose={() => setShowEmergencyModal(false)}
          reservation={reservation}
          pickup={pickup}
        />
      )}
    </div>
  );
};

export { ActiveRecoveryView };
