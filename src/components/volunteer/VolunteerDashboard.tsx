import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Star,
  AlertTriangle,
  Sparkles,
  Navigation,
  ArrowRight,
  TrendingUp,
  Package,
  ChevronRight,
  AlertCircle,
  Car,
  Key,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { QRScannerModal } from '../qr/QRScannerModal';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { ReportIssueModal } from '../feedback/ReportIssueModal';
import { ActiveRecoveryView } from '../recovery/ActiveRecoveryView';
import { Modal } from '../common/Modal';

export const VolunteerDashboard: React.FC = () => {
  const {
    currentUser,
    reservations,
    pickups,
    foodListings,
    updatePickupStatus,
    assignVolunteerToPickup,
    verifyHandoffOtp,
  } = useApp();

  const [activeRecoveryId, setActiveRecoveryId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'AVAILABLE_QUEUE' | 'COMPLETED'>('ACTIVE');

  // Manual OTP Verification Modal
  const [manualOtpModal, setManualOtpModal] = useState<{
    reservationId: string;
    pickupId: string;
    step: 'DONOR' | 'NGO';
  } | null>(null);
  const [manualOtpValue, setManualOtpValue] = useState('');
  const [manualOtpError, setManualOtpError] = useState('');
  const [manualOtpSuccess, setManualOtpSuccess] = useState('');

  const [activeFeedbackModal, setActiveFeedbackModal] = useState<{
    reservationId: string;
    listingId: string;
    toUserId: string;
    toUserName: string;
    toUserRole: 'DONOR' | 'NGO';
  } | null>(null);

  if (!currentUser) return null;

  // Volunteer's assigned active reservations
  const myAssignedReservations = reservations.filter(
    (r) => r.assignedVolunteerId === currentUser.id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  );

  // Completed trips
  const completedTrips = reservations.filter(
    (r) => r.assignedVolunteerId === currentUser.id && r.status === 'COMPLETED'
  );

  // Unassigned pickups awaiting volunteer in Surat
  const unassignedPickups = pickups.filter((p) => !p.volunteerId && p.status === 'PENDING');

  const totalMealsDelivered = completedTrips.reduce((sum, r) => sum + r.requestedQuantity, 0);

  const handleClaimPickup = (pickupId: string) => {
    assignVolunteerToPickup(pickupId, currentUser.id);
    setActiveTab('ACTIVE');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOtpModal) return;
    setManualOtpError('');
    setManualOtpSuccess('');

    const stage = manualOtpModal.step === 'DONOR' ? 'DONOR_TO_VOLUNTEER' : 'VOLUNTEER_TO_NGO';
    const res = verifyHandoffOtp(manualOtpModal.pickupId, manualOtpValue.trim(), stage);
    if (res.success) {
      setManualOtpSuccess('Verification successful!');
      setTimeout(() => {
        setManualOtpModal(null);
        setManualOtpValue('');
        setManualOtpSuccess('');
      }, 1500);
    } else {
      setManualOtpError(res.errorMessage || 'Invalid OTP code. Please check with donor/NGO.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Verified Relief Courier
            </span>
            <span className="text-xs text-purple-200">{currentUser.locality || 'Surat'}, Surat</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.fullName}</h1>
          <p className="text-xs text-purple-200/90 max-w-xl">
            Transport surplus food safely across Surat. Verify handoffs via QR scan or backup 6-digit OTP.
          </p>
        </div>

        <button
          id="volunteer-scan-qr-btn"
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Handoff QR Code</span>
        </button>
      </div>

      {/* 2. SUMMARY METRICS (Summary → Drill-down → Action) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Deliveries</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-900 mt-2">{myAssignedReservations.length}</p>
          <p className="text-[11px] text-indigo-700 mt-0.5">Trips in progress</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available in Surat</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-900 mt-2">{unassignedPickups.length}</p>
          <p className="text-[11px] text-purple-700 mt-0.5">Awaiting courier claim</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Rescues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-2">{completedTrips.length}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">{totalMealsDelivered} meals transported</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Reliability Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">99.4%</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Verified on-time handoffs</p>
        </div>
      </div>

      {/* 3. ACTIVE PICKUPS COMMAND HUB */}
      {myAssignedReservations.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Active Recovery Trip ({myAssignedReservations.length})
              </h2>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Task-Specific Route</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {myAssignedReservations.map((res) => {
              const listing = foodListings.find((l) => l.id === res.listingId);
              const pickup = pickups.find((p) => p.reservationId === res.id);
              if (!listing) return null;

              const donorHandoff = pickup?.handoffs?.find((h) => h.stage === 'DONOR_TO_VOLUNTEER');
              const ngoHandoff = pickup?.handoffs?.find((h) => h.stage === 'VOLUNTEER_TO_NGO');
              const isDonorDone = donorHandoff ? donorHandoff.isVerified : (pickup?.status === 'IN_TRANSIT' || pickup?.status === 'COMPLETED');
              const isNgoDone = ngoHandoff ? ngoHandoff.isVerified : (pickup?.status === 'COMPLETED');

              const isAtDonorStage = !isDonorDone;
              const isAtNgoStage = isDonorDone && !isNgoDone;

              return (
                <div key={res.id} className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                          {isAtDonorStage ? 'Step 1: Pick up from Donor' : 'Step 2: Deliver to Shelter'}
                        </span>
                        <StatusBadge status={res.status} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{listing.title}</h3>
                      <p className="text-xs text-slate-500">
                        {res.requestedQuantity} {listing.unit} · {listing.dietaryType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRecoveryId(res.id)}
                        className="py-2 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Open Live Route & Map</span>
                      </button>
                    </div>
                  </div>

                  {/* Two-Stage Progress Flow */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Stage 1: Donor */}
                    <div className={`p-3 rounded-xl border ${
                      isDonorDone
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isAtDonorStage
                        ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-600/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">1. Pickup (Donor Loading Bay)</span>
                        {isDonorDone ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            Active Step
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 truncate">{listing.pickupAddress}</p>
                      
                      {!isDonorDone && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="flex-1 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Scan Donor QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualOtpModal({ reservationId: res.id, pickupId: pickup?.id || '', step: 'DONOR' })}
                            className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                          >
                            Enter OTP
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage 2: NGO */}
                    <div className={`p-3 rounded-xl border ${
                      isNgoDone
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isAtNgoStage
                        ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-600/10'
                        : 'bg-slate-50 border-slate-200 opacity-80'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">2. Dropoff (Receiving Shelter)</span>
                        {isNgoDone ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ✓ Verified
                          </span>
                        ) : isAtNgoStage ? (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            Active Step
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Pending Stage 1</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 truncate">{res.ngoName} Shelter</p>

                      {isAtNgoStage && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="flex-1 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Scan NGO QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualOtpModal({ reservationId: res.id, pickupId: pickup?.id || '', step: 'NGO' })}
                            className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
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
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Assigned Pickups ({myAssignedReservations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AVAILABLE_QUEUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'AVAILABLE_QUEUE'
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Available in Surat Queue ({unassignedPickups.length})
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
            Delivered History ({completedTrips.length})
          </button>
        </div>

        {/* Tab 1: Available Pickups Queue */}
        {activeTab === 'AVAILABLE_QUEUE' && (
          <div className="space-y-3">
            {unassignedPickups.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">All pickups currently assigned</h3>
                <p className="text-xs text-slate-500">New rescue requests from Surat NGOs will appear here in real time.</p>
              </div>
            ) : (
              unassignedPickups.map((p) => {
                const res = reservations.find((r) => r.id === p.reservationId);
                const listing = foodListings.find((l) => l.id === res?.listingId);
                if (!res || !listing) return null;

                return (
                  <div key={p.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          Needs Courier
                        </span>
                        <span className="text-xs text-slate-400">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{listing.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span>📦 {res.requestedQuantity} {listing.unit}</span>
                        <span>📍 From: {listing.donorLocality}</span>
                        <span>🎯 To: {res.ngoName}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimPickup(p.id)}
                      className="py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all shrink-0"
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
        {activeTab === 'ACTIVE' && (
          <div className="space-y-3">
            {myAssignedReservations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No active deliveries assigned</h3>
                <p className="text-xs text-slate-500">Go to the "Available in Surat Queue" tab to accept a pending pickup.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('AVAILABLE_QUEUE')}
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold"
                >
                  View Available Pickups
                </button>
              </div>
            ) : (
              myAssignedReservations.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                if (!listing) return null;

                return (
                  <div key={res.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{listing.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {res.requestedQuantity} {listing.unit} · Delivering to {res.ngoName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveRecoveryId(res.id)}
                      className="py-2 px-3 rounded-lg bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5"
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
        {activeTab === 'COMPLETED' && (
          <div className="space-y-3">
            {completedTrips.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No completed deliveries yet</h3>
                <p className="text-xs text-slate-500">Completed deliveries with verified timestamps will be recorded here.</p>
              </div>
            ) : (
              completedTrips.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                return (
                  <div key={res.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Successfully Delivered
                        </span>
                        <span className="text-xs text-slate-400">Order #{res.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{listing?.title || 'Recovered Surplus'}</h4>
                      <p className="text-xs text-slate-500">
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
          title={`Enter ${manualOtpModal.step === 'DONOR' ? 'Donor' : 'Shelter'} Handoff OTP`}
          subtitle="Backup 6-digit cryptographic verification code"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit Handoff Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={manualOtpValue}
                onChange={(e) => setManualOtpValue(e.target.value)}
                placeholder="e.g. 582914"
                className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setManualOtpModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
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
