import React from 'react';
import { ListingStatus, ReservationStatus, PickupStatus, AccountState } from '../../types';

interface StatusBadgeProps {
  status: ListingStatus | ReservationStatus | PickupStatus | AccountState | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showDot = true }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotBg = 'bg-slate-500';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    // Success / Completed / Verified (Green)
    case 'COMPLETED':
    case 'VERIFIED':
    case 'APPROVED':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotBg = 'bg-emerald-500';
      label = status === 'VERIFIED' ? 'Verified' : status === 'APPROVED' ? 'Approved' : 'Completed';
      break;

    // Available (Purple brand)
    case 'AVAILABLE':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      dotBg = 'bg-purple-600';
      label = 'Available';
      break;

    // Reserved / In Progress / Assigned (Amber/Violet)
    case 'RESERVED':
    case 'REQUESTED':
    case 'CONFIRMED':
    case 'ASSIGNED':
    case 'VOLUNTEER_ASSIGNED':
      bg = 'bg-violet-50 text-violet-700 border-violet-200';
      dotBg = 'bg-violet-600';
      label = status === 'VOLUNTEER_ASSIGNED' ? 'Courier Assigned' : status === 'CONFIRMED' ? 'Confirmed' : 'Reserved';
      break;

    case 'IN_TRANSIT':
    case 'PICKUP_IN_PROGRESS':
    case 'PICKUP_SCHEDULED':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      dotBg = 'bg-amber-500 animate-pulse';
      label = 'In Transit';
      break;

    // Warning / Under Review / Pending (Amber)
    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'APPLIED':
    case 'VERIFICATION_PENDING':
    case 'MORE_INFORMATION_REQUIRED':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      dotBg = 'bg-amber-500';
      label = status === 'MORE_INFORMATION_REQUIRED' ? 'Info Required' : status === 'UNDER_REVIEW' ? 'Under Review' : status === 'APPLIED' ? 'Applied' : 'Pending';
      break;

    // Danger / Critical / Expired (Red)
    case 'EXPIRED':
    case 'CANCELLED':
    case 'FAILED':
    case 'SUSPENDED':
    case 'REJECTED':
    case 'DEACTIVATED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      dotBg = 'bg-rose-500';
      label = status === 'EXPIRED' ? 'Expired' : status === 'CANCELLED' ? 'Cancelled' : status === 'SUSPENDED' ? 'Suspended' : 'Rejected';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-medium',
    lg: 'text-base px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${bg} ${sizeClasses[size]}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`} />}
      <span className="capitalize">{label.toLowerCase()}</span>
    </span>
  );
};
