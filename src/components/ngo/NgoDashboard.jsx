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
  const [activeRecoveryId, setActiveRecoveryId] = useState(null);
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
      const matchLoc = l.donorLocality.toLowerCase().includes(searchQuery.toLowerCase());
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
  const handleAssignRider = () => {
    if (!assignRiderPickup || !selectedVolunteerId) return;
    assignVolunteerToPickup(assignRiderPickup.id, selectedVolunteerId);
    setAssignRiderPickup(null);
  };
  if (activeRecoveryId) {
    return <ActiveRecoveryView
      reservationId={activeRecoveryId}
      onBack={() => setActiveRecoveryId(null)}
    />;
  }
  return <div className="space-y-6">
      {
    /* 1. Header & Primary Info */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Verified Charity Shelter / NGO
            </span>
            <span className="text-xs text-purple-200">
              {currentUser.locality || "Surat"}, Surat
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.fullName}</h1>
          <p className="text-xs text-purple-200/90 max-w-xl">
            Claim fresh food surplus from restaurants, catering kitchens, and markets before safe expiry.
          </p>
        </div>

        <button
    type="button"
    onClick={() => setActiveTab("ALL")}
    className="px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 shrink-0"
  >
          <Search className="w-4 h-4" />
          <span>Browse Available Surplus</span>
        </button>
      </div>

      {
    /* 2. SUMMARY METRICS (Summary → Drill-down → Action) */
  }
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Smart Matches</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-900 mt-2">{smartMatches.length}</p>
          <p className="text-[11px] text-purple-700 mt-0.5">Recommended for your shelter</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Surplus</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{availableListings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active lots across Surat</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Orders</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-900 mt-2">{myReservations.length}</p>
          <p className="text-[11px] text-indigo-700 mt-0.5">In recovery & transit</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Portions Served</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-2">{totalPortionsReceived}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">{completedReservations.length} completed rescues</p>
        </div>
      </div>

      {
    /* 3. ACTIVE ORDERS ALERT (When movement is needed) */
  }
      {myReservations.length > 0 && <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Active Surplus Deliveries in Transit ({myReservations.length})
              </h2>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Real-time Recovery Logistics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myReservations.map((res) => {
    const listing = foodListings.find((l) => l.id === res.listingId);
    const pickup = pickups.find((p) => p.reservationId === res.id);
    if (!listing) return null;
    return <div key={res.id} className="p-3.5 rounded-xl bg-white border border-indigo-200/70 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{listing.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Donor: <span className="font-semibold text-purple-900">{listing.donorLocality}</span> · {res.requestedQuantity} {listing.unit}
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-medium text-slate-700">
                        {res.assignedVolunteerName ? `Courier: ${res.assignedVolunteerName}` : "No courier assigned yet"}
                      </span>
                    </div>
                    {!pickup?.volunteerId && <button
      type="button"
      onClick={() => {
        setAssignRiderPickup(pickup || null);
        setSelectedVolunteerId(activeVolunteers[0]?.id || "");
      }}
      className="text-[11px] font-bold text-purple-700 hover:underline"
    >
                        + Assign Rider
                      </button>}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
      type="button"
      onClick={() => setActiveRecoveryId(res.id)}
      className="flex-1 py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Order & Live Map</span>
                    </button>

                    {pickup && <button
      type="button"
      onClick={() => setActiveQrModal({ reservation: res, pickup, listing })}
      className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1"
      title="Show Receiving QR Code"
    >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Receive QR</span>
                      </button>}
                  </div>
                </div>;
  })}
          </div>
        </div>}

      {
    /* 4. DRILL-DOWN CATALOG & FILTERS */
  }
      <div className="space-y-4">
        {
    /* Tab Controls */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
    type="button"
    onClick={() => setActiveTab("RECOMMENDED")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === "RECOMMENDED" ? "bg-purple-100 text-purple-900 border border-purple-200" : "text-slate-600 hover:bg-slate-100"}`}
  >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Recommended ({smartMatches.length})</span>
            </button>
            <button
    type="button"
    onClick={() => setActiveTab("ALL")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === "ALL" ? "bg-purple-100 text-purple-900 border border-purple-200" : "text-slate-600 hover:bg-slate-100"}`}
  >
              All Surplus ({availableListings.length})
            </button>
            <button
    type="button"
    onClick={() => setActiveTab("ORDERS")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === "ORDERS" ? "bg-indigo-100 text-indigo-900 border border-indigo-200" : "text-slate-600 hover:bg-slate-100"}`}
  >
              My Active Orders ({myReservations.length})
            </button>
            <button
    type="button"
    onClick={() => setActiveTab("HISTORY")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === "HISTORY" ? "bg-emerald-100 text-emerald-900 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"}`}
  >
              Past Deliveries ({completedReservations.length})
            </button>
          </div>

          {
    /* Search bar */
  }
          {(activeTab === "ALL" || activeTab === "RECOMMENDED") && <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search surplus or area..."
    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
            </div>}
        </div>

        {
    /* Filter Badges (if on Catalog) */
  }
        {(activeTab === "ALL" || activeTab === "RECOMMENDED") && <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            <select
    value={localityFilter}
    onChange={(e) => setLocalityFilter(e.target.value)}
    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
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
    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
  >
              <option value="ALL">All Models</option>
              <option value="DONATION">Free Donation (₹0)</option>
              <option value="SOCIAL_PRICE">Social Price</option>
              <option value="RECOVERY_PRICE">Recovery Price</option>
            </select>

            <select
    value={dietaryFilter}
    onChange={(e) => setDietaryFilter(e.target.value)}
    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
  >
              <option value="ALL">All Diets</option>
              <option value="JAIN_VEG">Jain Vegetarian</option>
              <option value="VEG">Pure Vegetarian</option>
              <option value="VEGAN">Vegan</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>}

        {
    /* 5. CONTENT SECTIONS */
  }
        {activeTab === "RECOMMENDED" && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartMatches.length === 0 ? <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No smart matches currently</h3>
                <p className="text-xs text-slate-500">Check the "All Surplus" tab to see all active lots across Surat.</p>
              </div> : smartMatches.map(({ listing, score, explanation }) => {
    const hoursLeft = (new Date(listing.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
    return <div
      key={listing.id}
      className="rounded-2xl bg-white border border-purple-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
    >
                    {listing.imageUrl ? <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                        <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-100 backdrop-blur-md">
                            Smart Match ({score} pts)
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${listing.recoveryModel === "DONATION" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                            {listing.recoveryModel === "DONATION" ? "Free (\u20B90)" : `\u20B9${listing.pricePerUnit}/${listing.unit}`}
                          </span>
                        </div>
                      </div> : <div className="p-3 bg-purple-50 flex items-center justify-between border-b border-purple-100">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Smart Match ({score} pts)
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${listing.recoveryModel === "DONATION" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"}`}>
                          {listing.recoveryModel === "DONATION" ? "Free" : `\u20B9${listing.pricePerUnit}/${listing.unit}`}
                        </span>
                      </div>}

                    <div className="p-4 space-y-2.5 flex-1">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{listing.title}</h3>
                        <p className="text-xs font-semibold text-purple-800 mt-0.5">
                          {listing.quantity} {listing.unit} · {listing.dietaryType}
                        </p>
                      </div>

                      {
      /* Smart Match Reason tags */
    }
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          ✓ {explanation.urgencyLabel}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          ✓ {explanation.proximityLabel}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Expires in: {hoursLeft.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{listing.donorLocality}, Surat</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <button
      type="button"
      onClick={() => openClaimModal(listing)}
      className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
    >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Claim Surplus Food</span>
                      </button>
                    </div>
                  </div>;
  })}
          </div>}

        {activeTab === "ALL" && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.length === 0 ? <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No surplus lots matching criteria</h3>
                <p className="text-xs text-slate-500">Try changing your filters or search terms.</p>
              </div> : filteredCatalog.map((item) => {
    const hoursLeft = (new Date(item.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
    return <div
      key={item.id}
      className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
    >
                    {item.imageUrl ? <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${item.recoveryModel === "DONATION" ? "bg-emerald-900/80 text-emerald-100" : "bg-purple-900/80 text-purple-100"}`}>
                            {item.recoveryModel === "DONATION" ? "Free (\u20B90)" : `\u20B9${item.pricePerUnit}/${item.unit}`}
                          </span>
                        </div>
                      </div> : <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">{item.category}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.recoveryModel === "DONATION" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"}`}>
                          {item.recoveryModel === "DONATION" ? "Free" : `\u20B9${item.pricePerUnit}/${item.unit}`}
                        </span>
                      </div>}

                    <div className="p-4 space-y-2 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      <p className="text-xs font-semibold text-purple-800">
                        {item.quantity} {item.unit} · {item.dietaryType}
                      </p>

                      <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Safe window: {hoursLeft.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.donorLocality}, Surat</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <button
      type="button"
      onClick={() => openClaimModal(item)}
      className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
    >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Claim Surplus Food</span>
                      </button>
                    </div>
                  </div>;
  })}
          </div>}

        {activeTab === "ORDERS" && <div className="space-y-3">
            {myReservations.length === 0 ? <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No active recovery orders</h3>
                <p className="text-xs text-slate-500">Claim surplus from the catalog to initiate deliveries.</p>
              </div> : myReservations.map((res) => {
    const listing = foodListings.find((l) => l.id === res.listingId);
    const pickup = pickups.find((p) => p.reservationId === res.id);
    if (!listing) return null;
    return <div key={res.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={res.status} />
                        <span className="text-xs text-slate-400">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{listing.title}</h4>
                      <p className="text-xs text-slate-600">
                        {res.requestedQuantity} {listing.unit} · Donor: {listing.donorLocality} · Total: ₹{res.finalPayableAmount || 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
      type="button"
      onClick={() => setActiveRecoveryId(res.id)}
      className="py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
    >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Track Recovery</span>
                      </button>

                      {pickup && <button
      type="button"
      onClick={() => setActiveQrModal({ reservation: res, pickup, listing })}
      className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
    >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Receipt QR</span>
                        </button>}
                    </div>
                  </div>;
  })}
          </div>}

        {activeTab === "HISTORY" && <div className="space-y-3">
            {completedReservations.length === 0 ? <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No completed rescues yet</h3>
                <p className="text-xs text-slate-500">Your completed food deliveries and verification receipts will be stored here.</p>
              </div> : completedReservations.map((res) => {
    const listing = foodListings.find((l) => l.id === res.listingId);
    return <div key={res.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Verified & Received
                        </span>
                        <span className="text-xs text-slate-400">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{listing?.title || "Recovered Surplus"}</h4>
                      <p className="text-xs text-slate-500">
                        {res.requestedQuantity} portions received · Delivered to shelter
                      </p>
                    </div>

                    {listing && <button
      type="button"
      onClick={() => setActiveFeedbackModal({
        reservationId: res.id,
        listingId: listing.id,
        toUserId: listing.donorId,
        toUserName: listing.donorLocality,
        toUserRole: "DONOR"
      })}
      className="text-xs font-semibold text-purple-700 hover:underline"
    >
                        Leave Feedback
                      </button>}
                  </div>;
  })}
          </div>}
      </div>

      {
    /* CLAIM / CHECKOUT MODAL */
  }
      {claimModalListing && <Modal
    isOpen={true}
    onClose={() => setClaimModalListing(null)}
    title="Claim Surplus Recovery"
    subtitle={`Reserve portions for ${currentUser.fullName}`}
    maxWidth="md"
  >
          <div className="space-y-4">
            {claimError && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{claimError}</span>
              </div>}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="text-xs font-bold text-slate-900">{claimModalListing.title}</h4>
              <p className="text-xs text-purple-800 font-semibold">
                Available: {claimModalListing.quantity} {claimModalListing.unit} · {claimModalListing.dietaryType}
              </p>
              <p className="text-[11px] text-slate-500">
                Loading bay: {claimModalListing.donorLocality}, Surat
              </p>
            </div>

            {
    /* Quantity Selector */
  }
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portions to Claim ({claimModalListing.unit}) *
              </label>
              <input
    type="number"
    min={1}
    max={claimModalListing.quantity}
    value={claimQuantity}
    onChange={(e) => setClaimQuantity(Math.min(claimModalListing.quantity, Math.max(1, Number(e.target.value))))}
    className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
  />
            </div>

            {
    /* Transparent Cost Breakdown */
  }
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
              <span className="text-xs font-bold text-purple-950">Transparent Cost Breakdown</span>
              
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Food Cost ({claimModalListing.recoveryModel === "DONATION" ? "Free Donation" : `\u20B9${claimModalListing.pricePerUnit} \xD7 ${claimQuantity}`}):</span>
                <span className="font-semibold text-slate-900">₹{(claimModalListing.pricePerUnit || 0) * claimQuantity}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Platform Operational Fee:</span>
                <span className="font-semibold text-emerald-700">₹0 (Sponsored)</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Volunteer Courier Logistics:</span>
                <span className="font-semibold text-emerald-700">₹0 (Community)</span>
              </div>

              <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-sm font-bold text-purple-950">
                <span>Total Due:</span>
                <span>₹{(claimModalListing.pricePerUnit || 0) * claimQuantity}</span>
              </div>
            </div>

            {
    /* Confirm buttons */
  }
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
    type="button"
    onClick={() => setClaimModalListing(null)}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
  >
                Cancel
              </button>
              <button
    type="button"
    onClick={handleConfirmClaim}
    className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
  >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Create Order</span>
              </button>
            </div>
          </div>
        </Modal>}

      {
    /* ASSIGN RIDER MODAL */
  }
      {assignRiderPickup && <Modal
    isOpen={true}
    onClose={() => setAssignRiderPickup(null)}
    title="Assign Volunteer Courier"
    subtitle="Dispatch a verified courier for this surplus recovery"
    maxWidth="sm"
  >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Available Volunteer *
              </label>
              <select
    value={selectedVolunteerId}
    onChange={(e) => setSelectedVolunteerId(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium"
  >
                {activeVolunteers.map((v) => <option key={v.id} value={v.id}>
                    {v.fullName} ({v.locality || "Surat"})
                  </option>)}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
    type="button"
    onClick={() => setAssignRiderPickup(null)}
    className="px-4 py-2 text-xs font-semibold text-slate-600"
  >
                Cancel
              </button>
              <button
    type="button"
    onClick={handleAssignRider}
    className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
  >
                Assign Courier
              </button>
            </div>
          </div>
        </Modal>}

      {activeQrModal && <QRDisplayModal
    isOpen={true}
    onClose={() => setActiveQrModal(null)}
    reservation={activeQrModal.reservation}
    pickup={activeQrModal.pickup}
    listing={activeQrModal.listing}
  />}

      {activeFeedbackModal && <FeedbackModal
    isOpen={true}
    onClose={() => setActiveFeedbackModal(null)}
    reservationId={activeFeedbackModal.reservationId}
    listingId={activeFeedbackModal.listingId}
    toUserId={activeFeedbackModal.toUserId}
    toUserName={activeFeedbackModal.toUserName}
    toUserRole={activeFeedbackModal.toUserRole}
  />}
    </div>;
};
export {
  NgoDashboard
};
