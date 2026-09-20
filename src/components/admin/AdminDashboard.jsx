import { useState } from "react";
import {
  FileCheck2,
  AlertTriangle,
  Users,
  Sparkles,
  History,
  SlidersHorizontal,
  Layers
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NeedsAttentionBanner } from "../dashboard/NeedsAttentionBanner";
import { WidgetCard } from "../dashboard/WidgetCard";
import { CustomizeDashboardModal } from "../dashboard/CustomizeDashboardModal";
import { FocusOnboardingModal } from "../dashboard/FocusOnboardingModal";
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
    toggleCollapse,
    toggleFocusMode,
    applyPreset,
    resetToDefault
  } = useDashboardConfig(currentUser);
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [adminNotes, setAdminNotes] = useState({});
  const [incidentResolutionNotes, setIncidentResolutionNotes] = useState({});
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [issuedTokens, setIssuedTokens] = useState({});
  const [copiedTokenId, setCopiedTokenId] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isFocusOnboardingOpen, setIsFocusOnboardingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  if (!currentUser || currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    return null;
  }
  const pendingApps = joinApplications.filter((a) => a.status === "APPLIED" || a.status === "UNDER_REVIEW");
  const openIncidents = issueReports.filter((r) => r.status === "OPEN" || r.status === "UNDER_REVIEW");
  const filteredUsers = users.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.locality.toLowerCase().includes(q);
  });
  const getWidgetDef = (id) => ALL_WIDGETS.find((w) => w.id === id);
  const shouldRenderWidget = (widgetId) => {
    if (!config.visibleWidgets.includes(widgetId)) return false;
    const def = getWidgetDef(widgetId);
    if (!def) return false;
    if (config.focusMode && def.level > 2) return false;
    return true;
  };
  return <div className="space-y-6">
      {
    /* Top Banner */
  }
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
              City Administration Hub
            </span>
            <span className="text-xs text-purple-200">Surat Operations Command</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{currentUser.fullName}</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Surat platform governance. Verify applicant credentials, investigate incident reports, and audit transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/15">
          <div className="text-center px-2">
            <p className="text-xs text-purple-200">Pending Apps</p>
            <p className="text-lg font-bold text-white">{pendingApps.length}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2">
            <p className="text-xs text-purple-200">Open Incidents</p>
            <p className="text-lg font-bold text-amber-300">{openIncidents.length}</p>
          </div>
        </div>
      </div>

      {
    /* Needs Attention Alert Layer */
  }
      <NeedsAttentionBanner onAction={(type) => {
    if (type === "REVIEW_APP") setActiveTab("APPLICATIONS");
    if (type === "RESOLVE_ISSUE") setActiveTab("INCIDENTS");
  }} />

      {
    /* Navigation & View Modes */
  }
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
    type="button"
    onClick={() => setActiveTab("DASHBOARD")}
    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "DASHBOARD" ? "bg-white text-purple-950 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
  >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
            <span>Overview Dashboard</span>
          </button>

          <button
    type="button"
    onClick={() => setActiveTab("APPLICATIONS")}
    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "APPLICATIONS" ? "bg-white text-purple-950 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
  >
            <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
            <span>Verification Queue ({pendingApps.length})</span>
          </button>

          <button
    type="button"
    onClick={() => setActiveTab("INCIDENTS")}
    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "INCIDENTS" ? "bg-white text-purple-950 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
  >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Incidents ({openIncidents.length})</span>
          </button>

          <button
    type="button"
    onClick={() => setActiveTab("USERS")}
    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "USERS" ? "bg-white text-purple-950 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
  >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Users ({users.length})</span>
          </button>

          <button
    type="button"
    onClick={() => setActiveTab("AUDIT")}
    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === "AUDIT" ? "bg-white text-purple-950 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
  >
            <History className="w-3.5 h-3.5 text-slate-700" />
            <span>Audit Trail</span>
          </button>
        </div>

        {activeTab === "DASHBOARD" && <div className="flex items-center gap-2 pr-2">
            <button
    type="button"
    onClick={toggleFocusMode}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${config.focusMode ? "bg-purple-700 text-white" : "bg-white text-slate-700"}`}
  >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.focusMode ? "Focus ON" : "Focus Mode"}</span>
            </button>

            <button
    type="button"
    onClick={() => setIsCustomizeOpen(true)}
    className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1"
  >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Customize</span>
            </button>
          </div>}
      </div>

      {
    /* Main Tab: Overview Dashboard with Configurable Widgets */
  }
      {activeTab === "DASHBOARD" && <div className="space-y-6">
          {config.widgetOrder.map((widgetId) => {
    if (!shouldRenderWidget(widgetId)) return null;
    const widgetDef = getWidgetDef(widgetId);
    if (!widgetDef) return null;
    const isCollapsed = !!config.collapsedWidgets[widgetId];
    if (widgetId === "admin_pending_applications") {
      return <WidgetCard
        key={widgetId}
        widget={widgetDef}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleCollapse(widgetId)}
        count={pendingApps.length}
        onViewAll={() => setActiveTab("APPLICATIONS")}
        viewAllLabel="Open full verification queue"
      >
                  {pendingApps.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">All applications reviewed and processed.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pendingApps.slice(0, 2).map((app) => <div key={app.id} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900">{app.organizationName}</h4>
                              <p className="text-[11px] text-slate-500">{app.applicantName} · {app.locality}, Surat</p>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                              {app.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">Reg #: {app.registrationNumber || "Pending"} · FSSAI: {app.fssaiNumber || "N/A"}</p>
                        </div>)}
                    </div>}
                </WidgetCard>;
    }
    if (widgetId === "admin_reported_issues") {
      return <WidgetCard
        key={widgetId}
        widget={widgetDef}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleCollapse(widgetId)}
        count={openIncidents.length}
        onViewAll={() => setActiveTab("INCIDENTS")}
        viewAllLabel="Open all incident escalations"
      >
                  {openIncidents.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">Zero open incidents. Surat logistics healthy.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {openIncidents.slice(0, 2).map((inc) => <div key={inc.id} className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-600 text-white">
                              {inc.category.replace("_", " ")}
                            </span>
                            <span className="text-slate-400 text-[10px]">{new Date(inc.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="font-bold text-slate-900">{inc.description}</p>
                          <p className="text-[11px] text-slate-500">Reported by: {inc.reportedByUserName} ({inc.reportedByUserRole})</p>
                        </div>)}
                    </div>}
                </WidgetCard>;
    }
    if (widgetId === "admin_surat_map") {
      return <WidgetCard
        key={widgetId}
        widget={widgetDef}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleCollapse(widgetId)}
      >
                  <SuratRescueMap compact={false} />
                </WidgetCard>;
    }
    if (widgetId === "admin_network_impact") {
      return <WidgetCard
        key={widgetId}
        widget={widgetDef}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleCollapse(widgetId)}
      >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500">Total Food Diverted</p>
                      <p className="text-xl font-extrabold text-purple-700 mt-1">{outcomeMetrics.totalKgRecovered} kg</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500">Meals Distributed</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">{outcomeMetrics.estimatedMealsSaved}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500">Overall Success Rate</p>
                      <p className="text-xl font-extrabold text-emerald-600 mt-1">{outcomeMetrics.recoveryRate}%</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500">Active Participants</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">{users.length}</p>
                    </div>
                  </div>
                </WidgetCard>;
    }
    return null;
  })}
        </div>}

      {
    /* Tab: Applications Queue */
  }
      {activeTab === "APPLICATIONS" && <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Surat Verification Queue</h3>
          {pendingApps.length === 0 ? <p className="text-xs text-slate-500 py-6 text-center bg-white rounded-xl border border-slate-200">
              No pending applications in queue.
            </p> : pendingApps.map((app) => <div key={app.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.organizationName || app.applicantName}</h4>
                    <p className="text-xs text-slate-500">{app.applicantName} ({app.email}) · {app.locality}, Surat</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">{app.role}</span>
                </div>
                {issuedTokens[app.id] ? <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <p className="font-bold text-emerald-800">Application Approved & Setup Token Generated:</p>
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-emerald-300 font-mono text-[11px]">
                      <span className="truncate pr-2">{issuedTokens[app.id]}</span>
                      <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText(issuedTokens[app.id]);
      setCopiedTokenId(app.id);
      setTimeout(() => setCopiedTokenId(null), 2500);
    }}
    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-sans text-[10px] shrink-0 font-semibold transition-colors"
  >
                        {copiedTokenId === app.id ? "Copied!" : "Copy Token"}
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-600">The applicant can use this token under "Activate Account" to set their password.</p>
                  </div> : <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
    type="button"
    onClick={async () => {
      const res = await reviewApplication(app.id, "APPROVED", "Verified by Admin after documentation check");
      if (res.success && res.setupToken) {
        setIssuedTokens((prev) => ({ ...prev, [app.id]: res.setupToken }));
      }
    }}
    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
  >
                      Approve Application
                    </button>
                    <button
    type="button"
    onClick={() => reviewApplication(app.id, "REJECTED", "Missing required certificates")}
    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
  >
                      Reject
                    </button>
                  </div>}
              </div>)}
        </div>}

      {
    /* Tab: Incidents */
  }
      {activeTab === "INCIDENTS" && <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Food Safety & Incident Queue</h3>
          {openIncidents.length === 0 ? <p className="text-xs text-slate-500 py-6 text-center bg-white rounded-xl border border-slate-200">
              No open incidents reported.
            </p> : openIncidents.map((inc) => <div key={inc.id} className="p-4 rounded-xl bg-white border border-rose-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                      {inc.category.replace("_", " ")}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{inc.description}</h4>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(inc.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
    type="text"
    placeholder="Resolution notes..."
    value={incidentResolutionNotes[inc.id] || ""}
    onChange={(e) => setIncidentResolutionNotes({ ...incidentResolutionNotes, [inc.id]: e.target.value })}
    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
  />
                  <button
    type="button"
    onClick={() => resolveIssueReport(inc.id, incidentResolutionNotes[inc.id] || "Resolved", "RESOLVED")}
    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl"
  >
                    Mark Resolved
                  </button>
                </div>
              </div>)}
        </div>}

      {
    /* Tab: Users */
  }
      {activeTab === "USERS" && <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Surat Network Directory</h3>
            <input
    type="text"
    placeholder="Search users..."
    value={userSearchTerm}
    onChange={(e) => setUserSearchTerm(e.target.value)}
    className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
  />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.map((u) => <div key={u.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{u.fullName}</h4>
                  <p className="text-slate-500 text-[11px]">{u.email} · {u.role} · {u.locality}</p>
                </div>
                <button
    type="button"
    onClick={() => toggleUserSuspension(u.id, "Admin action")}
    className={`px-3 py-1 text-xs font-semibold rounded-lg ${u.isActive ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700" : "bg-emerald-100 text-emerald-800"}`}
  >
                  {u.isActive ? "Suspend" : "Activate"}
                </button>
              </div>)}
          </div>
        </div>}

      {
    /* Tab: Audit */
  }
      {activeTab === "AUDIT" && <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Cryptographic Governance Audit Log</h3>
          <div className="space-y-2">
            {moderationLogs.map((log) => <div key={log.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{log.action.replace("_", " ")} on {log.targetName}</p>
                  <p className="text-slate-500 text-[11px]">{log.reason} · by Admin {log.adminName}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>)}
          </div>
        </div>}

      {
    /* Modals */
  }
      {isCustomizeOpen && <CustomizeDashboardModal
    isOpen={isCustomizeOpen}
    onClose={() => setIsCustomizeOpen(false)}
    currentUser={currentUser}
    currentConfig={config}
    onSaveConfig={saveConfig}
  />}
      {isFocusOnboardingOpen && <FocusOnboardingModal
    isOpen={isFocusOnboardingOpen}
    onClose={() => setIsFocusOnboardingOpen(false)}
    currentUser={currentUser}
    onSelectPreset={applyPreset}
  />}
      {isHelpOpen && <ContextualHelpModal
    isOpen={isHelpOpen}
    onClose={() => setIsHelpOpen(false)}
    role={currentUser.role}
  />}
    </div>;
};
export {
  AdminDashboard
};
