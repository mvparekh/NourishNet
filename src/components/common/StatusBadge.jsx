const StatusBadge = ({ status, size = "sm", showDot = true }) => {
  let bg = "bg-[#F5EFEB] text-[#5D4037] border-[#E7DCD5]";
  let dotBg = "bg-[#8D6E63]";
  let label = status ? status.replace(/_/g, " ") : "Unknown";

  switch (status) {
    // Success / Completed / Verified
    case "COMPLETED":
    case "VERIFIED":
    case "APPROVED":
      bg = "bg-[#F0F7F2] text-[#2E6F40] border-[#C3E2CC]";
      dotBg = "bg-[#2E6F40]";
      label = status === "VERIFIED" ? "Verified" : status === "APPROVED" ? "Approved" : "Completed";
      break;

    // Available (Fresh Surplus ready)
    case "AVAILABLE":
      bg = "bg-[#F5EFEB] text-[#2C1810] border-[#E7DCD5]";
      dotBg = "bg-[#C85A32]";
      label = "Available";
      break;

    // Reserved / In Progress / Assigned
    case "RESERVED":
    case "REQUESTED":
    case "CONFIRMED":
    case "ASSIGNED":
    case "VOLUNTEER_ASSIGNED":
      bg = "bg-[#FAF3F0] text-[#C85A32] border-[#C85A32]/30";
      dotBg = "bg-[#C85A32]";
      label = status === "VOLUNTEER_ASSIGNED" ? "Courier Assigned" : status === "CONFIRMED" ? "Confirmed" : "Reserved";
      break;

    case "IN_TRANSIT":
    case "PICKUP_IN_PROGRESS":
    case "PICKUP_SCHEDULED":
      bg = "bg-[#FAF7F2] text-[#5D4037] border-[#E7DCD5]";
      dotBg = "bg-[#C85A32] animate-pulse";
      label = "In Transit";
      break;

    // Warning / Under Review / Pending
    case "PENDING":
    case "UNDER_REVIEW":
    case "APPLIED":
    case "VERIFICATION_PENDING":
    case "MORE_INFORMATION_REQUIRED":
      bg = "bg-[#FAF3F0] text-[#B34D28] border-[#E7DCD5]";
      dotBg = "bg-[#B34D28]";
      label =
        status === "MORE_INFORMATION_REQUIRED"
          ? "Info Required"
          : status === "UNDER_REVIEW"
          ? "Under Review"
          : status === "APPLIED"
          ? "Applied"
          : "Pending";
      break;

    // Danger / Critical / Expired
    case "EXPIRED":
    case "CANCELLED":
    case "FAILED":
    case "SUSPENDED":
    case "REJECTED":
    case "DEACTIVATED":
      bg = "bg-rose-50 text-rose-700 border-rose-200";
      dotBg = "bg-rose-500";
      label =
        status === "EXPIRED"
          ? "Expired"
          : status === "CANCELLED"
          ? "Cancelled"
          : status === "SUSPENDED"
          ? "Suspended"
          : "Rejected";
      break;
  }

  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5 font-medium",
    md: "text-sm px-3 py-1 font-medium",
    lg: "text-base px-3.5 py-1.5 font-semibold"
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

export { StatusBadge };
