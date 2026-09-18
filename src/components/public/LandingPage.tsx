import React from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Zap,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  UtensilsCrossed,
  Building2,
  Truck,
  Leaf,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenApply: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onOpenApply }) => {
  const { outcomeMetrics } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-200 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Surat Food Recovery Network · Live in 12 Localities</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Connecting Surplus Food with{' '}
              <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                Surat Shelters & Communities
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Every day in Surat, wholesome surplus meals from restaurants, banquets, and bakeries are
              matched with verified community kitchens and shelters before they expire.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="hero-apply-btn"
              type="button"
              onClick={onOpenApply}
              className="px-6 py-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-purple-300 to-fuchsia-300 hover:from-purple-200 hover:to-fuchsia-200 rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 group"
            >
              <span>Apply to Join Network</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              id="hero-sign-in-btn"
              type="button"
              onClick={onOpenLogin}
              className="px-6 py-3.5 text-sm font-bold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl backdrop-blur-sm transition-all"
            >
              Sign In to Platform
            </button>
          </div>

          {/* Live Dynamic City Stats (Real Database Calculated) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{outcomeMetrics.totalKgRecovered} <span className="text-sm font-normal text-purple-300">kg</span></p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Surplus Food Rescued</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{outcomeMetrics.estimatedMealsSaved}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Nutritious Meals Served</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{outcomeMetrics.recoveryRate}%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Successful Recovery Rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{outcomeMetrics.estimatedCo2AvoidedKg} <span className="text-sm font-normal text-purple-300">kg</span></p>
              <p className="text-xs text-slate-400 mt-1 font-medium">CO₂e Avoided</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            Operational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How Surplus Recovery Works in Surat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A fast, auditable coordination protocol designed for fresh cooked meals and food safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Donors Post Fresh Surplus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verified dining halls, banquets, and caterers in Vesu, Adajan, and Athwa list surplus meals with precise expiry countdowns and dietary info.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Smart Match & Reservation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nearby registered NGOs receive instant recommendations matching their daily beneficiary capacity and food preferences, securing the batch with one click.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Cryptographic QR Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assigned couriers pick up the surplus and scan a tamper-proof single-use QR token at the donor loading bay, ensuring verified, traceable delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Surat City Network Hubs */}
      <section className="bg-purple-900/5 py-16 px-4 sm:px-6 lg:px-8 border-y border-purple-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2 text-purple-800 font-semibold text-xs">
              <MapPin className="w-4 h-4" />
              <span>Surat Metropolitan Coverage</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Active Recovery Localities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our decentralized volunteer courier cell operates with under 30-minute response times across major Surat commercial and residential corridors.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Vesu', 'Adajan', 'Athwa Lines', 'Varachha', 'Katargam', 'Udhna', 'Piplod', 'Pal', 'City Light', 'Nanpura'].map((loc) => (
                <span key={loc} className="px-2.5 py-1 rounded-lg bg-white border border-purple-200/80 text-purple-900 text-xs font-medium">
                  {loc}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-purple-200/80 shadow-sm max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-700">Average Transit Speed</span>
              <span className="text-xs font-bold text-emerald-600">{outcomeMetrics.averageRecoverySpeedHours} hrs</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-700">Punctuality Score</span>
              <span className="text-xs font-bold text-purple-700">{outcomeMetrics.punctualityScoreAvg}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Spoilage Avoidance</span>
              <span className="text-xs font-bold text-emerald-600">{outcomeMetrics.spoilageAvoidanceRate}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">NourishNet Surat</span>
            <span>· Community Food Rescue Platform</span>
          </div>
          <p>© 2026 NourishNet. Supporting food security and zero-waste initiatives.</p>
        </div>
      </footer>
    </div>
  );
};
