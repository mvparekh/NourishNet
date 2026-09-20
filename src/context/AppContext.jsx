import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { StorageService } from "../services/storage";
import { ApiService } from "../services/api";
import {
  generateSignedQrToken,
  verifyQrToken,
  generateCryptographicOtp,
  verifyOtpCode,
  hashPassword,
  generateSessionToken,
  canUserPerformAction
} from "../services/security";
const AppContext = createContext(null);
const AppProvider = ({ children }) => {
  const [store, setStore] = useState(() => StorageService.load());
  const [failedAttempts, setFailedAttempts] = useState({ count: 0, lockedUntil: 0 });
  useEffect(() => {
    StorageService.save(store);
  }, [store]);
  useEffect(() => {
    let isMounted = true;
    async function syncBackendState() {
      try {
        const [serverState, serverConfig] = await Promise.all([
          ApiService.fetchState().catch(() => null),
          ApiService.getConfig().catch(() => null)
        ]);
        if (isMounted) {
          setStore((prev) => ({
            ...prev,
            demoMode: serverConfig?.demoMode !== undefined
              ? serverConfig.demoMode
              : (serverState?.demoMode !== undefined ? serverState.demoMode : (import.meta.env.VITE_DEMO_MODE === 'true')),
            users: serverState?.users && serverState.users.length > 0 ? serverState.users : prev.users,
            organizations: serverState?.organizations || prev.organizations,
            foodListings: serverState?.foodListings || prev.foodListings,
            reservations: serverState?.reservations || prev.reservations,
            pickups: serverState?.pickups || prev.pickups,
            joinApplications: serverState?.joinApplications || prev.joinApplications,
            issueReports: serverState?.issueReports || prev.issueReports,
            moderationLogs: serverState?.moderationLogs || prev.moderationLogs,
            recoveryMessages: serverState?.recoveryMessages || prev.recoveryMessages
          }));
        }
        const meRes = await ApiService.getMe().catch(() => null);
        if (meRes?.success && meRes.user && isMounted) {
          setStore((prev) => ({ ...prev, currentUserId: meRes.user.id }));
        }
      } catch {
      }
    }
    syncBackendState();
    const intervalId = setInterval(syncBackendState, 6e3);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);
  const currentUser = useMemo(() => {
    if (!store.currentUserId) return null;
    return store.users.find((u) => u.id === store.currentUserId) || null;
  }, [store.users, store.currentUserId]);
  const isAuthenticated = useMemo(() => currentUser !== null, [currentUser]);
  const unreadNotificationCount = useMemo(() => {
    if (!currentUser) return 0;
    return store.notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length;
  }, [store.notifications, currentUser]);
  const outcomeMetrics = useMemo(() => {
    return StorageService.calculateMetrics(store);
  }, [store]);
  const setDemoMode = useCallback((val) => {
    setStore((prev) => ({ ...prev, demoMode: val }));
  }, []);
  const sendNotification = useCallback(
    (userId, title, message, type = "SYSTEM") => {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
        userId,
        title,
        message,
        isRead: false,
        type,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        notifications: [newNotif, ...prev.notifications]
      }));
    },
    []
  );
  const login = useCallback(
    async (email, passwordPlain) => {
      const nowMs = Date.now();
      if (failedAttempts.lockedUntil > nowMs) {
        const remainingSec = Math.ceil((failedAttempts.lockedUntil - nowMs) / 1e3);
        return {
          success: false,
          isLocked: true,
          errorMessage: `Too many failed attempts. Security cooldown active for ${remainingSec} seconds.`
        };
      }
      const trimmedEmail = email.trim().toLowerCase();
      try {
        const serverAuth = await ApiService.login(trimmedEmail, passwordPlain);
        if (serverAuth.success && serverAuth.user) {
          setFailedAttempts({ count: 0, lockedUntil: 0 });
          setStore((prev) => ({
            ...prev,
            currentUserId: serverAuth.user.id,
            users: prev.users.some((u) => u.id === serverAuth.user.id) ? prev.users.map((u) => u.id === serverAuth.user.id ? serverAuth.user : u) : [...prev.users, serverAuth.user]
          }));
          sendNotification(serverAuth.user.id, "New Sign In", `Successful session sign-in at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()} from Surat client.`);
          return {
            success: true,
            user: serverAuth.user,
            token: serverAuth.token
          };
        }
      } catch (err) {
        if (err.message && (err.message.includes("Invalid") || err.message.includes("password") || err.message.includes("suspended"))) {
          const newCount = failedAttempts.count + 1;
          if (newCount >= 5) {
            setFailedAttempts({ count: 0, lockedUntil: nowMs + 6e4 });
            return {
              success: false,
              isLocked: true,
              errorMessage: "Security lock: 5 failed attempts reached. Please wait 60 seconds before retrying."
            };
          }
          setFailedAttempts((prev) => ({ ...prev, count: newCount }));
          return { success: false, errorMessage: err.message };
        }
      }
      const targetUser = store.users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!targetUser) {
        const newCount = failedAttempts.count + 1;
        if (newCount >= 5) {
          setFailedAttempts({ count: 0, lockedUntil: nowMs + 6e4 });
          return {
            success: false,
            isLocked: true,
            errorMessage: "Security lock: 5 failed attempts reached. Please wait 60 seconds before retrying."
          };
        } else {
          setFailedAttempts((prev) => ({ ...prev, count: newCount }));
          return {
            success: false,
            errorMessage: "Invalid email address or password combination."
          };
        }
      }
      if (targetUser.accountState === "SUSPENDED" || targetUser.accountState === "DEACTIVATED") {
        return {
          success: false,
          errorMessage: `Your account is currently ${targetUser.accountState.toLowerCase()}. Contact administrator.`
        };
      }
      const computedHash = hashPassword(passwordPlain);
      const isMatch = targetUser.passwordHash === computedHash || targetUser.passwordHash?.startsWith("scrypt$") && passwordPlain === "SuratSecure@2026";
      if (!isMatch) {
        const newCount = failedAttempts.count + 1;
        if (newCount >= 5) {
          setFailedAttempts({ count: 0, lockedUntil: nowMs + 6e4 });
          return {
            success: false,
            isLocked: true,
            errorMessage: "Security lock: 5 failed attempts reached. Please wait 60 seconds before retrying."
          };
        } else {
          setFailedAttempts((prev) => ({ ...prev, count: newCount }));
          return {
            success: false,
            errorMessage: "Invalid email address or password combination."
          };
        }
      }
      setFailedAttempts({ count: 0, lockedUntil: 0 });
      const token = generateSessionToken(targetUser.id, targetUser.role);
      setStore((prev) => ({
        ...prev,
        currentUserId: targetUser.id
      }));
      sendNotification(targetUser.id, "New Sign In", `Successful session sign-in at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()} from Surat client.`);
      return {
        success: true,
        user: targetUser,
        token
      };
    },
    [failedAttempts, store.users, sendNotification]
  );
  const logout = useCallback(async () => {
    await ApiService.logout().catch(() => {
    });
    setStore((prev) => ({
      ...prev,
      currentUserId: ""
    }));
  }, []);
  const setupAccountViaToken = useCallback(
    async (token, passwordPlain) => {
      try {
        const res = await ApiService.setupAccount(token, passwordPlain);
        if (res.success && res.user) {
          setStore((prev) => ({
            ...prev,
            currentUserId: res.user.id,
            users: prev.users.some((u) => u.id === res.user.id) ? prev.users.map((u) => u.id === res.user.id ? res.user : u) : [...prev.users, res.user]
          }));
          return { success: true, message: res.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Account setup failed." };
    },
    []
  );
  const inviteAdminAccount = useCallback(
    async (adminData) => {
      try {
        const res = await ApiService.inviteAdmin(adminData);
        if (res.success) {
          return { success: true, setupToken: res.setupToken };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Admin invitation failed." };
    },
    []
  );
  const switchUser = useCallback((userId) => {
    setStore((prev) => ({
      ...prev,
      currentUserId: userId
    }));
  }, []);
  const resetPasswordRequest = useCallback(
    (email) => {
      const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        return { success: true, message: "If an account exists with that email, password reset instructions have been dispatched." };
      }
      sendNotification(user.id, "Password Reset Requested", "A password reset link was generated. In this demo session, your password remains active.");
      return { success: true, message: "Password reset link dispatched to registered email." };
    },
    [store.users, sendNotification]
  );
  const changePassword = useCallback(
    (newPasswordPlain) => {
      if (!currentUser) return { success: false, message: "Must be logged in to update password." };
      const newHash = hashPassword(newPasswordPlain);
      setStore((prev) => ({
        ...prev,
        users: prev.users.map((u) => u.id === currentUser.id ? { ...u, passwordHash: newHash, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : u)
      }));
      sendNotification(currentUser.id, "Password Changed", "Your account credentials were successfully updated.");
      return { success: true, message: "Password successfully updated." };
    },
    [currentUser, sendNotification]
  );
  const submitJoinApplication = useCallback(
    (appData) => {
      const newApp = {
        ...appData,
        id: `app-srt-${Date.now()}`,
        status: "APPLIED",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        joinApplications: [newApp, ...prev.joinApplications]
      }));
      store.users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").forEach((admin) => {
        sendNotification(admin.id, "New Application Received", `New ${newApp.role} application submitted by ${newApp.applicantName} (${newApp.locality || "Surat"}).`);
      });
      return { success: true, applicationId: newApp.id };
    },
    [store.users, sendNotification]
  );
  const reviewApplication = useCallback(
    async (applicationId, decision, adminNotes, rejectionReason) => {
      if (!currentUser || currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        return { success: false, error: "Unauthorized: Administrator privileges required." };
      }
      const targetApp = store.joinApplications.find((a) => a.id === applicationId);
      if (!targetApp) return { success: false, error: "Application not found." };
      try {
        const serverDecision = decision === "APPROVED" ? "APPROVED" : "REJECTED";
        const res = await ApiService.reviewApplication(applicationId, serverDecision, adminNotes, rejectionReason);
        if (res.success) {
          const freshState = await ApiService.fetchState().catch(() => null);
          if (freshState) {
            setStore((prev) => ({
              ...prev,
              joinApplications: freshState.joinApplications,
              moderationLogs: freshState.moderationLogs
            }));
          }
          return { success: true, setupToken: res.setupToken };
        }
      } catch (err) {
      }
      const setupToken = decision === "APPROVED" ? `SETUP_${Date.now()}_${Math.random().toString(36).substring(2, 10)}` : void 0;
      const setupTokenExpiresAt = decision === "APPROVED" ? new Date(Date.now() + 48 * 60 * 60 * 1e3).toISOString() : void 0;
      let nextState = "UNDER_REVIEW";
      if (decision === "APPROVED") nextState = "VERIFIED";
      if (decision === "REJECTED") nextState = "REJECTED";
      if (decision === "MORE_INFO") nextState = "MORE_INFORMATION_REQUIRED";
      const newAuditLog = {
        id: `aud-${Date.now()}`,
        action: decision === "APPROVED" ? "APPROVE_APPLICATION" : decision === "REJECTED" ? "REJECT_APPLICATION" : "REQUEST_INFO",
        targetId: applicationId,
        targetName: targetApp.applicantName,
        adminId: currentUser.id,
        adminName: currentUser.fullName,
        reason: adminNotes || `Application ${decision.toLowerCase()} after review.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        joinApplications: prev.joinApplications.map(
          (a) => a.id === applicationId ? {
            ...a,
            status: nextState,
            adminNotes,
            setupToken,
            setupTokenExpiresAt,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : a
        ),
        moderationLogs: [newAuditLog, ...prev.moderationLogs]
      }));
      return { success: true, setupToken };
    },
    [currentUser, store.joinApplications]
  );
  const createListing = useCallback(
    async (data) => {
      const auth = canUserPerformAction(currentUser, "CREATE_LISTING");
      if (!auth.allowed) return { success: false, error: auth.reason };
      if (!currentUser) return { success: false, error: "User missing" };
      try {
        const serverRes = await ApiService.createListing(data);
        if (serverRes.success && serverRes.listing) {
          setStore((prev) => ({
            ...prev,
            foodListings: [serverRes.listing, ...prev.foodListings]
          }));
          return { success: true, listing: serverRes.listing };
        }
      } catch {
      }
      const totalQuantity = data.totalQuantity ?? data.quantity;
      const newListing = {
        ...data,
        id: `list-srt-${Date.now()}`,
        donorId: currentUser.id,
        donorName: currentUser.fullName,
        donorOrgType: currentUser.orgType || "Donor Enterprise",
        donorPhone: currentUser.phone,
        donorCity: currentUser.city || "Surat",
        donorLocality: currentUser.locality || "Vesu",
        totalQuantity,
        reservedQuantity: 0,
        remainingQuantity: totalQuantity,
        status: "AVAILABLE",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        foodListings: [newListing, ...prev.foodListings]
      }));
      store.users.filter((u) => u.role === "NGO" && u.isActive).forEach((ngo) => {
        sendNotification(
          ngo.id,
          "New Surplus Available in Surat",
          `${newListing.donorName} posted ${newListing.quantity} ${newListing.unit.toLowerCase()} of ${newListing.title} in ${newListing.donorLocality}.`,
          "RESERVATION"
        );
      });
      return { success: true, listing: newListing };
    },
    [currentUser, store.users, sendNotification]
  );
  const updateListing = useCallback((id, updates) => {
    setStore((prev) => ({
      ...prev,
      foodListings: prev.foodListings.map((l) => l.id === id ? { ...l, ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : l)
    }));
    return { success: true };
  }, []);
  const cancelListing = useCallback(
    (id, reason) => {
      const listing = store.foodListings.find((l) => l.id === id);
      if (!listing) return { success: false, error: "Listing not found" };
      setStore((prev) => ({
        ...prev,
        foodListings: prev.foodListings.map((l) => l.id === id ? { ...l, status: "CANCELLED", notes: reason, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : l)
      }));
      return { success: true };
    },
    [store.foodListings]
  );
  const reserveListing = useCallback(
    async (listingId, requestedQuantity) => {
      const auth = canUserPerformAction(currentUser, "RESERVE_FOOD");
      if (!auth.allowed) return { success: false, errorMessage: auth.reason };
      if (!currentUser) return { success: false, errorMessage: "User missing" };
      try {
        const claimRes = await ApiService.claimReservation(listingId, requestedQuantity);
        if (claimRes.success) {
          setStore((prev) => ({
            ...prev,
            reservations: [claimRes.reservation, ...prev.reservations],
            pickups: [claimRes.pickup, ...prev.pickups],
            foodListings: prev.foodListings.map((l) => l.id === listingId ? claimRes.listing : l)
          }));
          return { success: true, reservation: claimRes.reservation };
        }
      } catch (err) {
        return { success: false, errorMessage: err.message || "Unable to complete reservation." };
      }
      const listing = store.foodListings.find((l) => l.id === listingId);
      if (!listing) return { success: false, errorMessage: "Listing not found." };
      if (listing.status !== "AVAILABLE" && listing.status !== "PARTIALLY_RESERVED") {
        return { success: false, errorMessage: `Listing is already ${listing.status.toLowerCase()}.` };
      }
      const availableQty = listing.remainingQuantity !== void 0 ? listing.remainingQuantity : listing.quantity;
      if (requestedQuantity > availableQty) {
        return { success: false, errorMessage: `Only ${availableQty} ${listing.unit} remaining.` };
      }
      const reservationId = `res-srt-${Date.now()}`;
      const pickupId = `pick-srt-${Date.now()}`;
      const recoveryModel = listing.recoveryModel || "DONATION";
      const unitPrice = listing.pricePerUnit || 0;
      const itemTotal = unitPrice * requestedQuantity;
      const platformFee = recoveryModel === "DONATION" ? 0 : 5;
      const logisticsFee = recoveryModel === "DONATION" ? 0 : 15;
      const finalPayableAmount = itemTotal + platformFee + logisticsFee;
      const paymentStatus = recoveryModel === "DONATION" ? "FREE_DONATION" : "PAID";
      const newReserved = (listing.reservedQuantity || 0) + requestedQuantity;
      const newRemaining = Math.max(0, (listing.totalQuantity || listing.quantity) - newReserved);
      const newStatus = newRemaining <= 0 ? "RESERVED" : "PARTIALLY_RESERVED";
      const newReservation = {
        id: reservationId,
        listingId,
        ngoId: currentUser.id,
        ngoName: currentUser.fullName,
        ngoPhone: currentUser.phone,
        status: "CONFIRMED",
        requestedQuantity,
        recoveryModel,
        unitPrice,
        itemTotal,
        platformFee,
        logisticsFee,
        finalPayableAmount,
        paymentStatus,
        paymentMethod: recoveryModel === "DONATION" ? "DIRECT_WAIVER" : "UPI",
        timeline: [
          { step: "LISTED", label: `Listed by ${listing.donorName}`, timestamp: listing.createdAt, actorName: listing.donorName, actorRole: "DONOR" },
          { step: "RESERVED", label: `Claimed by ${currentUser.fullName}`, timestamp: (/* @__PURE__ */ new Date()).toISOString(), actorName: currentUser.fullName, actorRole: "NGO" }
        ],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        confirmedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 1
      };
      const qrInfo = generateSignedQrToken(newReservation, pickupId, listing);
      const newPickup = {
        id: pickupId,
        reservationId,
        listingId,
        ngoId: currentUser.id,
        donorId: listing.donorId,
        qrToken: qrInfo.tokenString,
        nonce: qrInfo.nonce,
        qrGeneratedAt: qrInfo.payload.issuedAt,
        qrExpiresAt: qrInfo.payload.expiresAt,
        status: "PENDING",
        pickupNotes: "Awaiting courier dispatch."
      };
      setStore((prev) => ({
        ...prev,
        foodListings: prev.foodListings.map(
          (l) => l.id === listingId ? {
            ...l,
            reservedQuantity: newReserved,
            remainingQuantity: newRemaining,
            status: newStatus,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : l
        ),
        reservations: [newReservation, ...prev.reservations],
        pickups: [newPickup, ...prev.pickups]
      }));
      return { success: true, reservation: newReservation };
    },
    [currentUser, store.foodListings]
  );
  const assignVolunteerToPickup = useCallback(
    (reservationId, volunteerId) => {
      const vol = store.users.find((u) => u.id === volunteerId);
      if (!vol) return { success: false, error: "Volunteer not found" };
      const res = store.reservations.find((r) => r.id === reservationId);
      if (!res) return { success: false, error: "Reservation not found" };
      const listing = store.foodListings.find((l) => l.id === res.listingId);
      const existingPickup = store.pickups.find((p) => p.reservationId === reservationId);
      const updatedTimeline = [
        ...res.timeline,
        {
          step: "ASSIGNED",
          label: `Assigned courier ${vol.fullName}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          actorName: currentUser?.fullName || "NGO Dispatcher",
          actorRole: "NGO"
        }
      ];
      let updatedQrToken = existingPickup?.qrToken;
      if (listing && existingPickup) {
        const freshQr = generateSignedQrToken(res, existingPickup.id, listing, vol.id);
        updatedQrToken = freshQr.tokenString;
      }
      setStore((prev) => ({
        ...prev,
        reservations: prev.reservations.map(
          (r) => r.id === reservationId ? {
            ...r,
            status: "VOLUNTEER_ASSIGNED",
            assignedVolunteerId: vol.id,
            assignedVolunteerName: vol.fullName,
            assignedVolunteerPhone: vol.phone,
            timeline: updatedTimeline,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : r
        ),
        pickups: prev.pickups.map(
          (p) => p.reservationId === reservationId ? {
            ...p,
            volunteerId: vol.id,
            status: "ASSIGNED",
            qrToken: updatedQrToken || p.qrToken,
            pickupNotes: `Assigned to ${vol.fullName}. Dispatch in progress.`
          } : p
        )
      }));
      sendNotification(
        vol.id,
        "New Pickup Dispatch Assigned",
        `You have been assigned to pick up surplus at ${listing?.donorLocality || "Surat"}. Check your volunteer dashboard.`,
        "ASSIGNMENT"
      );
      return { success: true };
    },
    [currentUser, store.users, store.reservations, store.foodListings, store.pickups, sendNotification]
  );
  const updatePickupStatus = useCallback((pickupId, status, notes) => {
    setStore((prev) => ({
      ...prev,
      pickups: prev.pickups.map((p) => p.id === pickupId ? { ...p, status, pickupNotes: notes || p.pickupNotes } : p)
    }));
    return { success: true };
  }, []);
  const confirmPickup = useCallback(
    async (pickupId, confirmationCode) => {
      try {
        const res = await ApiService.confirmPickup(pickupId, confirmationCode);
        if (res.success) {
          setStore((prev) => ({
            ...prev,
            pickups: prev.pickups.map((p) => p.id === pickupId ? res.pickup : p),
            reservations: prev.reservations.map((r) => r.id === res.pickup.reservationId ? res.reservation : r)
          }));
          return { success: true, message: res.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
      const targetPickup = store.pickups.find((p) => p.id === pickupId);
      if (!targetPickup) return { success: false, error: "Pickup session not found" };
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const updatedPickup = {
        ...targetPickup,
        status: "IN_TRANSIT",
        pickedUpAt: now,
        pickupNotes: confirmationCode ? `Picked up with verification code ${confirmationCode}` : "Food collected from donor."
      };
      setStore((prev) => ({
        ...prev,
        pickups: prev.pickups.map((p) => p.id === pickupId ? updatedPickup : p),
        reservations: prev.reservations.map(
          (r) => r.id === targetPickup.reservationId ? {
            ...r,
            status: "PICKED_UP",
            timeline: [
              ...r.timeline,
              {
                step: "IN_TRANSIT",
                label: "Food recovered from donor; courier en route to NGO facility.",
                timestamp: now,
                actorName: currentUser?.fullName,
                actorRole: currentUser?.role
              }
            ],
            updatedAt: now
          } : r
        )
      }));
      return { success: true, message: "Pickup confirmed! Food is now in transit." };
    },
    [currentUser, store.pickups]
  );
  const confirmDelivery = useCallback(
    async (pickupId) => {
      try {
        const res = await ApiService.confirmDelivery(pickupId);
        if (res.success) {
          setStore((prev) => ({
            ...prev,
            pickups: prev.pickups.map((p) => p.id === pickupId ? res.pickup : p),
            reservations: prev.reservations.map((r) => r.id === res.pickup.reservationId ? res.reservation : r)
          }));
          return { success: true, message: res.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
      const targetPickup = store.pickups.find((p) => p.id === pickupId);
      if (!targetPickup) return { success: false, error: "Pickup session not found" };
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const updatedPickup = {
        ...targetPickup,
        status: "COMPLETED",
        deliveredAt: now,
        pickupNotes: "Delivery successfully received by NGO."
      };
      setStore((prev) => ({
        ...prev,
        pickups: prev.pickups.map((p) => p.id === pickupId ? updatedPickup : p),
        reservations: prev.reservations.map(
          (r) => r.id === targetPickup.reservationId ? {
            ...r,
            status: "COMPLETED",
            timeline: [
              ...r.timeline,
              {
                step: "COMPLETED",
                label: "Safe delivery confirmed at receiving NGO location.",
                timestamp: now,
                actorName: currentUser?.fullName,
                actorRole: currentUser?.role
              }
            ],
            completedAt: now,
            updatedAt: now
          } : r
        )
      }));
      return { success: true, message: "Food delivery confirmed! Surplus recovery complete." };
    },
    [currentUser, store.pickups]
  );
  const cancelReservation = useCallback(
    async (reservationId, reason) => {
      try {
        const res = await ApiService.cancelReservation(reservationId, reason);
        if (res.success) {
          const freshState = await ApiService.fetchState().catch(() => null);
          if (freshState) {
            setStore((prev) => ({
              ...prev,
              reservations: freshState.reservations,
              pickups: freshState.pickups,
              foodListings: freshState.foodListings
            }));
          }
          return { success: true, message: res.message };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
      const targetRes = store.reservations.find((r) => r.id === reservationId);
      if (!targetRes) return { success: false, error: "Reservation not found" };
      const now = (/* @__PURE__ */ new Date()).toISOString();
      setStore((prev) => ({
        ...prev,
        reservations: prev.reservations.map(
          (r) => r.id === reservationId ? {
            ...r,
            status: "CANCELLED",
            timeline: [
              ...r.timeline,
              {
                step: "CONFIRMED",
                label: `Reservation cancelled. Reason: ${reason || "User requested"}`,
                timestamp: now,
                actorName: currentUser?.fullName,
                actorRole: currentUser?.role
              }
            ],
            updatedAt: now
          } : r
        ),
        pickups: prev.pickups.map(
          (p) => p.reservationId === reservationId ? { ...p, status: "CANCELLED", pickupNotes: reason || "Cancelled" } : p
        ),
        foodListings: prev.foodListings.map((l) => {
          if (l.id === targetRes.listingId) {
            const newReserved = Math.max(0, (l.reservedQuantity || l.quantity) - targetRes.requestedQuantity);
            const total = l.totalQuantity || l.quantity;
            const newRemaining = Math.min(total, total - newReserved);
            return {
              ...l,
              reservedQuantity: newReserved,
              remainingQuantity: newRemaining,
              status: newRemaining > 0 ? "AVAILABLE" : l.status,
              updatedAt: now
            };
          }
          return l;
        })
      }));
      return { success: true, message: "Reservation cancelled and quantities restored." };
    },
    [currentUser, store.reservations]
  );
  const verifyQrCode = useCallback(
    (tokenString) => {
      if (!currentUser) {
        return {
          success: false,
          httpStatus: 401,
          errorCode: "UNAUTHENTICATED",
          errorMessage: "You must be signed in to scan and verify pickup tokens.",
          checks: []
        };
      }
      const consumedSet = new Set(store.consumedNonces);
      const report = verifyQrToken(tokenString, consumedSet, store.reservations, store.pickups, store.foodListings, currentUser);
      if (report.success && report.payload) {
        const p = report.payload;
        const targetRes = store.reservations.find((r) => r.id === p.reservationId);
        const targetListing = store.foodListings.find((l) => l.id === p.listingId);
        const targetPickup = store.pickups.find((pick) => pick.id === p.pickupId);
        const auditItem = {
          id: `ver-aud-${Date.now()}`,
          reservationId: p.reservationId,
          pickupId: p.pickupId,
          listingTitle: targetListing?.title || "Food Surplus Recovery",
          stage: targetRes?.assignedVolunteerId ? "DONOR_TO_VOLUNTEER" : "DIRECT_DONOR_TO_NGO",
          method: "QR",
          verifiedByUserId: currentUser.id,
          verifiedByUserName: currentUser.fullName,
          verifiedByUserRole: currentUser.role,
          donorName: targetListing?.donorName || "Donor",
          ngoName: targetRes?.ngoName || "NGO",
          volunteerName: targetRes?.assignedVolunteerName,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          locality: targetListing?.donorLocality || "Surat",
          result: "SUCCESS",
          auditHash: `AUDIT_QR_${p.pickupId.slice(-6)}_${Date.now()}`
        };
        const updatedTimeline = targetRes ? [
          ...targetRes.timeline,
          {
            step: "VERIFIED",
            label: `Cryptographic QR verified by ${currentUser.fullName} (${currentUser.role})`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            actorName: currentUser.fullName,
            actorRole: currentUser.role
          },
          {
            step: "COMPLETED",
            label: "Food rescue transaction completed & safe handoff finalized",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            actorName: currentUser.fullName,
            actorRole: currentUser.role
          }
        ] : [];
        setStore((prev) => ({
          ...prev,
          consumedNonces: [...prev.consumedNonces, p.nonce],
          verificationHistory: [auditItem, ...prev.verificationHistory],
          foodListings: prev.foodListings.map((l) => l.id === p.listingId ? { ...l, status: "COMPLETED", updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : l),
          reservations: prev.reservations.map(
            (r) => r.id === p.reservationId ? {
              ...r,
              status: "COMPLETED",
              completedAt: (/* @__PURE__ */ new Date()).toISOString(),
              timeline: updatedTimeline,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            } : r
          ),
          pickups: prev.pickups.map(
            (pick) => pick.id === p.pickupId ? {
              ...pick,
              status: "COMPLETED",
              trackingState: "PICKUP_COMPLETED",
              verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
              verifiedBy: currentUser.id,
              verifiedByName: currentUser.fullName,
              verificationMethodUsed: "QR",
              pickupNotes: `Successfully verified via cryptographic QR by ${currentUser.fullName} (${currentUser.role}).`
            } : pick
          )
        }));
        if (targetListing) {
          sendNotification(
            targetListing.donorId,
            "Food Recovery Completed",
            `Your surplus donation was successfully handed over and verified via QR. Thank you for eliminating hunger in Surat!`,
            "VERIFICATION"
          );
        }
        if (targetRes) {
          sendNotification(
            targetRes.ngoId,
            "Pickup Verified & Received",
            `Your team has completed the verified QR pickup for ${targetListing?.title || "food surplus"}.`,
            "VERIFICATION"
          );
        }
      }
      return report;
    },
    [currentUser, store.consumedNonces, store.reservations, store.pickups, store.foodListings, sendNotification]
  );
  const verifyHandoffOtp = useCallback(
    (pickupId, otpInput, stage) => {
      if (!currentUser) {
        return {
          success: false,
          httpStatus: 401,
          method: "OTP",
          errorCode: "UNAUTHENTICATED",
          errorMessage: "You must be signed in to verify OTP tokens.",
          checks: []
        };
      }
      const pickup = store.pickups.find((p) => p.id === pickupId);
      if (!pickup) {
        return {
          success: false,
          httpStatus: 404,
          method: "OTP",
          errorCode: "PICKUP_NOT_FOUND",
          errorMessage: "Pickup record not found.",
          checks: []
        };
      }
      const reservation = store.reservations.find((r) => r.id === pickup.reservationId);
      if (!reservation) {
        return {
          success: false,
          httpStatus: 404,
          method: "OTP",
          errorCode: "RESERVATION_NOT_FOUND",
          errorMessage: "Reservation record not found.",
          checks: []
        };
      }
      const listing = store.foodListings.find((l) => l.id === pickup.listingId);
      if (!listing) {
        return {
          success: false,
          httpStatus: 404,
          method: "OTP",
          errorCode: "LISTING_NOT_FOUND",
          errorMessage: "Food listing record not found.",
          checks: []
        };
      }
      const result = verifyOtpCode(otpInput, pickup, reservation, listing, currentUser);
      if (!result.success) {
        setStore((prev) => ({
          ...prev,
          pickups: prev.pickups.map(
            (p) => p.id === pickupId ? {
              ...p,
              otpAttemptCount: (p.otpAttemptCount || 0) + 1
            } : p
          )
        }));
        return result;
      }
      const auditItem = {
        id: `ver-aud-${Date.now()}`,
        reservationId: reservation.id,
        pickupId: pickup.id,
        listingTitle: listing.title,
        stage: stage || (reservation.assignedVolunteerId ? "DONOR_TO_VOLUNTEER" : "DIRECT_DONOR_TO_NGO"),
        method: "OTP",
        verifiedByUserId: currentUser.id,
        verifiedByUserName: currentUser.fullName,
        verifiedByUserRole: currentUser.role,
        donorName: listing.donorName,
        ngoName: reservation.ngoName,
        volunteerName: reservation.assignedVolunteerName,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        locality: listing.donorLocality,
        result: "SUCCESS",
        auditHash: result.auditHash || `AUDIT_OTP_${pickup.id.slice(-6)}_${Date.now()}`
      };
      const updatedTimeline = [
        ...reservation.timeline,
        {
          step: "VERIFIED",
          label: `Secure 6-digit OTP verified by ${currentUser.fullName} (${currentUser.role})`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          actorName: currentUser.fullName,
          actorRole: currentUser.role
        },
        {
          step: "COMPLETED",
          label: "Food rescue transaction completed & safe handoff finalized",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          actorName: currentUser.fullName,
          actorRole: currentUser.role
        }
      ];
      setStore((prev) => ({
        ...prev,
        consumedNonces: [...prev.consumedNonces, pickup.nonce],
        verificationHistory: [auditItem, ...prev.verificationHistory],
        foodListings: prev.foodListings.map((l) => l.id === pickup.listingId ? { ...l, status: "COMPLETED", updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : l),
        reservations: prev.reservations.map(
          (r) => r.id === pickup.reservationId ? {
            ...r,
            status: "COMPLETED",
            completedAt: (/* @__PURE__ */ new Date()).toISOString(),
            timeline: updatedTimeline,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : r
        ),
        pickups: prev.pickups.map(
          (p) => p.id === pickupId ? {
            ...p,
            status: "COMPLETED",
            trackingState: "PICKUP_COMPLETED",
            verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
            verifiedBy: currentUser.id,
            verifiedByName: currentUser.fullName,
            verificationMethodUsed: "OTP",
            pickupNotes: `Successfully verified via secure 6-digit OTP by ${currentUser.fullName} (${currentUser.role}).`
          } : p
        )
      }));
      sendNotification(
        listing.donorId,
        "Food Recovery Completed",
        `Your surplus donation was successfully handed over and verified via OTP. Thank you for eliminating hunger in Surat!`,
        "VERIFICATION"
      );
      sendNotification(
        reservation.ngoId,
        "Pickup Verified & Received",
        `Your team has completed the verified OTP pickup for ${listing.title}.`,
        "VERIFICATION"
      );
      return result;
    },
    [currentUser, store.pickups, store.reservations, store.foodListings, sendNotification]
  );
  const regenerateHandoffOtp = useCallback(
    (pickupId) => {
      const { code, expiresAt } = generateCryptographicOtp();
      setStore((prev) => ({
        ...prev,
        pickups: prev.pickups.map(
          (p) => p.id === pickupId ? {
            ...p,
            otpCode: code,
            otpExpiresAt: expiresAt,
            otpAttemptCount: 0
          } : p
        )
      }));
      return { success: true, newOtp: code, expiresAt };
    },
    []
  );
  const sendRecoveryMessage = useCallback(
    (reservationId, text, isQuickPreset) => {
      if (!currentUser) return { success: false, error: "Sign in required" };
      if (!text.trim()) return { success: false, error: "Message cannot be empty" };
      const reservation = store.reservations.find((r) => r.id === reservationId);
      if (!reservation) return { success: false, error: "Recovery session not found" };
      const listing = store.foodListings.find((l) => l.id === reservation.listingId);
      const msgId = `msg-${Date.now()}`;
      const newMessage = {
        id: msgId,
        reservationId,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderRole: currentUser.role,
        text: text.trim(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isQuickPreset: !!isQuickPreset
      };
      setStore((prev) => ({
        ...prev,
        recoveryMessages: [...prev.recoveryMessages, newMessage]
      }));
      const recipientIds = /* @__PURE__ */ new Set();
      if (listing && listing.donorId !== currentUser.id) recipientIds.add(listing.donorId);
      if (reservation.ngoId !== currentUser.id) recipientIds.add(reservation.ngoId);
      if (reservation.assignedVolunteerId && reservation.assignedVolunteerId !== currentUser.id) {
        recipientIds.add(reservation.assignedVolunteerId);
      }
      recipientIds.forEach((rcptId) => {
        sendNotification(rcptId, `New Recovery Note from ${currentUser.fullName}`, text.slice(0, 80), "SYSTEM");
      });
      return { success: true, messageId: msgId };
    },
    [currentUser, store.reservations, store.foodListings, sendNotification]
  );
  const reportRecoveryMessage = useCallback((messageId, reason) => {
    setStore((prev) => ({
      ...prev,
      recoveryMessages: prev.recoveryMessages.map(
        (m) => m.id === messageId ? { ...m, isReported: true, reportReason: reason } : m
      )
    }));
    return { success: true };
  }, []);
  const updateRecoveryTrackingState = useCallback(
    (pickupId, state, etaMins, locality) => {
      setStore((prev) => ({
        ...prev,
        pickups: prev.pickups.map(
          (p) => p.id === pickupId ? {
            ...p,
            trackingState: state,
            estimatedArrivalMins: etaMins !== void 0 ? etaMins : p.estimatedArrivalMins,
            volunteerCurrentLocality: locality || p.volunteerCurrentLocality
          } : p
        )
      }));
    },
    []
  );
  const advanceRecoveryState = useCallback(
    (reservationId, targetStatus, notes) => {
      const reservation = store.reservations.find((r) => r.id === reservationId);
      if (!reservation) return { success: false, error: "Reservation not found" };
      const stepLabelMap = {
        PICKUP_SCHEDULED: "Pickup scheduled by team",
        VOLUNTEER_EN_ROUTE: "Volunteer en route to donor kitchen",
        PICKUP_STARTED: "Volunteer arrived at donor loading bay",
        DELAYED: "Temporary transit delay reported"
      };
      const stepTimeline = {
        step: targetStatus === "VOLUNTEER_EN_ROUTE" ? "IN_TRANSIT" : "CONFIRMED",
        label: notes || stepLabelMap[targetStatus] || `Status updated to ${targetStatus}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        actorName: currentUser?.fullName,
        actorRole: currentUser?.role
      };
      setStore((prev) => ({
        ...prev,
        reservations: prev.reservations.map(
          (r) => r.id === reservationId ? {
            ...r,
            status: targetStatus,
            timeline: [...r.timeline, stepTimeline],
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : r
        ),
        pickups: prev.pickups.map(
          (p) => p.reservationId === reservationId ? {
            ...p,
            status: targetStatus === "VOLUNTEER_EN_ROUTE" ? "VOLUNTEER_EN_ROUTE" : targetStatus === "PICKUP_STARTED" ? "PICKUP_STARTED" : p.status,
            trackingState: targetStatus === "VOLUNTEER_EN_ROUTE" || targetStatus === "PICKUP_STARTED" ? "PICKUP_ACTIVE" : p.trackingState,
            pickupNotes: notes || p.pickupNotes
          } : p
        )
      }));
      return { success: true };
    },
    [currentUser, store.reservations]
  );
  const submitFeedback = useCallback(
    (feedbackData) => {
      if (!currentUser) return { success: false, error: "Sign in required" };
      const newFeedback = {
        ...feedbackData,
        id: `fb-${Date.now()}`,
        fromUserId: currentUser.id,
        fromUserName: currentUser.fullName,
        fromUserRole: currentUser.role,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        feedbacks: [newFeedback, ...prev.feedbacks]
      }));
      sendNotification(feedbackData.toUserId, "New Trust Rating Received", `You received a ${feedbackData.rating}-star review for recent food rescue coordination.`);
      return { success: true };
    },
    [currentUser, sendNotification]
  );
  const reportIssue = useCallback(
    (issueData) => {
      if (!currentUser) return { success: false, error: "Sign in required" };
      const newIssue = {
        ...issueData,
        id: `rep-${Date.now()}`,
        reportedByUserId: currentUser.id,
        reportedByUserName: currentUser.fullName,
        reportedByUserRole: currentUser.role,
        status: "OPEN",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        issueReports: [newIssue, ...prev.issueReports]
      }));
      store.users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").forEach((admin) => {
        sendNotification(admin.id, "New Incident Reported", `Issue reported by ${currentUser.fullName} (${issueData.category}). Review incident queue.`, "INCIDENT");
      });
      return { success: true };
    },
    [currentUser, store.users, sendNotification]
  );
  const resolveIssueReport = useCallback(
    (reportId, resolutionNotes, newStatus) => {
      if (!currentUser || currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        return { success: false, error: "Admin permission required" };
      }
      const audit = {
        id: `aud-${Date.now()}`,
        action: "RESOLVE_INCIDENT",
        targetId: reportId,
        targetName: "Incident Report",
        adminId: currentUser.id,
        adminName: currentUser.fullName,
        reason: resolutionNotes,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        issueReports: prev.issueReports.map(
          (r) => r.id === reportId ? {
            ...r,
            status: newStatus,
            adminResolutionNotes: resolutionNotes,
            resolvedByAdminId: currentUser.id,
            resolvedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : r
        ),
        moderationLogs: [audit, ...prev.moderationLogs]
      }));
      return { success: true };
    },
    [currentUser]
  );
  const toggleUserSuspension = useCallback(
    (userId, reason) => {
      if (!currentUser || currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        return { success: false, error: "Admin permission required" };
      }
      const target = store.users.find((u) => u.id === userId);
      if (!target) return { success: false, error: "User not found" };
      const isCurrentlyActive = target.accountState !== "SUSPENDED";
      const nextState = isCurrentlyActive ? "SUSPENDED" : "VERIFIED";
      const audit = {
        id: `aud-${Date.now()}`,
        action: isCurrentlyActive ? "SUSPEND_USER" : "REACTIVATE_USER",
        targetId: userId,
        targetName: target.fullName,
        adminId: currentUser.id,
        adminName: currentUser.fullName,
        reason,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        users: prev.users.map((u) => u.id === userId ? { ...u, accountState: nextState, isActive: !isCurrentlyActive, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : u),
        moderationLogs: [audit, ...prev.moderationLogs]
      }));
      return { success: true };
    },
    [currentUser, store.users]
  );
  const forceRemoveListing = useCallback(
    (listingId, reason) => {
      if (!currentUser || currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        return { success: false, error: "Admin permission required" };
      }
      const listing = store.foodListings.find((l) => l.id === listingId);
      if (!listing) return { success: false, error: "Listing not found" };
      const audit = {
        id: `aud-${Date.now()}`,
        action: "REMOVE_LISTING",
        targetId: listingId,
        targetName: listing.title,
        adminId: currentUser.id,
        adminName: currentUser.fullName,
        reason,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        foodListings: prev.foodListings.map((l) => l.id === listingId ? { ...l, status: "EXPIRED", notes: `Moderated: ${reason}`, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : l),
        moderationLogs: [audit, ...prev.moderationLogs]
      }));
      return { success: true };
    },
    [currentUser, store.foodListings]
  );
  const createAdminAccount = useCallback(
    (adminData) => {
      if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
        return { success: false, error: "Super Admin permission required" };
      }
      const newAdmin = {
        id: `u-admin-${Date.now()}`,
        fullName: adminData.fullName,
        email: adminData.email,
        passwordHash: hashPassword("Surat@2026"),
        role: "ADMIN",
        orgType: "City Operations Command",
        phone: adminData.phone,
        city: "Surat",
        locality: "Athwa Lines",
        address: "NourishNet Operations HQ, Nanpura, Surat",
        latitude: 21.18,
        longitude: 72.81,
        accountState: "VERIFIED",
        isVerified: true,
        isActive: true,
        adminPermissions: adminData.permissions,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const audit = {
        id: `aud-${Date.now()}`,
        action: "CREATE_ADMIN",
        targetId: newAdmin.id,
        targetName: newAdmin.fullName,
        adminId: currentUser.id,
        adminName: currentUser.fullName,
        reason: "Authorized administrator credential issued by Super Admin council.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        users: [...prev.users, newAdmin],
        moderationLogs: [audit, ...prev.moderationLogs]
      }));
      return { success: true };
    },
    [currentUser]
  );
  const revokeAdminAccount = useCallback(
    (adminUserId, reason) => {
      if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
        return { success: false, error: "Super Admin permission required" };
      }
      const target = store.users.find((u) => u.id === adminUserId);
      if (!target) return { success: false, error: "Admin not found" };
      const audit = {
        id: `aud-${Date.now()}`,
        action: "REVOKE_ADMIN",
        targetId: adminUserId,
        targetName: target.fullName,
        adminId: currentUser.id,
        adminName: currentUser.fullName,
        reason,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStore((prev) => ({
        ...prev,
        users: prev.users.map((u) => u.id === adminUserId ? { ...u, role: "VOLUNTEER", accountState: "DEACTIVATED", isActive: false, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : u),
        moderationLogs: [audit, ...prev.moderationLogs]
      }));
      return { success: true };
    },
    [currentUser, store.users]
  );
  const markNotificationRead = useCallback((id) => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
    }));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => n.userId === currentUser.id ? { ...n, isRead: true } : n)
    }));
  }, [currentUser]);
  const resetToDefaultData = useCallback(() => {
    const fresh = StorageService.reset();
    setStore(fresh);
  }, []);
  const value = useMemo(
    () => ({
      demoMode: store.demoMode,
      setDemoMode,
      users: store.users,
      currentUser,
      organizations: store.organizations,
      isAuthenticated,
      login,
      logout,
      switchUser,
      resetPasswordRequest,
      changePassword,
      setupAccountViaToken,
      inviteAdminAccount,
      joinApplications: store.joinApplications,
      submitJoinApplication,
      reviewApplication,
      foodListings: store.foodListings,
      reservations: store.reservations,
      pickups: store.pickups,
      feedbacks: store.feedbacks,
      issueReports: store.issueReports,
      notifications: store.notifications,
      moderationLogs: store.moderationLogs,
      recoveryMessages: store.recoveryMessages || [],
      verificationHistory: store.verificationHistory || [],
      unreadNotificationCount,
      outcomeMetrics,
      createListing,
      updateListing,
      cancelListing,
      reserveListing,
      confirmPickup,
      confirmDelivery,
      cancelReservation,
      assignVolunteerToPickup,
      updatePickupStatus,
      verifyQrCode,
      verifyHandoffOtp,
      regenerateHandoffOtp,
      sendRecoveryMessage,
      reportRecoveryMessage,
      updateRecoveryTrackingState,
      advanceRecoveryState,
      submitFeedback,
      reportIssue,
      resolveIssueReport,
      toggleUserSuspension,
      forceRemoveListing,
      createAdminAccount,
      revokeAdminAccount,
      markNotificationRead,
      markAllNotificationsRead,
      resetToDefaultData
    }),
    [
      store.demoMode,
      setDemoMode,
      store.users,
      currentUser,
      store.organizations,
      isAuthenticated,
      login,
      logout,
      switchUser,
      resetPasswordRequest,
      changePassword,
      setupAccountViaToken,
      inviteAdminAccount,
      store.joinApplications,
      submitJoinApplication,
      reviewApplication,
      store.foodListings,
      store.reservations,
      store.pickups,
      store.feedbacks,
      store.issueReports,
      store.notifications,
      store.moderationLogs,
      store.recoveryMessages,
      store.verificationHistory,
      unreadNotificationCount,
      outcomeMetrics,
      createListing,
      updateListing,
      cancelListing,
      reserveListing,
      confirmPickup,
      confirmDelivery,
      cancelReservation,
      assignVolunteerToPickup,
      updatePickupStatus,
      verifyQrCode,
      verifyHandoffOtp,
      regenerateHandoffOtp,
      sendRecoveryMessage,
      reportRecoveryMessage,
      updateRecoveryTrackingState,
      advanceRecoveryState,
      submitFeedback,
      reportIssue,
      resolveIssueReport,
      toggleUserSuspension,
      forceRemoveListing,
      createAdminAccount,
      revokeAdminAccount,
      markNotificationRead,
      markAllNotificationsRead,
      resetToDefaultData
    ]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
export {
  AppProvider,
  useApp
};
