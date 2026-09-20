import { useEffect } from "react";
import {
  HeartHandshake,
  MapPin,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Clock,
  Sparkles,
  Users,
  UtensilsCrossed,
  Truck,
  Building2
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const LandingPage = ({ onOpenLogin, onOpenApply, onOpenDemo }) => {
  const { outcomeMetrics, demoMode } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col selection:bg-[#C85A32] selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2C1810] via-[#3E2419] to-[#2C1810] text-[#FAF7F2] pt-16 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        {/* Subtle decorative warm glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C85A32]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#8D6E63]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-[#FAF7F2] text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
            <span>Surat Food Recovery Network · Operational Across 12 Localities</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Connecting Surplus Food with{" "}
              <span className="text-[#E07A5F]">
                Surat Shelters & Communities
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#D7CCC8] max-w-2xl mx-auto leading-relaxed font-normal">
              Wholesome surplus meals from restaurants, banquets, and bakeries in Surat are
              swiftly coordinated with verified community kitchens and shelters before expiry.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="hero-apply-btn"
              type="button"
              onClick={onOpenApply}
              className="btn-terracotta px-6 py-3.5 text-sm flex items-center gap-2 group shadow-lg shadow-[#C85A32]/25"
            >
              <span>Apply to Join Network</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              id="hero-sign-in-btn"
              type="button"
              onClick={onOpenLogin}
              className="px-6 py-3.5 text-sm font-bold text-[#FAF7F2] bg-[#5D4037]/80 hover:bg-[#5D4037] border border-[#795548] rounded-xl backdrop-blur-sm transition-all shadow-md"
            >
              Sign In to Platform
            </button>
          </div>

          {/* Demo Mode Prompt Banner */}
          {demoMode && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenDemo}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-[#FAF7F2] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                <span>Demo Mode Active: Press <kbd className="font-mono bg-white/20 px-1.5 py-0.5 rounded font-bold">Ctrl</kbd> to explore 25 Demo Accounts</span>
              </button>
            </div>
          )}

          {/* Live Dynamic City Stats (Real Database State) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-5 rounded-2xl bg-[#FAF7F2]/10 border border-[#FAF7F2]/15 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {outcomeMetrics.totalKgRecovered} <span className="text-sm font-normal text-[#E07A5F]">kg</span>
              </p>
              <p className="text-xs text-[#D7CCC8] mt-1 font-medium">Surplus Food Rescued</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF7F2]/10 border border-[#FAF7F2]/15 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {outcomeMetrics.estimatedMealsSaved}
              </p>
              <p className="text-xs text-[#D7CCC8] mt-1 font-medium">Nutritious Meals Served</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF7F2]/10 border border-[#FAF7F2]/15 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {outcomeMetrics.recoveryRate}%
              </p>
              <p className="text-xs text-[#D7CCC8] mt-1 font-medium">Successful Recovery Rate</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF7F2]/10 border border-[#FAF7F2]/15 backdrop-blur-md text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {outcomeMetrics.estimatedCo2AvoidedKg} <span className="text-sm font-normal text-[#E07A5F]">kg</span>
              </p>
              <p className="text-xs text-[#D7CCC8] mt-1 font-medium">CO₂e Avoided</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32] bg-[#C85A32]/10 px-3.5 py-1 rounded-full border border-[#C85A32]/20">
            Operational Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1810] mt-3">
            How Surplus Recovery Works in Surat
          </h2>
          <p className="text-xs sm:text-sm text-[#5D4037] mt-2">
            A fast, accountable coordination workflow engineered for food safety and transparent handoffs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="card-warm p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#2C1810] border border-[#E7DCD5] flex items-center justify-center font-bold text-lg shadow-2xs">
              <UtensilsCrossed className="w-5 h-5 text-[#C85A32]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-wider">Step 1</span>
              <h3 className="text-base font-bold text-[#2C1810] mt-0.5">Donors Post Fresh Surplus</h3>
            </div>
            <p className="text-xs text-[#5D4037] leading-relaxed">
              Verified dining halls, banquets, and caterers in Vesu, Adajan, and Athwa list surplus meals with precise expiry countdowns and dietary info.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card-warm p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#2C1810] border border-[#E7DCD5] flex items-center justify-center font-bold text-lg shadow-2xs">
              <Building2 className="w-5 h-5 text-[#5D4037]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-wider">Step 2</span>
              <h3 className="text-base font-bold text-[#2C1810] mt-0.5">Smart Match & Reservation</h3>
            </div>
            <p className="text-xs text-[#5D4037] leading-relaxed">
              Nearby registered NGOs receive instant alerts matching their daily beneficiary capacity and food preferences, securing the batch with one click.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card-warm p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#2C1810] border border-[#E7DCD5] flex items-center justify-center font-bold text-lg shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#8D6E63]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-wider">Step 3</span>
              <h3 className="text-base font-bold text-[#2C1810] mt-0.5">OTP or QR Handoff Verification</h3>
            </div>
            <p className="text-xs text-[#5D4037] leading-relaxed">
              Assigned couriers verify surplus pickup using either secure single-use QR or an alternative cryptographic OTP, ensuring complete chain-of-custody.
            </p>
          </div>
        </div>
      </section>

      {/* Surat City Network Hubs */}
      <section className="bg-[#F5EFEB] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#E7DCD5]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2 text-[#C85A32] font-semibold text-xs">
              <MapPin className="w-4 h-4" />
              <span>Surat Metropolitan Coverage</span>
            </div>
            <h3 className="text-2xl font-bold text-[#2C1810]">Active Recovery Localities</h3>
            <p className="text-xs text-[#5D4037] leading-relaxed">
              Our decentralized volunteer courier network operates with under 30-minute dispatch times across major Surat commercial and residential sectors.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Vesu", "Adajan", "Athwa Lines", "Varachha", "Katargam", "Udhna", "Piplod", "Pal", "City Light", "Nanpura"].map((loc) => (
                <span
                  key={loc}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E7DCD5] text-[#2C1810] text-xs font-medium shadow-2xs"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7DCD5] shadow-xs max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DCD5] pb-3">
              <span className="text-xs font-semibold text-[#5D4037]">Average Recovery Speed</span>
              <span className="text-xs font-bold text-[#2C1810]">{outcomeMetrics.averageRecoverySpeedHours} hrs</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E7DCD5] pb-3">
              <span className="text-xs font-semibold text-[#5D4037]">Punctuality Score</span>
              <span className="text-xs font-bold text-[#C85A32]">{outcomeMetrics.punctualityScoreAvg}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5D4037]">Spoilage Avoidance</span>
              <span className="text-xs font-bold text-[#5D4037]">{outcomeMetrics.spoilageAvoidanceRate}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Public Landing Footer */}
      <footer className="mt-auto py-8 bg-[#2C1810] text-[#D7CCC8] text-xs border-t border-[#3D2319]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#C85A32]" />
            <span className="font-semibold text-white">NourishNet Surat</span>
            <span>· Community Surplus Food Recovery & Redistribution Network</span>
          </div>
          <p>© 2026 NourishNet Surat. Built for zero-waste communities.</p>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };
