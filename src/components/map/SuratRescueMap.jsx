import { useState } from "react";
import {
  Navigation,
  ChevronRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../common/StatusBadge";
const LOCALITY_COORDS = {
  VESU: { x: 380, y: 480, label: "Vesu" },
  PIPLOD: { x: 340, y: 420, label: "Piplod" },
  ATHWA_LINES: { x: 420, y: 350, label: "Athwa Lines" },
  ADAJAN: { x: 260, y: 280, label: "Adajan" },
  PAL: { x: 220, y: 340, label: "Pal" },
  RANDER: { x: 280, y: 210, label: "Rander" },
  KATARGAM: { x: 500, y: 190, label: "Katargam" },
  VARACHHA: { x: 580, y: 260, label: "Varachha" },
  UDHNA: { x: 490, y: 430, label: "Udhna" },
  CITY_LIGHT: { x: 370, y: 390, label: "City Light" },
  GHOD_DOD: { x: 400, y: 370, label: "Ghod Dod Rd" }
};
const SuratRescueMap = ({
  highlightListingId,
  highlightReservationId,
  compact = false,
  onSelectListing
}) => {
  const { foodListings, reservations, pickups, users, currentUser, reserveListing } = useApp();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredLocality, setHoveredLocality] = useState(null);
  const availableListings = foodListings.filter((l) => l.status === "AVAILABLE");
  const activePickups = pickups.filter((p) => p.status === "IN_TRANSIT" || p.status === "ASSIGNED");
  const ngoUsers = users.filter((u) => u.role === "NGO");
  const getLocalityKey = (loc) => {
    const clean = loc.toUpperCase().replace(/\s+/g, "_");
    if (LOCALITY_COORDS[clean]) return clean;
    if (clean.includes("VESU")) return "VESU";
    if (clean.includes("ADAJAN")) return "ADAJAN";
    if (clean.includes("ATHWA")) return "ATHWA_LINES";
    if (clean.includes("VARACHHA")) return "VARACHHA";
    if (clean.includes("KATARGAM")) return "KATARGAM";
    if (clean.includes("PIPLOD")) return "PIPLOD";
    if (clean.includes("PAL")) return "PAL";
    return "ATHWA_LINES";
  };
  const handleReserveQuick = (listing) => {
    if (currentUser?.role === "NGO") {
      reserveListing(listing.id, listing.quantity);
      setSelectedNode(null);
    }
  };
  return <div className={`relative bg-[#1A0F0A] rounded-2xl border border-[#3D2319] text-[#FAF7F2] overflow-hidden shadow-md flex flex-col ${compact ? "h-[360px]" : "h-[520px]"}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-[#2C1810]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#5D4037] text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-pulse" />
          <span className="font-bold text-white tracking-wide flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Surat Live Relief Radar</span>
          </span>
          <span className="text-[10px] text-[#D7CCC8] hidden sm:inline">
            · {availableListings.length} Surplus · {activePickups.length} In-Transit
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#1A0F0A] p-1 rounded-lg border border-[#3D2319]">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${activeFilter === "ALL" ? "bg-[#C85A32] text-white" : "text-[#D7CCC8] hover:text-white"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("SURPLUS")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${activeFilter === "SURPLUS" ? "bg-[#C85A32] text-white" : "text-[#D7CCC8] hover:text-white"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
            <span>Surplus ({availableListings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("NGOS")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${activeFilter === "NGOS" ? "bg-[#C85A32] text-white" : "text-[#D7CCC8] hover:text-white"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D7CCC8]" />
            <span>NGOs ({ngoUsers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("COURIERS")}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${activeFilter === "COURIERS" ? "bg-[#C85A32] text-white" : "text-[#D7CCC8] hover:text-white"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Couriers ({activePickups.length})</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="flex-1 w-full h-full relative cursor-crosshair">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2C1810" strokeWidth="0.8" />
            </pattern>
            {/* Pulsing glow */}
            <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C85A32" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C85A32" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="600" fill="#150C07" />
          <rect width="800" height="600" fill="url(#grid)" />

          {
    /* Tapi River Flowing through Surat */
  }
          <path
    d="M 120 100 Q 240 220 330 290 T 490 320 T 700 340"
    fill="none"
    stroke="#1e3a8a"
    strokeWidth="24"
    strokeLinecap="round"
    opacity="0.5"
  />
          <path
    d="M 120 100 Q 240 220 330 290 T 490 320 T 700 340"
    fill="none"
    stroke="#38bdf8"
    strokeWidth="3"
    strokeDasharray="6 6"
    opacity="0.7"
  />
          <text x="310" y="270" fill="#60a5fa" fontSize="10" fontWeight="bold" opacity="0.6" transform="rotate(25 310 270)">
            Tapi River · Surat
          </text>

          {
    /* Surat Major Ring Roads & Corridors */
  }
          <path
    d="M 220 340 L 380 480 L 490 430 L 580 260 L 500 190 L 280 210 Z"
    fill="none"
    stroke="#334155"
    strokeWidth="2"
    strokeDasharray="4 4"
  />

          {
    /* Locality Boundary Clusters & Labels */
  }
          {Object.entries(LOCALITY_COORDS).map(([key, loc]) => <g
    key={key}
    className="cursor-pointer transition-opacity"
    onMouseEnter={() => setHoveredLocality(loc.label)}
    onMouseLeave={() => setHoveredLocality(null)}
  >
              <circle
    cx={loc.x}
    cy={loc.y}
    r="38"
    fill="#1e293b"
    fillOpacity={hoveredLocality === loc.label ? "0.6" : "0.25"}
    stroke="#475569"
    strokeWidth="1"
    strokeDasharray="3 3"
  />
              <text
    x={loc.x}
    y={loc.y + 32}
    textAnchor="middle"
    fill="#94a3b8"
    fontSize="11"
    fontWeight="600"
    className="select-none pointer-events-none"
  >
                {loc.label}
              </text>
            </g>)}

          {
    /* Active Volunteer Route Lines (Animated In-Transit) */
  }
          {activePickups.map((pickup) => {
    const res = reservations.find((r) => r.id === pickup.reservationId);
    const listing = res ? foodListings.find((l) => l.id === res.listingId) : null;
    if (!listing || !res) return null;
    const ngoUser = users.find((u) => u.id === res.ngoId);
    const originLoc = getLocalityKey(listing.donorLocality);
    const destLoc = getLocalityKey(ngoUser?.locality || "Athwa Lines");
    const p1 = LOCALITY_COORDS[originLoc] || { x: 380, y: 480 };
    const p2 = LOCALITY_COORDS[destLoc] || { x: 420, y: 350 };
    return <g key={pickup.id}>
                {
      /* Connecting transit line */
    }
                <line
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke="#a855f7"
      strokeWidth="2.5"
      strokeDasharray="5 5"
      className="animate-pulse"
    />
                {
      /* Moving Courier Icon on Path */
    }
                <circle
      cx={(p1.x + p2.x) / 2}
      cy={(p1.y + p2.y) / 2}
      r="12"
      fill="#7e22ce"
      stroke="#f472b6"
      strokeWidth="2"
      className="cursor-pointer hover:scale-125 transition-transform"
      onClick={() => setSelectedNode({ type: "COURIER", data: { pickup, listing, res } })}
    />
                <text
      x={(p1.x + p2.x) / 2}
      y={(p1.y + p2.y) / 2 + 3}
      textAnchor="middle"
      fill="#ffffff"
      fontSize="8"
      fontWeight="bold"
      className="pointer-events-none"
    >
                  ⚡
                </text>
              </g>;
  })}

          {
    /* NGO Shelter Hub Markers */
  }
          {(activeFilter === "ALL" || activeFilter === "NGOS") && ngoUsers.map((ngo, idx) => {
    const locKey = getLocalityKey(ngo.locality);
    const baseCoords = LOCALITY_COORDS[locKey] || { x: 420, y: 350 };
    const offsetX = (idx % 3 - 1) * 16;
    const offsetY = Math.floor(idx / 3) * 16 - 10;
    return <g
      key={ngo.id}
      className="cursor-pointer hover:scale-110 transition-transform"
      onClick={() => setSelectedNode({ type: "NGO", data: ngo })}
    >
                  <circle
      cx={baseCoords.x + offsetX}
      cy={baseCoords.y + offsetY}
      r="11"
      fill="#312e81"
      stroke="#818cf8"
      strokeWidth="2"
    />
                  <text
      x={baseCoords.x + offsetX}
      y={baseCoords.y + offsetY + 3.5}
      textAnchor="middle"
      fill="#ffffff"
      fontSize="9"
      fontWeight="bold"
      className="pointer-events-none"
    >
                    🏢
                  </text>
                </g>;
  })}

          {
    /* Food Listing Surplus Pins */
  }
          {(activeFilter === "ALL" || activeFilter === "SURPLUS") && availableListings.map((listing, idx) => {
    const locKey = getLocalityKey(listing.donorLocality);
    const baseCoords = LOCALITY_COORDS[locKey] || { x: 380, y: 480 };
    const offsetX = (idx % 4 - 1.5) * 18;
    const offsetY = Math.floor(idx / 4) * 18 + 10;
    const isHighlighted = highlightListingId === listing.id;
    const hoursLeft = Math.max(
      0,
      Math.round((new Date(listing.expiresAt).getTime() - Date.now()) / (1e3 * 60 * 60) * 10) / 10
    );
    const isUrgent = hoursLeft <= 2.5;
    return <g
      key={listing.id}
      className="cursor-pointer hover:scale-125 transition-transform"
      onClick={() => {
        setSelectedNode({ type: "LISTING", data: listing });
        if (onSelectListing) onSelectListing(listing);
      }}
    >
                  {isHighlighted && <circle
      cx={baseCoords.x + offsetX}
      cy={baseCoords.y + offsetY}
      r="22"
      fill="url(#pulseGlow)"
      className="animate-ping"
    />}
                  <circle
      cx={baseCoords.x + offsetX}
      cy={baseCoords.y + offsetY}
      r={isUrgent ? "14" : "12"}
      fill={isUrgent ? "#dc2626" : "#7c3aed"}
      stroke="#ffffff"
      strokeWidth="2"
      className="shadow-lg"
    />
                  <text
      x={baseCoords.x + offsetX}
      y={baseCoords.y + offsetY + 3.5}
      textAnchor="middle"
      fill="#ffffff"
      fontSize="9"
      fontWeight="bold"
      className="pointer-events-none"
    >
                    🍲
                  </text>
                </g>;
  })}
        </svg>

        {/* Selected Node Popover Card */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-[#2C1810]/95 backdrop-blur-md p-4 rounded-2xl border border-[#C85A32]/40 shadow-2xl text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C85A32]/20 text-[#FAF7F2] border border-[#C85A32]/40">
                  {selectedNode.type === "LISTING" ? "Surplus Batch" : selectedNode.type === "NGO" ? "NGO Shelter" : "Courier In-Transit"}
                </span>
                {selectedNode.type === "LISTING" && <StatusBadge status={selectedNode.data.status} />}
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-[#8D6E63] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {selectedNode.type === "LISTING" && (
              <>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedNode.data.title}</h4>
                  <p className="text-[#E7DCD5] text-[11px]">
                    Donor: {selectedNode.data.donorName} ({selectedNode.data.donorLocality}, Surat)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#1A0F0A] p-2.5 rounded-xl border border-[#5D4037]/40 text-[11px]">
                  <div>
                    <span className="text-[#8D6E63] block text-[10px]">Portion Size</span>
                    <span className="font-bold text-[#C85A32]">
                      {selectedNode.data.quantity} {selectedNode.data.unit.toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8D6E63] block text-[10px]">Dietary / Prep</span>
                    <span className="font-bold text-emerald-400">
                      {selectedNode.data.dietaryType?.replace("_", " ") || "Veg"}
                    </span>
                  </div>
                </div>

                {currentUser?.role === "NGO" && (
                  <button
                    type="button"
                    onClick={() => handleReserveQuick(selectedNode.data)}
                    className="w-full py-2 bg-[#C85A32] hover:bg-[#B04A24] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Reserve Batch for Shelter</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {selectedNode.type === "NGO" && (
              <div>
                <h4 className="text-sm font-bold text-white">{selectedNode.data.fullName}</h4>
                <p className="text-[#E7DCD5] text-[11px]">
                  Locality: {selectedNode.data.locality}, Surat · Capacity: {selectedNode.data.capacityPerDay || 250} meals/day
                </p>
                <p className="text-[#8D6E63] text-[10px] mt-1">
                  Active shelter hub receiving verified surplus dispatches.
                </p>
              </div>
            )}

            {selectedNode.type === "COURIER" && (
              <div>
                <h4 className="text-sm font-bold text-white">Relief Trip in Transit</h4>
                <p className="text-[#E7DCD5] text-[11px]">
                  Delivering: {selectedNode.data.listing.title} ({selectedNode.data.res.requestedQuantity} portions)
                </p>
                <p className="text-[#C85A32] text-[11px] mt-0.5">
                  Origin: {selectedNode.data.listing.donorLocality} → Destination: {selectedNode.data.res.ngoName}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Footer Indicator */}
      <div className="px-4 py-2 bg-[#1A0F0A] border-t border-[#2C1810] flex items-center justify-between text-[11px] text-[#E7DCD5]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
            <span>Surplus Batch</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#5D4037]" />
            <span>NGO Shelter</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Courier</span>
          </span>
        </div>
        <span className="hidden sm:inline text-[#8D6E63]">Surat Metropolitan Area</span>
      </div>
    </div>;
};
export {
  SuratRescueMap
};
