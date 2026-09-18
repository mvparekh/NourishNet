import React, { useState } from 'react';
import {
  Utensils,
  Building2,
  Truck,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { SuratLocality, FoodCategory } from '../../types';

interface ApplyToJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SURAT_LOCALITIES: SuratLocality[] = [
  'Vesu',
  'Adajan',
  'Athwa Lines',
  'Varachha',
  'Katargam',
  'Udhna',
  'Piplod',
  'Pal',
  'City Light',
  'Nanpura',
  'Rander',
  'Ghanshyam Nagar',
];

export const ApplyToJoinModal: React.FC<ApplyToJoinModalProps> = ({ isOpen, onClose }) => {
  const { submitJoinApplication } = useApp();

  const [selectedRole, setSelectedRole] = useState<'DONOR' | 'NGO' | 'VOLUNTEER'>('DONOR');
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState<SuratLocality>('Vesu');
  const [address, setAddress] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('Restaurant & Dining');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [capacityPerDay, setCapacityPerDay] = useState(150);
  const [vehicleType, setVehicleType] = useState<'TWO_WHEELER' | 'FOUR_WHEELER' | 'MINI_VAN' | 'ON_FOOT'>('TWO_WHEELER');
  const [availabilityHours, setAvailabilityHours] = useState('Evenings (6 PM - 10 PM)');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = submitJoinApplication({
      role: selectedRole,
      applicantName,
      email,
      phone,
      city: 'Surat',
      locality,
      address,
      organizationName: selectedRole === 'VOLUNTEER' ? undefined : orgName,
      orgType: selectedRole === 'VOLUNTEER' ? 'Volunteer Courier' : orgType,
      fssaiNumber: fssaiNumber || undefined,
      registrationNumber: regNumber || undefined,
      capacityPerDay: selectedRole === 'NGO' ? capacityPerDay : undefined,
      vehicleType: selectedRole === 'VOLUNTEER' ? vehicleType : undefined,
      availabilityHours: selectedRole === 'VOLUNTEER' ? availabilityHours : undefined,
    });

    if (res.success) {
      setSubmittedAppId(res.applicationId);
      setIsSubmitted(true);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isSubmitted ? 'Application Submitted' : 'Apply to Join NourishNet Surat'}
      subtitle={
        isSubmitted
          ? 'Your credentials have entered the city verification queue'
          : 'Join our trusted food recovery and redistribution ecosystem'
      }
      maxWidth="2xl"
    >
      {isSubmitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Application Received</h4>
            <p className="text-xs text-slate-500 font-mono mt-1">Application Reference: #{submittedAppId}</p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Multi-Stage Verification Process</span>
            </div>
            <p>
              1. <strong>Document Review:</strong> Our Surat operations administration verifies your food safety registration or trust certificates.
            </p>
            <p>
              2. <strong>Account Activation:</strong> Once verified, credentials will be issued directly to <strong>{email}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Role in Surat
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('DONOR')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'DONOR'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Utensils className={`w-5 h-5 mb-1.5 ${selectedRole === 'DONOR' ? 'text-purple-700' : 'text-slate-500'}`} />
                <p className="text-xs font-bold text-slate-900">Food Donor</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Restaurant, Banquet, Caterer</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('NGO')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'NGO'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Building2 className={`w-5 h-5 mb-1.5 ${selectedRole === 'NGO' ? 'text-purple-700' : 'text-slate-500'}`} />
                <p className="text-xs font-bold text-slate-900">NGO / Shelter</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Community Kitchen, Shelter</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('VOLUNTEER')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'VOLUNTEER'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Truck className={`w-5 h-5 mb-1.5 ${selectedRole === 'VOLUNTEER' ? 'text-purple-700' : 'text-slate-500'}`} />
                <p className="text-xs font-bold text-slate-900">Volunteer</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Local Courier & Transport</p>
              </button>
            </div>
          </div>

          {/* Core Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicant Full Name *
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Nilesh Parekh"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (WhatsApp Active) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98250 12345"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Surat Locality Hub *
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value as SuratLocality)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              >
                {SURAT_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, Surat
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role-Specific Fields */}
          {selectedRole !== 'VOLUNTEER' && (
            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Gokul Banquet / Seva Trust"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {selectedRole === 'DONOR' ? 'FSSAI License Number' : 'Trust Registration / 80G No.'}
                  </label>
                  <input
                    type="text"
                    value={selectedRole === 'DONOR' ? fssaiNumber : regNumber}
                    onChange={(e) =>
                      selectedRole === 'DONOR' ? setFssaiNumber(e.target.value) : setRegNumber(e.target.value)
                    }
                    placeholder={selectedRole === 'DONOR' ? '14-digit FSSAI number' : 'TR-GJ-SRT-XXXX'}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-mono"
                  />
                </div>
              </div>

              {selectedRole === 'NGO' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Beneficiary Meal Capacity (~people)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    value={capacityPerDay}
                    onChange={(e) => setCapacityPerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>
              )}
            </div>
          )}

          {selectedRole === 'VOLUNTEER' && (
            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Transport Mode
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                >
                  <option value="TWO_WHEELER">Two-Wheeler (Motorcycle/Scooter)</option>
                  <option value="FOUR_WHEELER">Four-Wheeler Car</option>
                  <option value="MINI_VAN">Mini Van (For bulk transport)</option>
                  <option value="ON_FOOT">Eco-Cycle / On Foot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability Hours
                </label>
                <input
                  type="text"
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(e.target.value)}
                  placeholder="e.g. Evenings (6 PM - 10 PM)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Street Address (Surat) *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 12, Someshwar Square, VIP Road, Vesu, Surat"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Submit Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
