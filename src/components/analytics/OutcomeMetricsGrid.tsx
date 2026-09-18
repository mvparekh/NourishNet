import React from 'react';
import { PlatformOutcomeMetrics } from '../../types';
import {
  TrendingUp,
  Clock,
  ShieldAlert,
  Utensils,
  Leaf,
  Info,
  CheckCircle,
} from 'lucide-react';

interface OutcomeMetricsGridProps {
  metrics: PlatformOutcomeMetrics;
  roleScopeLabel?: string;
}

export const OutcomeMetricsGrid: React.FC<OutcomeMetricsGridProps> = ({
  metrics,
  roleScopeLabel = 'Network-wide',
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner with Scope & Methodological Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Outcome Analytics ({roleScopeLabel})
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-300">
          <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Derived from append-only donation history log (Principle 11)</span>
        </div>
      </div>

      {/* 5-Card Headline Outcome Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Recovery Rate */}
        <div
          id="metric-recovery-rate"
          className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Recovery Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {metrics.recoveryRate}%
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
              High Impact
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-tight">
            Completed pickups ÷ total created listings
          </p>
        </div>

        {/* Metric 2: Recovery Speed */}
        <div
          id="metric-recovery-speed"
          className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Avg Recovery Speed</span>
            <div className="p-1.5 rounded-lg bg-blue-100/80 text-blue-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {metrics.averageRecoverySpeedHours}h
            </span>
            <span className="text-[10px] text-slate-500">time-to-pickup</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-tight">
            Creation to physical QR completion
          </p>
        </div>

        {/* Metric 3: Spoilage Avoidance Rate */}
        <div
          id="metric-spoilage-avoidance"
          className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Spoilage Avoidance</span>
            <div className="p-1.5 rounded-lg bg-amber-100/80 text-amber-700">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {metrics.spoilageAvoidanceRate}%
            </span>
            <span className="text-[10px] text-slate-500">pre-expiry</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-tight">
            Rescued before expiration window
          </p>
        </div>

        {/* Metric 4: Estimated Meals Saved */}
        <div
          id="metric-meals-saved"
          className="rounded-2xl border border-orange-200/80 bg-gradient-to-b from-orange-50/50 to-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Estimated Meals</span>
            <div className="p-1.5 rounded-lg bg-orange-100/80 text-orange-700">
              <Utensils className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              ~{metrics.estimatedMealsSaved}
            </span>
            <span className="text-[10px] text-slate-500">({metrics.estimatedEdibleKgSaved} kg)</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-tight">
            *Est: 0.42 kg/meal baseline conversion
          </p>
        </div>

        {/* Metric 5: Estimated CO2 Avoided */}
        <div
          id="metric-co2-prevented"
          className="rounded-2xl border border-teal-200/80 bg-gradient-to-b from-teal-50/50 to-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">CO₂e Abatement</span>
            <div className="p-1.5 rounded-lg bg-teal-100/80 text-teal-700">
              <Leaf className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              ~{metrics.estimatedCo2AvoidedKg}
            </span>
            <span className="text-[10px] text-slate-500">kg CO₂e</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400 leading-tight">
            *Est: 2.5 kg CO₂e avoided per kg food
          </p>
        </div>
      </div>
    </div>
  );
};
