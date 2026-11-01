import {
  AlertTriangle,
  Clock,
  ArrowRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";
const NeedsAttentionBanner = ({ onAction }) => {
  const {
    currentUser,
    foodListings,
    reservations,
    pickups,
    joinApplications,
    issueReports
  } = useApp();
  if (!currentUser) return null;
  const attentionItems = [];
  if (currentUser.role === "DONOR") {
    const myListings = foodListings.filter(
      (l) => l.donorId === currentUser.id && l.status === "AVAILABLE"
    );
    myListings.forEach((listing) => {
      const hoursLeft = (new Date(listing.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60);
      if (hoursLeft > 0 && hoursLeft <= 2) {
        attentionItems.push({
          id: `exp-${listing.id}`,
          title: `Surplus Expiring in ${Math.round(hoursLeft * 60)} mins`,
          message: `"${listing.title}" (${listing.quantity} ${listing.unit.toLowerCase()}) at ${listing.donorLocality} needs urgent recovery.`,
          severity: "CRITICAL",
          actionLabel: "Check Matches",
          actionType: "VIEW_MATCHES",
          targetId: listing.id,
          deadlineMinutes: Math.round(hoursLeft * 60)
        });
      }
    });
    const myPendingReservations = reservations.filter((r) => {
      const listing = foodListings.find((l) => l.id === r.listingId);
      return listing?.donorId === currentUser.id && (r.status === "CONFIRMED" || r.status === "VOLUNTEER_ASSIGNED");
    });
    myPendingReservations.forEach((res) => {
      const pickup = pickups.find((p) => p.reservationId === res.id);
      if (pickup && pickup.status === "ASSIGNED") {
        attentionItems.push({
          id: `pickup-${pickup.id}`,
          title: "Delivery Partner Assigned for Pickup",
          message: `Delivery partner is heading to your loading bay for reservation #${res.id.slice(-4)}.`,
          severity: "WARNING",
          actionLabel: "View QR Code",
          actionType: "VIEW_QR",
          targetId: res.id
        });
      }
    });
  }
  if (currentUser.role === "NGO") {
    const myUnassigned = reservations.filter(
      (r) => r.ngoId === currentUser.id && (r.status === "REQUESTED" || r.status === "CONFIRMED") && !r.assignedVolunteerId
    );
    myUnassigned.forEach((res) => {
      const listing = foodListings.find((l) => l.id === res.listingId);
      attentionItems.push({
        id: `unassigned-${res.id}`,
        title: "Dispatch Delivery Partner Needed",
        message: `Reserved batch "${listing?.title || "Surplus"}" requires a Delivery Partner to initiate pickup.`,
        severity: "CRITICAL",
        actionLabel: "Assign Delivery Partner",
        actionType: "ASSIGN_COURIER",
        targetId: res.id
      });
    });
  }
  if (currentUser.role === "VOLUNTEER") {
    const myActiveTrips = reservations.filter(
      (r) => r.assignedVolunteerId === currentUser.id && (r.status === "VOLUNTEER_ASSIGNED" || r.status === "PICKUP_IN_PROGRESS")
    );
    myActiveTrips.forEach((res) => {
      const pickup = pickups.find((p) => p.reservationId === res.id);
      const listing = foodListings.find((l) => l.id === res.listingId);
      if (pickup) {
        attentionItems.push({
          id: `trip-${res.id}`,
          title: pickup.status === "IN_TRANSIT" ? "Delivery In Transit" : "Pickup Awaiting Handoff",
          message: `${listing?.title || "Relief batch"} (${res.requestedQuantity} portions) ready for loading bay QR scan.`,
          severity: "CRITICAL",
          actionLabel: "Scan QR Token",
          actionType: "VERIFY_QR",
          targetId: res.id
        });
      }
    });
  }
  if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
    const pendingApps = joinApplications.filter(
      (a) => a.status === "APPLIED" || a.status === "UNDER_REVIEW"
    );
    if (pendingApps.length > 0) {
      attentionItems.push({
        id: "admin-pending-apps",
        title: `${pendingApps.length} Verification Applications Pending`,
        message: "New Surat food donors, NGOs, or delivery partners require license & FSSAI document review.",
        severity: "WARNING",
        actionLabel: "Review Queue",
        actionType: "REVIEW_APP"
      });
    }
    const openIssues = issueReports.filter(
      (i) => i.status === "OPEN" || i.status === "UNDER_REVIEW"
    );
    if (openIssues.length > 0) {
      attentionItems.push({
        id: "admin-open-issues",
        title: `${openIssues.length} Safety/Dispute Incidents Open`,
        message: "Urgent reports submitted by participants regarding food condition or delayed pickups.",
        severity: "CRITICAL",
        actionLabel: "Resolve Incidents",
        actionType: "RESOLVE_ISSUE"
      });
    }
  }
  if (attentionItems.length === 0) return null;
  return <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span>Action Required Immediately ({attentionItems.length})</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {attentionItems.map((item) => {
    const isCritical = item.severity === "CRITICAL";
    return <div
      key={item.id}
      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCritical ? "bg-rose-50/80 border-rose-200 text-rose-950 shadow-xs" : "bg-amber-50/80 border-amber-200 text-amber-950 shadow-xs"}`}
    >
              <div className="flex items-start gap-3">
                <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCritical ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}`}
    >
                  {isCritical ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold leading-tight">{item.title}</h4>
                  <p className="text-[11px] opacity-90">{item.message}</p>
                </div>
              </div>

              {item.actionLabel && <button
      type="button"
      onClick={() => onAction && onAction(item.actionType || "", item.targetId)}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto ${isCritical ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs" : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"}`}
    >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>}
            </div>;
  })}
      </div>
    </div>;
};
export {
  NeedsAttentionBanner
};
