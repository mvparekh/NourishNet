import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  QrCode,
  Sparkles,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';

interface ContextualHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  contextPage?: string;
}

export const ContextualHelpModal: React.FC<ContextualHelpModalProps> = ({
  isOpen,
  onClose,
  role,
  contextPage = 'dashboard',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contextual Operating Guide"
      subtitle="Plain-language guidance on workflows, safety standards, and verification"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Section 1: Role-Specific Core Workflow */}
        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2">
          <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>
              {role === 'DONOR' && 'Food Donor Quick Guide'}
              {role === 'NGO' && 'NGO Partner Operations Guide'}
              {role === 'VOLUNTEER' && 'Relief Courier Field Guide'}
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && 'City Governance & Safety Guide'}
            </span>
          </div>

          <p className="text-purple-900 leading-relaxed">
            {role === 'DONOR' &&
              'Post surplus batches when excess prepared meals, banquet food, or fresh produce are ready. Specify storage type (Hot Insulated, Refrigerated) to ensure food safety compliance across Surat.'}
            {role === 'NGO' &&
              'Smart Match ranks available food by travel distance to your shelter, portion size fit, and remaining expiry countdown. After claiming food, assign a volunteer courier to pick it up.'}
            {role === 'VOLUNTEER' &&
              'Receive dispatch alerts for assigned pickups. Follow the Surat navigation map to the donor loading bay and present your app to scan the single-use QR token.'}
            {(role === 'ADMIN' || role === 'SUPER_ADMIN') &&
              'Verify new applicant registrations against Gujarat Trust & FSSAI databases. Resolve escalated incidents promptly to protect community public health.'}
          </p>
        </div>

        {/* Section 2: Cryptographic QR Verification */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <QrCode className="w-4 h-4 text-purple-700" />
            <span>How Loading Bay Verification Works</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Every food handoff is secured by a single-use cryptographic token. When the courier arrives, either party scans the generated QR code. Once confirmed, the batch status is updated to Delivered and nonces are consumed to prevent double handoffs.
          </p>
        </div>

        {/* Section 3: Food Safety & Escalations */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>What to do if something goes wrong?</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            If food temperature is unsafe, packaging is damaged, or a party is unreachable, click <strong>"Report Issue"</strong> on the dispatch card. City Administrators will immediately investigate and coordinate alternative food distribution.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </Modal>
  );
};
