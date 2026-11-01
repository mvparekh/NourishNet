import { useState } from "react";
import {
  HeartHandshake,
  Sparkles,
  MapPin,
  Clock,
  Truck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  Navigation,
  Package
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../common/StatusBadge";
import { getSmartMatchesForNgo } from "../../services/allocationEngine";
import { QRDisplayModal } from "../qr/QRDisplayModal";
import { FeedbackModal } from "../feedback/FeedbackModal";
import { ActiveRecoveryView } from "../recovery/ActiveRecoveryView";
import { Modal } from "../common/Modal";

const NgoDashboard = () => {
  const {
    currentUser,
    foodListings,
    reservations,
    pickups,
    users,
    reserveListing,
    assignVolunteerToPickup
  } = useApp();

  const [activeRecoveryId, setActiveRecoveryId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("order") || params.get("recovery") || null;
  });
  const [activeTab, setActiveTab] = useState("RECOMMENDED");
  const [searchQuery, setSearchQuery] = useState("");
  const [localityFilter, setLocalityFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [dietaryFilter, setDietaryFilter] = useState("ALL");
  const [claimModalListing, setClaimModalListing] = useState(null);
  const [claimQuantity, setClaimQuantity] = useState(10);
  const [claimError, setClaimError] = useState("");
  const [assignRiderPickup, setAssignRiderPickup] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [activeQrModal, setActiveQrModal] = useState(null);
  const [activeFeedbackModal, setActiveFeedbackModal] = useState(null);

  if (!currentUser) return null;

  const activeVolunteers = users.filter((u) => u.role === "VOLUNTEER" && u.isActive);
  const smartMatches = getSmartMatchesForNgo(currentUser, foodListings);
  const availableListings = foodListings.filter((l) => l.status === "AVAILABLE");
  const myReservations = reservations.filter(
    (r) => r.ngoId === currentUser.id && r.status !== "COMPLETED" && r.status !== "CANCELLED"
  );
  const completedReservations = reservations.filter(
    (r) => r.ngoId === currentUser.id && r.status === "COMPLETED"
  );
  const totalPortionsReceived = completedReservations.reduce(
    (sum, r) => sum + r.requestedQuantity,
    0
  );

  const filteredCatalog = availableListings.filter((l) => {
    if (searchQuery.trim()) {
      const matchTitle = l.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLoc = (l.donorLocality || "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchLoc) return false;
    }
    if (localityFilter !== "ALL" && l.donorLocality !== localityFilter) return false;
    if (dietaryFilter !== "ALL" && l.dietaryType !== dietaryFilter) return false;
    if (modelFilter !== "ALL" && l.recoveryModel !== modelFilter) return false;
    return true;
  });

  const openClaimModal = (listing) => {
    setClaimModalListing(listing);
    setClaimQuantity(listing.quantity);
    setClaimError("");
  };

  const handleConfirmClaim = async () => {
    if (!claimModalListing) return;
    setClaimError("");
    const res = await reserveListing(claimModalListing.id, Number(claimQuantity));
    if (res.success && res.reservation) {
      setClaimModalListing(null);
      setActiveTab("ORDERS");
    } else {
      setClaimError(res.errorMessage || "Failed to complete reservation.");
    }
  };

  const handleAssignRider = async () => {
    if (!assignRiderPickup || !selectedVolunteerId) return;
    const resId = assignRiderPickup.reservationId || assignRiderPickup.id;
    await assignVolunteerToPickup(resId, selectedVolunteerId);
    setAssignRiderPickup(null);
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
      {/* 1. Header & Primary Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#2C1810] via-[#3D2319] to-[#2C1810] text-[#FAF7F2] shadow-md border border-[#5D4037]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#C85A32] text-white">
              Verified Charity Shelter / NGO
            </span>
            <span className="text-xs text-[#D7CCC8]">
              {currentUser.locality || "Surat"}, Surat
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-[#D7CCC8] max-w-xl">
            Claim fresh food surplus from restaurants, catering kitchens, and bakeries before safe expiry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className="btn-terracotta px-5 py-3 text-xs flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#C85A32]/25"
        >
          <Search className="w-4 h-4" />
          <span>Browse Available Surplus</span>
        </button>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Smart Matches</span>
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
          </div>
          <p className="text-2xl font-extrabold text-[#C85A32] mt-2">{smartMatches.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Recommended for your shelter</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Available Surplus</span>
            <Package className="w-4 h-4 text-[#5D4037]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{availableListings.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">Active lots across Surat</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Active Orders</span>
            <Truck className="w-4 h-4 text-[#5D4037]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{myReservations.length}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">In recovery & transit</p>
        </div>

        <div className="card-warm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8D6E63]">Portions Served</span>
            <HeartHandshake className="w-4 h-4 text-[#795548]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-2">{totalPortionsReceived}</p>
          <p className="text-[11px] text-[#8D6E63] mt-0.5">{completedReservations.length} completed rescues</p>
        </div>
      </div>

      {/* 3. ACTIVE ORDERS ALERT */}
      {myReservations.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#F5EFEB] border border-[#E7DCD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C1810]">
                Active Surplus Deliveries in Transit ({myReservations.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#5D4037] font-medium">Real-time Recovery Logistics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myReservations.map((res) => {
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
                        Donor: <span className="font-semibold text-[#2C1810]">{listing.donorLocality}</span> · {res.requestedQuantity} {listing.unit}
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E7DCD5]">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#5D4037]" />
                      <span className="font-medium text-[#2C1810]">
                        {res.assignedVolunteerName
                          ? `Delivery Partner: ${res.assignedVolunteerName}`
                          : "No Delivery Partner assigned yet"}
                      </span>
                    </div>
                    {!pickup?.volunteerId && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignRiderPickup(pickup || null);
                          setSelectedVolunteerId(activeVolunteers[0]?.id || "");
                        }}
                        className="text-[11px] font-bold text-[#C85A32] hover:underline cursor-pointer"
                      >
                        + Assign Delivery Partner
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveRecoveryId(res.id)}
                      className="btn-primary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Order & Map</span>
                    </button>

                    {pickup && (
                      <button
                        type="button"
                        onClick={() => setActiveQrModal({ reservation: res, pickup, listing })}
                        className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                        title="Show Receiving QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Receive QR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DRILL-DOWN CATALOG & FILTERS */}
      <div className="space-y-4">
        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DCD5] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#F5EFEB] rounded-xl border border-[#E7DCD5]">
            <button
              type="button"
              onClick={() => setActiveTab("RECOMMENDED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "RECOMMENDED"
                  ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Recommended ({smartMatches.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              All Surplus ({availableListings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ORDERS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "ORDERS"
                  ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              My Orders ({myReservations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("HISTORY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "HISTORY"
                  ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                  : "text-[#5D4037] hover:text-[#2C1810]"
              }`}
            >
              Past Deliveries ({completedReservations.length})
            </button>
          </div>

          {(activeTab === "ALL" || activeTab === "RECOMMENDED") && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8D6E63] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search surplus or area..."
                className="input-warm w-full pl-8 py-1.5 text-xs"
              />
            </div>
          )}
        </div>

        {/* Filters */}
        {(activeTab === "ALL" || activeTab === "RECOMMENDED") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#8D6E63] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="text-xs bg-white border border-[#E7DCD5] rounded-lg px-2.5 py-1 text-[#2C1810] font-medium"
            >
              <option value="ALL">All Localities</option>
              <option value="Vesu">Vesu</option>
              <option value="Adajan">Adajan</option>
              <option value="Katargam">Katargam</option>
              <option value="Varachha">Varachha</option>
              <option value="Rander">Rander</option>
              <option value="Athwa">Athwa</option>
              <option value="Ring Road">Ring Road</option>
              <option value="Pal">Pal</option>
            </select>

            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="text-xs bg-white border border-[#E7DCD5] rounded-lg px-2.5 py-1 text-[#2C1810] font-medium"
            >
              <option value="ALL">All Models</option>
              <option value="DONATION">Free Donation (₹0)</option>
              <option value="SOCIAL_PRICE">Social Price</option>
              <option value="RECOVERY_PRICE">Recovery Price</option>
            </select>

            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="text-xs bg-white border border-[#E7DCD5] rounded-lg px-2.5 py-1 text-[#2C1810] font-medium"
            >
              <option value="ALL">All Diets</option>
              <option value="JAIN_VEG">Jain Vegetarian</option>
              <option value="VEG">Pure Vegetarian</option>
              <option value="VEGAN">Vegan</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>
        )}

        {/* Content: RECOMMENDED */}
        {activeTab === "RECOMMENDED" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartMatches.length === 0 ? (
              <div className="col-span-full card-warm p-8 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[#C85A32] mx-auto opacity-60" />
                <h3 className="text-sm font-bold text-[#2C1810]">No smart matches currently</h3>
                <p className="text-xs text-[#5D4037]">Check the "All Surplus" tab to see all active lots across Surat.</p>
              </div>
            ) : (
              smartMatches.map(({ listing, score, explanation }) => {
                const hoursLeft = (new Date(listing.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
                return (
                  <div
                    key={listing.id}
                    className="card-warm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all border-[#C85A32]/30"
                  >
                    {listing.imageUrl ? (
                      <div className="relative h-36 w-full overflow-hidden bg-[#FAF7F2]">
                        <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2C1810]/85 text-[#FAF7F2] backdrop-blur-md">
                            Smart Match ({score} pts)
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C85A32] text-white">
                            {listing.recoveryModel === "DONATION"
                              ? "Free (₹0)"
                              : `\u20B9${listing.pricePerUnit}/${listing.unit}`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#F5EFEB] flex items-center justify-between border-b border-[#E7DCD5]">
                        <span className="text-xs font-bold text-[#2C1810] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" /> Smart Match ({score} pts)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#5D4037] border border-[#E7DCD5]">
                          {listing.recoveryModel === "DONATION" ? "Free" : `\u20B9${listing.pricePerUnit}/${listing.unit}`}
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-2.5 flex-1">
                      <div>
                        <h3 className="text-sm font-bold text-[#2C1810] leading-snug">{listing.title}</h3>
                        <p className="text-xs font-semibold text-[#C85A32] mt-0.5">
                          {listing.quantity} {listing.unit} · {listing.dietaryType}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5D4037] border border-[#E7DCD5]">
                          ✓ {explanation.urgencyLabel}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5D4037] border border-[#E7DCD5]">
                          ✓ {explanation.proximityLabel}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-[#5D4037] pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8D6E63]" />
                          <span>Safe window: {hoursLeft.toFixed(1)}h remaining</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8D6E63]" />
                          <span>{listing.donorLocality}, Surat</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DCD5]">
                      <button
                        type="button"
                        onClick={() => openClaimModal(listing)}
                        className="btn-terracotta w-full py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Claim Surplus Food</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Content: ALL SURPLUS */}
        {activeTab === "ALL" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.length === 0 ? (
              <div className="col-span-full card-warm p-8 text-center space-y-2">
                <Package className="w-8 h-8 text-[#8D6E63] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#2C1810]">No surplus lots matching criteria</h3>
                <p className="text-xs text-[#5D4037]">Try clearing your search or filters.</p>
              </div>
            ) : (
              filteredCatalog.map((item) => {
                const hoursLeft = (new Date(item.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
                return (
                  <div
                    key={item.id}
                    className="card-warm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    {item.imageUrl ? (
                      <div className="relative h-36 w-full overflow-hidden bg-[#FAF7F2]">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2C1810]/80 text-[#FAF7F2] backdrop-blur-md">
                            {item.recoveryModel === "DONATION" ? "Free (₹0)" : `\u20B9${item.pricePerUnit}/${item.unit}`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#F5EFEB] flex items-center justify-between border-b border-[#E7DCD5]">
                        <span className="text-xs font-bold text-[#2C1810]">{item.category}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#5D4037] border border-[#E7DCD5]">
                          {item.recoveryModel === "DONATION" ? "Free" : `\u20B9${item.pricePerUnit}/${item.unit}`}
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-2 flex-1">
                      <h3 className="text-sm font-bold text-[#2C1810] leading-snug">{item.title}</h3>
                      <p className="text-xs font-semibold text-[#C85A32]">
                        {item.quantity} {item.unit} · {item.dietaryType}
                      </p>

                      <div className="space-y-1 text-[11px] text-[#5D4037] pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8D6E63]" />
                          <span>Safe window: {hoursLeft.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8D6E63]" />
                          <span>{item.donorLocality}, Surat</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] border-t border-[#E7DCD5]">
                      <button
                        type="button"
                        onClick={() => openClaimModal(item)}
                        className="btn-terracotta w-full py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Claim Surplus Food</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Content: MY ORDERS */}
        {activeTab === "ORDERS" && (
          <div className="space-y-3">
            {myReservations.length === 0 ? (
              <div className="card-warm p-8 text-center space-y-2">
                <Truck className="w-8 h-8 text-[#8D6E63] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#2C1810]">No active recovery orders</h3>
                <p className="text-xs text-[#5D4037]">Claim surplus from the catalog to initiate deliveries.</p>
              </div>
            ) : (
              myReservations.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                const pickup = pickups.find((p) => p.reservationId === res.id);
                if (!listing) return null;
                return (
                  <div
                    key={res.id}
                    className="card-warm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={res.status} />
                        <span className="text-xs text-[#8D6E63]">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C1810]">{listing.title}</h4>
                      <p className="text-xs text-[#5D4037]">
                        {res.requestedQuantity} {listing.unit} · Donor: {listing.donorLocality} · Total: ₹{res.finalPayableAmount || 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRecoveryId(res.id)}
                        className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Track Recovery</span>
                      </button>

                      {pickup && (
                        <button
                          type="button"
                          onClick={() => setActiveQrModal({ reservation: res, pickup, listing })}
                          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Receipt QR</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Content: PAST HISTORY */}
        {activeTab === "HISTORY" && (
          <div className="space-y-3">
            {completedReservations.length === 0 ? (
              <div className="card-warm p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#8D6E63] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#2C1810]">No completed rescues yet</h3>
                <p className="text-xs text-[#5D4037]">Your completed deliveries and receipts will appear here.</p>
              </div>
            ) : (
              completedReservations.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                return (
                  <div
                    key={res.id}
                    className="card-warm p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#5D4037] bg-[#F5EFEB] px-2 py-0.5 rounded border border-[#E7DCD5]">
                          ✓ Verified & Received
                        </span>
                        <span className="text-xs text-[#8D6E63]">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C1810] mt-1">{listing?.title || "Recovered Surplus"}</h4>
                      <p className="text-xs text-[#5D4037]">
                        {res.requestedQuantity} portions received · Delivered to shelter
                      </p>
                    </div>

                    {listing && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveFeedbackModal({
                            reservationId: res.id,
                            listingId: listing.id,
                            toUserId: listing.donorId,
                            toUserName: listing.donorLocality,
                            toUserRole: "DONOR"
                          })
                        }
                        className="text-xs font-semibold text-[#C85A32] hover:underline"
                      >
                        Leave Feedback
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* CLAIM / CHECKOUT MODAL */}
      {claimModalListing && (
        <Modal
          isOpen={true}
          onClose={() => setClaimModalListing(null)}
          title="Claim Surplus Recovery"
          subtitle={`Reserve portions for ${currentUser.fullName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {claimError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#F5EFEB] border border-[#E7DCD5] space-y-1">
              <h4 className="text-xs font-bold text-[#2C1810]">{claimModalListing.title}</h4>
              <p className="text-xs text-[#C85A32] font-semibold">
                Available: {claimModalListing.quantity} {claimModalListing.unit} · {claimModalListing.dietaryType}
              </p>
              <p className="text-[11px] text-[#8D6E63]">
                Loading bay: {claimModalListing.donorLocality}, Surat
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                Portions to Claim ({claimModalListing.unit}) *
              </label>
              <input
                type="number"
                min={1}
                max={claimModalListing.quantity}
                value={claimQuantity}
                onChange={(e) =>
                  setClaimQuantity(Math.min(claimModalListing.quantity, Math.max(1, Number(e.target.value))))
                }
                className="input-warm w-full text-sm font-bold"
              />
            </div>

            {/* Transparent Cost Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7DCD5] space-y-2">
              <span className="text-xs font-bold text-[#2C1810]">Transparent Cost Breakdown</span>

              <div className="flex items-center justify-between text-xs text-[#5D4037]">
                <span>
                  Food Cost (
                  {claimModalListing.recoveryModel === "DONATION"
                    ? "Free Donation"
                    : `\u20B9${claimModalListing.pricePerUnit} \xD7 ${claimQuantity}`}
                  ):
                </span>
                <span className="font-semibold text-[#2C1810]">
                  ₹{(claimModalListing.pricePerUnit || 0) * claimQuantity}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#5D4037]">
                <span>Platform Operational Fee:</span>
                <span className="font-semibold text-[#5D4037]">₹0 (Zero Fee Protocol)</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#5D4037]">
                <span>Delivery Partner Logistics:</span>
                <span className="font-semibold text-[#5D4037]">₹0 (Community)</span>
              </div>

              <div className="pt-2 border-t border-[#E7DCD5] flex items-center justify-between text-sm font-bold text-[#2C1810]">
                <span>Total Due:</span>
                <span className="text-[#C85A32]">₹{(claimModalListing.pricePerUnit || 0) * claimQuantity}</span>
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClaimModalListing(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClaim}
                className="btn-terracotta text-xs px-5 py-2.5 flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Create Order</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ASSIGN RIDER MODAL */}
      {assignRiderPickup && (
        <Modal
          isOpen={true}
          onClose={() => setAssignRiderPickup(null)}
          title="Assign Delivery Partner"
          subtitle="Dispatch a verified Delivery Partner for this surplus recovery"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2C1810] mb-1">
                Select Available Delivery Partner *
              </label>
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                className="input-warm w-full text-xs font-medium"
              >
                {activeVolunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.fullName} ({v.locality || "Surat"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignRiderPickup(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignRider}
                className="btn-primary text-xs px-4 py-2"
              >
                Assign Delivery Partner
              </button>
            </div>
          </div>
        </Modal>
      )}

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
    </div>
  );
};

export { NgoDashboard };
