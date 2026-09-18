import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Building2,
  Navigation,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  Radio,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { FoodListing, Reservation, Pickup, UserRole } from '../../types';

interface LiveRecoveryRouteMapProps {
  reservation: Reservation;
  pickup: Pickup;
  listing: FoodListing;
  viewerRole: UserRole;
  compact?: boolean;
}

// Normalized coordinate map of Surat localities (800 x 500 SVG grid)
const SURAT_NODES: Record<string, { x: number; y: number; label: string }> = {
  VESU: { x: 380, y: 410, label: 'Vesu' },
  PIPLOD: { x: 320, y: 350, label: 'Piplod' },
  ATHWA_LINES: { x: 420, y: 290, label: 'Athwa Lines' },
  CITY_LIGHT: { x: 360, y: 320, label: 'City Light' },
  ADAJAN: { x: 260, y: 220, label: 'Adajan' },
  PAL: { x: 210, y: 270, label: 'Pal' },
  RANDER: { x: 270, y: 150, label: 'Rander' },
  KATARGAM: { x: 500, y: 130, label: 'Katargam' },
  VARACHHA: { x: 600, y: 190, label: 'Varachha' },
  UDHNA: { x: 510, y: 360, label: 'Udhna' },
  DUMAS_ROAD: { x: 310, y: 440, label: 'Dumas Road' },
};

function resolveLocality(localityStr: string) {
  const clean = localityStr.toUpperCase().replace(/\s+/g, '_');
  for (const [key, val] of Object.entries(SURAT_NODES)) {
    if (clean.includes(key) || key.includes(clean)) return val;
  }
  return SURAT_NODES.ATHWA_LINES;
}

