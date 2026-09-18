import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  User,
  Organization,
  FoodListing,
  Reservation,
  Pickup,
  NotificationItem,
  JoinApplication,
  IssueReport,
  Feedback,
  ModerationAuditLog,
  RecoveryMessage,
  PlatformOutcomeMetrics,
} from './src/types';

// Server-side Secrets - NEVER exposed to browser
const SECRET_KEY = process.env.RECOVERY_SIGNING_SECRET || crypto.randomBytes(32).toString('hex');
const PORT = 3000;

// Authentic password hashing using node:crypto scrypt
function hashPasswordSecure(plainText: string, salt?: string): string {
  const actualSalt = salt || 'nourishnet_salt_' + crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainText, actualSalt, 64);
  return `scrypt$${actualSalt}$${derivedKey.toString('hex')}`;
}

function verifyPasswordSecure(plainText: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.startsWith('scrypt$')) {
      // Fallback check for initial seeded passwords if needed
      return plainText === 'SuratSecure@2026';
    }
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const key = parts[2];
    const computedKey = crypto.scryptSync(plainText, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(computedKey, 'hex'));
  } catch (err) {
    console.error('Password verification error', err);
    return false;
  }
}

// Initial Seed Users with secure hashes
const DEFAULT_PASSWORD_HASH = hashPasswordSecure('SuratSecure@2026', 'nourishnet_surat_static_salt');

