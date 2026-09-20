import { useState } from "react";
import {
  Plus,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  UtensilsCrossed,
  Truck,
  Leaf,
  Navigation
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../common/StatusBadge";
import { AddListingModal } from "./AddListingModal";
import { QRDisplayModal } from "../qr/QRDisplayModal";
import { FeedbackModal } from "../feedback/FeedbackModal";
import { ReportIssueModal } from "../feedback/ReportIssueModal";
import { ActiveRecoveryView } from "../recovery/ActiveRecoveryView";

const DonorDashboard = () => {
  const { currentUser, foodListings, reservations, pickups, cancelListing } = useApp();
  const [activeRecoveryId, setActiveRecoveryId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [activeQrModal, setActiveQrModal] = useState(null);
  const [activeFeedbackModal, setActiveFeedbackModal] = useState(null);
  const [activeIssueModal, setActiveIssueModal] = useState(null);

  if (!currentUser) return null;

  const myListings = foodListings.filter((l) => l.donorId === currentUser.id);
  const activeListings = myListings.filter((l) => l.status === "AVAILABLE" || l.status === "RESERVED");
  const pastListings = myListings.filter((l) => l.status === "COMPLETED" || l.status === "CANCELLED" || l.status === "EXPIRED");
  const expiringSoonListings = activeListings.filter((l) => {
    const hoursLeft = (new Date(l.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 3;
  });

  const activeReservations = reservations.filter((r) => {
    const listing = foodListings.find((l) => l.id === r.listingId);
    return listing?.donorId === currentUser.id && r.status !== "COMPLETED" && r.status !== "CANCELLED";
  });

  const donorKgRescued = myListings
    .filter((l) => l.status === "COMPLETED")
    .reduce((sum, l) => sum + (l.unit === "KG" ? l.quantity : l.quantity * 0.45), 0);
  const completedCount = myListings.filter((l) => l.status === "COMPLETED").length;

  const filteredListings = myListings.filter((item) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "EXPIRING") {
      const hoursLeft = (new Date(item.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
      return item.status === "AVAILABLE" && hoursLeft > 0 && hoursLeft <= 3;
    }
    if (activeTab === "RESERVED") return item.status === "RESERVED";
    if (activeTab === "COMPLETED") return item.status === "COMPLETED";
    return true;
  });

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
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#2C1810] via-[#3D2319] to-[#2C1810] text-[#FAF7F2] shadow-md border border-[#5D4037]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#C85A32] text-white">
              Verified Food Donor
            </span>
            <span className="text-xs text-[#D7CCC8]">
              {currentUser.locality || "Surat"}, Surat
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-[#D7CCC8] max-w-xl">
            Surplus meals are matched instantly to accredited shelters and routed via verified volunteer couriers.
          </p>
        </div>

        <button
          id="donor-list-surplus-btn"
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="btn-terracotta px-5 py-3 text-xs flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#C85A32]/25"
        >
          <Plus className="w-4 h-4" />
          <span>+ List Surplus Food</span>
        </button>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Active Listings</span>
            <UtensilsCrossed className="w-4 h-4 text-[#C85A32]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{activeListings.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Surplus ready for rescue</p>
        </div>

        <div
          className={`card-warm p-4 ${
            expiringSoonListings.length > 0 ? "border-[#C85A32] bg-[#FAF3F0]" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Expiring Soon (&lt;3h)</span>
            <Clock
              className={`w-4 h-4 ${
                expiringSoonListings.length > 0 ? "text-[#C85A32] animate-pulse" : "text-[#8D6E63]"
              }`}
            />
          </div>
          <p className="text-2xl font-extrabold text-[#C85A32] mt-2">{expiringSoonListings.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Urgent priority window</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Active Pickups</span>
            <Truck className="w-4 h-4 text-[#5D4037]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{activeReservations.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">In transit or awaiting handoff</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Total Rescued</span>
            <Leaf className="w-4 h-4 text-[#795548]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">
            {donorKgRescued.toFixed(0)} <span className="text-xs font-normal text-[#8D6E63]">kg</span>
          </p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">{completedCount} recoveries completed</p>
        </div>
      </div>

      {/* 3. ACTIVE RECOVERIES HUB */}
      {activeReservations.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C1810]">
                Active Rescue Handoffs in Progress ({activeReservations.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#5D4037] font-medium">Verified Courier Routing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeReservations.map((res) => {
              const listing = foodListings.find((l) => l.id === res.listingId);
              const pickup = pickups.find((p) => p.reservationId === res.id);
              if (!listing) return null;
              return (
                <div
                  key={res.id}
                  className="p-4 rounded-xl bg-white border border-[#E7DCD5] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#2C1810]">{listing.title}</h3>
                      <p className="text-[11px] text-[#5D4037] mt-0.5">
                        Claimed by: <span className="font-semibold text-[#2C1810]">{res.ngoName}</span>
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E7DCD5]">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#5D4037]" />
                      <span className="font-medium text-[#2C1810]">
                        {res.assignedVolunteerName
                          ? `Courier: ${res.assignedVolunteerName}`
                          : "Assigning Courier..."}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#C85A32] font-bold">
                      {res.requestedQuantity} {listing.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveRecoveryId(res.id)}
                      className="btn-primary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Pickup</span>
                    </button>

                    {pickup && (
                      <button
                        type="button"
                        onClick={() => setActiveQrModal({ reservation: res, pickup, listing })}
                        className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                        title="Show Donor Handoff QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Handoff QR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DRILL-DOWN & LIST VIEW */}
      <div className="space-y-4">
        {/* Tab Filters */}
        <div className="flex items-center justify-between border-b border-[#E7DCD5] pb-2">
          <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#F5EFEB] rounded-xl border border-[#E7DCD5]">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              All Surplus ({myListings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("EXPIRING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "EXPIRING"
                  ? "bg-white text-[#C85A32] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              Expiring Soon ({expiringSoonListings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("RESERVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "RESERVED"
                  ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              Reserved ({activeReservations.length})
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
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="card-warm p-8 text-center space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-[#8D6E63] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[#2C1810]">No surplus listings in this view</h3>
            <p className="text-xs text-[#5D4037] max-w-sm mx-auto">
              Post fresh surplus food whenever you have extra thalis, catering preparations, or bakery surplus.
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="btn-terracotta px-4 py-2 text-xs"
            >
              + List Surplus Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((item) => {
              const hoursLeft = (new Date(item.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
              const isExpiring = item.status === "AVAILABLE" && hoursLeft > 0 && hoursLeft <= 3;
              const res = reservations.find((r) => r.listingId === item.id && r.status !== "CANCELLED");
              const pickup = res ? pickups.find((p) => p.reservationId === res.id) : null;
              return (
                <div
                  key={item.id}
                  className="card-warm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                >
                  {/* Photo or Header */}
                  {item.imageUrl ? (
                    <div className="relative h-36 w-full overflow-hidden bg-[#FAF7F2]">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2C1810]/80 text-[#FAF7F2] backdrop-blur-md">
                          {item.recoveryModel === "DONATION"
                            ? "Free Donation"
                            : `\u20B9${item.pricePerUnit}/${item.unit}`}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#F5EFEB] border-b border-[#E7DCD5] flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#5D4037] border border-[#E7DCD5]">
                        {item.recoveryModel === "DONATION" ? "Free Donation" : `\u20B9${item.pricePerUnit}/${item.unit}`}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-[#2C1810] leading-snug">{item.title}</h3>
                      <p className="text-xs font-semibold text-[#C85A32] mt-1">
                        {item.quantity} {item.unit} · {item.dietaryType}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[#5D4037]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8D6E63] shrink-0" />
                        <span className={isExpiring ? "font-bold text-[#C85A32]" : ""}>
                          {item.status === "COMPLETED"
                            ? "Recovered successfully"
                            : hoursLeft > 0
                            ? `Safe window: ${hoursLeft.toFixed(1)}h remaining`
                            : "Expired"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#8D6E63] shrink-0" />
                        <span className="truncate">{item.pickupAddress}</span>
                      </div>

                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-[#8D6E63]">Allergens:</span>
                          <span className="text-[10px] font-medium text-[#2C1810] truncate">
                            {item.allergens.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DCD5] flex items-center justify-between gap-2">
                    {item.status === "AVAILABLE" ? (
                      <>
                        <span className="text-[11px] text-[#8D6E63] font-medium">Awaiting shelter claim</span>
                        <button
                          type="button"
                          onClick={() => cancelListing(item.id, "Donor cancelled manually")}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : item.status === "RESERVED" && res ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveRecoveryId(res.id)}
                          className="btn-primary flex-1 py-1.5 px-2.5 text-xs flex items-center justify-center gap-1"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Track Pickup</span>
                        </button>

                        {pickup && (
                          <button
                            type="button"
                            onClick={() => setActiveQrModal({ reservation: res, pickup, listing: item })}
                            className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>QR</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-[#5D4037] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Rescued & Verified
                        </span>
                        {res && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveFeedbackModal({
                                reservationId: res.id,
                                listingId: item.id,
                                toUserId: res.ngoId,
                                toUserName: res.ngoName,
                                toUserRole: "NGO"
                              })
                            }
                            className="text-[11px] font-semibold text-[#C85A32] hover:underline"
                          >
                            Leave Feedback
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddListingModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {activeQrModal && (
        <QRDisplayModal
          isOpen={true}
          onClose={() => setActiveQrModal(null)}
          reservation={activeQrModal.reservation}
          pickup={activeQrModal.pickup}
          listing={activeQrModal.listing}
        />
      )}

      {activeFeedbackModal && (
        <FeedbackModal
          isOpen={true}
          onClose={() => setActiveFeedbackModal(null)}
          reservationId={activeFeedbackModal.reservationId}
          listingId={activeFeedbackModal.listingId}
          toUserId={activeFeedbackModal.toUserId}
          toUserName={activeFeedbackModal.toUserName}
          toUserRole={activeFeedbackModal.toUserRole}
        />
      )}

      {activeIssueModal && (
        <ReportIssueModal
          isOpen={true}
          onClose={() => setActiveIssueModal(null)}
          reservationId={activeIssueModal.reservationId}
          listingId={activeIssueModal.listingId}
          reportedAgainstUserId={activeIssueModal.reportedAgainstUserId}
          reportedAgainstUserName={activeIssueModal.reportedAgainstUserName}
        />
      )}
    </div>
  );
};

export { DonorDashboard };