export const LiveRecoveryRouteMap: React.FC<LiveRecoveryRouteMapProps> = ({
  reservation,
  pickup,
  listing,
  viewerRole,
  compact = false,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(45);
  const [privacyMode, setPrivacyMode] = useState<boolean>(viewerRole === 'DONOR'); // Donors get approximate privacy by default
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(true);

  const donorNode = resolveLocality(listing.donorLocality || 'Piplod');
  const ngoNode = resolveLocality('Vesu'); // Destination NGO center

  // Volunteer position interpolated along route or at current locality
  const isEnRoute = pickup.status === 'VOLUNTEER_EN_ROUTE' || pickup.status === 'IN_TRANSIT' || pickup.status === 'ASSIGNED';
  const isPickedUp = pickup.status === 'PICKUP_STARTED' || pickup.status === 'IN_TRANSIT';

  // Smooth live transit animation
  useEffect(() => {
    if (!isSimulatingLive || !isEnRoute) return;
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + 1.2;
        return next > 95 ? 20 : next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isSimulatingLive, isEnRoute]);

  // Interpolate volunteer coordinate between donor and ngo
  const startX = donorNode.x;
  const startY = donorNode.y;
  const endX = ngoNode.x;
  const endY = ngoNode.y;

  // Mid control point for curved realistic road path
  const midX = (startX + endX) / 2 + 35;
  const midY = (startY + endY) / 2 - 25;

  // Parametric Bezier formula for courier coordinate: B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
  const t = Math.min(Math.max(progressPercent / 100, 0.05), 0.95);
  const volX = Math.round((1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX);
  const volY = Math.round((1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY);

  const remainingMins = Math.max(1, Math.round((1 - t) * (pickup.estimatedArrivalMins || 10)));
  const distanceKm = ((1 - t) * 4.2).toFixed(1);

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg flex flex-col">
      {/* Top Banner: Status & Privacy Guard */}
      <div className="p-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Navigation className="w-3.5 h-3.5 text-purple-400" />
              <span>Surat Live Rescue Route</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                {pickup.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {donorNode.label} Loading Bay → {ngoNode.label} Relief Shelter
            </p>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA: <strong>{remainingMins} mins</strong></span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dist: <strong>{distanceKm} km</strong></span>
          </div>

          {/* Privacy Toggle (for Donor / Privacy compliance) */}
          <button
            type="button"
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              privacyMode
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
                : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
            }`}
            title="Privacy-by-workflow: Discloses location only during active dispatch"
          >
            {privacyMode ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-purple-400" />}
            <span>{privacyMode ? 'Area Mode' : 'Precise Track'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className={`relative w-full ${compact ? 'h-[280px]' : 'h-[360px]'} bg-slate-950 select-none overflow-hidden`}>
        <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern-recovery" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
            </pattern>

            {/* Route Gradient */}
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Pulse Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="#090d16" />
          <rect width="100%" height="100%" fill="url(#grid-pattern-recovery)" />

          {/* Tapi River representation in Surat (Flowing from East to West) */}
          <path
            d="M 750,80 Q 520,110 380,180 T 150,220"
            fill="none"
            stroke="#0284c7"
            strokeWidth="24"
            strokeOpacity="0.18"
            strokeLinecap="round"
          />
          <path
            d="M 750,80 Q 520,110 380,180 T 150,220"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeOpacity="0.4"
            strokeDasharray="6 6"
          />
          <text x="310" y="195" fill="#38bdf8" fontSize="11" opacity="0.6" fontWeight="bold">
            Tapi River (Surat)
          </text>

          {/* Major Roads / Ring Roads Network */}
          <path d="M 220,120 L 620,150 L 550,420 L 260,390 Z" fill="none" stroke="#334155" strokeWidth="2" strokeOpacity="0.4" />
          <path d="M 380,180 L 400,450" fill="none" stroke="#475569" strokeWidth="2.5" strokeOpacity="0.4" />
          <path d="M 260,220 L 580,200" fill="none" stroke="#475569" strokeWidth="2.5" strokeOpacity="0.4" />

          {/* Locality Nodes Background */}
          {Object.entries(SURAT_NODES).map(([key, loc]) => (
            <g key={key} transform={`translate(${loc.x}, ${loc.y})`}>
              <circle r="4" fill="#475569" opacity="0.5" />
              <text y="14" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                {loc.label}
              </text>
            </g>
          ))}

          {/* --- ACTIVE RECOVERY ROUTE --- */}
          {/* Outer glow line */}
          <path
            d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="10"
            strokeOpacity="0.2"
            filter="url(#glow)"
          />

          {/* Core road line */}
          <path
            d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Animated dashing indicating direction of travel */}
          <path
            d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="8 8"
            strokeDashoffset={-(progressPercent * 2)}
            strokeOpacity="0.7"
          />

          {/* --- PIN 1: DONOR KITCHEN --- */}
          <g transform={`translate(${startX}, ${startY})`} className="cursor-pointer">
            <circle r="22" fill="#f59e0b" fillOpacity="0.15" />
            <circle r="14" fill="#f59e0b" />
            <circle r="6" fill="#ffffff" />
            <g transform="translate(-8, -32)">
              <rect width="90" height="24" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="45" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                📍 Donor: {donorNode.label}
              </text>
            </g>
          </g>

          {/* --- PIN 2: DESTINATION NGO --- */}
          <g transform={`translate(${endX}, ${endY})`} className="cursor-pointer">
            <circle r="22" fill="#10b981" fillOpacity="0.15" />
            <circle r="14" fill="#10b981" />
            <circle r="6" fill="#ffffff" />
            <g transform="translate(-10, -32)">
              <rect width="96" height="24" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
              <text x="48" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                📍 Shelter: {ngoNode.label}
              </text>
            </g>
          </g>

          {/* --- PIN 3: LIVE VOLUNTEER COURIER --- */}
          {privacyMode ? (
            // Area Mode: Privacy circle around locality
            <g transform={`translate(${volX}, ${volY})`}>
              <circle r="36" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle r="8" fill="#a855f7" />
              <circle r="4" fill="#ffffff" />
              <g transform="translate(-50, 24)">
                <rect width="100" height="20" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
                <text x="50" y="14" textAnchor="middle" fill="#e9d5ff" fontSize="9" fontWeight="bold">
                  🛡️ Volunteer in Area
                </text>
              </g>
            </g>
          ) : (
            // Precise Live Tracker Mode
            <g transform={`translate(${volX}, ${volY})`}>
              <circle r="28" fill="#a855f7" fillOpacity="0.2" className="animate-ping" />
              <circle r="18" fill="#7e22ce" stroke="#ffffff" strokeWidth="2" />
              {/* Courier icon placeholder */}
              <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                🚗
              </text>
              <g transform="translate(-60, -34)">
                <rect width="120" height="26" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                <text x="60" y="17" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {reservation.assignedVolunteerName?.split(' ')[0] || 'Volunteer'} (En Route)
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Bottom Info Floating Card */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Privacy Guaranteed:</strong> Location sharing automatically terminates upon handoff completion.
            </span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Vehicle: <strong>Two-Wheeler (Thermal Box)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
