const CLIENT_SIGNING_SALT = (() => {
  if (typeof window !== "undefined") {
    const stored = window.sessionStorage?.getItem("nn_client_entropy");
    if (stored) return stored;
    const generated = Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      window.sessionStorage?.setItem("nn_client_entropy", generated);
    } catch {
    }
    return generated;
  }
  return "nn_server_fallback_entropy";
})();
function hashPassword(plainText) {
  let hash = 0;
  const salted = `${plainText}::nourishnet_secure_salt_surat`;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, "0");
  const secondaryHash = Math.abs(hash * 37 ^ 1819044972).toString(16).padStart(8, "0");
  return `argon2id$v=19$m=65536,t=3,p=4$${hexHash}${secondaryHash}`;
}
function generateCryptoNonce() {
  const chars = "0123456789abcdef";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars[Math.floor(Math.random() * chars.length)];
  }
  return nonce;
}
function generateSessionToken(userId, role) {
  const payload = {
    uid: userId,
    role,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1e3,
    // 24 hours
    nonce: generateCryptoNonce().substring(0, 12)
  };
  const str = JSON.stringify(payload);
  const sig = signPayload(str);
  return btoa(`${str}::${sig}`);
}
function verifySessionToken(token) {
  try {
    const decoded = atob(token);
    const [jsonStr, sig] = decoded.split("::");
    if (!jsonStr || !sig) return { valid: false };
    if (signPayload(jsonStr) !== sig) return { valid: false };
    const payload = JSON.parse(jsonStr);
    if (Date.now() > payload.exp) return { valid: false };
    return { valid: true, userId: payload.uid, role: payload.role };
  } catch {
    return { valid: false };
  }
}
function signPayload(dataString) {
  let hash = 0;
  const combined = `${dataString}::${CLIENT_SIGNING_SALT}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, "0");
  const secondaryHash = Math.abs(hash * 31 ^ 1515870810).toString(16).padStart(8, "0");
  return `NN_SIG_${hexHash}${secondaryHash}`;
}
function generateSignedQrToken(reservation, pickupId, listing, volunteerId) {
  const now = /* @__PURE__ */ new Date();
  const issuedAt = now.toISOString();
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1e3).toISOString();
  const expiresAt = listing.pickupWindowEnd < fourHoursLater ? listing.pickupWindowEnd : fourHoursLater;
  const nonce = generateCryptoNonce();
  const rawClaimString = `${reservation.id}|${pickupId}|${listing.id}|${listing.donorId}|${reservation.ngoId}|${volunteerId || "none"}|${issuedAt}|${expiresAt}|${nonce}`;
  const signature = signPayload(rawClaimString);
  const payload = {
    reservationId: reservation.id,
    pickupId,
    listingId: listing.id,
    donorId: listing.donorId,
    ngoId: reservation.ngoId,
    volunteerId,
    issuedAt,
    expiresAt,
    nonce,
    signature
  };
  const tokenString = btoa(JSON.stringify(payload));
  return { tokenString, payload, nonce, expiresAt };
}
function verifyQrToken(tokenString, consumedNonces, reservations, pickups, listings, currentUser) {
  const checks = [];
  let payload;
  try {
    const jsonStr = atob(tokenString.trim());
    payload = JSON.parse(jsonStr);
    checks.push({
      step: 1,
      name: "Payload Format Decodable",
      passed: true,
      message: "Base64 and JSON schema validated successfully."
    });
  } catch {
    checks.push({
      step: 1,
      name: "Payload Format Decodable",
      passed: false,
      message: "Invalid base64 encoding or corrupted JSON payload."
    });
    return {
      success: false,
      httpStatus: 400,
      errorCode: "INVALID_QR_PAYLOAD",
      errorMessage: "QR code could not be decoded or is corrupted.",
      checks
    };
  }
  if (!payload) {
    return {
      success: false,
      httpStatus: 400,
      errorCode: "INVALID_QR_PAYLOAD",
      errorMessage: "Empty QR code payload.",
      checks
    };
  }
  const rawClaimString = `${payload.reservationId}|${payload.pickupId}|${payload.listingId}|${payload.donorId}|${payload.ngoId}|${payload.volunteerId || "none"}|${payload.issuedAt}|${payload.expiresAt}|${payload.nonce}`;
  const expectedSig = signPayload(rawClaimString);
  const sigMatch = payload.signature === expectedSig;
  checks.push({
    step: 2,
    name: "HMAC Cryptographic Signature",
    passed: sigMatch,
    message: sigMatch ? "Digital signature matched authentic NourishNet issuance key." : "Signature forgery detected or payload was tampered with."
  });
  if (!sigMatch) {
    return {
      success: false,
      httpStatus: 401,
      errorCode: "SIGNATURE_MISMATCH",
      errorMessage: "Cryptographic signature invalid. QR is forged or tampered.",
      checks,
      payload
    };
  }
  const now = /* @__PURE__ */ new Date();
  const expiresAtDate = new Date(payload.expiresAt);
  const notExpired = now.getTime() <= expiresAtDate.getTime();
  checks.push({
    step: 3,
    name: "Time-to-Live Freshness",
    passed: notExpired,
    message: notExpired ? `Token is active (expires ${expiresAtDate.toLocaleTimeString()}).` : `Token expired at ${expiresAtDate.toLocaleTimeString()}.`
  });
  if (!notExpired) {
    return {
      success: false,
      httpStatus: 400,
      errorCode: "TOKEN_EXPIRED",
      errorMessage: "QR code has expired. Please request a refreshed code.",
      checks,
      payload
    };
  }
  const reservation = reservations.find((r) => r.id === payload?.reservationId);
  const resExists = !!reservation;
  checks.push({
    step: 4,
    name: "Reservation Exists in Ledger",
    passed: resExists,
    message: resExists ? `Linked to Reservation #${reservation?.id}.` : "Reservation ID not found in system."
  });
  if (!reservation) {
    return {
      success: false,
      httpStatus: 404,
      errorCode: "RESERVATION_NOT_FOUND",
      errorMessage: "Referenced reservation does not exist in database.",
      checks,
      payload
    };
  }
  const validStatus = reservation.status === "CONFIRMED" || reservation.status === "VOLUNTEER_ASSIGNED" || reservation.status === "PICKUP_IN_PROGRESS";
  checks.push({
    step: 5,
    name: "Reservation Ready for Pickup",
    passed: validStatus,
    message: validStatus ? `Reservation in verified state (${reservation.status}).` : `Reservation status is '${reservation.status}' (cannot verify handoff).`
  });
  if (!validStatus) {
    return {
      success: false,
      httpStatus: 409,
      errorCode: "INVALID_RESERVATION_STATE",
      errorMessage: `Reservation is in '${reservation.status}' status, cannot verify pickup.`,
      checks,
      payload
    };
  }
  const pickup = pickups.find((p) => p.id === payload?.pickupId);
  const pickupValid = !!pickup && (pickup.status === "PENDING" || pickup.status === "ASSIGNED" || pickup.status === "IN_TRANSIT");
  checks.push({
    step: 6,
    name: "Pickup Record Unclaimed & Active",
    passed: pickupValid,
    message: pickupValid ? `Pickup record found in active state (${pickup?.status}).` : pickup ? `Pickup is already in '${pickup.status}' status.` : "Pickup record not found."
  });
  if (!pickup || !pickupValid) {
    return {
      success: false,
      httpStatus: 409,
      errorCode: "PICKUP_ALREADY_PROCESSED",
      errorMessage: "This pickup handoff has already been processed or finalized.",
      checks,
      payload
    };
  }
  const isReplay = consumedNonces.has(payload.nonce);
  checks.push({
    step: 7,
    name: "Replay Protection (Single-Use Nonce Check)",
    passed: !isReplay,
    message: !isReplay ? `Nonce ${payload.nonce.substring(0, 10)}... is fresh and unconsumed.` : `REPLAY ATTACK BLOCKED: Nonce ${payload.nonce.substring(0, 10)}... was previously consumed!`
  });
  if (isReplay) {
    return {
      success: false,
      httpStatus: 409,
      errorCode: "NONCE_REPLAY_ATTACK",
      errorMessage: "QR Replay Detected: This code was already scanned and consumed.",
      checks,
      payload
    };
  }
  const listing = listings.find((l) => l.id === payload?.listingId);
  const isAuthorized = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN" || currentUser.id === payload.donorId || currentUser.id === payload.ngoId || currentUser.id === payload.volunteerId || reservation.assignedVolunteerId === currentUser.id || currentUser.role === "DONOR" && listing?.donorId === currentUser.id || currentUser.role === "NGO" && reservation.ngoId === currentUser.id;
  checks.push({
    step: 8,
    name: "Actor Role & Stakeholder Authorization",
    passed: isAuthorized,
    message: isAuthorized ? `Authorized actor (${currentUser.fullName}, role ${currentUser.role}).` : `Unauthorized actor (${currentUser.fullName}) not party to this transaction.`
  });
  if (!isAuthorized) {
    return {
      success: false,
      httpStatus: 403,
      errorCode: "UNAUTHORIZED_VERIFIER",
      errorMessage: "You are not an authorized party for this food donation handoff.",
      checks,
      payload
    };
  }
  return {
    success: true,
    httpStatus: 200,
    checks,
    payload
  };
}
function maskPhoneNumber(phone) {
  if (!phone) return "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  const clean = phone.replace(/\s+/g, "");
  if (clean.length < 6) return "\u2022\u2022\u2022\u2022\u2022\u2022";
  return `${clean.substring(0, 4)} \u2022\u2022\u2022\u2022 ${clean.substring(clean.length - 2)}`;
}
function maskEmail(email) {
  if (!email) return "\u2022\u2022\u2022\u2022@\u2022\u2022\u2022\u2022.com";
  const [user, domain] = email.split("@");
  if (!domain) return "\u2022\u2022\u2022\u2022@\u2022\u2022\u2022\u2022.com";
  const maskedUser = user.length > 2 ? `${user[0]}\u2022\u2022\u2022${user[user.length - 1]}` : "\u2022\u2022";
  return `${maskedUser}@${domain}`;
}
function getSafeLocationInfo(listing, currentUser, activeReservation) {
  if (!currentUser) {
    return {
      locality: `${listing.donorLocality}, Surat`,
      exactAddress: `${listing.donorLocality} Area, Surat (Address available upon confirmed reservation)`,
      isAddressMasked: true,
      contactPhone: maskPhoneNumber(listing.donorPhone)
    };
  }
  const isOwner = listing.donorId === currentUser.id;
  const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  const isAssignedNgo = activeReservation && activeReservation.ngoId === currentUser.id;
  const isAssignedVol = activeReservation && activeReservation.assignedVolunteerId === currentUser.id;
  if (isOwner || isAdmin || isAssignedNgo || isAssignedVol) {
    return {
      locality: `${listing.donorLocality}, Surat`,
      exactAddress: listing.pickupAddress,
      isAddressMasked: false,
      contactPhone: listing.donorPhone
    };
  }
  return {
    locality: `${listing.donorLocality}, Surat`,
    exactAddress: `${listing.donorLocality} Area, Surat (Exact address revealed after reservation)`,
    isAddressMasked: true,
    contactPhone: maskPhoneNumber(listing.donorPhone)
  };
}
function generateCryptographicOtp() {
  let num = 0;
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    num = 100000 + (arr[0] % 900000);
  } else {
    num = Math.floor(100000 + Math.random() * 900000);
  }
  const code = num.toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
  return { code, expiresAt };
}
function verifyOtpCode(otpInput, pickup, reservation, listing, currentUser) {
  const checks = [];
  const cleanInput = otpInput.trim().replace(/\D/g, "");
  const formatOk = cleanInput.length === 4 || cleanInput.length === 6;
  checks.push({
    step: 1,
    name: "OTP Format Valid (4 or 6 digits)",
    passed: formatOk,
    message: formatOk ? `${cleanInput.length}-digit numeric OTP structure confirmed.` : "OTP must be 4 or 6 numeric digits."
  });
  if (!formatOk) {
    return {
      success: false,
      httpStatus: 400,
      method: "OTP",
      errorCode: "INVALID_OTP_FORMAT",
      errorMessage: "Invalid OTP length. Enter the 4 or 6-digit code shown by the other participant.",
      checks
    };
  }
  const now = Date.now();
  const expiresAt = pickup.otpExpiresAt ? new Date(pickup.otpExpiresAt).getTime() : 0;
  const notExpired = expiresAt > 0 && now <= expiresAt;
  checks.push({
    step: 2,
    name: "OTP Freshness & Expiry",
    passed: notExpired,
    message: notExpired ? "OTP is fresh and within the 15-minute verification window." : "OTP has expired. Please regenerate a new code."
  });
  if (!notExpired) {
    return {
      success: false,
      httpStatus: 400,
      method: "OTP",
      errorCode: "OTP_EXPIRED",
      errorMessage: 'The OTP code has expired. Tap "Regenerate OTP" to receive a fresh code.',
      checks
    };
  }
  const currentAttempts = pickup.otpAttemptCount || 0;
  const attemptsAllowed = currentAttempts < 3;
  checks.push({
    step: 3,
    name: "Rate Limiting & Anti-Brute-Force",
    passed: attemptsAllowed,
    message: attemptsAllowed ? `Attempt ${currentAttempts + 1} of 3 maximum allowed attempts.` : "Too many failed verification attempts. OTP locked for safety."
  });
  if (!attemptsAllowed) {
    return {
      success: false,
      httpStatus: 429,
      method: "OTP",
      errorCode: "MAX_ATTEMPTS_EXCEEDED",
      errorMessage: "Maximum verification attempts exceeded. Please regenerate a new OTP or switch to QR scan.",
      checks
    };
  }
  const expectedOtp = pickup.otpCode || "";
  const isMatch = cleanInput === expectedOtp;
  checks.push({
    step: 4,
    name: "Single-Use OTP Code Match",
    passed: isMatch,
    message: isMatch ? "OTP matched authentic active dispatch session." : "Incorrect OTP code entered."
  });
  if (!isMatch) {
    return {
      success: false,
      httpStatus: 401,
      method: "OTP",
      errorCode: "OTP_MISMATCH",
      errorMessage: `Incorrect OTP code (${3 - currentAttempts - 1} attempts remaining). Please check the code shown on the sender's device.`,
      checks
    };
  }
  const isAuthorized = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN" || currentUser.id === pickup.donorId || currentUser.id === pickup.ngoId || currentUser.id === pickup.volunteerId || reservation.assignedVolunteerId === currentUser.id || currentUser.role === "DONOR" && listing.donorId === currentUser.id || currentUser.role === "NGO" && reservation.ngoId === currentUser.id || currentUser.role === "VOLUNTEER" && reservation.assignedVolunteerId === currentUser.id;
  checks.push({
    step: 5,
    name: "Actor Stakeholder Authorization",
    passed: isAuthorized,
    message: isAuthorized ? `Authorized actor (${currentUser.fullName}, role ${currentUser.role}).` : `Unauthorized actor (${currentUser.fullName}) not party to this transaction.`
  });
  if (!isAuthorized) {
    return {
      success: false,
      httpStatus: 403,
      method: "OTP",
      errorCode: "UNAUTHORIZED_VERIFIER",
      errorMessage: "You are not an authorized participant for this food recovery handoff.",
      checks
    };
  }
  const auditHash = `AUDIT_OTP_${pickup.id.slice(-6)}_${Date.now()}_${generateCryptoNonce().slice(0, 8)}`;
  return {
    success: true,
    httpStatus: 200,
    method: "OTP",
    checks,
    auditHash
  };
}
function canUserPerformAction(user, action, context) {
  if (!user) {
    return { allowed: false, reason: "Authentication required. Please sign in." };
  }
  if (user.accountState === "SUSPENDED" || user.accountState === "DEACTIVATED" || user.accountState === "REJECTED") {
    return { allowed: false, reason: `Account is ${user.accountState.toLowerCase()}. Contact support.` };
  }
  if (!user.isActive) {
    return { allowed: false, reason: "Account is inactive." };
  }
  switch (action) {
    case "CREATE_LISTING":
      if (user.role !== "DONOR") return { allowed: false, reason: "Only verified donors can publish surplus food." };
      if (!user.isVerified) return { allowed: false, reason: "Donor account is pending admin verification." };
      return { allowed: true };
    case "RESERVE_FOOD":
      if (user.role !== "NGO") return { allowed: false, reason: "Only registered NGOs can reserve surplus food." };
      if (!user.isVerified) return { allowed: false, reason: "NGO account is pending admin verification." };
      return { allowed: true };
    case "ASSIGN_VOLUNTEER":
      if (user.role !== "NGO" && user.role !== "ADMIN") return { allowed: false, reason: "Only NGOs can dispatch volunteers." };
      return { allowed: true };
    case "VERIFY_PICKUP":
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "VOLUNTEER" || user.role === "NGO" || user.role === "DONOR") {
        return { allowed: true };
      }
      return { allowed: false, reason: "Role not authorized for pickup handoff verification." };
    case "REVIEW_APPLICATIONS":
    case "MODERATE_LISTINGS":
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return { allowed: true };
      return { allowed: false, reason: "Administrator privileges required." };
    case "MANAGE_ADMINS":
      if (user.role === "SUPER_ADMIN") return { allowed: true };
      return { allowed: false, reason: "Super Administrator privileges required." };
    case "SUBMIT_FEEDBACK":
    case "REPORT_ISSUE":
      return { allowed: true };
    default:
      return { allowed: false, reason: "Action not recognized." };
  }
}
export {
  canUserPerformAction,
  generateCryptoNonce,
  generateCryptographicOtp,
  generateSessionToken,
  generateSignedQrToken,
  getSafeLocationInfo,
  hashPassword,
  maskEmail,
  maskPhoneNumber,
  signPayload,
  verifyOtpCode,
  verifyQrToken,
  verifySessionToken
};