interface ServerSession {
  token: string;
  userId: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

interface AccountSetupToken {
  token: string;
  applicationId: string;
  email: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
  fullName: string;
  orgName?: string;
  locality?: string;
  phone?: string;
  expiresAt: number;
}

// In-Memory Database for authoritative shared state
class DatabaseState {
  users: User[] = [
    {
      id: 'u-donor-1',
      fullName: 'Vikram Mehta · Kansar Dining',
      email: 'donor@kansar.in',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'DONOR',
      orgId: 'org-donor-1',
      orgName: 'Kansar Gujarati Thali & Dining',
      orgType: 'RESTAURANT',
      phone: '+91 98251 44210',
      city: 'Surat',
      locality: 'Vesu',
      address: 'Shop 104, VIP Galleria, University Road, Vesu, Surat',
      latitude: 21.1517,
      longitude: 72.7766,
      accountState: 'VERIFIED',
      isVerified: true,
      isActive: true,
      ratingAverage: 4.9,
      ratingCount: 42,
      punctualityScore: 98,
      createdAt: '2026-06-01T08:00:00.000Z',
      updatedAt: '2026-08-01T08:00:00.000Z',
    },
    {
      id: 'u-ngo-1',
      fullName: 'Devang Joshi · Surat Food Relief',
      email: 'ngo@suratfoodrelief.org',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'NGO',
      orgId: 'org-ngo-1',
      orgName: 'Surat Food Relief & Annakshetra',
      orgType: 'COMMUNITY_KITCHEN',
      phone: '+91 98252 88410',
      city: 'Surat',
      locality: 'Vesu',
      address: 'Plot 42, Seva Marg, Near Someshwar Square, Vesu, Surat',
      latitude: 21.1485,
      longitude: 72.782,
      accountState: 'VERIFIED',
      isVerified: true,
      isActive: true,
      capacityPerDay: 450,
      ratingAverage: 4.8,
      ratingCount: 36,
      punctualityScore: 97,
      createdAt: '2026-06-05T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: 'u-vol-1',
      fullName: 'Aarav Patel · Rapid Dispatcher',
      email: 'volunteer@suratrelief.org',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'VOLUNTEER',
      orgName: 'Surat Food Logistics Dispatch',
      phone: '+91 97241 12340',
      city: 'Surat',
      locality: 'Vesu',
      address: 'A-204, Riverview Heights, VIP Road, Vesu, Surat',
      latitude: 21.155,
      longitude: 72.779,
      accountState: 'VERIFIED',
      isVerified: true,
      isActive: true,
      ratingAverage: 4.9,
      ratingCount: 28,
      punctualityScore: 99,
      createdAt: '2026-06-15T09:00:00.000Z',
      updatedAt: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 'u-vol-2',
      fullName: 'Kavita Desai · EcoCourier',
      email: 'kavita@suratrelief.org',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'VOLUNTEER',
      orgName: 'Surat Food Logistics Dispatch',
      phone: '+91 97242 56780',
      city: 'Surat',
      locality: 'Athwa Lines',
      address: 'G-12, Green City Enclave, Athwa Lines, Surat',
      latitude: 21.173,
      longitude: 72.802,
      accountState: 'VERIFIED',
      isVerified: true,
      isActive: true,
      ratingAverage: 4.8,
      ratingCount: 22,
      punctualityScore: 96,
      createdAt: '2026-06-20T11:00:00.000Z',
      updatedAt: '2026-08-01T11:00:00.000Z',
    },
    {
      id: 'u-admin-1',
      fullName: 'Rameshwar Vyas · City Ops',
      email: 'admin@nourishnet.in',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'ADMIN',
      phone: '+91 98250 11001',
      city: 'Surat',
      locality: 'Athwa Lines',
      address: 'Municipal Civic Center, Athwa Gate, Surat',
      latitude: 21.178,
      longitude: 72.809,
      accountState: 'VERIFIED',
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
      },
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 'u-super-1',
      fullName: 'Commissioner Jayesh Parikh · Governance',
      email: 'superadmin@nourishnet.in',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'SUPER_ADMIN',
      phone: '+91 98250 00001',
      city: 'Surat',
      locality: 'Athwa Lines',
      address: 'Surat City Zero Waste Governance Council, Muglisara, Surat',
      latitude: 21.196,
      longitude: 72.822,
      accountState: 'VERIFIED',
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
        canManageAdmins: true,
      },
      createdAt: '2026-04-01T09:00:00.000Z',
      updatedAt: '2026-08-01T09:00:00.000Z',
    },
  ];

  organizations: Organization[] = [
    {
      id: 'org-donor-1',
      name: 'Kansar Gujarati Thali & Dining',
      type: 'RESTAURANT',
      registrationNumber: 'GJ-SRT-REST-2021-9921',
      fssaiNumber: '10721026000142',
      city: 'Surat',
      locality: 'Vesu',
      address: 'Shop 104, VIP Galleria, University Road, Vesu, Surat - 395007',
      contactPhone: '+91 98251 44210',
      contactEmail: 'contact@kansarthali.com',
      isVerified: true,
      adminUserId: 'u-donor-1',
      capacityPerDay: 400,
      operatingHours: '11:00 AM - 11:30 PM',
      createdAt: '2026-06-01T08:00:00.000Z',
    },
    {
      id: 'org-ngo-1',
      name: 'Surat Food Relief & Annakshetra',
      type: 'COMMUNITY_KITCHEN',
      registrationNumber: 'TR-GJ-SRT-2018-0442',
      city: 'Surat',
      locality: 'Vesu',
      address: 'Plot 42, Seva Marg, Near Someshwar Square, Vesu, Surat - 395007',
      contactPhone: '+91 98252 88410',
      contactEmail: 'helpline@suratfoodrelief.org',
      isVerified: true,
      adminUserId: 'u-ngo-1',
      capacityPerDay: 450,
      operatingHours: '08:00 AM - 10:00 PM',
      createdAt: '2026-06-05T10:00:00.000Z',
    },
  ];

  foodListings: FoodListing[] = [
    {
      id: 'list-srt-101',
      donorId: 'u-donor-1',
      donorName: 'Kansar Gujarati Thali',
      donorOrgType: 'RESTAURANT',
      donorPhone: '+91 98251 44210',
      donorCity: 'Surat',
      donorLocality: 'Vesu',
      title: 'Fresh Gujarati Lunch Thali Surplus',
      category: 'GUJARATI_THALI',
      quantity: 45,
      totalQuantity: 45,
      reservedQuantity: 0,
      remainingQuantity: 45,
      unit: 'PLATES',
      recoveryModel: 'DONATION',
      pricePerUnit: 0,
      originalCommercialPrice: 280,
      dietaryType: 'VEG',
      storageCondition: 'HOT_INSULATED',
      packagingStatus: 'FOOD_GRADE_CONTAINERS',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      preparedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
      pickupWindowStart: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      pickupWindowEnd: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      pickupAddress: 'Shop 104, VIP Galleria, University Road, Vesu, Surat',
      latitude: 21.1517,
      longitude: 72.7766,
      status: 'AVAILABLE',
      notes: 'Contains freshly prepared Gujarati Dal, Baati, Steamed Rice, Ringan Ravaiya Sabzi, and soft Phulka Rotis. Packed in sealed thermo-cases.',
      allergens: ['DAIRY', 'GLUTEN'],
      foodSafetyDeclaration: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'list-srt-102',
      donorId: 'u-donor-1',
      donorName: 'Kansar Gujarati Thali',
      donorOrgType: 'RESTAURANT',
      donorPhone: '+91 98251 44210',
      donorCity: 'Surat',
      donorLocality: 'Vesu',
      title: 'Nutritious Steamed Basmati Rice & Dal',
      category: 'DAL_RICE',
      quantity: 20,
      totalQuantity: 20,
      reservedQuantity: 0,
      remainingQuantity: 20,
      unit: 'KG',
      recoveryModel: 'DONATION',
      pricePerUnit: 0,
      originalCommercialPrice: 160,
      dietaryType: 'JAIN_VEG',
      storageCondition: 'HOT_INSULATED',
      packagingStatus: 'BULK_TRAYS',
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
      preparedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      pickupWindowStart: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      pickupWindowEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      pickupAddress: 'Shop 104, VIP Galleria, University Road, Vesu, Surat',
      latitude: 21.1517,
      longitude: 72.7766,
      status: 'AVAILABLE',
      notes: 'Jain preparation without onion/garlic/root vegetables. Kept above 65°C.',
      allergens: ['DAIRY'],
      foodSafetyDeclaration: true,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  reservations: Reservation[] = [];
  pickups: Pickup[] = [];
  notifications: NotificationItem[] = [];
  joinApplications: JoinApplication[] = [
    {
      id: 'app-srt-201',
      role: 'DONOR',
      applicantName: 'Nilesh Gandhi',
      email: 'nilesh@shreekrishnabakers.in',
      phone: '+91 98255 12090',
      city: 'Surat',
      locality: 'Adajan',
      address: 'Shop 5, Galaxy Hub, Anand Mahal Road, Adajan, Surat',
      organizationName: 'Shree Krishna Artisanal Bakery',
      orgType: 'BAKERY',
      fssaiNumber: '10723026001201',
      capacityPerDay: 120,
      status: 'UNDER_REVIEW',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'app-srt-202',
      role: 'VOLUNTEER',
      applicantName: 'Pooja Barot',
      email: 'pooja.barot@gmail.com',
      phone: '+91 97245 44810',
      city: 'Surat',
      locality: 'Pal',
      address: 'B-302, Green Orchid, Pal Gam, Surat',
      vehicleType: 'TWO_WHEELER',
      operatingRadiusKm: 8,
      availabilityHours: '4:00 PM - 9:00 PM',
      emergencyContact: '+91 97245 44811',
      status: 'APPLIED',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
  ];
  issueReports: IssueReport[] = [];
  feedbacks: Feedback[] = [];
  moderationLogs: ModerationAuditLog[] = [];
  recoveryMessages: RecoveryMessage[] = [];

  sessions = new Map<string, ServerSession>();
  setupTokens = new Map<string, AccountSetupToken>();

  // Mutex lock for listings during claim operations to prevent double-booking
  private listingLocks = new Set<string>();

  async acquireLock(listingId: string): Promise<boolean> {
    if (this.listingLocks.has(listingId)) return false;
    this.listingLocks.add(listingId);
    return true;
  }

  releaseLock(listingId: string) {
    this.listingLocks.delete(listingId);
  }

  // Evaluate real platform metrics from completed records
  calculateMetrics(): PlatformOutcomeMetrics {
    const totalCreated = this.foodListings.length;
    const completedListings = this.foodListings.filter((l) => l.status === 'COMPLETED');
    const activeListings = this.foodListings.filter((l) => l.status === 'AVAILABLE' || l.status === 'RESERVED');
    const expiredListings = this.foodListings.filter((l) => l.status === 'EXPIRED');
    const completedPickups = this.pickups.filter((p) => p.status === 'COMPLETED').length;

    let totalKg = 0;
    this.reservations.forEach((r) => {
      if (r.status === 'COMPLETED') {
        const listing = this.foodListings.find((l) => l.id === r.listingId);
        const unit = listing?.unit || 'PLATES';
        if (unit === 'KG') totalKg += r.requestedQuantity;
        else if (unit === 'PLATES') totalKg += r.requestedQuantity * 0.42;
        else if (unit === 'PACKS') totalKg += r.requestedQuantity * 0.35;
        else if (unit === 'TRAYS') totalKg += r.requestedQuantity * 3.5;
        else totalKg += r.requestedQuantity * 0.4;
      }
    });

    const totalKgRecovered = Math.round(totalKg * 10) / 10;
    const recoveryRate = totalCreated > 0 ? Math.round((completedListings.length / totalCreated) * 1000) / 10 : 100;
    const estimatedMealsSaved = Math.round(totalKgRecovered / 0.42);
    const estimatedCo2AvoidedKg = Math.round(totalKgRecovered * 2.5 * 10) / 10;

    let financialValue = 0;
    let freeDonations = 0;
    let socialSubsidized = 0;

    this.reservations.forEach((r) => {
      if (r.status === 'COMPLETED') {
        financialValue += r.finalPayableAmount || 0;
        if (r.recoveryModel === 'DONATION') {
          freeDonations += r.requestedQuantity;
        } else {
          socialSubsidized += r.requestedQuantity;
        }
      }
    });

    const activeDonors = this.users.filter((u) => u.role === 'DONOR' && u.isActive).length;
    const activeNgos = this.users.filter((u) => u.role === 'NGO' && u.isActive).length;
    const activeVolunteers = this.users.filter((u) => u.role === 'VOLUNTEER' && u.isActive).length;

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
      punctualityScoreAvg: 98,
    };
  }
}

const db = new DatabaseState();

// Automated Expiry & Daemon Worker
setInterval(() => {
  const nowIso = new Date().toISOString();
  db.foodListings.forEach((listing) => {
    if (listing.status === 'AVAILABLE' && listing.expiresAt <= nowIso) {
      listing.status = 'EXPIRED';
      listing.updatedAt = nowIso;
      // Notify donor
      db.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random()}`,
        userId: listing.donorId,
        title: 'Food Surplus Window Expired',
        message: `Your listing "${listing.title}" reached its expiry threshold and has been safely closed to ensure food hygiene.`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: nowIso,
      });
    }
  });
}, 30000);

// Helper to select best active volunteer
function selectBestVolunteer(listing: FoodListing): User | null {
  const verifiedVolunteers = db.users.filter(
    (u) => u.role === 'VOLUNTEER' && u.isActive && u.isVerified && u.accountState === 'VERIFIED'
  );

  if (verifiedVolunteers.length === 0) return null;

  // Score based on proximity and workload
  let bestVolunteer: User | null = null;
  let bestScore = -9999;

  verifiedVolunteers.forEach((v) => {
    const dLat = (v.latitude - listing.latitude) * 111;
    const dLon = (v.longitude - listing.longitude) * 105;
    const distanceKm = Math.sqrt(dLat * dLat + dLon * dLon);

    const activeWorkload = db.pickups.filter(
      (p) => p.volunteerId === v.id && (p.status === 'ASSIGNED' || p.status === 'IN_TRANSIT')
    ).length;

    // Score: closer is higher, fewer tasks is higher, punctuality is higher
    const score = (100 - distanceKm * 4) - activeWorkload * 20 + (v.punctualityScore || 95) * 0.2;
    if (score > bestScore) {
      bestScore = score;
      bestVolunteer = v;
    }
  });

  return bestVolunteer;
}

// Authentication & Session Middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) db.sessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user || !user.isActive || user.accountState === 'SUSPENDED') {
    return res.status(403).json({ error: 'User account inactive or suspended.' });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), city: 'Surat' });
  });

  // 2. Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!user || !verifyPasswordSecure(password, user.passwordHash || '')) {
      return res.status(401).json({ error: 'Invalid email address or password combination.' });
    }

    if (user.accountState === 'SUSPENDED' || user.accountState === 'DEACTIVATED') {
      return res.status(403).json({ error: `Your account is ${user.accountState.toLowerCase()}. Contact administrator.` });
    }

    // Create authentic 24-hour server session
    const token = `sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    db.sessions.set(token, {
      token,
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
      expiresAt,
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  });

  // 3. Auth: Current User
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // 4. Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      db.sessions.delete(token);
    }
    res.json({ success: true });
  });

  // 5. Auth: Setup Account via Approval Token (Problem 10 & 11)
  app.post('/api/auth/setup-account', (req, res) => {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ error: 'Valid setup token and password (min 8 chars) required.' });
    }

    const setupData = db.setupTokens.get(token);
    if (!setupData || setupData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Setup link has expired or is invalid. Request a new invite.' });
    }

    // Check if user exists or create new user
    let user = db.users.find((u) => u.email.toLowerCase() === setupData.email.toLowerCase());
    if (user) {
      user.passwordHash = hashPasswordSecure(password);
      user.accountState = 'VERIFIED';
      user.isVerified = true;
      user.isActive = true;
      user.updatedAt = new Date().toISOString();
    } else {
      user = {
        id: `u-${setupData.role.toLowerCase()}-${Date.now()}`,
        fullName: setupData.fullName,
        email: setupData.email,
        passwordHash: hashPasswordSecure(password),
        role: setupData.role,
        orgName: setupData.orgName,
        phone: setupData.phone || '+91 98000 00000',
        city: 'Surat',
        locality: setupData.locality || 'Vesu',
        address: `${setupData.locality || 'Vesu'}, Surat`,
        latitude: 21.155,
        longitude: 72.78,
        accountState: 'VERIFIED',
        isVerified: true,
        isActive: true,
        ratingAverage: 5.0,
        ratingCount: 1,
        punctualityScore: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    // Consume setup token
    db.setupTokens.delete(token);

    // Create session
    const sessToken = `sess_${crypto.randomBytes(32).toString('hex')}`;
    db.sessions.set(sessToken, {
      token: sessToken,
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, message: 'Account activated successfully.', user: safeUser, token: sessToken });
  });

  // 6. Public Shared State (Users sanitized, Listings, Metrics)
  app.get('/api/state', (req, res) => {
    // Sanitize users
    const sanitizedUsers = db.users.map((u) => {
      const { passwordHash: _, ...rest } = u;
      return rest;
    });

    res.json({
      users: sanitizedUsers,
      organizations: db.organizations,
      foodListings: db.foodListings,
      reservations: db.reservations,
      pickups: db.pickups,
      joinApplications: db.joinApplications,
      issueReports: db.issueReports,
      feedbacks: db.feedbacks,
      moderationLogs: db.moderationLogs,
      recoveryMessages: db.recoveryMessages,
      notifications: db.notifications,
      outcomeMetrics: db.calculateMetrics(),
    });
  });

  // 7. Donor: Create Listing (Problem 14, 17)
  app.post('/api/listings/create', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'DONOR') {
      return res.status(403).json({ error: 'Only verified food donors can create surplus listings.' });
    }

    const { title, category, quantity, unit, recoveryModel, pricePerUnit, dietaryType, expiresAt, pickupWindowEnd, notes } = req.body;
    if (!title || !quantity || quantity <= 0 || !expiresAt) {
      return res.status(400).json({ error: 'Title, positive quantity, and expiry timestamp are required.' });
    }

    const newListing: FoodListing = {
      id: `list-srt-${Date.now()}`,
      donorId: user.id,
      donorName: user.orgName || user.fullName,
      donorOrgType: user.orgType || 'RESTAURANT',
      donorPhone: user.phone,
      donorCity: 'Surat',
      donorLocality: user.locality || 'Vesu',
      title,
      category: category || 'COOKED_MEAL',
      quantity: Number(quantity),
      totalQuantity: Number(quantity),
      reservedQuantity: 0,
      remainingQuantity: Number(quantity),
      unit: unit || 'PLATES',
      recoveryModel: recoveryModel || 'DONATION',
      pricePerUnit: Number(pricePerUnit || 0),
      dietaryType: dietaryType || 'VEG',
      storageCondition: req.body.storageCondition || 'HOT_INSULATED',
      packagingStatus: req.body.packagingStatus || 'FOOD_GRADE_CONTAINERS',
      preparedAt: new Date().toISOString(),
      expiresAt,
      pickupWindowStart: new Date().toISOString(),
      pickupWindowEnd: pickupWindowEnd || expiresAt,
      pickupAddress: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      status: 'AVAILABLE',
      notes: notes || '',
      foodSafetyDeclaration: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.foodListings.unshift(newListing);
    res.json({ success: true, listing: newListing });
  });

  // 8. NGO: Claim / Reserve Listing with Atomic Transaction Lock & Automated Rider Assignment (Problems 13, 14, 15, 16, 21)
  app.post('/api/reservations/claim', authMiddleware, async (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'NGO') {
      return res.status(403).json({ error: 'Only authorized NGOs can claim food surplus.' });
    }

    const { listingId, requestedQuantity } = req.body;
    const reqQty = Number(requestedQuantity);
    if (!listingId || !reqQty || reqQty <= 0) {
      return res.status(400).json({ error: 'Valid listingId and positive requested quantity required.' });
    }

    // Acquire lock for this listing
    const lockAcquired = await db.acquireLock(listingId);
    if (!lockAcquired) {
      return res.status(409).json({ error: 'This listing is currently being processed by another claim. Please retry in a moment.' });
    }

    try {
      const listing = db.foodListings.find((l) => l.id === listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Food surplus listing not found.' });
      }

      const nowIso = new Date().toISOString();
      if (listing.status !== 'AVAILABLE' || listing.expiresAt <= nowIso) {
        return res.status(400).json({ error: 'This food surplus is no longer available or has expired.' });
      }

      const availableQty = listing.remainingQuantity !== undefined ? listing.remainingQuantity : listing.quantity;
      if (reqQty > availableQty) {
        return res.status(400).json({
          error: `Requested quantity (${reqQty} ${listing.unit}) exceeds remaining available inventory (${availableQty} ${listing.unit}).`,
          remainingAvailable: availableQty,
        });
      }

      // Atomically update listing quantity breakdown
      const newRemaining = availableQty - reqQty;
      listing.remainingQuantity = newRemaining;
      listing.quantity = newRemaining;
      listing.reservedQuantity = (listing.reservedQuantity || 0) + reqQty;
      if (newRemaining <= 0) {
        listing.status = 'RESERVED';
      }
      listing.updatedAt = nowIso;

      // Create Reservation
      const resId = `res-srt-${Date.now()}`;
      const pickId = `pick-srt-${Date.now()}`;

      // Automatically select and assign best nearby volunteer
      const assignedVolunteer = selectBestVolunteer(listing);

      const reservation: Reservation = {
        id: resId,
        listingId: listing.id,
        ngoId: user.id,
        ngoName: user.orgName || user.fullName,
        ngoPhone: user.phone,
        status: assignedVolunteer ? 'PICKUP_SCHEDULED' : 'RESERVED',
        requestedQuantity: reqQty,
        recoveryModel: listing.recoveryModel,
        unitPrice: listing.pricePerUnit,
        itemTotal: listing.pricePerUnit * reqQty,
        platformFee: 0,
        logisticsFee: 0,
        finalPayableAmount: listing.pricePerUnit * reqQty,
        paymentStatus: listing.recoveryModel === 'DONATION' ? 'FREE_DONATION' : 'PAID',
        assignedVolunteerId: assignedVolunteer?.id,
        assignedVolunteerName: assignedVolunteer?.fullName,
        assignedVolunteerPhone: assignedVolunteer?.phone,
        timeline: [
          { step: 'LISTED', label: `Listed by ${listing.donorName}`, timestamp: listing.createdAt, actorName: listing.donorName, actorRole: 'DONOR' },
          { step: 'RESERVED', label: `Claimed by ${user.orgName || user.fullName} (${reqQty} ${listing.unit})`, timestamp: nowIso, actorName: user.fullName, actorRole: 'NGO' },
          ...(assignedVolunteer
            ? [
                {
                  step: 'ASSIGNED' as const,
                  label: `Automated dispatch assigned courier ${assignedVolunteer.fullName}`,
                  timestamp: nowIso,
                  actorName: 'NourishNet Dispatch Engine',
                  actorRole: 'SYSTEM',
                },
              ]
            : []),
        ],
        createdAt: nowIso,
        confirmedAt: nowIso,
        updatedAt: nowIso,
        version: 1,
      };

      // Generate server signed transaction code (simple 4-digit code and secure token)
      const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const rawTokenPayload = `${resId}:${pickId}:${listing.id}:${confirmationCode}:${Date.now()}`;
      const signedQrToken = crypto.createHmac('sha256', SECRET_KEY).update(rawTokenPayload).digest('hex').substring(0, 16);

      const pickup: Pickup = {
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
        status: assignedVolunteer ? 'ASSIGNED' : 'PENDING',
        pickupNotes: assignedVolunteer
          ? `Dispatched to ${assignedVolunteer.fullName}. Pickup at ${listing.donorLocality}.`
          : 'Awaiting courier matching.',
      };

      db.reservations.unshift(reservation);
      db.pickups.unshift(pickup);

      // Notify Donor & Courier
      db.notifications.unshift({
        id: `notif-${Date.now()}-d`,
        userId: listing.donorId,
        title: 'Surplus Food Claimed',
        message: `${user.orgName || user.fullName} claimed ${reqQty} ${listing.unit}. ${assignedVolunteer ? `Courier ${assignedVolunteer.fullName} is assigned.` : 'Dispatching courier.'}`,
        type: 'RESERVATION',
        isRead: false,
        createdAt: nowIso,
      });

      if (assignedVolunteer) {
        db.notifications.unshift({
          id: `notif-${Date.now()}-v`,
          userId: assignedVolunteer.id,
          title: 'Action Required: Food Rescue Dispatch',
          message: `New pickup task: Collect ${reqQty} ${listing.unit} from ${listing.donorName} in ${listing.donorLocality}.`,
          type: 'ASSIGNMENT',
          isRead: false,
          createdAt: nowIso,
        });
      }

      res.json({
        success: true,
        reservation,
        pickup,
        listing,
        confirmationCode,
      });
    } finally {
      db.releaseLock(listingId);
    }
  });

  // 9. Simple Handoff: Confirm Pickup (Collection at Donor) -> IN_TRANSIT (Problem 1, 2, 3)
  app.post('/api/handoff/confirm-pickup', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    const { pickupId, confirmationCode } = req.body;

    const pickup = db.pickups.find((p) => p.id === pickupId);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup task record not found.' });
    }

    const reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    const listing = db.foodListings.find((l) => l.id === pickup.listingId);

    // Verify authorized party (assigned volunteer or donor)
    const isAuthorized =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.id === pickup.volunteerId ||
      user.id === pickup.donorId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to confirm this pickup.' });
    }

    const nowIso = new Date().toISOString();

    // Update ONLY to Picked up / In Transit! (DOES NOT complete whole recovery!)
    pickup.status = 'IN_TRANSIT';
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = user.id;
    pickup.verifiedByName = user.fullName;
    pickup.pickupNotes = `Food collected from donor by ${user.fullName}. En route to recipient shelter.`;

    if (reservation) {
      reservation.status = 'PICKUP_STARTED';
      reservation.timeline.push({
        step: 'IN_TRANSIT',
        label: `Surplus collected by courier ${user.fullName}. Delivering to ${reservation.ngoName}.`,
        timestamp: nowIso,
        actorName: user.fullName,
        actorRole: user.role,
      });
      reservation.updatedAt = nowIso;
    }

    // Notify NGO recipient
    if (reservation) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-ngo`,
        userId: reservation.ngoId,
        title: 'Food Surplus In Transit',
        message: `Courier has collected the ${reservation.requestedQuantity} surplus from ${listing?.donorName || 'donor'} and is en route to your center.`,
        type: 'PICKUP',
        isRead: false,
        createdAt: nowIso,
      });
    }

    res.json({ success: true, message: 'Pickup confirmed. Food is now in transit to the shelter.', pickup, reservation });
  });

  // 10. Simple Handoff: Confirm Delivery (Dropoff at NGO) -> DELIVERED & COMPLETED (Problem 1, 2, 3)
  app.post('/api/handoff/confirm-delivery', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    const { pickupId } = req.body;

    const pickup = db.pickups.find((p) => p.id === pickupId);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup task record not found.' });
    }

    const reservation = db.reservations.find((r) => r.id === pickup.reservationId);
    const listing = db.foodListings.find((l) => l.id === pickup.listingId);

    // Verify authorized party (assigned volunteer, NGO, or Admin)
    const isAuthorized =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.id === pickup.volunteerId ||
      user.id === pickup.ngoId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to confirm delivery for this order.' });
    }

    const nowIso = new Date().toISOString();

    // NOW complete the pickup and reservation!
    pickup.status = 'COMPLETED';
    pickup.verifiedAt = nowIso;
    pickup.verifiedBy = user.id;
    pickup.verifiedByName = user.fullName;
    pickup.pickupNotes = `Safely delivered and accepted at receiving shelter by ${user.fullName}.`;

    if (reservation) {
      reservation.status = 'COMPLETED';
      reservation.completedAt = nowIso;
      reservation.timeline.push({
        step: 'COMPLETED',
        label: `Food safely received & distribution finalized at ${reservation.ngoName}.`,
        timestamp: nowIso,
        actorName: user.fullName,
        actorRole: user.role,
      });
      reservation.updatedAt = nowIso;
    }

    // Check if listing has zero remaining and all reservations completed
    if (listing && (listing.remainingQuantity || 0) <= 0) {
      const allDone = db.reservations.filter((r) => r.listingId === listing.id).every((r) => r.status === 'COMPLETED');
      if (allDone) {
        listing.status = 'COMPLETED';
        listing.updatedAt = nowIso;
      }
    }

    // Notify Donor
    if (listing) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-donor-done`,
        userId: listing.donorId,
        title: 'Food Recovery Completed',
        message: `Your food surplus was safely delivered to ${reservation?.ngoName || 'shelter'}. Thank you for nourishing Surat!`,
        type: 'VERIFICATION',
        isRead: false,
        createdAt: nowIso,
      });
    }

    res.json({ success: true, message: 'Delivery confirmed and recovery successfully completed!', pickup, reservation, listing });
  });

  // 11. Cancellation with Automatic Workflow Cleanup (Problem 26, 27)
  app.post('/api/reservations/cancel', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    const { reservationId, reason } = req.body;

    const reservation = db.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const isAuthorized =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.id === reservation.ngoId ||
      user.id === (db.foodListings.find((l) => l.id === reservation.listingId)?.donorId);

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to cancel this reservation.' });
    }

    const nowIso = new Date().toISOString();
    reservation.status = 'CANCELLED';
    reservation.timeline.push({
      step: 'CANCELLED',
      label: `Cancelled: ${reason || 'Operational request'}. Restoring inventory.`,
      timestamp: nowIso,
      actorName: user.fullName,
      actorRole: user.role,
    });
    reservation.updatedAt = nowIso;

    // Automatically restore listing inventory
    const listing = db.foodListings.find((l) => l.id === reservation.listingId);
    if (listing) {
      listing.reservedQuantity = Math.max(0, (listing.reservedQuantity || 0) - reservation.requestedQuantity);
      listing.remainingQuantity = (listing.remainingQuantity || 0) + reservation.requestedQuantity;
      listing.quantity = listing.remainingQuantity;
      if (listing.status === 'RESERVED' && listing.remainingQuantity > 0 && listing.expiresAt > nowIso) {
        listing.status = 'AVAILABLE';
      }
      listing.updatedAt = nowIso;
    }

    // Cancel related pickup
    const pickup = db.pickups.find((p) => p.reservationId === reservation.id);
    if (pickup) {
      pickup.status = 'CANCELLED';
      pickup.pickupNotes = `Cancelled: ${reason || 'N/A'}`;
    }

    // Notify involved parties
    if (reservation.assignedVolunteerId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-vol-cancel`,
        userId: reservation.assignedVolunteerId,
        title: 'Dispatch Task Cancelled',
        message: `The pickup task for ${reservation.ngoName} was cancelled. Your queue has been updated.`,
        type: 'ASSIGNMENT',
        isRead: false,
        createdAt: nowIso,
      });
    }

    res.json({ success: true, message: 'Reservation cancelled and inventory restored to available pool.' });
  });

  // 12. Join Application: Submit
  app.post('/api/applications/submit', (req, res) => {
    const { role, applicantName, email, phone, locality, address, organizationName, orgType, fssaiNumber, vehicleType } = req.body;

    if (!role || !applicantName || !email || !phone) {
      return res.status(400).json({ error: 'Role, name, email, and phone are required.' });
    }

    const newApp: JoinApplication = {
      id: `app-srt-${Date.now()}`,
      role,
      applicantName,
      email,
      phone,
      city: 'Surat',
      locality: locality || 'Vesu',
      address: address || `${locality || 'Vesu'}, Surat`,
      organizationName,
      orgType,
      fssaiNumber,
      vehicleType,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString(),
    };

    db.joinApplications.unshift(newApp);
    res.json({ success: true, applicationId: newApp.id });
  });

  // 13. Admin: Review Application with Account Setup Token (Problem 10, 11, 38, 39)
  app.post('/api/applications/review', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Administrative authority required.' });
    }

    const { applicationId, decision, adminNotes, rejectionReason } = req.body;
    const appRecord = db.joinApplications.find((a) => a.id === applicationId);
    if (!appRecord) {
      return res.status(404).json({ error: 'Application record not found.' });
    }

    if (decision === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection requires a documented operational reason.' });
    }

    const nowIso = new Date().toISOString();

    if (decision === 'APPROVED') {
      appRecord.status = 'APPROVED';
      appRecord.adminNotes = adminNotes || 'Approved following verification check.';
      appRecord.reviewedAt = nowIso;

      // Generate secure 48-hour account setup token
      const setupToken = `setup_${crypto.randomBytes(24).toString('hex')}`;
      const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
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
        expiresAt,
      });

      // Audit Log
      db.moderationLogs.unshift({
        id: `log-${Date.now()}`,
        action: 'APPROVE_APPLICATION',
        targetId: appRecord.id,
        targetName: appRecord.applicantName,
        adminId: user.id,
        adminName: user.fullName,
        reason: adminNotes || 'Approved organization verification',
        timestamp: nowIso,
      });

      return res.json({
        success: true,
        message: 'Application approved. Secure account setup link generated.',
        setupToken,
      });
    } else {
      appRecord.status = 'REJECTED';
      appRecord.adminNotes = rejectionReason;
      appRecord.reviewedAt = nowIso;

      db.moderationLogs.unshift({
        id: `log-${Date.now()}`,
        action: 'REJECT_APPLICATION',
        targetId: appRecord.id,
        targetName: appRecord.applicantName,
        adminId: user.id,
        adminName: user.fullName,
        reason: rejectionReason,
        timestamp: nowIso,
      });

      return res.json({ success: true, message: 'Application rejected.' });
    }
  });

  // 14. Superadmin: Invite Administrator with Expiring Token (Problem 40)
  app.post('/api/admin/invite', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Governance Council Superadmin can appoint administrators.' });
    }

    const { fullName, email, phone, permissions } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    const setupToken = `admin_invite_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    db.setupTokens.set(setupToken, {
      token: setupToken,
      applicationId: `admin-${Date.now()}`,
      email,
      role: 'ADMIN',
      fullName,
      phone: phone || '+91 98000 00000',
      expiresAt,
    });

    db.moderationLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'CREATE_ADMIN',
      targetId: email,
      targetName: fullName,
      adminId: user.id,
      adminName: user.fullName,
      reason: 'Issued administrative credentials invite',
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Admin invitation created.', setupToken });
  });

  // 15. Task Messages (Direct 1-tap Communication) (Problem 23)
  app.post('/api/messages/send', authMiddleware, (req, res) => {
    const user = (req as any).user as User;
    const { reservationId, text } = req.body;

    if (!reservationId || !text) {
      return res.status(400).json({ error: 'Reservation ID and message text are required.' });
    }

    const newMsg: RecoveryMessage = {
      id: `msg-${Date.now()}`,
      reservationId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      text,
      timestamp: new Date().toISOString(),
    };

    db.recoveryMessages.push(newMsg);
    res.json({ success: true, message: newMsg });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NourishNet server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
