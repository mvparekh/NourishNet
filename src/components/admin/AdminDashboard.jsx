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
  Check
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NeedsAttentionBanner } from "../dashboard/NeedsAttentionBanner";
import { WidgetCard } from "../dashboard/WidgetCard";
import { CustomizeDashboardModal } from "../dashboard/CustomizeDashboardModal";
import { ContextualHelpModal } from "../dashboard/ContextualHelpModal";
import { SuratRescueMap } from "../map/SuratRescueMap";
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
    forceRemoveListing,
    moderationLogs,
    outcomeMetrics
  } = useApp();

  const {
    config,
    saveConfig,
    toggleCollapse
  } = useDashboardConfig(currentUser);

  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [adminNotes, setAdminNotes] = useState({});
  const [incidentResolutionNotes, setIncidentResolutionNotes] = useState({});
  const [userSearchTerm, setUserSearchTerm] = useState("");
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
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="card-warm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
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
                  <p className="text-[#8D6E63] text-[11px] mt-0.5">
                    {u.email} · {u.locality || "Surat"} · {u.phone || "No phone"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
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
            ))}
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
