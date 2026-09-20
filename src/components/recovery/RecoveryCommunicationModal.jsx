import { useState } from "react";
import {
  Phone,
  MessageSquare,
  Send,
  X,
  ShieldCheck,
  CheckCircle2,
  Flag
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { maskPhoneNumber } from "../../services/security";
const QUICK_PRESETS = [
  "I'm 5\u20138 minutes away with thermal insulated crates.",
  "Please pull up to Rear Gate 3 loading dock.",
  "Food is packed, sealed, and ready at the counter.",
  "Arrived at destination relief shelter gate.",
  "Slight traffic delay on Ring Road, updated ETA +10 mins.",
  "Need help locating the exact service entry."
];
const RecoveryCommunicationModal = ({
  reservation,
  listing,
  initialMode = "MESSAGE",
  onClose
}) => {
  const {
    currentUser,
    recoveryMessages,
    sendRecoveryMessage,
    reportRecoveryMessage
  } = useApp();
  const [activeTab, setActiveTab] = useState(initialMode);
  const [inputText, setInputText] = useState("");
  const [isCallingInitiated, setIsCallingInitiated] = useState(false);
  const [reportingMsgId, setReportingMsgId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const isVolunteer = currentUser?.role === "VOLUNTEER";
  const isDonor = currentUser?.role === "DONOR";
  const isNgo = currentUser?.role === "NGO";
  const counterpartyName = isVolunteer ? listing.donorName : isDonor ? reservation.assignedVolunteerName || reservation.ngoName : reservation.assignedVolunteerName || listing.donorName;
  const counterpartyPhone = isVolunteer ? listing.donorPhone : isDonor ? reservation.assignedVolunteerPhone || reservation.ngoPhone || "+91 94268 77310" : reservation.assignedVolunteerPhone || listing.donorPhone;
  const messages = recoveryMessages.filter((m) => m.reservationId === reservation.id);
  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    sendRecoveryMessage(reservation.id, text, !!textToSend);
    if (!textToSend) setInputText("");
  };
  const handleReport = (msgId) => {
    if (!reportReason.trim()) return;
    reportRecoveryMessage(msgId, reportReason);
    setReportingMsgId(null);
    setReportReason("");
  };
  return <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {
    /* Header */
  }
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Recovery Coordination</span>
            </h3>
            <p className="text-xs text-slate-400">
              Active Channel with <strong>{counterpartyName}</strong>
            </p>
          </div>
          <button
    type="button"
    onClick={onClose}
    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Tab Switcher */
  }
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
    type="button"
    onClick={() => setActiveTab("MESSAGE")}
    className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeTab === "MESSAGE" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
  >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Operational Notes ({messages.length})</span>
          </button>
          <button
    type="button"
    onClick={() => setActiveTab("CALL")}
    className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeTab === "CALL" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
  >
            <Phone className="w-3.5 h-3.5" />
            <span>Direct Call</span>
          </button>
        </div>

        {
    /* Tab Content */
  }
        {activeTab === "MESSAGE" ? <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden">
            {
    /* Quick Presets Carousel / Badges */
  }
            <div className="mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                ⚡ Quick Operational Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset, idx) => <button
    key={idx}
    type="button"
    onClick={() => handleSendMessage(preset)}
    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-medium text-left transition-colors"
  >
                    + {preset}
                  </button>)}
              </div>
            </div>

            {
    /* Message Stream */
  }
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-2 min-h-[160px] max-h-[260px]">
              {messages.length === 0 ? <div className="text-center py-8 text-slate-400 text-xs">
                  No coordination notes yet. Tap a quick preset above to update arrival status.
                </div> : messages.map((msg) => {
    const isMine = msg.senderId === currentUser?.id;
    return <div
      key={msg.id}
      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">{msg.senderName}</span>
                        <span>({msg.senderRole})</span>
                        <span>· {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
      className={`p-3 rounded-2xl text-xs max-w-[85%] ${msg.isReported ? "bg-rose-50 text-rose-800 border border-rose-200" : isMine ? "bg-purple-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none"}`}
    >
                        <p>{msg.text}</p>
                        {msg.isReported && <div className="mt-1 text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            <span>Flagged for moderation: {msg.reportReason}</span>
                          </div>}
                      </div>

                      {
      /* Report Action for incoming messages */
    }
                      {!isMine && !msg.isReported && <button
      type="button"
      onClick={() => setReportingMsgId(msg.id)}
      className="mt-1 text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
    >
                          <Flag className="w-2.5 h-2.5" />
                          <span>Report note</span>
                        </button>}
                    </div>;
  })}
            </div>

            {
    /* In-Line Report Dialog */
  }
            {reportingMsgId && <div className="my-2 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <span className="text-xs font-bold text-rose-800 block">Report Inappropriate Note:</span>
                <input
    type="text"
    placeholder="Reason (e.g. Unsafe conduct, harassment, false info)..."
    value={reportReason}
    onChange={(e) => setReportReason(e.target.value)}
    className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white"
  />
                <div className="flex justify-end gap-2">
                  <button
    type="button"
    onClick={() => setReportingMsgId(null)}
    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
  >
                    Cancel
                  </button>
                  <button
    type="button"
    onClick={() => handleReport(reportingMsgId)}
    className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
  >
                    Submit Report
                  </button>
                </div>
              </div>}

            {
    /* Input Bar */
  }
            <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
              <input
    type="text"
    placeholder="Type a coordination update..."
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
              <button
    type="button"
    onClick={() => handleSendMessage()}
    disabled={!inputText.trim()}
    className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
  >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div> : (
    // --- DIRECT CALLING TAB ---
    <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
              <Phone className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-bold text-lg text-slate-900">{counterpartyName}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Contact: <strong className="font-mono">{maskPhoneNumber(counterpartyPhone)}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privacy-Preserving Contact</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Calls are strictly for active recovery coordination (loading gate directions, gate access pass, transit delay updates).
              </p>
            </div>

            {isCallingInitiated ? <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="font-bold">Dialer Triggered</p>
                <p className="text-[11px]">Connecting directly to {counterpartyName}...</p>
              </div> : <a
      href={`tel:${counterpartyPhone.replace(/\s+/g, "")}`}
      onClick={() => setIsCallingInitiated(true)}
      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all inline-block"
    >
                <Phone className="w-4 h-4" />
                <span>Call {counterpartyName} Now</span>
              </a>}
          </div>
  )}
      </div>
    </div>;
};
export {
  RecoveryCommunicationModal
};
