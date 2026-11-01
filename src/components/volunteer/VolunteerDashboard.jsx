import { useState } from "react";
import {
  Truck,
  QrCode,
  CheckCircle2,
  Star,
  Navigation,
  Package,
  AlertCircle
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../common/StatusBadge";
import { QRScannerModal } from "../qr/QRScannerModal";
import { ActiveRecoveryView } from "../recovery/ActiveRecoveryView";
import { Modal } from "../common/Modal";

const VolunteerDashboard = () => {
  const {
    currentUser,
    reservations,
    pickups,
    foodListings,
    assignVolunteerToPickup,
    verifyHandoffOtp
  } = useApp();

  const [activeRecoveryId, setActiveRecoveryId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("order") || params.get("recovery") || null;
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [manualOtpModal, setManualOtpModal] = useState(null);
  const [manualOtpValue, setManualOtpValue] = useState("");
  const [manualOtpError, setManualOtpError] = useState("");
  const [manualOtpSuccess, setManualOtpSuccess] = useState("");

  if (!currentUser) return null;

  const myAssignedReservations = reservations.filter(
    (r) => r.assignedVolunteerId === currentUser.id && r.status !== "COMPLETED" && r.status !== "CANCELLED"
  );
  const completedTrips = reservations.filter(
    (r) => r.assignedVolunteerId === currentUser.id && r.status === "COMPLETED"
  );
  const unassignedPickups = pickups.filter((p) => !p.volunteerId && p.status === "PENDING");
  const totalMealsDelivered = completedTrips.reduce((sum, r) => sum + r.requestedQuantity, 0);

  const handleClaimPickup = async (pickupId) => {
    const pickupObj = pickups.find((p) => p.id === pickupId);
    const resId = pickupObj?.reservationId || pickupId;
    await assignVolunteerToPickup(resId, currentUser.id);
    setActiveTab("ACTIVE");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!manualOtpModal) return;
    setManualOtpError("");
    setManualOtpSuccess("");
    const stage = manualOtpModal.step === "DONOR" ? "DONOR_TO_VOLUNTEER" : "VOLUNTEER_TO_NGO";
    const res = await verifyHandoffOtp(manualOtpModal.pickupId, manualOtpValue.trim(), stage);
    if (res.success) {
      setManualOtpSuccess("Verification successful!");
      setTimeout(() => {
        setManualOtpModal(null);
        setManualOtpValue("");
        setManualOtpSuccess("");
      }, 1500);
    } else {
      setManualOtpError(res.errorMessage || "Invalid OTP code. Please check with donor/NGO.");
    }
  };

  if (activeRecoveryId) {
    return (
      <ActiveRecoveryView
        reservationId={activeRecoveryId}
        onBack={() => setActiveRecoveryId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Verification Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#2C1810] via-[#3D2319] to-[#2C1810] text-[#FAF7F2] shadow-md border border-[#5D4037]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#C85A32] text-white">
              Verified Delivery Partner
            </span>
            <span className="text-xs text-[#D7CCC8]">{currentUser.locality || "Surat"}, Surat</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-[#D7CCC8] max-w-xl">
            Transport surplus food safely across Surat. Verify handoffs via Single 4-digit OTP.
          </p>
        </div>

        <button
          id="volunteer-scan-qr-btn"
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="btn-terracotta px-5 py-3 text-xs flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#C85A32]/25"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Handoff QR Code</span>
        </button>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Active Trips</span>
            <Truck className="w-4 h-4 text-[#C85A32]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{myAssignedReservations.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Trips in progress</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Available in Surat</span>
            <Package className="w-4 h-4 text-[#5D4037]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{unassignedPickups.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Awaiting Delivery Partner</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Completed Rescues</span>
            <CheckCircle2 className="w-4 h-4 text-[#795548]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{completedTrips.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">{totalMealsDelivered} meals delivered</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Reliability Score</span>
            <Star className="w-4 h-4 text-[#C85A32] fill-[#C85A32]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">99.4%</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Verified on-time handoffs</p>
        </div>
      </div>

      {/* 3. ACTIVE PICKUPS COMMAND HUB */}
      {myAssignedReservations.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C1810]">
                Active Recovery Trip ({myAssignedReservations.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#5D4037] font-medium">Task-Specific Route</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {myAssignedReservations.map((res) => {
              const listing = foodListings.find((l) => l.id === res.listingId);
              const pickup = pickups.find((p) => p.reservationId === res.id);
              if (!listing) return null;
              const donorHandoff = pickup?.handoffs?.find((h) => h.stage === "DONOR_TO_VOLUNTEER");
              const ngoHandoff = pickup?.handoffs?.find((h) => h.stage === "VOLUNTEER_TO_NGO");
              const isDonorDone = donorHandoff
                ? donorHandoff.isVerified
                : pickup?.status === "IN_TRANSIT" || pickup?.status === "COMPLETED";
              const isNgoDone = ngoHandoff ? ngoHandoff.isVerified : pickup?.status === "COMPLETED";
              const isAtDonorStage = !isDonorDone;
              const isAtNgoStage = isDonorDone && !isNgoDone;

              return (
                <div
                  key={res.id}
                  className="p-4 rounded-xl bg-white border border-[#E7DCD5] shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F5EFEB] text-[#5D4037] border border-[#E7DCD5]">
                          {isAtDonorStage ? "Step 1: Pick up from Donor" : "Step 2: Deliver to Shelter"}
                        </span>
                        <StatusBadge status={res.status} />
                      </div>
                      <h3 className="text-sm font-bold text-[#2C1810] mt-1">{listing.title}</h3>
                      <p className="text-xs text-[#5D4037]">
                        {res.requestedQuantity} {listing.unit} · {listing.dietaryType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRecoveryId(res.id)}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Open Live Route & Map</span>
                      </button>
                    </div>
                  </div>

                  {/* Two-Stage Progress Flow with Alternative Options: [ Enter OTP ] OR [ Scan QR ] */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Stage 1: Donor */}
                    <div
                      className={`p-3.5 rounded-xl border ${
                        isDonorDone
                          ? "bg-emerald-50/70 border-emerald-200"
                          : isAtDonorStage
                          ? "bg-[#FAF7F2] border-[#C85A32] ring-1 ring-[#C85A32]"
                          : "bg-[#F5EFEB] border-[#E7DCD5]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C1810]">1. Pickup (Donor Loading Bay)</span>
                        {isDonorDone ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#C85A32] bg-[#C85A32]/10 px-1.5 py-0.5 rounded">
                            Active Step
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5D4037] mt-1 truncate">{listing.pickupAddress}</p>

                      {!isDonorDone && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="btn-terracotta flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Scan Donor QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setManualOtpModal({
                                reservationId: res.id,
                                pickupId: pickup?.id || "",
                                step: "DONOR"
                              })
                            }
                            className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                          >
                            Enter OTP
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage 2: NGO */}
                    <div
                      className={`p-3.5 rounded-xl border ${
                        isNgoDone
                          ? "bg-emerald-50/70 border-emerald-200"
                          : isAtNgoStage
                          ? "bg-[#FAF7F2] border-[#C85A32] ring-1 ring-[#C85A32]"
                          : "bg-[#F5EFEB] border-[#E7DCD5] opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C1810]">2. Dropoff (Receiving Shelter)</span>
                        {isNgoDone ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ✓ Verified
                          </span>
                        ) : isAtNgoStage ? (
                          <span className="text-[10px] font-bold text-[#C85A32] bg-[#C85A32]/10 px-1.5 py-0.5 rounded">
                            Active Step
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8D6E63]">Pending Step 1</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5D4037] mt-1 truncate">{res.ngoName} Shelter</p>

                      {isAtNgoStage && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="btn-terracotta flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Scan NGO QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setManualOtpModal({
                                reservationId: res.id,
                                pickupId: pickup?.id || "",
                                step: "NGO"
                              })
                            }
                            className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                          >
                            Enter OTP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DRILL-DOWN TABS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E7DCD5] pb-2 overflow-x-auto p-1 bg-[#F5EFEB] rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ACTIVE"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            My Assigned Pickups ({myAssignedReservations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AVAILABLE_QUEUE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "AVAILABLE_QUEUE"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            Available in Surat Queue ({unassignedPickups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "COMPLETED"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            Delivered History ({completedTrips.length})
          </button>
        </div>

        {/* Tab 1: Available Pickups Queue */}
        {activeTab === "AVAILABLE_QUEUE" && (
          <div className="space-y-3">
            {unassignedPickups.length === 0 ? (
              <div className="card-warm p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#5D4037] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C1810]">All pickups currently assigned</h3>
                <p className="text-xs text-[#5D4037]">New rescue requests from Surat NGOs will appear here in real time.</p>
              </div>
            ) : (
              unassignedPickups.map((p) => {
                const res = reservations.find((r) => r.id === p.reservationId);
                const listing = foodListings.find((l) => l.id === res?.listingId);
                if (!res || !listing) return null;
                return (
                  <div
                    key={p.id}
                    className="card-warm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF3F0] text-[#C85A32] border border-[#C85A32]/20">
                          Needs Delivery Partner
                        </span>
                        <span className="text-xs text-[#8D6E63]">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C1810]">{listing.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5D4037]">
                        <span>📦 {res.requestedQuantity} {listing.unit}</span>
                        <span>📍 From: {listing.donorLocality}</span>
                        <span>🎯 To: {res.ngoName}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimPickup(p.id)}
                      className="btn-terracotta py-2.5 px-4 text-xs shadow-sm shrink-0"
                    >
                      Accept Pickup & Start Route
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Active */}
        {activeTab === "ACTIVE" && (
          <div className="space-y-3">
            {myAssignedReservations.length === 0 ? (
              <div className="card-warm p-8 text-center space-y-2">
                <Truck className="w-8 h-8 text-[#8D6E63] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#2C1810]">No active deliveries assigned</h3>
                <p className="text-xs text-[#5D4037]">Accept a pending pickup from the Surat queue.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("AVAILABLE_QUEUE")}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  View Available Pickups
                </button>
              </div>
            ) : (
              myAssignedReservations.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                if (!listing) return null;
                return (
                  <div
                    key={res.id}
                    className="card-warm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">{listing.title}</h4>
                      <p className="text-xs text-[#5D4037] mt-0.5">
                        {res.requestedQuantity} {listing.unit} · Delivering to {res.ngoName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveRecoveryId(res.id)}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track & Navigate</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Completed History */}
        {activeTab === "COMPLETED" && (
          <div className="space-y-3">
            {completedTrips.length === 0 ? (
              <div className="card-warm p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#8D6E63] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#2C1810]">No completed deliveries yet</h3>
                <p className="text-xs text-[#5D4037]">Completed deliveries with verified timestamps will be recorded here.</p>
              </div>
            ) : (
              completedTrips.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                return (
                  <div
                    key={res.id}
                    className="card-warm p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#5D4037] bg-[#F5EFEB] px-2 py-0.5 rounded border border-[#E7DCD5]">
                          ✓ Successfully Delivered
                        </span>
                        <span className="text-xs text-[#8D6E63]">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C1810] mt-1">{listing?.title || "Recovered Surplus"}</h4>
                      <p className="text-xs text-[#5D4037]">
                        {res.requestedQuantity} portions · Delivered to {res.ngoName}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MANUAL OTP MODAL */}
      {manualOtpModal && (
        <Modal
          isOpen={true}
          onClose={() => setManualOtpModal(null)}
          title={`Enter ${manualOtpModal.step === "DONOR" ? "Donor" : "Shelter"} Handoff OTP`}
          subtitle="Alternative cryptographic verification method"
          maxWidth="sm"
        >
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {manualOtpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{manualOtpError}</span>
              </div>
            )}

            {manualOtpSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{manualOtpSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                6-Digit Handoff OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={manualOtpValue}
                onChange={(e) => setManualOtpValue(e.target.value)}
                placeholder="e.g. 582914"
                className="input-warm w-full text-center text-lg font-mono tracking-widest font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setManualOtpModal(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs px-4 py-2"
              >
                Verify Code
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* QR Scanner */}
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};

export { VolunteerDashboard };
