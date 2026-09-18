import React, { useState } from 'react';
import {
  Plus,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
  Truck,
  Leaf,
  Calendar,
  Navigation,
  ArrowRight,
  TrendingUp,
  Tag,
  IndianRupee,
  Phone,
  MessageSquare,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodListing, Reservation, Pickup } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AddListingModal } from './AddListingModal';
import { QRDisplayModal } from '../qr/QRDisplayModal';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { ReportIssueModal } from '../feedback/ReportIssueModal';
import { ActiveRecoveryView } from '../recovery/ActiveRecoveryView';

export const DonorDashboard: React.FC = () => {
  const { currentUser, foodListings, reservations, pickups, cancelListing } = useApp();

  const [activeRecoveryId, setActiveRecoveryId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPIRING' | 'RESERVED' | 'COMPLETED'>('ALL');

  const [activeQrModal, setActiveQrModal] = useState<{
    reservation: Reservation;
    pickup: Pickup;
    listing: FoodListing;
  } | null>(null);

  const [activeFeedbackModal, setActiveFeedbackModal] = useState<{
    reservationId: string;
    listingId: string;
    toUserId: string;
    toUserName: string;
    toUserRole: 'NGO' | 'VOLUNTEER';
  } | null>(null);

  const [activeIssueModal, setActiveIssueModal] = useState<{
    reservationId?: string;
    listingId?: string;
    reportedAgainstUserId?: string;
    reportedAgainstUserName?: string;
  } | null>(null);

  if (!currentUser) return null;

  // Filter donor listings
  const myListings = foodListings.filter((l) => l.donorId === currentUser.id);
  const activeListings = myListings.filter((l) => l.status === 'AVAILABLE' || l.status === 'RESERVED');
  const pastListings = myListings.filter((l) => l.status === 'COMPLETED' || l.status === 'CANCELLED' || l.status === 'EXPIRED');

  // Expiring soon (<3 hours)
  const expiringSoonListings = activeListings.filter((l) => {
    const hoursLeft = (new Date(l.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 3;
  });

  // Active reservations in progress
  const activeReservations = reservations.filter((r) => {
    const listing = foodListings.find((l) => l.id === r.listingId);
    return listing?.donorId === currentUser.id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
  });

  // Stats
  const donorKgRescued = myListings
    .filter((l) => l.status === 'COMPLETED')
    .reduce((sum, l) => sum + (l.unit === 'KG' ? l.quantity : l.quantity * 0.45), 0);

  const completedCount = myListings.filter((l) => l.status === 'COMPLETED').length;

  const filteredListings = myListings.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'EXPIRING') {
      const hoursLeft = (new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
      return item.status === 'AVAILABLE' && hoursLeft > 0 && hoursLeft <= 3;
    }
    if (activeTab === 'RESERVED') return item.status === 'RESERVED';
    if (activeTab === 'COMPLETED') return item.status === 'COMPLETED';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Verified Food Donor
            </span>
            <span className="text-xs text-purple-200">
              {currentUser.locality || 'Surat'}, Surat
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.fullName}</h1>
          <p className="text-xs text-purple-200/90 max-w-xl">
            Surplus meals are matched instantly to accredited shelters and routed via verified volunteer couriers.
          </p>
        </div>

        <button
          id="donor-list-surplus-btn"
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ List Surplus Food</span>
        </button>
      </div>

      {/* 2. SUMMARY METRICS (Summary → Drill-down → Action) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Listings</span>
            <UtensilsCrossed className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeListings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Surplus lots ready for rescue</p>
        </div>

        <div className={`p-4 rounded-xl bg-white border shadow-xs ${expiringSoonListings.length > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expiring Soon (&lt;3h)</span>
            <Clock className={`w-4 h-4 ${expiringSoonListings.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 mt-2">{expiringSoonListings.length}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Urgent prioritization active</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Pickups</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeReservations.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">In transit or awaiting handoff</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Rescued</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-2">{donorKgRescued.toFixed(0)} <span className="text-xs font-normal text-slate-500">kg</span></p>
          <p className="text-[11px] text-emerald-700 mt-0.5">{completedCount} recoveries completed</p>
        </div>
      </div>

      {/* 3. ACTIVE RECOVERIES HUB (Only when movement or handoff is needed) */}
      {activeReservations.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Active Rescue Handoffs in Progress ({activeReservations.length})
              </h2>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Verified Courier Routing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeReservations.map((res) => {
              const listing = foodListings.find((l) => l.id === res.listingId);
              const pickup = pickups.find((p) => p.reservationId === res.id);
              if (!listing) return null;

              return (
                <div key={res.id} className="p-3.5 rounded-xl bg-white border border-indigo-200/70 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{listing.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Claimed by: <span className="font-semibold text-purple-900">{res.ngoName}</span>
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-medium text-slate-700">
                        {res.assignedVolunteerName ? `Rider: ${res.assignedVolunteerName}` : 'Assigning Courier...'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-purple-700 font-bold">
                      {res.requestedQuantity} {listing.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveRecoveryId(res.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Pickup</span>
                    </button>

                    {pickup && (
                      <button
                        type="button"
                        onClick={() => setActiveQrModal({ reservation: res, pickup, listing })}
                        className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1"
                        title="Show Donor Handoff QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Handoff Code</span>
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
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Surplus ({myListings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('EXPIRING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'EXPIRING'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Expiring Soon ({expiringSoonListings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RESERVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'RESERVED'
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Claimed / Reserved ({activeReservations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No surplus listings in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Publish fresh surplus food whenever you have extra thalis, catering leftovers, or bakery surplus.
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-all shadow-xs"
            >
              + List Surplus Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((item) => {
              const hoursLeft = (new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
              const isExpiring = item.status === 'AVAILABLE' && hoursLeft > 0 && hoursLeft <= 3;
              const res = reservations.find((r) => r.listingId === item.id && r.status !== 'CANCELLED');
              const pickup = res ? pickups.find((p) => p.reservationId === res.id) : null;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Photo or Header */}
                  {item.imageUrl ? (
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                          item.recoveryModel === 'DONATION'
                            ? 'bg-emerald-900/80 text-emerald-100'
                            : item.recoveryModel === 'SOCIAL_PRICE'
                            ? 'bg-purple-900/80 text-purple-100'
                            : 'bg-amber-900/80 text-amber-100'
                        }`}>
                          {item.recoveryModel === 'DONATION' ? 'Free Donation (₹0)' : item.recoveryModel === 'SOCIAL_PRICE' ? `Social Price: ₹${item.pricePerUnit}/${item.unit}` : `Recovery: ₹${item.pricePerUnit}/${item.unit}`}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.recoveryModel === 'DONATION'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.recoveryModel === 'DONATION' ? 'Free Donation' : `₹${item.pricePerUnit}/${item.unit}`}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      <p className="text-xs font-semibold text-purple-800 mt-1">
                        {item.quantity} {item.unit} · {item.dietaryType}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className={isExpiring ? 'font-bold text-amber-700' : ''}>
                          {item.status === 'COMPLETED'
                            ? 'Recovered successfully'
                            : hoursLeft > 0
                            ? `Safe window: ${hoursLeft.toFixed(1)}h remaining`
                            : 'Expired'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.pickupAddress}</span>
                      </div>

                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-slate-400">Allergens:</span>
                          <span className="text-[10px] font-medium text-slate-700 truncate">
                            {item.allergens.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {item.status === 'AVAILABLE' ? (
                      <>
                        <span className="text-[11px] text-slate-500 font-medium">Awaiting shelter claim</span>
                        <button
                          type="button"
                          onClick={() => cancelListing(item.id, 'Donor cancelled manually')}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : item.status === 'RESERVED' && res ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveRecoveryId(res.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Track Pickup</span>
                        </button>

                        {pickup && (
                          <button
                            type="button"
                            onClick={() => setActiveQrModal({ reservation: res, pickup, listing: item })}
                            className="py-1.5 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Code</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Rescued & Verified
                        </span>
                        {res && (
                          <button
                            type="button"
                            onClick={() => setActiveFeedbackModal({
                              reservationId: res.id,
                              listingId: item.id,
                              toUserId: res.ngoId,
                              toUserName: res.ngoName,
                              toUserRole: 'NGO',
                            })}
                            className="text-[11px] font-semibold text-purple-700 hover:underline"
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
