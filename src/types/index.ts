export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountState = 
  | 'APPLIED' 
  | 'UNDER_REVIEW' 
  | 'MORE_INFORMATION_REQUIRED' 
  | 'APPROVED' 
  | 'PROFILE_INCOMPLETE' 
  | 'VERIFICATION_PENDING' 
  | 'VERIFIED' 
  | 'SUSPENDED' 
  | 'REJECTED' 
  | 'DEACTIVATED';

export type NgoType = 
  | 'SHELTER' 
  | 'COMMUNITY_KITCHEN' 
  | 'ORPHANAGE' 
  | 'OLD_AGE_HOME' 
  | 'DISASTER_RELIEF'
  | 'FOOD_BANK';

export type FoodCategory = 
  | 'GUJARATI_THALI' 
  | 'COOKED_MEAL' 
  | 'ROTIS_BREADS' 
  | 'DAL_RICE' 
  | 'BIRYANI_RICE' 
  | 'BAKERY' 
  | 'PRODUCE_VEG' 
  | 'DAIRY_PACKAGED' 
  | 'SNACKS_FARSAN' 
  | 'RAW_INGREDIENTS';

export type QuantityUnit = 'PLATES' | 'KG' | 'PACKS' | 'TRAYS' | 'LITRES';

export type RecoveryModel = 'DONATION' | 'SOCIAL_PRICE' | 'RECOVERY_PRICE';

export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export type ReservationStatus = 
  | 'LISTED'
  | 'MATCHED'
  | 'RESERVED'
  | 'VOLUNTEER_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'VOLUNTEER_EN_ROUTE'
  | 'PICKUP_STARTED'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELLED'
  | 'FAILED'
  | 'ISSUE_REPORTED'
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'PICKUP_IN_PROGRESS'
  | 'EXPIRED';

export type PickupStatus = 
  | 'PENDING' 
  | 'ASSIGNED'
  | 'VOLUNTEER_EN_ROUTE'
  | 'PICKUP_STARTED'
  | 'IN_TRANSIT' 
  | 'VERIFIED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export type VerificationMethod = 'OTP' | 'QR';

export type VerificationStage = 'DONOR_TO_VOLUNTEER' | 'VOLUNTEER_TO_NGO' | 'DIRECT_DONOR_TO_NGO';

export interface VerificationHandoff {
  id: string;
  stage: VerificationStage;
  otpCode: string; // 6-digit one-time code
  otpExpiresAt: string;
  otpAttemptCount: number;
  otpMaxAttempts: number;
  qrToken: string;
  qrExpiresAt: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedByUserId?: string;
  verifiedByUserName?: string;
  verifiedByUserRole?: UserRole;
  verificationMethodUsed?: VerificationMethod;
  proofNonce?: string;
}

export interface VerificationHistoryItem {
  id: string;
  reservationId: string;
  pickupId: string;
  listingTitle: string;
  stage: VerificationStage;
  method: VerificationMethod;
  verifiedByUserId: string;
  verifiedByUserName: string;
  verifiedByUserRole: UserRole;
  donorName: string;
  ngoName: string;
  volunteerName?: string;
  timestamp: string;
  locality: string;
  result: 'SUCCESS' | 'FAILED' | 'ATTEMPT_EXCEEDED';
  auditHash: string;
}

export type LocationTrackingState = 
  | 'NO_ACTIVE_RECOVERY' // No tracking
  | 'RECOVERY_ASSIGNED'  // Location access available / route preview
  | 'PICKUP_ACTIVE'      // Operational tracking active
  | 'PICKUP_COMPLETED';  // Tracking stopped

export interface RecoveryMessage {
  id: string;
  reservationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverRole?: UserRole;
  text: string;
  timestamp: string;
  isQuickPreset?: boolean;
  isSafetyWarning?: boolean;
  isReported?: boolean;
  reportReason?: string;
}

