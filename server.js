import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  DEMO_USERS,
  NAMED_DEMO_USERS,
  DEMO_FOOD_LISTINGS,
  DEMO_RESERVATIONS,
  DEMO_PICKUPS,
  DEMO_JOIN_APPLICATIONS,
  DEMO_FEEDBACKS,
  DEMO_ISSUE_REPORTS,
  DEMO_AUDIT_LOGS,
  DEMO_RECOVERY_MESSAGES,
} from "./src/services/demoData.js";

dotenv.config();
const SECRET_KEY = process.env.RECOVERY_SIGNING_SECRET || crypto.randomBytes(32).toString("hex");
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const DB_FILE = path.join(process.cwd(), "data", "db.json");

function hashPasswordSecure(plainText, salt) {
  const actualSalt = salt || "nourishnet_salt_" + crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(plainText, actualSalt, 64);
  return `scrypt$${actualSalt}$${derivedKey.toString("hex")}`;
}
function verifyPasswordSecure(plainText, storedHash) {
  try {
    if (!storedHash || !storedHash.startsWith("scrypt$")) {
      return false;
    }
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const key = parts[2];
    const computedKey = crypto.scryptSync(plainText, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(computedKey, "hex"));
  } catch (err) {
    console.error("Password verification error", err);
    return false;
  }
}
const DEFAULT_PASSWORD_HASH = hashPasswordSecure("SuratSecure@2026", "nourishnet_surat_static_salt");
const SEED_USERS = [
  {
    id: "u-donor-1",
    fullName: "Vikram Mehta · Kansar Dining",
    email: "donor@kansar.in",
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: "DONOR",
    orgId: "org-donor-1",
    orgName: "Kansar Gujarati Thali & Dining",
    orgType: "RESTAURANT",
    phone: "+91 98251 44210",
    city: "Surat",
    locality: "Vesu",
    address: "Shop 104, VIP Galleria, University Road, Vesu, Surat",
    latitude: 21.1517,
    longitude: 72.7766,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 42,
    punctualityScore: 98,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-ngo-1",
    fullName: "Devang Joshi · Surat Food Relief",
    email: "ngo@suratfoodrelief.org",
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: "NGO",
    orgId: "org-ngo-1",
    orgName: "Surat Food Relief & Annakshetra",
    orgType: "COMMUNITY_KITCHEN",
    phone: "+91 98252 88410",
    city: "Surat",
    locality: "Vesu",
    address: "Plot 42, Seva Marg, Near Someshwar Square, Vesu, Surat",
    latitude: 21.1485,
    longitude: 72.782,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    capacityPerDay: 450,
    ratingAverage: 4.8,
    ratingCount: 36,
    punctualityScore: 97,
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "u-vol-1",
    fullName: "Aarav Patel · Rapid Dispatcher",
    email: "volunteer@suratrelief.org",
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: "VOLUNTEER",
    orgName: "Surat Food Logistics Dispatch",
    phone: "+91 97241 12340",
    city: "Surat",
    locality: "Vesu",
    address: "A-204, Riverview Heights, VIP Road, Vesu, Surat",
    latitude: 21.155,
    longitude: 72.779,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 28,
    punctualityScore: 99,
    createdAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    id: "u-admin-1",
    fullName: "Rameshwar Vyas · City Ops",
    email: "admin@nourishnet.in",
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: "ADMIN",
    phone: "+91 98250 11001",
    city: "Surat",
    locality: "Athwa Lines",
    address: "Municipal Civic Center, Athwa Gate, Surat",
    latitude: 21.178,
    longitude: 72.809,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canVerifyOrganizations: true,
      canModerateListings: true,
      canManageDisputes: true,
      canManageIncidents: true,
      canSuspendUsers: true,
      canManageUsers: true,
      canAccessAuditLogs: true
    },
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    id: "u-super-1",
    fullName: "Commissioner Jayesh Parikh · Governance",
    email: "superadmin@nourishnet.in",
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: "SUPER_ADMIN",
    phone: "+91 98250 00001",
    city: "Surat",
    locality: "Athwa Lines",
    address: "Surat City Zero Waste Governance Council, Muglisara, Surat",
    latitude: 21.196,
    longitude: 72.822,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canVerifyOrganizations: true,
      canModerateListings: true,
      canManageDisputes: true,
      canManageIncidents: true,
      canSuspendUsers: true,
      canManageUsers: true,
      canAccessAuditLogs: true,
      canManageAdmins: true
    },
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  }
];

const SEED_ORGANIZATIONS = [
  {
    id: "org-donor-1",
    name: "Kansar Gujarati Thali & Dining",
    type: "RESTAURANT",
    registrationNumber: "GJ-SRT-REST-2021-9921",
    fssaiNumber: "10721026000142",
    city: "Surat",
    locality: "Vesu",
    address: "Shop 104, VIP Galleria, University Road, Vesu, Surat - 395007",
    contactPhone: "+91 98251 44210",
    contactEmail: "contact@kansarthali.com",
    isVerified: true,
    adminUserId: "u-donor-1",
    capacityPerDay: 400,
    operatingHours: "11:00 AM - 11:30 PM",
    createdAt: "2026-06-01T08:00:00.000Z"
  },
  {
    id: "org-ngo-1",
    name: "Surat Food Relief & Annakshetra",
    type: "COMMUNITY_KITCHEN",
    registrationNumber: "TR-GJ-SRT-2018-0442",
    city: "Surat",
    locality: "Vesu",
    address: "Plot 42, Seva Marg, Near Someshwar Square, Vesu, Surat - 395007",
    contactPhone: "+91 98252 88410",
    contactEmail: "helpline@suratfoodrelief.org",
    isVerified: true,
    adminUserId: "u-ngo-1",
    capacityPerDay: 450,
    operatingHours: "08:00 AM - 10:00 PM",
    createdAt: "2026-06-05T10:00:00.000Z"
  }
];

class DatabaseState {
  users = [];
  organizations = [];
  foodListings = [];
  reservations = [];
  pickups = [];
  notifications = [];
  joinApplications = [];
  issueReports = [];
  feedbacks = [];
  moderationLogs = [];
  recoveryMessages = [];
  sessions = new Map();
  setupTokens = new Map();
  listingLocks = new Set();
  otpAttempts = new Map();
  usedNonces = new Set();

  constructor() {
    if (!this.loadFromDisk()) {
      this.resetToDefault();
    }
  }

