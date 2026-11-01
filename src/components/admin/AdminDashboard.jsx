import { useState } from "react";
import {
  FileCheck2,
  AlertTriangle,
  Users,
  Sparkles,
  History,
  SlidersHorizontal,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Trash2,
  Copy,
  Check,
  Truck,
  Clock,
  Package
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NeedsAttentionBanner } from "../dashboard/NeedsAttentionBanner";
import { WidgetCard } from "../dashboard/WidgetCard";
import { CustomizeDashboardModal } from "../dashboard/CustomizeDashboardModal";
import { ContextualHelpModal } from "../dashboard/ContextualHelpModal";
import { SuratRescueMap } from "../map/SuratRescueMap";
import { StatusBadge } from "../common/StatusBadge";
import { useDashboardConfig } from "../../hooks/useDashboardConfig";
import { ALL_WIDGETS } from "../../services/dashboardConfig";

const AdminDashboard = () => {
  const {
    currentUser,
    joinApplications,
    reviewApplication,
    issueReports,
    resolveIssueReport,
    users,
    toggleUserSuspension,
    foodListings,
    reservations = [],
    pickups = [],
    assignVolunteerToPickup,
    forceRemoveListing,
    moderationLogs,
    outcomeMetrics
  } = useApp();

  const {
    config,
    saveConfig,
    toggleCollapse
  } = useDashboardConfig(currentUser);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const pending = sessionStorage.getItem("nourishnet_pending_tab");
      if (pending) {
        sessionStorage.removeItem("nourishnet_pending_tab");
        return pending;
      }
    } catch {}
    return "DASHBOARD";
  });
  const [adminNotes, setAdminNotes] = useState({});
  const [incidentResolutionNotes, setIncidentResolutionNotes] = useState({});
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [selectedVolForOrder, setSelectedVolForOrder] = useState("");
  const [issuedTokens, setIssuedTokens] = useState({});
  const [copiedTokenId, setCopiedTokenId] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return null;
  }

  const pendingApps = joinApplications.filter(
    (a) => a.status === "APPLIED" || a.status === "UNDER_REVIEW"
  );
  const openIncidents = issueReports.filter(
    (r) => r.status === "OPEN" || r.status === "UNDER_REVIEW"
  );
  const filteredUsers = users.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.locality && u.locality.toLowerCase().includes(q))
    );
  });

  const activeVolunteers = users.filter((u) => u.role === "VOLUNTEER" && u.isActive);

  const filteredOrders = reservations.filter((r) => {
    const listing = foodListings.find((l) => l.id === r.listingId);
    if (orderFilter === "UNASSIGNED" && r.assignedVolunteerId) return false;
    if (orderFilter === "ASSIGNED" && (r.status !== "ASSIGNED" && r.status !== "VOLUNTEER_ASSIGNED")) return false;
    if (orderFilter === "IN_TRANSIT" && (r.status !== "IN_TRANSIT" && r.status !== "PICKED_UP" && r.status !== "PICKUP_STARTED" && r.status !== "VOLUNTEER_EN_ROUTE")) return false;
    if (orderFilter === "COMPLETED" && r.status !== "COMPLETED") return false;
    if (orderFilter === "CANCELLED" && r.status !== "CANCELLED") return false;
    if (orderFilter === "OVERDUE") {
      const isUnassigned = !r.assignedVolunteerId && r.status !== "COMPLETED" && r.status !== "CANCELLED";
      const isExpired = listing && listing.expiresAt && listing.expiresAt <= new Date().toISOString() && r.status !== "COMPLETED";
      if (!isUnassigned && !isExpired) return false;
    }

    if (!orderSearchTerm) return true;
    const q = orderSearchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      (r.ngoName && r.ngoName.toLowerCase().includes(q)) ||
      (r.assignedVolunteerName && r.assignedVolunteerName.toLowerCase().includes(q)) ||
      (listing?.title && listing.title.toLowerCase().includes(q)) ||
      (listing?.donorName && listing.donorName.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q))
    );
  });

  const handleAdminAssignVolunteer = async (orderId) => {
    if (!selectedVolForOrder) return;
    await assignVolunteerToPickup(orderId, selectedVolForOrder);
    setAssigningOrderId(null);
    setSelectedVolForOrder("");
  };

  const getWidgetDef = (id) => ALL_WIDGETS.find((w) => w.id === id);
  const shouldRenderWidget = (widgetId) => {
    if (!config.visibleWidgets.includes(widgetId)) return false;
    const def = getWidgetDef(widgetId);
    return !!def;
  };

  const handleApprove = async (appId) => {
    const note = adminNotes[appId] || "Approved by Surat operations admin";
    const res = await reviewApplication(appId, "APPROVED", note);
    if (res?.setupToken) {
      setIssuedTokens((prev) => ({ ...prev, [appId]: res.setupToken }));
    }
  };

  const handleReject = async (appId) => {
    const note = adminNotes[appId] || "Does not meet verification standards";
    await reviewApplication(appId, "REJECTED", note);
  };

  const handleResolveIncident = async (incidentId) => {
    const notes = incidentResolutionNotes[incidentId] || "Resolved following platform audit";
    await resolveIssueReport(incidentId, "RESOLVED", notes);
  };

  const copyToken = (tokenId, tokenVal) => {
    navigator.clipboard?.writeText(tokenVal);
    setCopiedTokenId(tokenId);
    setTimeout(() => setCopiedTokenId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#2C1810] via-[#3D2319] to-[#2C1810] text-[#FAF7F2] shadow-md border border-[#5D4037] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#C85A32] text-white">
              City Administration Hub
            </span>
            <span className="text-xs text-[#D7CCC8]">Surat Operations Command</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-[#D7CCC8] max-w-xl">
            Surat food recovery network governance. Verify applicant credentials, arbitrate dispute reports, and moderate listings.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FAF7F2]/10 p-3.5 rounded-xl backdrop-blur-sm border border-[#FAF7F2]/15">
          <div className="text-center px-2">
            <p className="text-xs text-[#D7CCC8]">Pending Apps</p>
            <p className="text-xl font-extrabold text-white">{pendingApps.length}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2">
            <p className="text-xs text-[#D7CCC8]">Open Incidents</p>
            <p className="text-xl font-extrabold text-[#E07A5F]">{openIncidents.length}</p>
          </div>
        </div>
      </div>

      {/* Needs Attention Alert Layer */}
      <NeedsAttentionBanner currentUser={currentUser} />

      {/* Action Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7DCD5]">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#F5EFEB] rounded-xl border border-[#E7DCD5]">
          <button
            type="button"
            onClick={() => setActiveTab("DASHBOARD")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "DASHBOARD"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            id="admin-tab-orders"
            onClick={() => setActiveTab("ORDERS")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "ORDERS"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Orders & Recoveries ({reservations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("APPLICATIONS")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "APPLICATIONS"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#5D4037]" />
            <span>Pending Approvals ({pendingApps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INCIDENTS")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "INCIDENTS"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Disputes ({openIncidents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("USERS")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "USERS"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#5D4037]" />
            <span>Users ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("AUDIT")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "AUDIT"
                ? "bg-white text-[#2C1810] shadow-xs ring-1 ring-[#C85A32]"
                : "text-[#5D4037] hover:text-[#2C1810]"
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#5D4037]" />
            <span>Audit Trail</span>
          </button>
        </div>

        {activeTab === "DASHBOARD" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomizeOpen(true)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#5D4037]" />
              <span>Customize Widgets</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Tab: Overview Dashboard with Configurable Widgets */}
      {activeTab === "DASHBOARD" && (
        <div className="space-y-6">
          {config.widgetOrder.map((widgetId) => {
            if (!shouldRenderWidget(widgetId)) return null;
            const widgetDef = getWidgetDef(widgetId);
            if (!widgetDef) return null;
            const isCollapsed = !!config.collapsedWidgets[widgetId];

            if (widgetId === "admin_pending_applications") {
              return (
                <WidgetCard
                  key={widgetId}
                  widget={widgetDef}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapse(widgetId)}
                  count={pendingApps.length}
                  onViewAll={() => setActiveTab("APPLICATIONS")}
                  viewAllLabel="Open full verification queue"
                >
                  {pendingApps.length === 0 ? (
                    <p className="text-xs text-[#8D6E63] text-center py-4">
                      All applications reviewed and processed.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pendingApps.slice(0, 2).map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-xl bg-[#F5EFEB] border border-[#E7DCD5] text-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-[#2C1810]">{app.organizationName}</h4>
                              <p className="text-[11px] text-[#8D6E63]">
                                {app.applicantName} · {app.locality}, Surat
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5D4037] border border-[#E7DCD5]">
                              {app.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5D4037]">
                            Reg #: {app.registrationNumber || "Pending"} · FSSAI: {app.fssaiNumber || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </WidgetCard>
              );
            }

            if (widgetId === "admin_reported_issues") {
              return (
                <WidgetCard
                  key={widgetId}
                  widget={widgetDef}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapse(widgetId)}
                  count={openIncidents.length}
                  onViewAll={() => setActiveTab("INCIDENTS")}
                  viewAllLabel="Open all incident escalations"
                >
                  {openIncidents.length === 0 ? (
                    <p className="text-xs text-[#8D6E63] text-center py-4">
                      Zero open incidents. Surat logistics healthy.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {openIncidents.slice(0, 2).map((inc) => (
                        <div
                          key={inc.id}
                          className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white">
                              {inc.category.replace("_", " ")}
                            </span>
                            <span className="text-[#8D6E63] text-[10px]">
                              {new Date(inc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-bold text-[#2C1810]">{inc.description}</p>
                          <p className="text-[11px] text-[#5D4037]">
                            Reported by: {inc.reportedByUserName} ({inc.reportedByUserRole})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </WidgetCard>
              );
            }

            if (widgetId === "admin_surat_map") {
              return (
                <WidgetCard
                  key={widgetId}
                  widget={widgetDef}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapse(widgetId)}
                >
                  <SuratRescueMap compact={false} />
                </WidgetCard>
              );
            }

            if (widgetId === "admin_network_impact") {
              return (
                <WidgetCard
                  key={widgetId}
                  widget={widgetDef}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapse(widgetId)}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#F5EFEB] border border-[#E7DCD5]">
                      <p className="text-[11px] font-semibold text-[#8D6E63]">Total Food Rescued</p>
                      <p className="text-xl font-extrabold text-[#C85A32] mt-1">
                        {outcomeMetrics.totalKgRecovered} kg
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5EFEB] border border-[#E7DCD5]">
                      <p className="text-[11px] font-semibold text-[#8D6E63]">Meals Distributed</p>
                      <p className="text-xl font-extrabold text-[#2C1810] mt-1">
                        {outcomeMetrics.estimatedMealsSaved}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5EFEB] border border-[#E7DCD5]">
                      <p className="text-[11px] font-semibold text-[#8D6E63]">Recovery Rate</p>
                      <p className="text-xl font-extrabold text-[#5D4037] mt-1">
                        {outcomeMetrics.recoveryRate}%
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5EFEB] border border-[#E7DCD5]">
                      <p className="text-[11px] font-semibold text-[#8D6E63]">Active Participants</p>
                      <p className="text-xl font-extrabold text-[#2C1810] mt-1">
                        {users.length}
                      </p>
                    </div>
                  </div>
                </WidgetCard>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Tab: Real-Time Operational Orders & Deliveries */}
      {activeTab === "ORDERS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#2C1810]">
                Surat Surplus Recoveries & Logistics Dispatch ({filteredOrders.length})
              </h3>
              <p className="text-xs text-[#8D6E63]">
                Authoritative cross-dashboard operational view of all active claims, delivery partners, and delivery handoffs.
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-[#8D6E63] absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                placeholder="Search order ID, item, NGO, delivery partner..."
                className="input-warm w-full pl-9 text-xs"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "ALL", label: `All Orders (${reservations.length})` },
              { id: "UNASSIGNED", label: `Unassigned (${reservations.filter((r) => !r.assignedVolunteerId && r.status !== "COMPLETED" && r.status !== "CANCELLED").length})` },
              { id: "ASSIGNED", label: `Assigned (${reservations.filter((r) => r.status === "ASSIGNED" || r.status === "VOLUNTEER_ASSIGNED").length})` },
              { id: "IN_TRANSIT", label: `In Transit (${reservations.filter((r) => r.status === "IN_TRANSIT" || r.status === "PICKED_UP" || r.status === "PICKUP_STARTED" || r.status === "VOLUNTEER_EN_ROUTE").length})` },
              { id: "COMPLETED", label: `Completed (${reservations.filter((r) => r.status === "COMPLETED").length})` },
              { id: "CANCELLED", label: `Cancelled (${reservations.filter((r) => r.status === "CANCELLED").length})` },
              { id: "OVERDUE", label: `Needs Attention` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOrderFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  orderFilter === f.id
                    ? "bg-[#C85A32] text-white border-[#C85A32] shadow-xs"
                    : "bg-[#F5EFEB] text-[#5D4037] border-[#E7DCD5] hover:bg-[#EFE5DF]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Orders Grid / Cards */}
          {filteredOrders.length === 0 ? (
            <div className="card-warm p-8 text-center space-y-2">
              <Package className="w-8 h-8 text-[#C85A32] mx-auto opacity-70" />
              <h4 className="font-bold text-[#2C1810] text-sm">No Recoveries Match Criteria</h4>
              <p className="text-xs text-[#8D6E63]">
                Try adjusting your search query or selecting a different status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((res) => {
                const listing = foodListings.find((l) => l.id === res.listingId);
                const pickup = pickups.find((p) => p.reservationId === res.id);
                const isUnassigned = !res.assignedVolunteerId && res.status !== "COMPLETED" && res.status !== "CANCELLED";
                const isOverdue = isUnassigned && (Date.now() - new Date(res.createdAt).getTime() > 30 * 60 * 1000);
                const latestStep = res.timeline && res.timeline.length > 0 ? res.timeline[res.timeline.length - 1] : null;

                return (
                  <div
                    key={res.id}
                    className="card-warm p-4 space-y-3 text-xs border border-[#E7DCD5] hover:border-[#C85A32]/40 transition-all"
                  >
                    {/* Header: ID, Status, Timestamps */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7DCD5]/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#2C1810] text-[#FAF7F2]">
                          {res.id}
                        </span>
                        <StatusBadge status={res.status} />
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-rose-600" />
                            Overdue (&gt;30m Unassigned)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8D6E63] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>Created: {new Date(res.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>· Updated: {new Date(res.updatedAt || res.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Column 1: Food & Donor */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">Food Item & Donor</p>
                        <p className="font-bold text-sm text-[#2C1810]">
                          {listing?.title || "Food Surplus"}
                        </p>
                        <p className="text-xs text-[#5D4037]">
                          <strong>{res.requestedQuantity}</strong> {listing?.unit || "Plates"} · {listing?.donorName || "Donor"} ({listing?.donorLocality || "Surat"})
                        </p>
                      </div>

                      {/* Column 2: Recipient NGO */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">Recipient Shelter</p>
                        <p className="font-bold text-sm text-[#2C1810]">
                          {res.ngoName}
                        </p>
                        <p className="text-xs text-[#8D6E63]">
                          Contact: {res.ngoPhone || "Surat Relief Unit"}
                        </p>
                      </div>

                      {/* Column 3: Logistics & Volunteer Assignment */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">Assigned Delivery Partner</p>
                        {res.assignedVolunteerName ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-[#2C1810] flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                                {res.assignedVolunteerName}
                              </p>
                              <p className="text-[11px] text-[#8D6E63]">
                                {res.assignedVolunteerPhone || "Active Delivery Partner"}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Dispatched
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-xs text-rose-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Delivery Partner Not Assigned
                            </p>
                            {assigningOrderId === res.id ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <select
                                  value={selectedVolForOrder}
                                  onChange={(e) => setSelectedVolForOrder(e.target.value)}
                                  className="input-warm text-xs py-1 px-2 flex-1"
                                >
                                  <option value="">Select active delivery partner...</option>
                                  {activeVolunteers.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.fullName} ({v.locality || "Surat"})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleAdminAssignVolunteer(res.id)}
                                  disabled={!selectedVolForOrder}
                                  className="btn-terracotta text-xs px-2.5 py-1 whitespace-nowrap"
                                >
                                  Assign
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAssigningOrderId(null)}
                                  className="btn-secondary text-xs px-2 py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningOrderId(res.id);
                                  setSelectedVolForOrder(activeVolunteers[0]?.id || "");
                                }}
                                className="btn-terracotta text-xs px-2.5 py-1 flex items-center gap-1"
                              >
                                <span>+ Assign Delivery Partner</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: Latest Timeline Event */}
                    {latestStep && (
                      <div className="pt-2 border-t border-[#E7DCD5]/40 flex items-center justify-between text-[11px] text-[#8D6E63]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Latest Update: <strong className="text-[#2C1810]">{latestStep.label}</strong></span>
                        </span>
                        <span>Actor: {latestStep.actorName} ({latestStep.actorRole})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Applications Queue */}
      {activeTab === "APPLICATIONS" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2C1810]">Surat Verification Queue</h3>
          {pendingApps.length === 0 ? (
            <p className="text-xs text-[#8D6E63] py-8 text-center bg-white rounded-xl border border-[#E7DCD5]">
              No pending applications in queue.
            </p>
          ) : (
            pendingApps.map((app) => (
              <div
                key={app.id}
                className="card-warm p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#2C1810]">
                      {app.organizationName || app.applicantName}
                    </h4>
                    <p className="text-xs text-[#8D6E63]">
                      {app.applicantName} ({app.email}) · {app.locality}, Surat
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#F5EFEB] text-[#5D4037] border border-[#E7DCD5]">
                    {app.role}
                  </span>
                </div>

                {issuedTokens[app.id] ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <p className="font-bold text-emerald-800">Application Approved & Setup Token Generated:</p>
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-emerald-300 font-mono text-[11px]">
                      <span className="truncate pr-2">{issuedTokens[app.id]}</span>
                      <button
                        type="button"
                        onClick={() => copyToken(app.id, issuedTokens[app.id])}
                        className="btn-secondary text-[11px] px-2 py-0.5 flex items-center gap-1 shrink-0"
                      >
                        {copiedTokenId === app.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTokenId === app.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-[#E7DCD5]">
                    <input
                      type="text"
                      placeholder="Admin notes (optional)"
                      value={adminNotes[app.id] || ""}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({ ...prev, [appId]: e.target.value }))
                      }
                      className="input-warm w-full text-xs"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleReject(app.id)}
                        className="btn-secondary text-xs px-3 py-1.5 text-rose-700 hover:bg-rose-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(app.id)}
                        className="btn-terracotta text-xs px-4 py-1.5 shadow-sm"
                      >
                        Approve & Issue Token
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Reported Incidents */}
      {activeTab === "INCIDENTS" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2C1810]">Reported Incidents & Dispute Resolution</h3>
          {openIncidents.length === 0 ? (
            <p className="text-xs text-[#8D6E63] py-8 text-center bg-white rounded-xl border border-[#E7DCD5]">
              No active incidents to resolve.
            </p>
          ) : (
            openIncidents.map((inc) => (
              <div
                key={inc.id}
                className="card-warm p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                      {inc.category.replace("_", " ")}
                    </span>
                    <h4 className="text-sm font-bold text-[#2C1810] mt-1.5">{inc.description}</h4>
                    <p className="text-xs text-[#8D6E63]">
                      Reported by {inc.reportedByUserName} ({inc.reportedByUserRole}) · {new Date(inc.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E7DCD5]">
                  <input
                    type="text"
                    placeholder="Resolution notes"
                    value={incidentResolutionNotes[inc.id] || ""}
                    onChange={(e) =>
                      setIncidentResolutionNotes((prev) => ({
                        ...prev,
                        [inc.id]: e.target.value
                      }))
                    }
                    className="input-warm w-full text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleResolveIncident(inc.id)}
                      className="btn-primary text-xs px-4 py-1.5"
                    >
                      Resolve & Close Incident
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === "USERS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#2C1810]">
              User Accounts & Governance ({filteredUsers.length})
            </h3>
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-[#8D6E63] absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search user, role, email, locality..."
                className="input-warm w-full pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => {
              const userStats = (() => {
                if (u.role === "DONOR") {
                  const userListings = foodListings.filter((l) => l.donorId === u.id);
                  const totalKg = userListings.reduce((sum, l) => sum + (l.quantityKg || l.quantity || 0), 0);
                  const completed = userListings.filter((l) => l.status === "COMPLETED").length;
                  return [
                    { label: "Listings", val: userListings.length },
                    { label: "Donated", val: `${Math.round(totalKg)} kg` },
                    { label: "Completed", val: completed }
                  ];
                }
                if (u.role === "RECEIVER" || u.role === "NGO") {
                  const userRes = reservations.filter((r) => r.ngoId === u.id || r.userId === u.id);
                  const completed = userRes.filter((r) => r.status === "COMPLETED" || r.status === "DELIVERED").length;
                  const active = userRes.filter((r) => ["CONFIRMED", "IN_TRANSIT", "ASSIGNED"].includes(r.status)).length;
                  return [
                    { label: "Claims", val: userRes.length },
                    { label: "Received", val: completed },
                    { label: "Active", val: active }
                  ];
                }
                if (u.role === "VOLUNTEER") {
                  const userPickups = pickups.filter((p) => p.assignedVolunteerId === u.id);
                  const completed = userPickups.filter((p) => p.status === "COMPLETED" || p.status === "DELIVERED").length;
                  const active = userPickups.filter((p) => ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(p.status)).length;
                  return [
                    { label: "Tasks", val: userPickups.length },
                    { label: "Delivered", val: completed },
                    { label: "Active", val: active }
                  ];
                }
                return [];
              })();

              return (
                <div
                  key={u.id}
                  className="card-warm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#2C1810]">{u.fullName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#F5EFEB] text-[#5D4037] border border-[#E7DCD5]">
                        {u.role}
                      </span>
                      {!u.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-100 text-rose-800">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-[#8D6E63] text-[11px]">
                      {u.email} · {u.locality || "Surat"} · {u.phone || "No phone"}
                    </p>
                    {userStats.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {userStats.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                          >
                            <span className="text-emerald-600 font-normal">{s.label}:</span>
                            <span className="font-bold">{s.val}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleUserSuspension(u.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        u.isActive
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {u.isActive ? "Suspend User" : "Activate User"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Audit Trail & Moderation Logs */}
      {activeTab === "AUDIT" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2C1810]">
            Platform Moderation Audit Trail ({moderationLogs.length})
          </h3>
          <div className="space-y-2">
            {moderationLogs.map((log) => (
              <div
                key={log.id}
                className="card-warm p-3 text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2C1810]">{log.actionType}</span>
                    <span className="text-[#8D6E63] text-[10px]">Target: {log.targetType} ({log.targetId})</span>
                  </div>
                  <p className="text-[#5D4037] text-[11px] mt-0.5">{log.reason}</p>
                </div>
                <span className="text-[10px] text-[#8D6E63] shrink-0 font-mono">
                  {new Date(log.performedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isCustomizeOpen && (
        <CustomizeDashboardModal
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          currentUser={currentUser}
          currentConfig={config}
          onSaveConfig={saveConfig}
        />
      )}

      {isHelpOpen && (
        <ContextualHelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          role={currentUser.role}
        />
      )}
    </div>
  );
};

export { AdminDashboard };