export type SuratLocality = 
  | 'Vesu' 
  | 'Adajan' 
  | 'Athwa Lines' 
  | 'Varachha' 
  | 'Katargam' 
  | 'Udhna' 
  | 'Piplod' 
  | 'Pal' 
  | 'City Light' 
  | 'Nanpura' 
  | 'Rander' 
  | 'Ghanshyam Nagar';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  orgId?: string;
  orgName?: string;
  orgType?: string;
  phone: string;
  city: string;
  locality: SuratLocality | string;
  address: string;
  latitude: number;
  longitude: number;
  accountState: AccountState;
  isVerified: boolean;
  isActive: boolean;
  adminPermissions?: AdminPermissions;
  capacityPerDay?: number;
  ratingAverage?: number;
  ratingCount?: number;
  punctualityScore?: number;
  foodQualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermissions {
  canVerifyOrganizations?: boolean;
  canVerifyOrgs?: boolean;
  canModerateListings: boolean;
  canManageDisputes?: boolean;
  canManageIncidents?: boolean;
  canSuspendUsers?: boolean;
  canManageUsers?: boolean;
  canAccessAuditLogs?: boolean;
  canManageAdmins?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'RESTAURANT' | 'CATERER' | 'HOTEL' | 'NGO' | 'COMMUNITY_KITCHEN' | 'SUPERMARKET';
  registrationNumber: string;
  fssaiNumber?: string;
  city: string;
  locality: SuratLocality | string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  isVerified: boolean;
  adminUserId: string;
  capacityPerDay?: number;
  acceptedCategories?: FoodCategory[];
  operatingHours?: string;
  createdAt: string;
}

export interface FoodListing {
  id: string;
  donorId: string;
  donorName: string;
  donorOrgType: string;
  donorPhone: string;
  donorCity: string;
  donorLocality: SuratLocality | string;
  title: string;
  category: FoodCategory;
  quantity: number; // Current remaining available quantity
  totalQuantity?: number; // Initial total listed quantity
  reservedQuantity?: number; // Quantity locked in active claims
  remainingQuantity?: number; // Quantity still available for claim
  unit: QuantityUnit;
  recoveryModel: RecoveryModel;
  pricePerUnit: number; // 0 for DONATION, subsidized or recovery price
  originalCommercialPrice?: number;
  dietaryType?: 'VEG' | 'JAIN_VEG' | 'NON_VEG' | 'VEGAN';
  storageCondition?: 'HOT_INSULATED' | 'REFRIGERATED' | 'ROOM_TEMP' | 'FROZEN';
  packagingStatus?: 'FOOD_GRADE_CONTAINERS' | 'FOIL_PACKS' | 'BULK_TRAYS' | 'SEALED_BOXES';
  imageUrl?: string;
  preparedAt: string;
  expiresAt: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  status: ListingStatus;
  notes?: string;
  allergens?: string[];
  foodSafetyDeclaration?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  step: 'LISTED' | 'MATCHED' | 'RESERVED' | 'ASSIGNED' | 'IN_TRANSIT' | 'VERIFIED' | 'COMPLETED' | 'CANCELLED';
  label: string;
  timestamp: string;
  actorName?: string;
  actorRole?: string;
}

export interface Reservation {
  id: string;
  listingId: string;
  ngoId: string;
  ngoName: string;
  ngoPhone?: string;
  status: ReservationStatus;
  requestedQuantity: number;
  recoveryModel?: RecoveryModel;
  unitPrice?: number;
  itemTotal?: number;
  platformFee?: number;
  logisticsFee?: number;
  finalPayableAmount?: number;
  paymentStatus?: 'FREE_DONATION' | 'PENDING' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  assignedVolunteerPhone?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  updatedAt: string;
  version: number;
}

