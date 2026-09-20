import { useState } from "react";
import {
  UserPlus,
  Trash2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AdminDashboard } from "./AdminDashboard";
import { Modal } from "../common/Modal";
const SuperAdminDashboard = () => {
  const { currentUser, users, inviteAdminAccount, revokeAdminAccount } = useApp();
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("+91 98250 ");
  const [canVerify, setCanVerify] = useState(true);
  const [canIncidents, setCanIncidents] = useState(true);
  const [canAudit, setCanAudit] = useState(true);
  const [canUsers, setCanUsers] = useState(true);
  const [canListings, setCanListings] = useState(true);
  const [generatedInviteToken, setGeneratedInviteToken] = useState(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [revokingAdmin, setRevokingAdmin] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return null;
  }
  const currentAdmins = users.filter((u) => u.role === "ADMIN");
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const res = await inviteAdminAccount({
      fullName: adminName,
      email: adminEmail,
      phone: adminPhone,
      permissions: {
        canVerifyOrganizations: canVerify,
        canManageIncidents: canIncidents,
        canAccessAuditLogs: canAudit,
        canManageUsers: canUsers,
        canModerateListings: canListings
      }
    });
    if (res.success && res.setupToken) {
      setGeneratedInviteToken(res.setupToken);
    } else {
      setIsCreateAdminOpen(false);
      setAdminName("");
      setAdminEmail("");
    }
  };
  return <div className="space-y-6">
      {
    /* Super Admin Control Bar */
  }
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Governance Council Authority</h2>
            <p className="text-xs text-slate-400">
              Super Admin Console · Managing {currentAdmins.length} City Administrators in Surat
            </p>
          </div>
        </div>

        <button
    type="button"
    onClick={() => setIsCreateAdminOpen(true)}
    className="px-4 py-2 text-xs font-bold text-slate-900 bg-gradient-to-r from-purple-300 to-fuchsia-300 hover:from-purple-200 hover:to-fuchsia-200 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
  >
          <UserPlus className="w-4 h-4" />
          <span>Issue Admin Credential</span>
        </button>
      </div>

      {
    /* City Admins Management List */
  }
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Authorized City Operations Admins</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentAdmins.map((admin) => <div key={admin.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{admin.fullName}</p>
                <p className="text-slate-500 text-[11px]">{admin.email} · {admin.locality}</p>
              </div>

              <button
    type="button"
    onClick={() => {
      setRevokingAdmin({ id: admin.id, fullName: admin.fullName });
      setRevokeReason("");
    }}
    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
  >
                <Trash2 className="w-3 h-3" />
                <span>Revoke</span>
              </button>
            </div>)}
        </div>
      </div>

      {
    /* Standard Admin Dashboard Views */
  }
      <AdminDashboard />

      {
    /* Create Admin Modal */
  }
      <Modal
    isOpen={isCreateAdminOpen}
    onClose={() => {
      setIsCreateAdminOpen(false);
      setGeneratedInviteToken(null);
      setAdminName("");
      setAdminEmail("");
    }}
    title="Issue City Admin Credential"
    subtitle="Provision a designated administrator for Surat food rescue governance"
    maxWidth="lg"
  >
        {generatedInviteToken ? <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Admin Account Provisioned</span>
              </div>
              <p className="text-xs text-emerald-700">
                A secure setup token has been issued for <strong>{adminEmail}</strong>. Provide this token to the administrator so they can set their own secure password via "Activate Account" on the login screen.
              </p>
              <div className="mt-2 p-3 bg-white rounded-lg border border-emerald-300 font-mono text-xs break-all flex items-center justify-between">
                <span>{generatedInviteToken}</span>
                <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText(generatedInviteToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2500);
    }}
    className="px-2.5 py-1 text-[11px] font-sans font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded shrink-0 ml-2 transition-colors"
  >
                  {tokenCopied ? "Copied!" : "Copy Token"}
                </button>
              </div>
              <p className="text-[11px] text-emerald-600">
                Expires in 48 hours. No temporary passwords are ever used.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
    type="button"
    onClick={() => {
      setIsCreateAdminOpen(false);
      setGeneratedInviteToken(null);
      setAdminName("");
      setAdminEmail("");
    }}
    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
  >
                Done
              </button>
            </div>
          </div> : <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Official Full Name *
            </label>
            <input
    type="text"
    required
    value={adminName}
    onChange={(e) => setAdminName(e.target.value)}
    placeholder="e.g. Meera Vashi"
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <input
    type="email"
    required
    value={adminEmail}
    onChange={(e) => setAdminEmail(e.target.value)}
    placeholder="meera@nourishnet.in"
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
    type="text"
    required
    value={adminPhone}
    onChange={(e) => setAdminPhone(e.target.value)}
    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
  />
            </div>
          </div>

          {
    /* Granular Permissions */
  }
          <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
            <span className="font-semibold text-purple-950 block">Granular Admin Privileges</span>
            <label className="flex items-center gap-2">
              <input
    type="checkbox"
    checked={canVerify}
    onChange={(e) => setCanVerify(e.target.checked)}
    className="accent-purple-600 rounded"
  />
              <span>Verify & Approve Organizations (FSSAI/Trusts)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
    type="checkbox"
    checked={canIncidents}
    onChange={(e) => setCanIncidents(e.target.checked)}
    className="accent-purple-600 rounded"
  />
              <span>Manage & Resolve Incident Reports</span>
            </label>
            <label className="flex items-center gap-2">
              <input
    type="checkbox"
    checked={canAudit}
    onChange={(e) => setCanAudit(e.target.checked)}
    className="accent-purple-600 rounded"
  />
              <span>Access Cryptographic Audit Trail</span>
            </label>
            <label className="flex items-center gap-2">
              <input
    type="checkbox"
    checked={canListings}
    onChange={(e) => setCanListings(e.target.checked)}
    className="accent-purple-600 rounded"
  />
              <span>Moderate & Force Remove Food Listings</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
    type="button"
    onClick={() => setIsCreateAdminOpen(false)}
    className="px-4 py-2 text-xs font-semibold text-slate-600"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
  >
              Authorize Admin
            </button>
          </div>
        </form>}
      </Modal>

      {
    /* Revoke Admin Credentials Modal */
  }
      <Modal
    isOpen={!!revokingAdmin}
    onClose={() => {
      setRevokingAdmin(null);
      setRevokeReason("");
    }}
    title="Revoke Administrator Access"
  >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <p className="font-bold">Caution: Irreversible Governance Action</p>
            <p className="text-[11px] mt-0.5">
              You are revoking administrative and moderation privileges for{" "}
              <span className="font-semibold">{revokingAdmin?.fullName}</span>.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Official Justification / Audit Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
    value={revokeReason}
    onChange={(e) => setRevokeReason(e.target.value)}
    placeholder="e.g. Governance rotation, volunteer team change, or compliance breach"
    rows={3}
    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none resize-none"
  />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
    type="button"
    onClick={() => {
      setRevokingAdmin(null);
      setRevokeReason("");
    }}
    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
  >
              Cancel
            </button>
            <button
    type="button"
    disabled={!revokeReason.trim()}
    onClick={() => {
      if (revokingAdmin && revokeReason.trim()) {
        revokeAdminAccount(revokingAdmin.id, revokeReason.trim());
        setRevokingAdmin(null);
        setRevokeReason("");
      }
    }}
    className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
  >
              Revoke Credentials
            </button>
          </div>
        </div>
      </Modal>
    </div>;
};
export {
  SuperAdminDashboard
};