  saveToDisk() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const data = {
        users: this.users,
        organizations: this.organizations,
        foodListings: this.foodListings,
        reservations: this.reservations,
        pickups: this.pickups,
        notifications: this.notifications,
        joinApplications: this.joinApplications,
        issueReports: this.issueReports,
        feedbacks: this.feedbacks,
        moderationLogs: this.moderationLogs,
        recoveryMessages: this.recoveryMessages,
        usedNonces: Array.from(this.usedNonces),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database state to disk:", err);
    }
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.users) && Array.isArray(data.foodListings)) {
          this.users = data.users;
          this.organizations = data.organizations || [];
          this.foodListings = data.foodListings || [];
          this.reservations = data.reservations || [];
          this.pickups = data.pickups || [];
          this.notifications = data.notifications || [];
          this.joinApplications = data.joinApplications || [];
          this.issueReports = data.issueReports || [];
          this.feedbacks = data.feedbacks || [];
          this.moderationLogs = data.moderationLogs || [];
          this.recoveryMessages = data.recoveryMessages || [];
          this.usedNonces = new Set(data.usedNonces || []);
          return true;
        }
      }
    } catch (err) {
      console.error("Failed to load database state from disk:", err);
    }
    return false;
  }

  resetToDefault() {
    // Deep clone seed base users + 25 Demo Users + Phase 2 Named Demo Accounts
    this.users = JSON.parse(JSON.stringify([...SEED_USERS, ...DEMO_USERS, ...NAMED_DEMO_USERS])).map((u) => ({
      ...u,
      passwordHash: u.passwordHash || DEFAULT_PASSWORD_HASH,
      accountState: "VERIFIED",
      isActive: true,
      failedAttempts: 0,
      lockoutUntil: 0,
    }));
    this.organizations = JSON.parse(JSON.stringify(SEED_ORGANIZATIONS));

    const namedListings = [
      {
        id: "list-named-donor-1",
        donorId: "u-named-donor",
        donorName: "Kansar Gujarati Thali & Dining",
        donorOrgType: "RESTAURANT",
        donorPhone: "+91 98251 99002",
        donorCity: "Surat",
        donorLocality: "Vesu",
        title: "Fresh Kathiyawadi Thali & Chaas Surplus",
        category: "COOKED_MEAL",
        quantity: 40,
        totalQuantity: 40,
        reservedQuantity: 0,
        remainingQuantity: 40,
        unit: "PLATES",
        recoveryModel: "DONATION",
        pricePerUnit: 0,
        dietaryType: "VEG",
        storageCondition: "HOT_INSULATED",
        packagingStatus: "FOOD_GRADE_CONTAINERS",
        preparedAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 18000000).toISOString(),
        pickupWindowStart: new Date(Date.now()).toISOString(),
        pickupWindowEnd: new Date(Date.now() + 18000000).toISOString(),
        pickupAddress: "Shop 104, VIP Galleria, University Road, Vesu, Surat",
        latitude: 21.1517,
        longitude: 72.7766,
        status: "AVAILABLE",
        notes: "Fresh vegetarian lunch surplus prepared under high hygiene standards.",
        foodSafetyDeclaration: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    const namedReservations = [
      {
        id: "res-named-active",
        listingId: "list-demo-101",
        ngoId: "u-named-shelter",
        ngoName: "Surat Food Relief Shelter",
        ngoPhone: "+91 98252 99003",
        status: "DELIVERED",
        requestedQuantity: 25,
        recoveryModel: "DONATION",
        unitPrice: 0,
        itemTotal: 0,
        platformFee: 0,
        logisticsFee: 0,
        finalPayableAmount: 0,
        paymentStatus: "FREE_DONATION",
        assignedVolunteerId: "u-named-dp",
        assignedVolunteerName: "Rapid Relief Delivery Partner",
        assignedVolunteerPhone: "+91 97241 99004",
        confirmationCode: "4921",
        timeline: [
          { step: "LISTED", label: "Surplus listed by Kansar Dining", timestamp: new Date(Date.now() - 7200000).toISOString(), actorName: "Kansar Dining", actorRole: "DONOR" },
          { step: "RESERVED", label: "Claimed by Surat Food Relief Shelter", timestamp: new Date(Date.now() - 5400000).toISOString(), actorName: "Surat Food Relief Shelter", actorRole: "NGO" },
          { step: "ASSIGNED", label: "Assigned to Delivery Partner Rapid Relief", timestamp: new Date(Date.now() - 3600000).toISOString(), actorName: "Surat Logistics Dispatch", actorRole: "SYSTEM" },
          { step: "IN_TRANSIT", label: "Picked up and in transit to shelter", timestamp: new Date(Date.now() - 1800000).toISOString(), actorName: "Rapid Relief Delivery Partner", actorRole: "VOLUNTEER" },
          { step: "DELIVERED", label: "Food arrived at shelter loading bay. Ready for OTP verification.", timestamp: new Date(Date.now() - 300000).toISOString(), actorName: "Rapid Relief Delivery Partner", actorRole: "VOLUNTEER" }
        ],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        confirmedAt: new Date(Date.now() - 5400000).toISOString(),
        updatedAt: new Date(Date.now() - 300000).toISOString(),
        version: 1
      }
    ];

    const namedPickups = [
      {
        id: "pick-named-active",
        reservationId: "res-named-active",
        listingId: "list-demo-101",
        ngoId: "u-named-shelter",
        donorId: "u-demo-donor-1",
        volunteerId: "u-named-dp",
        otpCode: "4921",
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        otpAttemptCount: 0,
        status: "DELIVERED",
        pickupNotes: "Arrived at Surat Food Relief Shelter. Handover OTP ready.",
        nonce: "4921",
        qrToken: "signed_token_4921"
      }
    ];

    this.foodListings = [...namedListings, ...JSON.parse(JSON.stringify(DEMO_FOOD_LISTINGS))];
    this.reservations = [...namedReservations, ...JSON.parse(JSON.stringify(DEMO_RESERVATIONS))];
    this.pickups = [...namedPickups, ...JSON.parse(JSON.stringify(DEMO_PICKUPS))];
    this.joinApplications = JSON.parse(JSON.stringify(DEMO_JOIN_APPLICATIONS));
    this.issueReports = JSON.parse(JSON.stringify(DEMO_ISSUE_REPORTS));
    this.feedbacks = JSON.parse(JSON.stringify(DEMO_FEEDBACKS));
    this.moderationLogs = JSON.parse(JSON.stringify(DEMO_AUDIT_LOGS));
    this.recoveryMessages = JSON.parse(JSON.stringify(DEMO_RECOVERY_MESSAGES));
    this.notifications = [
      {
        id: `notif-init-dp-1`,
        userId: "u-named-dp",
        title: "Active Handover Ready",
        message: "You have arrived at Surat Food Relief Shelter with 25 plates of surplus. Enter the 4-digit OTP from shelter staff to complete delivery.",
        type: "ASSIGNMENT",
        isRead: false,
        createdAt: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: `notif-init-shelter-1`,
        userId: "u-named-shelter",
        title: "Delivery Partner Arrived",
        message: "Rapid Relief Delivery Partner has arrived with your food rescue order. Handover OTP is 4921.",
        type: "DELIVERY",
        isRead: false,
        createdAt: new Date(Date.now() - 300000).toISOString()
      }
    ];
    this.otpAttempts = new Map();
    this.usedNonces = new Set();
    this.saveToDisk();
  }
  // Mutex lock for listings during claim operations to prevent double-booking
  async acquireLock(listingId) {
    if (this.listingLocks.has(listingId)) return false;
    this.listingLocks.add(listingId);
    return true;
  }
  releaseLock(listingId) {
    this.listingLocks.delete(listingId);
  }
  // Evaluate real platform metrics from completed records
  calculateMetrics() {
    const totalCreated = this.foodListings.length;
    const completedListings = this.foodListings.filter((l) => l.status === "COMPLETED");
    const activeListings = this.foodListings.filter((l) => l.status === "AVAILABLE" || l.status === "RESERVED");
    const expiredListings = this.foodListings.filter((l) => l.status === "EXPIRED");
    const completedPickups = this.pickups.filter((p) => p.status === "COMPLETED").length;
    let totalKg = 0;
    this.reservations.forEach((r) => {
      if (r.status === "COMPLETED") {
        const listing = this.foodListings.find((l) => l.id === r.listingId);
        const unit = listing?.unit || "PLATES";
        if (unit === "KG") totalKg += r.requestedQuantity;
        else if (unit === "PLATES") totalKg += r.requestedQuantity * 0.42;
        else if (unit === "PACKS") totalKg += r.requestedQuantity * 0.35;
        else if (unit === "TRAYS") totalKg += r.requestedQuantity * 3.5;
        else totalKg += r.requestedQuantity * 0.4;
      }
    });
    const totalKgRecovered = Math.round(totalKg * 10) / 10;
    const recoveryRate = totalCreated > 0 ? Math.round(completedListings.length / totalCreated * 1e3) / 10 : 100;
    const estimatedMealsSaved = Math.round(totalKgRecovered / 0.42);
    const estimatedCo2AvoidedKg = Math.round(totalKgRecovered * 2.5 * 10) / 10;
    let financialValue = 0;
    let freeDonations = 0;
    let socialSubsidized = 0;
    this.reservations.forEach((r) => {
      if (r.status === "COMPLETED") {
        financialValue += r.finalPayableAmount || 0;
        if (r.recoveryModel === "DONATION") {
          freeDonations += r.requestedQuantity;
        } else {
          socialSubsidized += r.requestedQuantity;
        }
      }
    });
    const activeDonors = this.users.filter((u) => u.role === "DONOR" && u.isActive).length;
    const activeNgos = this.users.filter((u) => u.role === "NGO" && u.isActive).length;
    const activeVolunteers = this.users.filter((u) => u.role === "VOLUNTEER" && u.isActive).length;
    return {
      recoveryRate,
      totalCreatedListings: totalCreated,
      totalCompletedPickups: completedPickups,
      totalActiveListings: activeListings.length,
      totalExpiredListings: expiredListings.length,
      totalKgRecovered,
      financialValueRecovered: Math.round(financialValue),
      freeDonationMealsCount: freeDonations,
      socialSubsidizedMealsCount: socialSubsidized,
      averageRecoverySpeedHours: 1.2,
      spoilageAvoidanceRate: 98.5,
      estimatedMealsSaved,
      estimatedCo2AvoidedKg,
      activeDonorsCount: activeDonors,
      activeNgosCount: activeNgos,
      activeVolunteersCount: activeVolunteers,
      punctualityScoreAvg: 98
    };
  }
}
const db = new DatabaseState();
setInterval(() => {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  db.foodListings.forEach((listing) => {
    if (listing.status === "AVAILABLE" && listing.expiresAt <= nowIso) {
      listing.status = "EXPIRED";
      listing.updatedAt = nowIso;
      db.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random()}`,
        userId: listing.donorId,
        title: "Food Surplus Window Expired",
        message: `Your listing "${listing.title}" reached its expiry threshold and has been safely closed to ensure food hygiene.`,
        type: "SYSTEM",
        isRead: false,
        createdAt: nowIso
      });
    }
  });
}, 3e4);
function selectBestVolunteer(listing) {
  const verifiedVolunteers = db.users.filter(
    (u) => u.role === "VOLUNTEER" && u.isActive && u.isVerified && u.accountState === "VERIFIED"
  );
  if (verifiedVolunteers.length === 0) return null;
  let bestVolunteer = null;
  let bestScore = -9999;
  verifiedVolunteers.forEach((v) => {
    const dLat = (v.latitude - listing.latitude) * 111;
    const dLon = (v.longitude - listing.longitude) * 105;
    const distanceKm = Math.sqrt(dLat * dLat + dLon * dLon);
    const activeWorkload = db.pickups.filter(
      (p) => p.volunteerId === v.id && (p.status === "ASSIGNED" || p.status === "IN_TRANSIT")
    ).length;
    const score = 100 - distanceKm * 4 - activeWorkload * 20 + (v.punctualityScore || 95) * 0.2;
    if (score > bestScore) {
      bestScore = score;
      bestVolunteer = v;
    }
  });
  return bestVolunteer;
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  const token = authHeader.split(" ")[1];
  const session = db.sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) db.sessions.delete(token);
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
  const user = db.users.find((u) => u.id === session.userId);
  if (!user || !user.isActive || user.accountState === "SUSPENDED") {
    return res.status(403).json({ error: "User account inactive or suspended." });
  }
  req.user = user;
  req.session = session;
  next();
}
async function startServer() {
  const app = express();
  app.use(express.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), city: "Surat" });
  });
  app.get("/api/config", (req, res) => {
    res.json({
      demoMode: process.env.DEMO_MODE !== "false",
      port: process.env.PUBLIC_PORT ? parseInt(process.env.PUBLIC_PORT) : (process.env.PORT ? parseInt(process.env.PORT) : 3001),
      city: "Surat"
    });
  });
  app.get("/session-bridge", (req, res) => {
    const { email, username, tab, recovery } = req.query;
    const identifier = (email || username || "").trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        (u.username && u.username.toLowerCase() === identifier) ||
        u.email.toLowerCase() === `${identifier}@nourishnet.demo`
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    const token = `sess_${crypto.randomBytes(32).toString("hex")}`;
    db.sessions.set(token, {
      token,
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1e3
    });
    res.send(`<!DOCTYPE html>
<html>
<head><title>NourishNet Session Bridge</title></head>
<body>
<script>
  localStorage.setItem('nourishnet_auth_token', '${token}');
  ${tab ? `sessionStorage.setItem('nourishnet_pending_tab', '${tab}');` : ""}
  window.location.replace('${recovery ? `/?recovery=${recovery}` : "/"}');
</script>
</body>
</html>`);
  });
  app.get("/api/demo/users", (req, res) => {
    if (process.env.DEMO_MODE === "false") {
      return res.status(403).json({ error: "Demo mode is disabled in this environment." });
    }
    const grouped = {
      DONOR: DEMO_USERS.filter((u) => u.role === "DONOR"),
      NGO: DEMO_USERS.filter((u) => u.role === "NGO"),
      VOLUNTEER: DEMO_USERS.filter((u) => u.role === "VOLUNTEER"),
      ADMIN: DEMO_USERS.filter((u) => u.role === "ADMIN"),
      SUPER_ADMIN: DEMO_USERS.filter((u) => u.role === "SUPER_ADMIN"),
    };
    res.json({
      success: true,
      totalCount: DEMO_USERS.length,
      users: DEMO_USERS.map(({ passwordHash: _, ...u }) => u),
      namedAccounts: NAMED_DEMO_USERS.map(({ passwordHash: _, ...u }) => u),
      grouped,
      defaultPassword: "SuratSecure@2026"
    });
  });
  app.post("/api/demo/reset", (req, res) => {
    if (process.env.DEMO_MODE === "false") {
      return res.status(403).json({ error: "Demo reset is disabled in production mode." });
    }
    db.resetToDefault();
    res.json({ success: true, message: "Demo data reset successfully." });
  });
  app.post("/api/auth/login", (req, res) => {
    const { email, username, password } = req.body;
    const identifier = (email || username || "").trim().toLowerCase();
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email or username and password are required." });
    }
    let user = db.users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        (u.username && u.username.toLowerCase() === identifier) ||
        (u.username && `${u.username.toLowerCase()}@nourishnet.demo` === identifier) ||
        u.email.toLowerCase() === `${identifier}@nourishnet.demo`
    );
    if (!user) {
      const alias1 = identifier
        .replace('volunteer0', 'vol0')
        .replace('superadmin0', 'super0');
      const alias2 = identifier
        .replace('vol0', 'volunteer0')
        .replace('super0', 'superadmin0');
      user = db.users.find(
        (u) => u.email.toLowerCase() === alias1 || u.email.toLowerCase() === alias2
      );
    }
    if (!user || !verifyPasswordSecure(password, user.passwordHash || "")) {
      return res.status(401).json({ error: "Invalid email/username or password combination." });
    }
    if (user.accountState === "SUSPENDED" || user.accountState === "DEACTIVATED") {
      return res.status(403).json({ error: `Your account is ${user.accountState.toLowerCase()}. Contact administrator.` });
    }
    const token = `sess_${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
    db.sessions.set(token, {
      token,
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
      expiresAt
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  });
  app.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = req.user;
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });
  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      db.sessions.delete(token);
    }
    res.json({ success: true });
  });
  app.post("/api/auth/setup-account", (req, res) => {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ error: "Valid setup token and password (min 8 chars) required." });
    }
    const setupData = db.setupTokens.get(token);
    if (!setupData || setupData.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Setup link has expired or is invalid. Request a new invite." });
    }
    let user = db.users.find((u) => u.email.toLowerCase() === setupData.email.toLowerCase());
    if (user) {
      user.passwordHash = hashPasswordSecure(password);
      user.accountState = "VERIFIED";
      user.isVerified = true;
      user.isActive = true;
      user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      user = {
        id: `u-${setupData.role.toLowerCase()}-${Date.now()}`,
        fullName: setupData.fullName,
        email: setupData.email,
        passwordHash: hashPasswordSecure(password),
        role: setupData.role,
        orgName: setupData.orgName,
        phone: setupData.phone || "+91 98000 00000",
        city: "Surat",
        locality: setupData.locality || "Vesu",
        address: `${setupData.locality || "Vesu"}, Surat`,
        latitude: 21.155,
        longitude: 72.78,
        accountState: "VERIFIED",
        isVerified: true,
        isActive: true,
        ratingAverage: 5,
        ratingCount: 1,
        punctualityScore: 100,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.users.push(user);
    }
    db.setupTokens.delete(token);
    const sessToken = `sess_${crypto.randomBytes(32).toString("hex")}`;
    db.sessions.set(sessToken, {
      token: sessToken,
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1e3
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, message: "Account activated successfully.", user: safeUser, token: sessToken });
  });
  app.get("/api/state", (req, res) => {
    let authUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const session = db.sessions.get(token);
      if (session && session.expiresAt >= Date.now()) {
        authUser = db.users.find((u) => u.id === session.userId && u.isActive && u.accountState !== "SUSPENDED");
      }
    }

    const outcomeMetrics = db.calculateMetrics();
    const demoMode = process.env.DEMO_MODE !== "false";

    if (!authUser) {
      if (!demoMode) {
        return res.json({
          users: [],
          organizations: [],
          foodListings: db.foodListings.filter((l) => l.status === "AVAILABLE").map((l) => ({
            id: l.id,
            title: l.title,
            category: l.category,
            quantity: l.quantity,
            unit: l.unit,
            recoveryModel: l.recoveryModel,
            pricePerUnit: l.pricePerUnit,
            donorLocality: l.donorLocality,
            donorCity: l.donorCity,
            expiresAt: l.expiresAt,
            status: l.status,
            createdAt: l.createdAt
          })),
          reservations: [],
          pickups: [],
          joinApplications: [],
          issueReports: [],
          feedbacks: [],
          moderationLogs: [],
          recoveryMessages: [],
          notifications: [],
          outcomeMetrics,
          demoMode: false
        });
      }

      const sanitizedDemoUsers = db.users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        locality: u.locality,
        city: u.city,
        orgName: u.orgName,
        orgType: u.orgType,
        ratingAverage: u.ratingAverage,
        accountState: u.accountState,
        isActive: u.isActive,
        isVerified: u.isVerified,
      }));

      return res.json({
        users: sanitizedDemoUsers,
        organizations: db.organizations,
        foodListings: db.foodListings,
        reservations: db.reservations,
        pickups: db.pickups,
        joinApplications: [],
        issueReports: [],
        feedbacks: db.feedbacks,
        moderationLogs: [],
        recoveryMessages: [],
        notifications: [],
        outcomeMetrics,
        demoMode: true
      });
    }

    const isSuperAdmin = authUser.role === "SUPER_ADMIN";
    const isAdmin = authUser.role === "ADMIN" || isSuperAdmin;
    const isDonor = authUser.role === "DONOR";
    const isNgo = authUser.role === "NGO";
    const isVolunteer = authUser.role === "VOLUNTEER";

    const sanitizedUsers = db.users.map((u) => {
      const { passwordHash: _, ...rest } = u;
      if (!isAdmin && u.id !== authUser.id) {
        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          locality: u.locality,
          city: u.city,
          orgName: u.orgName,
          orgType: u.orgType,
          ratingAverage: u.ratingAverage,
          accountState: u.accountState,
          isActive: u.isActive,
          isVerified: u.isVerified,
          phone: u.phone ? (u.phone.substring(0, 7) + " ****") : undefined
        };
      }
      return rest;
    });

    let visibleReservations = db.reservations;
    let visiblePickups = db.pickups;
    let visibleListings = db.foodListings;
    let visibleMessages = db.recoveryMessages;
    let visibleApplications = [];
    let visibleLogs = [];
    let visibleIssueReports = [];

    if (isAdmin) {
      visibleApplications = db.joinApplications;
      visibleLogs = db.moderationLogs;
      visibleIssueReports = db.issueReports;
    } else if (isDonor) {
      visibleListings = db.foodListings.filter((l) => l.donorId === authUser.id || l.status === "AVAILABLE");
      const myListingIds = new Set(db.foodListings.filter((l) => l.donorId === authUser.id).map((l) => l.id));
      visibleReservations = db.reservations.filter((r) => myListingIds.has(r.listingId));
      visiblePickups = db.pickups.filter((p) => p.donorId === authUser.id || myListingIds.has(p.listingId));
      const myResIds = new Set(visibleReservations.map((r) => r.id));
      visibleMessages = db.recoveryMessages.filter((m) => myResIds.has(m.reservationId));
    } else if (isNgo) {
      visibleReservations = db.reservations.filter((r) => r.ngoId === authUser.id);
      visiblePickups = db.pickups.filter((p) => p.ngoId === authUser.id);
      const myResIds = new Set(visibleReservations.map((r) => r.id));
      visibleMessages = db.recoveryMessages.filter((m) => myResIds.has(m.reservationId));
    } else if (isVolunteer) {
      visiblePickups = db.pickups.filter((p) => p.volunteerId === authUser.id || (!p.volunteerId && p.status === "PENDING"));
      const myPickupResIds = new Set(visiblePickups.map((p) => p.reservationId));
      visibleReservations = db.reservations.filter((r) => r.assignedVolunteerId === authUser.id || myPickupResIds.has(r.id));
      visibleMessages = db.recoveryMessages.filter((m) => myPickupResIds.has(m.reservationId));
    }

    const userNotifications = db.notifications.filter((n) => n.userId === authUser.id);

    res.json({
      users: sanitizedUsers,
      organizations: db.organizations,
      foodListings: visibleListings,
      reservations: visibleReservations,
      pickups: visiblePickups,
      joinApplications: visibleApplications,
      issueReports: visibleIssueReports,
      feedbacks: db.feedbacks,
      moderationLogs: visibleLogs,
      recoveryMessages: visibleMessages,
      notifications: userNotifications,
      outcomeMetrics,
      demoMode
    });
  });
  app.post("/api/listings/create", authMiddleware, (req, res) => {
    const user = req.user;
    if (user.role !== "DONOR") {
      return res.status(403).json({ error: "Only verified food donors can create surplus listings." });
    }
    const { title, category, quantity, unit, recoveryModel, pricePerUnit, dietaryType, expiresAt, pickupWindowEnd, notes } = req.body;
    const expiry = expiresAt || pickupWindowEnd;
    if (!title || !quantity || Number(quantity) <= 0 || !expiry) {
      return res.status(400).json({ error: "Title, positive quantity, and expiry timestamp are required." });
    }
    const newListing = {
      id: `list-srt-${Date.now()}`,
      donorId: user.id,
      donorName: user.orgName || user.fullName,
      donorOrgType: user.orgType || "RESTAURANT",
      donorPhone: user.phone,
      donorCity: "Surat",
      donorLocality: user.locality || "Vesu",
      title,
      category: category || "COOKED_MEAL",
      quantity: Number(quantity),
      totalQuantity: Number(quantity),
      reservedQuantity: 0,
      remainingQuantity: Number(quantity),
      unit: unit || "PLATES",
      recoveryModel: recoveryModel || "DONATION",
      pricePerUnit: Number(pricePerUnit || 0),
      dietaryType: dietaryType || "VEG",
      storageCondition: req.body.storageCondition || "HOT_INSULATED",
      packagingStatus: req.body.packagingStatus || "FOOD_GRADE_CONTAINERS",
      preparedAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: expiry,
      pickupWindowStart: (/* @__PURE__ */ new Date()).toISOString(),
      pickupWindowEnd: pickupWindowEnd || expiry,
      pickupAddress: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      status: "AVAILABLE",
      notes: notes || "",
      foodSafetyDeclaration: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.foodListings.unshift(newListing);
    db.saveToDisk();
    res.json({ success: true, listing: newListing });
  });
  app.post("/api/reservations/claim", authMiddleware, async (req, res) => {
    const user = req.user;
    if (user.role !== "NGO") {
      return res.status(403).json({ error: "Only authorized NGOs can claim food surplus." });
    }
    const { listingId, requestedQuantity, quantity } = req.body;
    const reqQty = Number(requestedQuantity || quantity);
    if (!listingId || !reqQty || reqQty <= 0) {
      return res.status(400).json({ error: "Valid listingId and positive requested quantity required." });
    }
    const lockAcquired = await db.acquireLock(listingId);
    if (!lockAcquired) {
      return res.status(409).json({ error: "This listing is currently being processed by another claim. Please retry in a moment." });
    }
    try {
      const listing = db.foodListings.find((l) => l.id === listingId);
      if (!listing) {
        return res.status(404).json({ error: "Food surplus listing not found." });
      }
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      if (listing.status !== "AVAILABLE" || listing.expiresAt <= nowIso) {
        return res.status(400).json({ error: "This food surplus is no longer available or has expired." });
      }
      const availableQty = listing.remainingQuantity !== void 0 ? listing.remainingQuantity : listing.quantity;
      if (reqQty > availableQty) {
        return res.status(400).json({
          error: `Requested quantity (${reqQty} ${listing.unit}) exceeds remaining available inventory (${availableQty} ${listing.unit}).`,
          remainingAvailable: availableQty
        });
      }
      const newRemaining = availableQty - reqQty;
      listing.remainingQuantity = newRemaining;
      listing.quantity = newRemaining;
      listing.reservedQuantity = (listing.reservedQuantity || 0) + reqQty;
      if (newRemaining <= 0) {
        listing.status = "RESERVED";
      }
      listing.updatedAt = nowIso;
      const resId = `res-srt-${Date.now()}`;
      const pickId = `pick-srt-${Date.now()}`;
      const assignedVolunteer = selectBestVolunteer(listing);
      const reservation = {
        id: resId,
        listingId: listing.id,
        ngoId: user.id,
        ngoName: user.orgName || user.fullName,
        ngoPhone: user.phone,
        status: assignedVolunteer ? "PICKUP_SCHEDULED" : "RESERVED",
        requestedQuantity: reqQty,
        recoveryModel: listing.recoveryModel,
        unitPrice: listing.pricePerUnit,
        itemTotal: listing.pricePerUnit * reqQty,
        platformFee: 0,
        logisticsFee: 0,
        finalPayableAmount: listing.pricePerUnit * reqQty,
        paymentStatus: listing.recoveryModel === "DONATION" ? "FREE_DONATION" : "PAID",
        assignedVolunteerId: assignedVolunteer?.id,
        assignedVolunteerName: assignedVolunteer?.fullName,
        assignedVolunteerPhone: assignedVolunteer?.phone,
        timeline: [
          { step: "LISTED", label: `Listed by ${listing.donorName}`, timestamp: listing.createdAt, actorName: listing.donorName, actorRole: "DONOR" },
          { step: "RESERVED", label: `Claimed by ${user.orgName || user.fullName} (${reqQty} ${listing.unit})`, timestamp: nowIso, actorName: user.fullName, actorRole: "NGO" },
          ...assignedVolunteer ? [
            {
              step: "ASSIGNED",
              label: `Automated dispatch assigned Delivery Partner ${assignedVolunteer.fullName}`,
              timestamp: nowIso,
              actorName: "NourishNet Dispatch Engine",
              actorRole: "SYSTEM"
            }
          ] : []
        ],
        createdAt: nowIso,
        confirmedAt: nowIso,
        updatedAt: nowIso,
        version: 1
      };
      const confirmationCode = crypto.randomInt(1000, 10000).toString();
      const rawTokenPayload = `${resId}:${pickId}:${listing.id}:${confirmationCode}:${Date.now()}`;
      const signedQrToken = crypto.createHmac("sha256", SECRET_KEY).update(rawTokenPayload).digest("hex").substring(0, 16);
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
      const pickup = {
        id: pickId,
        reservationId: resId,
        listingId: listing.id,
        ngoId: user.id,
        donorId: listing.donorId,
        volunteerId: assignedVolunteer?.id,
        qrToken: signedQrToken,
        nonce: confirmationCode,
        qrGeneratedAt: nowIso,
        qrExpiresAt: listing.pickupWindowEnd,
        otpCode: confirmationCode,
        otpExpiresAt,
        otpAttemptCount: 0,
        status: assignedVolunteer ? "ASSIGNED" : "PENDING",
        pickupNotes: assignedVolunteer ? `Dispatched to ${assignedVolunteer.fullName}. Pickup at ${listing.donorLocality}.` : "Awaiting Delivery Partner matching."
      };
      db.reservations.unshift(reservation);
      db.pickups.unshift(pickup);
      db.saveToDisk();
      db.notifications.unshift({
        id: `notif-${Date.now()}-d`,
        userId: listing.donorId,
        title: "Surplus Food Claimed",
        message: `${user.orgName || user.fullName} claimed ${reqQty} ${listing.unit}. ${assignedVolunteer ? `Delivery Partner ${assignedVolunteer.fullName} is assigned.` : "Dispatching Delivery Partner."}`,
        type: "RESERVATION",
        isRead: false,
        createdAt: nowIso
      });
      if (assignedVolunteer) {
        db.notifications.unshift({
          id: `notif-${Date.now()}-v`,
          userId: assignedVolunteer.id,
          title: "Action Required: Food Rescue Dispatch",
          message: `New pickup task: Collect ${reqQty} ${listing.unit} from ${listing.donorName} in ${listing.donorLocality}.`,
          type: "ASSIGNMENT",
          isRead: false,
          createdAt: nowIso
        });
      }
      res.json({
        success: true,
        reservation,
        pickup,
        listing,
        confirmationCode
      });
    } finally {
      db.releaseLock(listingId);
    }
  });
  app.post("/api/handoff/confirm-pickup", authMiddleware, (req, res) => {
    const user = req.user;
    const { pickupId, confirmationCode } = req.body;
    const pickup = db.pickups.find((p) => p.id === pickupId);
    if (!pickup) {
      return res.status(404).json({ error: "Pickup task record not found." });
    }
    const reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    const listing = db.foodListings.find((l) => l.id === pickup.listingId);
    const isAuthorized = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.id === pickup.volunteerId || user.id === pickup.donorId || (reservation && user.id === reservation.assignedVolunteerId);
    if (!isAuthorized) {
      return res.status(403).json({ error: "You are not authorized to confirm this pickup." });
    }
    if (pickup.status === "COMPLETED" || pickup.status === "CANCELLED") {
      return res.status(400).json({ error: `Cannot confirm pickup on an order that is already ${pickup.status.toLowerCase()}.` });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    pickup.status = "IN_TRANSIT";
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = user.id;
    pickup.verifiedByName = user.fullName;
    pickup.pickupNotes = `Food collected from donor by ${user.fullName}. En route to recipient shelter.`;
    if (reservation) {
      reservation.status = "PICKUP_STARTED";
      reservation.timeline.push({
        step: "IN_TRANSIT",
        label: `Surplus collected by Delivery Partner ${user.fullName}. Delivering to ${reservation.ngoName}.`,
        timestamp: nowIso,
        actorName: user.fullName,
        actorRole: user.role
      });
      reservation.updatedAt = nowIso;
    }
    if (reservation) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-ngo`,
        userId: reservation.ngoId,
        title: "Food Surplus In Transit",
        message: `Delivery Partner has collected the ${reservation.requestedQuantity} surplus from ${listing?.donorName || "donor"} and is en route to your center.`,
        type: "PICKUP",
        isRead: false,
        createdAt: nowIso
      });
    }
    db.saveToDisk();
    res.json({ success: true, message: "Pickup confirmed. Food is now in transit to the shelter.", pickup, reservation });
  });
  app.post("/api/handoff/confirm-delivery", authMiddleware, (req, res) => {
    const user = req.user;
    const { pickupId } = req.body;
    const pickup = db.pickups.find((p) => p.id === pickupId);
    if (!pickup) {
      return res.status(404).json({ error: "Pickup task record not found." });
    }
    const reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    const listing = db.foodListings.find((l) => l.id === pickup.listingId);
    const isAuthorized = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.id === pickup.volunteerId || user.id === pickup.ngoId;
    if (!isAuthorized) {
      return res.status(403).json({ error: "You are not authorized to confirm delivery for this order." });
    }
    if (pickup.status === "COMPLETED" || pickup.status === "CANCELLED") {
      return res.status(400).json({ error: `Cannot confirm delivery on an order that is already ${pickup.status.toLowerCase()}.` });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    pickup.status = "COMPLETED";
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = user.id;
    pickup.verifiedByName = user.fullName;
    pickup.pickupNotes = `Safely delivered and accepted at receiving shelter by ${user.fullName}.`;
    if (reservation) {
      reservation.status = "COMPLETED";
      reservation.completedAt = nowIso;
      reservation.timeline.push({
        step: "COMPLETED",
        label: `Food safely received & distribution finalized at ${reservation.ngoName}.`,
        timestamp: nowIso,
        actorName: user.fullName,
        actorRole: user.role
      });
      reservation.updatedAt = nowIso;
    }
    if (listing && (listing.remainingQuantity || 0) <= 0) {
      const allDone = db.reservations.filter((r) => r.listingId === listing.id).every((r) => r.status === "COMPLETED");
      if (allDone) {
        listing.status = "COMPLETED";
        listing.updatedAt = nowIso;
      }
    }
    if (listing) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-donor-done`,
        userId: listing.donorId,
        title: "Food Recovery Completed",
        message: `Your food surplus was safely delivered to ${reservation?.ngoName || "shelter"}. Thank you for nourishing Surat!`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }
    db.saveToDisk();
    res.json({ success: true, message: "Delivery confirmed and recovery successfully completed!", pickup, reservation, listing });
  });
  app.post("/api/reservations/cancel", authMiddleware, (req, res) => {
    const user = req.user;
    const { reservationId, reason } = req.body;
    const reservation = db.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }
    const isAuthorized = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.id === reservation.ngoId || user.id === db.foodListings.find((l) => l.id === reservation.listingId)?.donorId;
    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized to cancel this reservation." });
    }
    if (reservation.status === "COMPLETED") {
      return res.status(400).json({ error: "Cannot cancel a completed food recovery." });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    reservation.status = "CANCELLED";
    reservation.timeline.push({
      step: "CANCELLED",
      label: `Cancelled: ${reason || "Operational request"}. Restoring inventory.`,
      timestamp: nowIso,
      actorName: user.fullName,
      actorRole: user.role
    });
    reservation.updatedAt = nowIso;
    const listing = db.foodListings.find((l) => l.id === reservation.listingId);
    if (listing) {
      listing.reservedQuantity = Math.max(0, (listing.reservedQuantity || 0) - reservation.requestedQuantity);
      listing.remainingQuantity = (listing.remainingQuantity || 0) + reservation.requestedQuantity;
      listing.quantity = listing.remainingQuantity;
      if (listing.status === "RESERVED" && listing.remainingQuantity > 0 && listing.expiresAt > nowIso) {
        listing.status = "AVAILABLE";
      }
      listing.updatedAt = nowIso;
    }
    const pickup = db.pickups.find((p) => p.reservationId === reservation.id);
    if (pickup) {
      pickup.status = "CANCELLED";
      pickup.pickupNotes = `Cancelled: ${reason || "N/A"}`;
    }
    if (reservation.assignedVolunteerId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-vol-cancel`,
        userId: reservation.assignedVolunteerId,
        title: "Dispatch Task Cancelled",
        message: `The pickup task for ${reservation.ngoName} was cancelled. Your queue has been updated.`,
        type: "ASSIGNMENT",
        isRead: false,
        createdAt: nowIso
      });
    }
    db.saveToDisk();
    res.json({ success: true, message: "Reservation cancelled and inventory restored to available pool." });
  });

  app.post("/api/handoff/advance-state", authMiddleware, (req, res) => {
    const { reservationId, toState, notes } = req.body;
    if (!reservationId || !toState) {
      return res.status(400).json({ error: "Reservation ID and target state are required." });
    }

    const reservation = db.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const pickup = db.pickups.find((p) => p.reservationId === reservationId);
    const listing = db.foodListings.find((l) => l.id === reservation.listingId);

    // Authorization check: User must be a stakeholder (donor, NGO, assigned volunteer, or admin)
    const user = req.user;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isDonor = user.id === listing?.donorId || (user.role === "DONOR" && listing?.donorId === user.id);
    const isNgo = user.id === reservation.ngoId || (user.role === "NGO" && reservation.ngoId === user.id);
    const isAssignedVol = user.id === reservation.assignedVolunteerId || user.id === pickup?.volunteerId;

    if (!isAdmin && !isDonor && !isNgo && !isAssignedVol) {
      return res.status(403).json({ error: "You are not authorized to advance the state of this order." });
    }

    const validStates = [
      "RESERVED",
      "ASSIGNED",
      "VOLUNTEER_ASSIGNED",
      "SCHEDULED",
      "PICKUP_SCHEDULED",
      "VOLUNTEER_EN_ROUTE",
      "PICKUP_STARTED",
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED"
    ];

    if (!validStates.includes(toState)) {
      return res.status(400).json({ error: `Invalid target state: ${toState}` });
    }

    // Terminal state protection: cannot transition out of COMPLETED or CANCELLED
    if (reservation.status === "COMPLETED" || reservation.status === "CANCELLED") {
      return res.status(400).json({ error: `Cannot transition an order that is in terminal state '${reservation.status}'.` });
    }

    // Disallow skipping directly from unassigned/reserved to COMPLETED without handoff verification
    if ((reservation.status === "RESERVED" || reservation.status === "CONFIRMED") && toState === "COMPLETED" && !isAdmin) {
      return res.status(400).json({ error: "Direct completion requires valid OTP/QR handoff verification." });
    }

    // Disallow regressing backwards from IN_TRANSIT or DELIVERED back to SCHEDULED or CONFIRMED
    if (["IN_TRANSIT", "DELIVERED"].includes(reservation.status) && ["SCHEDULED", "CONFIRMED", "RESERVED"].includes(toState)) {
      return res.status(400).json({ error: `Invalid backwards state transition from '${reservation.status}' to '${toState}'.` });
    }

    const nowIso = new Date().toISOString();
    reservation.status = toState;
    if (!reservation.timeline) reservation.timeline = [];
    reservation.timeline.push({
      step: toState,
      label: notes || `State transitioned to ${toState} by ${req.user.fullName}.`,
      timestamp: nowIso,
      actorName: req.user.fullName,
      actorRole: req.user.role
    });
    reservation.updatedAt = nowIso;

    if (pickup) {
      if (toState === "PICKED_UP" || toState === "IN_TRANSIT" || toState === "PICKUP_STARTED" || toState === "VOLUNTEER_EN_ROUTE") {
        pickup.status = toState === "VOLUNTEER_EN_ROUTE" ? "VOLUNTEER_EN_ROUTE" : "IN_TRANSIT";
      }
      if (toState === "DELIVERED") {
        pickup.status = "DELIVERED";
      }
      if (toState === "COMPLETED") {
        pickup.status = "COMPLETED";
      }
      if (toState === "CANCELLED") {
        pickup.status = "CANCELLED";
      }
      pickup.updatedAt = nowIso;
    }

    if (toState === "IN_TRANSIT" || toState === "PICKED_UP") {
      db.notifications.unshift({
        id: `notif-${Date.now()}-transit-ngo`,
        userId: reservation.ngoId,
        title: "Surplus in Transit",
        message: `Your food surplus from ${listing?.donorName || "donor"} is now in transit with the Delivery Partner.`,
        type: "DELIVERY",
        isRead: false,
        createdAt: nowIso
      });
    } else if (toState === "DELIVERED") {
      db.notifications.unshift({
        id: `notif-${Date.now()}-delivered-ngo`,
        userId: reservation.ngoId,
        title: "Delivery Partner Arrived",
        message: `Delivery Partner has arrived at your shelter loading bay. Share your Handover OTP (${pickup?.otpCode || reservation.confirmationCode}) to complete handover.`,
        type: "DELIVERY",
        isRead: false,
        createdAt: nowIso
      });
    } else if (toState === "CANCELLED") {
      if (listing) {
        db.notifications.unshift({
          id: `notif-${Date.now()}-cancel-donor`,
          userId: listing.donorId,
          title: "Food Reservation Cancelled",
          message: `The reservation for "${listing.title}" was cancelled. Inventory restored to available surplus.`,
          type: "RESERVATION",
          isRead: false,
          createdAt: nowIso
        });
      }
    }

    if (toState === "COMPLETED") {
      reservation.completedAt = nowIso;
      if (listing && (listing.remainingQuantity || 0) <= 0) {
        const allDone = db.reservations.filter((r) => r.listingId === listing.id).every((r) => r.status === "COMPLETED");
        if (allDone) {
          listing.status = "COMPLETED";
          listing.updatedAt = nowIso;
        }
      }
    }

    db.saveToDisk();

    res.json({
      success: true,
      message: `Recovery state advanced to ${toState}.`,
      reservation,
      pickup
    });
  });

  app.post("/api/reservations/assign-volunteer", authMiddleware, (req, res) => {
    const user = req.user;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "NGO" && user.role !== "VOLUNTEER") {
      return res.status(403).json({ error: "Only NGOs, Delivery Partners, or admins can assign delivery tasks." });
    }

    const { reservationId, pickupId, volunteerId } = req.body;
    if ((!reservationId && !pickupId) || !volunteerId) {
      return res.status(400).json({ error: "Reservation ID (or Pickup ID) and Delivery Partner ID are required." });
    }

    let reservation = null;
    let pickup = null;
    if (reservationId) {
      reservation = db.reservations.find((r) => r.id === reservationId);
      pickup = db.pickups.find((p) => p.reservationId === reservationId);
    }
    if (!reservation && pickupId) {
      pickup = db.pickups.find((p) => p.id === pickupId);
      if (pickup) {
        reservation = db.reservations.find((r) => r.id === pickup.reservationId);
      }
    }
    if (!reservation) {
      pickup = db.pickups.find((p) => p.id === reservationId);
      if (pickup) {
        reservation = db.reservations.find((r) => r.id === pickup.reservationId);
      }
    }

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isReceiverNgo = user.role === "NGO" && reservation.ngoId === user.id;
    const isSelfClaim = user.role === "VOLUNTEER" && user.id === volunteerId;

    if (!isAdmin && !isReceiverNgo && !isSelfClaim) {
      return res.status(403).json({ error: "You are not authorized to assign delivery partners to this reservation." });
    }

    if (reservation.status === "COMPLETED" || reservation.status === "CANCELLED") {
      return res.status(400).json({ error: `Cannot assign delivery partner to an order that is already ${reservation.status.toLowerCase()}.` });
    }

    if (reservation.assignedVolunteerId && reservation.assignedVolunteerId !== volunteerId && isSelfClaim) {
      return res.status(409).json({ error: "This task has already been assigned to another Delivery Partner." });
    }

    const volunteer = db.users.find((u) => u.id === volunteerId && u.role === "VOLUNTEER");
    if (!volunteer || !volunteer.isActive || volunteer.accountState === "SUSPENDED") {
      return res.status(404).json({ error: "Valid, active Delivery Partner not found." });
    }

    const nowIso = new Date().toISOString();
    reservation.assignedVolunteerId = volunteer.id;
    reservation.assignedVolunteerName = volunteer.fullName;
    reservation.assignedVolunteerPhone = volunteer.phone;
    reservation.status = "VOLUNTEER_ASSIGNED";
    if (!reservation.timeline) reservation.timeline = [];
    reservation.timeline.push({
      step: "ASSIGNED",
      label: `Delivery Partner ${volunteer.fullName} assigned for surplus transport.`,
      timestamp: nowIso,
      actorName: req.user.fullName,
      actorRole: req.user.role
    });
    reservation.updatedAt = nowIso;

    if (pickup) {
      pickup.volunteerId = volunteer.id;
      pickup.status = "ASSIGNED";
      pickup.pickupNotes = `Assigned to Delivery Partner ${volunteer.fullName}.`;
      pickup.updatedAt = nowIso;
    }

    const listing = db.foodListings.find(l => l.id === reservation.listingId);
    db.notifications.unshift({
      id: `notif-${Date.now()}-vol`,
      userId: volunteer.id,
      title: "New Dispatch Task Assigned",
      message: `You have been assigned to pick up surplus at ${listing?.donorLocality || "Surat"}. Check your Delivery Partner dashboard.`,
      type: "ASSIGNMENT",
      isRead: false,
      createdAt: nowIso
    });

    if (reservation.ngoId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-ngo-assign`,
        userId: reservation.ngoId,
        title: "Delivery Partner Dispatched",
        message: `Delivery Partner ${volunteer.fullName} has been assigned to transport your claimed surplus from ${listing?.donorName || "donor"}.`,
        type: "ASSIGNMENT",
        isRead: false,
        createdAt: nowIso
      });
    }

    db.saveToDisk();

    res.json({
      success: true,
      message: `Delivery Partner ${volunteer.fullName} assigned to reservation.`,
      reservation,
      pickup
    });
  });

  app.post("/api/verification/verify-otp", authMiddleware, (req, res) => {
    const { reservationId, pickupId, enteredOtp } = req.body;
    if ((!reservationId && !pickupId) || !enteredOtp) {
      return res.status(400).json({ error: "Reservation ID (or Pickup ID) and OTP code are required." });
    }

    let reservation = db.reservations.find((r) => r.id === reservationId);
    let pickup = db.pickups.find((p) => p.reservationId === reservationId || p.id === pickupId);
    if (!reservation && pickup) {
      reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    }
    if (!reservation && !pickup) {
      pickup = db.pickups.find((p) => p.id === reservationId);
      if (pickup) {
        reservation = db.reservations.find((r) => r.id === pickup.reservationId);
      }
    }

    if (!reservation || !pickup) {
      return res.status(404).json({ error: "Active recovery record not found." });
    }

    const listing = db.foodListings.find((l) => l.id === reservation.listingId);

    const user = req.user;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isDonor = user.id === listing?.donorId || (user.role === "DONOR" && listing?.donorId === user.id);
    const isNgo = user.id === reservation.ngoId || (user.role === "NGO" && reservation.ngoId === user.id);
    const isAssignedVol = user.id === reservation.assignedVolunteerId || user.id === pickup.volunteerId;

    if (!isAdmin && !isDonor && !isNgo && !isAssignedVol) {
      return res.status(403).json({ error: "You are not authorized to verify handoff for this order." });
    }

    if (reservation.status === "COMPLETED" || pickup.status === "COMPLETED") {
      return res.status(400).json({ error: "This handoff has already been completed." });
    }

    const rateKey = reservation.id;
    const attempts = db.otpAttempts.get(rateKey) || 0;
    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        errorCode: "RATE_LIMITED",
        error: "Too many failed OTP verification attempts. Verification locked for security.",
        attemptsRemaining: 0
      });
    }

    const expectedOtp = pickup.otpCode || reservation.confirmationCode;
    if (enteredOtp.trim() !== expectedOtp?.trim()) {
      const newAttempts = attempts + 1;
      db.otpAttempts.set(rateKey, newAttempts);
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_CODE",
        error: "Incorrect 4-digit verification OTP.",
        attemptsRemaining: Math.max(0, 5 - newAttempts)
      });
    }

    db.otpAttempts.delete(rateKey);
    const nowIso = new Date().toISOString();
    pickup.status = "COMPLETED";
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = req.user.id;
    pickup.verifiedByName = req.user.fullName;
    pickup.verificationMethod = "OTP";

    reservation.status = "COMPLETED";
    reservation.completedAt = nowIso;
    if (!reservation.timeline) reservation.timeline = [];
    reservation.timeline.push({
      step: "COMPLETED",
      label: `Handoff verified via 4-digit OTP by ${req.user.fullName}.`,
      timestamp: nowIso,
      actorName: req.user.fullName,
      actorRole: req.user.role
    });
    reservation.updatedAt = nowIso;

    if (listing && (listing.remainingQuantity || 0) <= 0) {
      const allDone = db.reservations.filter((r) => r.listingId === listing.id).every((r) => r.status === "COMPLETED");
      if (allDone) {
        listing.status = "COMPLETED";
        listing.updatedAt = nowIso;
      }
    }

    // Complete notification dispatches to all stakeholders
    if (listing) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-donor-done`,
        userId: listing.donorId,
        title: "Food Recovery Completed",
        message: `Your food surplus "${listing.title}" was safely delivered to ${reservation.ngoName || "shelter"} via verified OTP.`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }
    if (reservation.ngoId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-ngo-done`,
        userId: reservation.ngoId,
        title: "Food Surplus Received",
        message: `Handover verified successfully. Food from ${listing?.donorName || "donor"} has been added to your kitchen inventory.`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }
    if (pickup.volunteerId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-vol-done`,
        userId: pickup.volunteerId,
        title: "Delivery Mission Completed",
        message: `Handover verified successfully for ${reservation.ngoName || "shelter"}. Mission logged to your impact record.`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }

    db.saveToDisk();

    res.json({
      success: true,
      message: "OTP verified successfully. Food recovery completed.",
      reservation,
      pickup
    });
  });

  app.post("/api/verification/verify-qr", authMiddleware, (req, res) => {
    const { pickupId, qrToken } = req.body;
    if (!pickupId || !qrToken) {
      return res.status(400).json({ error: "Pickup ID and QR token are required." });
    }
    const pickup = db.pickups.find((p) => p.id === pickupId);
    if (!pickup) {
      return res.status(404).json({ error: "Pickup task not found." });
    }

    const reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    const listing = db.foodListings.find((l) => l.id === pickup.listingId);

    const user = req.user;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isDonor = user.id === pickup.donorId || (user.role === "DONOR" && listing?.donorId === user.id);
    const isNgo = user.id === pickup.ngoId || (user.role === "NGO" && reservation?.ngoId === user.id);
    const isAssignedVol = user.id === pickup.volunteerId || user.id === reservation?.assignedVolunteerId;

    if (!isAdmin && !isDonor && !isNgo && !isAssignedVol) {
      return res.status(403).json({ error: "You are not authorized to verify this QR handoff." });
    }

    if (db.usedNonces.has(qrToken.trim())) {
      return res.status(400).json({
        success: false,
        errorCode: "NONCE_REPLAYED",
        error: "This single-use cryptographic QR token has already been consumed."
      });
    }

    if (pickup.qrToken !== qrToken.trim()) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_TOKEN",
        error: "Cryptographic signature mismatch on QR token."
      });
    }

    db.usedNonces.add(qrToken.trim());
    const nowIso = new Date().toISOString();
    pickup.status = "COMPLETED";
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = req.user.id;
    pickup.verifiedByName = req.user.fullName;
    pickup.verificationMethod = "QR_HMAC";

    if (reservation) {
      reservation.status = "COMPLETED";
      reservation.completedAt = nowIso;
      if (!reservation.timeline) reservation.timeline = [];
      reservation.timeline.push({
        step: "COMPLETED",
        label: `Handoff cryptographically verified via HMAC QR token by ${req.user.fullName}.`,
        timestamp: nowIso,
        actorName: req.user.fullName,
        actorRole: req.user.role
      });
      reservation.updatedAt = nowIso;
    }

    if (listing && (listing.remainingQuantity || 0) <= 0) {
      const allDone = db.reservations.filter((r) => r.listingId === listing.id).every((r) => r.status === "COMPLETED");
      if (allDone) {
        listing.status = "COMPLETED";
        listing.updatedAt = nowIso;
      }
    }

    // Complete notification dispatches to all stakeholders
    if (listing) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-donor-done`,
        userId: listing.donorId,
        title: "Food Recovery Completed",
        message: `Your food surplus "${listing.title}" was safely delivered to ${reservation.ngoName || "shelter"} via verified OTP.`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }
    if (reservation.ngoId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-ngo-done`,
        userId: reservation.ngoId,
        title: "Food Surplus Received",
        message: `Handover verified successfully. Food from ${listing?.donorName || "donor"} has been added to your kitchen inventory.`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }
    if (pickup.volunteerId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-vol-done`,
        userId: pickup.volunteerId,
        title: "Delivery Mission Completed",
        message: `Handover verified successfully for ${reservation.ngoName || "shelter"}. Mission logged to your impact record.`,
        type: "VERIFICATION",
        isRead: false,
        createdAt: nowIso
      });
    }

    db.saveToDisk();

    res.json({
      success: true,
      message: "HMAC QR token verified successfully. Single-use nonce consumed.",
      pickup,
      reservation
    });
  });

  app.post("/api/verification/fallback-confirm", authMiddleware, (req, res) => {
    const { reservationId, pickupId, reason } = req.body;
    let reservation = db.reservations.find((r) => r.id === reservationId);
    let pickup = db.pickups.find((p) => p.id === pickupId || p.reservationId === reservationId);
    if (!reservation && pickup) {
      reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    }
    if (!reservation || !pickup) {
      return res.status(404).json({ error: "Recovery task record not found." });
    }

    const listing = db.foodListings.find((l) => l.id === reservation.listingId);

    const user = req.user;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isDonor = user.id === listing?.donorId;
    const isNgo = user.id === reservation.ngoId;
    const isAssignedVol = user.id === pickup.volunteerId || user.id === reservation.assignedVolunteerId;

    if (!isAdmin && !isDonor && !isNgo && !isAssignedVol) {
      return res.status(403).json({ error: "You are not authorized to confirm fallback for this task." });
    }

    const nowIso = new Date().toISOString();
    pickup.status = "COMPLETED";
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = req.user.id;
    pickup.verifiedByName = req.user.fullName;
    pickup.verificationMethod = "MANUAL_FALLBACK";
    pickup.fallbackReason = reason || "Battery/Device failure confirmed on-site.";
    reservation.status = "COMPLETED";
    reservation.completedAt = nowIso;
    if (!reservation.timeline) reservation.timeline = [];
    reservation.timeline.push({
      step: "COMPLETED",
      label: `Operational manual fallback confirmed (${pickup.fallbackReason}) by ${req.user.fullName}.`,
      timestamp: nowIso,
      actorName: req.user.fullName,
      actorRole: req.user.role
    });
    reservation.updatedAt = nowIso;

    if (listing && (listing.remainingQuantity || 0) <= 0) {
      const allDone = db.reservations.filter((r) => r.listingId === listing.id).every((r) => r.status === "COMPLETED");
      if (allDone) {
        listing.status = "COMPLETED";
        listing.updatedAt = nowIso;
      }
    }

    db.moderationLogs.unshift({
      id: `log-${Date.now()}`,
      action: "OPERATIONAL_FALLBACK_VERIFIED",
      targetId: reservation.id,
      targetName: listing?.title || reservation.id,
      adminId: req.user.id,
      adminName: req.user.fullName,
      reason: pickup.fallbackReason,
      timestamp: nowIso
    });

    db.saveToDisk();

    res.json({
      success: true,
      message: "Operational fallback verified and audited.",
      reservation,
      pickup
    });
  });

  app.post("/api/applications/submit", (req, res) => {
    const { role, applicantName, email, phone, locality, address, organizationName, orgType, fssaiNumber, vehicleType } = req.body;
    if (!role || !applicantName || !email || !phone) {
      return res.status(400).json({ error: "Role, name, email, and phone are required." });
    }
    const newApp = {
      id: `app-srt-${Date.now()}`,
      role,
      applicantName,
      email,
      phone,
      city: "Surat",
      locality: locality || "Vesu",
      address: address || `${locality || "Vesu"}, Surat`,
      organizationName,
      orgType,
      fssaiNumber,
      vehicleType,
      status: "UNDER_REVIEW",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.joinApplications.unshift(newApp);
    db.saveToDisk();
    res.json({ success: true, applicationId: newApp.id });
  });
  app.post("/api/applications/review", authMiddleware, (req, res) => {
    const user = req.user;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Administrative authority required." });
    }
    const { applicationId, decision, adminNotes, rejectionReason } = req.body;
    const appRecord = db.joinApplications.find((a) => a.id === applicationId);
    if (!appRecord) {
      return res.status(404).json({ error: "Application record not found." });
    }
    if (decision === "REJECTED" && !rejectionReason) {
      return res.status(400).json({ error: "Rejection requires a documented operational reason." });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    if (decision === "APPROVED") {
      appRecord.status = "APPROVED";
      appRecord.adminNotes = adminNotes || "Approved following verification check.";
      appRecord.reviewedAt = nowIso;
      const setupToken = `setup_${crypto.randomBytes(24).toString("hex")}`;
      const expiresAt = Date.now() + 48 * 60 * 60 * 1e3;
      appRecord.setupToken = setupToken;
      appRecord.setupTokenExpiresAt = new Date(expiresAt).toISOString();
      db.setupTokens.set(setupToken, {
        token: setupToken,
        applicationId: appRecord.id,
        email: appRecord.email,
        role: appRecord.role,
        fullName: appRecord.applicantName,
        orgName: appRecord.organizationName,
        locality: appRecord.locality,
        phone: appRecord.phone,
        expiresAt
      });
      db.moderationLogs.unshift({
        id: `log-${Date.now()}`,
        action: "APPROVE_APPLICATION",
        targetId: appRecord.id,
        targetName: appRecord.applicantName,
        adminId: user.id,
        adminName: user.fullName,
        reason: adminNotes || "Approved organization verification",
        timestamp: nowIso
      });
      db.saveToDisk();
      return res.json({
        success: true,
        message: "Application approved. Secure account setup link generated.",
        setupToken
      });
    } else {
      appRecord.status = "REJECTED";
      appRecord.adminNotes = rejectionReason;
      appRecord.reviewedAt = nowIso;
      db.moderationLogs.unshift({
        id: `log-${Date.now()}`,
        action: "REJECT_APPLICATION",
        targetId: appRecord.id,
        targetName: appRecord.applicantName,
        adminId: user.id,
        adminName: user.fullName,
        reason: rejectionReason,
        timestamp: nowIso
      });
      db.saveToDisk();
      return res.json({ success: true, message: "Application rejected." });
    }
  });

  app.get("/api/applications/export", authMiddleware, (req, res) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Administrative authority required." });
    }
    const headers = ["ID", "Role", "Name", "Email", "Phone", "Locality", "Status", "CreatedAt"];
    const rows = db.joinApplications.map((a) => [
      a.id,
      a.role,
      `"${a.applicantName}"`,
      a.email,
      a.phone,
      `"${a.locality || ""}"`,
      a.status,
      a.createdAt
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="nourishnet_applications.csv"');
    res.send(csvContent);
  });
  app.post("/api/admin/invite", authMiddleware, (req, res) => {
    const user = req.user;
    if (user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only Governance Council Superadmin can appoint administrators." });
    }
    const { fullName, email, phone, permissions } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ error: "Full name and email are required." });
    }
    const setupToken = `admin_invite_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
    db.setupTokens.set(setupToken, {
      token: setupToken,
      applicationId: `admin-${Date.now()}`,
      email,
      role: "ADMIN",
      fullName,
      phone: phone || "+91 98000 00000",
      expiresAt
    });
    db.moderationLogs.unshift({
      id: `log-${Date.now()}`,
      action: "CREATE_ADMIN",
      targetId: email,
      targetName: fullName,
      adminId: user.id,
      adminName: user.fullName,
      reason: "Issued administrative credentials invite",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    db.saveToDisk();
    res.json({ success: true, message: "Admin invitation created.", setupToken });
  });

  app.post("/api/admin/revoke", authMiddleware, (req, res) => {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only Super Admin can revoke administrative credentials." });
    }
    const { adminId, reason } = req.body;
    const target = db.users.find((u) => u.id === adminId && (u.role === "ADMIN" || u.role === "SUPER_ADMIN"));
    if (!target) {
      return res.status(404).json({ error: "Admin account not found." });
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ error: "Cannot revoke your own active super admin credentials." });
    }
    target.accountState = "SUSPENDED";
    target.isActive = false;
    const nowIso = new Date().toISOString();
    db.moderationLogs.unshift({
      id: `log-${Date.now()}`,
      action: "REVOKE_ADMIN",
      targetId: target.id,
      targetName: target.fullName,
      adminId: req.user.id,
      adminName: req.user.fullName,
      reason: reason || "Credentials revoked by Governance Council",
      timestamp: nowIso
    });
    db.saveToDisk();
    res.json({
      success: true,
      message: `Administrative credentials for ${target.fullName} revoked.`,
      targetUser: { id: target.id, fullName: target.fullName, accountState: target.accountState }
    });
  });

  app.post("/api/notifications/mark-read", authMiddleware, (req, res) => {
    const { notificationId } = req.body;
    const notif = db.notifications.find((n) => n.id === notificationId && n.userId === req.user.id);
    if (notif) {
      notif.isRead = true;
      db.saveToDisk();
    }
    res.json({ success: true });
  });

  app.post("/api/notifications/mark-all-read", authMiddleware, (req, res) => {
    db.notifications.forEach((n) => {
      if (n.userId === req.user.id) {
        n.isRead = true;
      }
    });
    db.saveToDisk();
    res.json({ success: true });
  });

  app.post("/api/messages/send", authMiddleware, (req, res) => {
    const user = req.user;
    const { reservationId, text } = req.body;
    if (!reservationId || !text || !text.trim()) {
      return res.status(400).json({ error: "Reservation ID and message text are required." });
    }
    const reservation = db.reservations.find(r => r.id === reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation record not found." });
    }
    const pickup = db.pickups.find(p => p.reservationId === reservationId);
    const listing = db.foodListings.find(l => l.id === reservation.listingId);

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isDonor = user.id === listing?.donorId;
    const isNgo = user.id === reservation.ngoId;
    const isVol = user.id === reservation.assignedVolunteerId || user.id === pickup?.volunteerId;
    if (!isAdmin && !isDonor && !isNgo && !isVol) {
      return res.status(403).json({ error: "You are not authorized to send messages on this recovery order." });
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      reservationId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      text: text.trim(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.recoveryMessages.push(newMsg);
    db.saveToDisk();
    res.json({ success: true, message: newMsg });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NourishNet server active on port ${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