export interface Pickup {
  id: string;
  reservationId: string;
  listingId: string;
  ngoId: string;
  donorId: string;
  volunteerId?: string;
  qrToken: string;
  nonce: string;
  qrGeneratedAt: string;
  qrExpiresAt: string;
  otpCode?: string;
  otpExpiresAt?: string;
  otpAttemptCount?: number;
  handoffs?: VerificationHandoff[];
  trackingState?: LocationTrackingState;
  estimatedArrivalMins?: number;
  volunteerCurrentLocality?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verificationMethodUsed?: VerificationMethod;
  status: PickupStatus;
  pickupNotes?: string;
}

export interface Feedback {
  id: string;
  reservationId: string;
  listingId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserName: string;
  toUserRole: UserRole;
  rating: number; // 1 to 5
  punctualityRating?: number;
  foodConditionRating?: number;
  quantityAccuracyRating?: number;
  communicationRating?: number;
  comments?: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface IssueReport {
  id: string;
  reservationId?: string;
  listingId?: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reportedByUserRole: UserRole;
  reportedAgainstUserId?: string;
  reportedAgainstUserName?: string;
  category: 
    | 'FOOD_SAFETY' 
    | 'INCORRECT_QUANTITY' 
    | 'DONOR_UNAVAILABLE' 
    | 'NGO_UNAVAILABLE' 
    | 'VOLUNTEER_NOSHOW' 
    | 'PICKUP_DELAYED' 
    | 'INCORRECT_INFO' 
    | 'OTHER';
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  adminResolutionNotes?: string;
  resolvedByAdminId?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface JoinApplication {
  id: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER';
  applicantName: string;
  email: string;
  phone: string;
  city: string;
  locality: string;
  address: string;
  organizationName?: string;
  orgType?: string;
  registrationNumber?: string;
  fssaiNumber?: string;
  capacityPerDay?: number;
  acceptedCategories?: FoodCategory[];
  vehicleType?: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'MINI_VAN' | 'ON_FOOT';
  operatingRadiusKm?: number;
  availabilityHours?: string;
  emergencyContact?: string;
  status: AccountState;
  adminNotes?: string;
  setupToken?: string;
  setupTokenExpiresAt?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'RESERVATION' | 'ASSIGNMENT' | 'PICKUP' | 'VERIFICATION' | 'INCIDENT' | 'FEEDBACK' | 'SYSTEM';
  createdAt: string;
}

export interface ModerationAuditLog {
  id: string;
  action: 
    | 'APPROVE_APPLICATION' 
    | 'REJECT_APPLICATION' 
    | 'REQUEST_INFO' 
    | 'SUSPEND_USER' 
    | 'REACTIVATE_USER' 
    | 'REMOVE_LISTING' 
    | 'RESOLVE_INCIDENT' 
    | 'CREATE_ADMIN' 
    | 'REVOKE_ADMIN' 
    | 'MANUAL_OVERRIDE';
  targetId: string;
  targetName: string;
  adminId: string;
  adminName: string;
  reason: string;
  timestamp: string;
}

export interface SmartMatchExplanation {
  hoursRemaining: number;
  distanceKm: number;
  urgencyLabel: string;
  proximityLabel: string;
  capacityMatchLabel: string;
  compatibilityLabel: string;
  isHighUrgency: boolean;
  score: number; // 0-100
}

export interface ScoredListing {
  listing: FoodListing;
  score: number;
  explanation: SmartMatchExplanation;
}

export interface PlatformOutcomeMetrics {
  recoveryRate: number; // percentage
  totalCreatedListings: number;
  totalCompletedPickups: number;
  totalActiveListings: number;
  totalExpiredListings: number;
  totalKgRecovered: number;
  financialValueRecovered: number;
  freeDonationMealsCount: number;
  socialSubsidizedMealsCount: number;
  averageRecoverySpeedHours: number;
  spoilageAvoidanceRate: number;
  estimatedMealsSaved: number;
  estimatedCo2AvoidedKg: number;
  activeDonorsCount: number;
  activeNgosCount: number;
  activeVolunteersCount: number;
  punctualityScoreAvg: number;
}
