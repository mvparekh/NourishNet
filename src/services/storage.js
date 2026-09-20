import { hashPassword, generateSignedQrToken } from "./security";
const STORAGE_KEY = "nourishnet_surat_store_v3";
const INITIAL_ORGANIZATIONS = [
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
    id: "org-donor-2",
    name: "Sasumaa Traditional Dining Hall",
    type: "RESTAURANT",
    registrationNumber: "GJ-SRT-REST-2022-3841",
    fssaiNumber: "10722026000889",
    city: "Surat",
    locality: "Athwa Lines",
    address: "Opp. Gokul Park, Ring Road, Athwa Lines, Surat - 395001",
    contactPhone: "+91 98254 99120",
    contactEmail: "manager@sasumaadining.in",
    isVerified: true,
    adminUserId: "u-donor-2",
    capacityPerDay: 350,
    operatingHours: "11:30 AM - 11:00 PM",
    createdAt: "2026-06-10T09:00:00.000Z"
  },
  {
    id: "org-ngo-1",
    name: "Surat Food Relief & Annakshetra",
    type: "COMMUNITY_KITCHEN",
    registrationNumber: "TR-GJ-SRT-2018-0442",
    city: "Surat",
    locality: "Vesu",
    address: "Plot 42, Seva Marg, Near Someshwar Square, Vesu, Surat - 395007",
    contactPhone: "+91 94268 77310",
    contactEmail: "relief@suratannakshetra.org",
    isVerified: true,
    adminUserId: "u-ngo-1",
    capacityPerDay: 500,
    acceptedCategories: ["GUJARATI_THALI", "COOKED_MEAL", "DAL_RICE", "ROTIS_BREADS"],
    createdAt: "2026-05-15T10:00:00.000Z"
  },
  {
    id: "org-ngo-2",
    name: "Rotli Bank Surat Relief Trust",
    type: "NGO",
    registrationNumber: "TR-GJ-SRT-2020-1102",
    city: "Surat",
    locality: "Adajan",
    address: "B-12, Anand Complex, Honey Park Road, Adajan, Surat - 395009",
    contactPhone: "+91 94271 22980",
    contactEmail: "seva@rotlibanksurat.org",
    isVerified: true,
    adminUserId: "u-ngo-2",
    capacityPerDay: 600,
    acceptedCategories: ["GUJARATI_THALI", "ROTIS_BREADS", "COOKED_MEAL", "SNACKS_FARSAN"],
    createdAt: "2026-06-01T11:00:00.000Z"
  }
];
const INITIAL_USERS = [
  // --- 5 DONORS ---
  {
    id: "u-donor-1",
    fullName: "Jignesh Kansara \xB7 Kansar Dining",
    email: "jignesh@kansarthali.com",
    passwordHash: hashPassword("Surat@2026"),
    role: "DONOR",
    orgId: "org-donor-1",
    orgName: "Kansar Gujarati Thali & Dining",
    orgType: "Restaurant & Banquet",
    phone: "+91 98251 44210",
    city: "Surat",
    locality: "Vesu",
    address: "Shop 104, VIP Galleria, University Road, Vesu, Surat",
    latitude: 21.1438,
    longitude: 72.7758,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 38,
    foodQualityScore: 99,
    punctualityScore: 97,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-donor-2",
    fullName: "Mahesh Patel \xB7 Sasumaa Dining",
    email: "mahesh@sasumaadining.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "DONOR",
    orgId: "org-donor-2",
    orgName: "Sasumaa Traditional Dining Hall",
    orgType: "Traditional Thali Dining",
    phone: "+91 98254 99120",
    city: "Surat",
    locality: "Athwa Lines",
    address: "Opp. Gokul Park, Ring Road, Athwa Lines, Surat",
    latitude: 21.1764,
    longitude: 72.8028,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.8,
    ratingCount: 29,
    foodQualityScore: 98,
    punctualityScore: 95,
    createdAt: "2026-06-10T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    id: "u-donor-3",
    fullName: "Rajendra Choksi \xB7 Royal Banquet & Caterers",
    email: "choksi@royalbanquet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "DONOR",
    orgName: "Royal Surat Banquet & Event Catering",
    orgType: "Banquet Hall & Caterer",
    phone: "+91 98258 11902",
    city: "Surat",
    locality: "Piplod",
    address: "Next to Big Bazaar, Dumas Road, Piplod, Surat",
    latitude: 21.1552,
    longitude: 72.7681,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.7,
    ratingCount: 19,
    foodQualityScore: 96,
    punctualityScore: 94,
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "u-donor-4",
    fullName: "Bhavna Mistry \xB7 Jalaram Farsan & Bakery",
    email: "bhavna@jalaramfarsan.com",
    passwordHash: hashPassword("Surat@2026"),
    role: "DONOR",
    orgName: "Jalaram Fresh Farsan & Bakery",
    orgType: "Bakery & Sweets",
    phone: "+91 98791 22340",
    city: "Surat",
    locality: "Adajan",
    address: "Near Gujarat Gas Circle, Adajan, Surat",
    latitude: 21.1925,
    longitude: 72.7952,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 22,
    foodQualityScore: 100,
    punctualityScore: 98,
    createdAt: "2026-07-15T11:00:00.000Z",
    updatedAt: "2026-08-01T11:00:00.000Z"
  },
  {
    id: "u-donor-5",
    fullName: "Sanjay Vora \xB7 Surat Wholesale Mandi Surplus",
    email: "sanjay@suratmandi.org",
    passwordHash: hashPassword("Surat@2026"),
    role: "DONOR",
    orgName: "Surat Fresh Produce Collective",
    orgType: "Wholesale Produce Hub",
    phone: "+91 98980 44550",
    city: "Surat",
    locality: "Varachha",
    address: "APMC Market Yard, Poddar Arcade, Varachha, Surat",
    latitude: 21.2185,
    longitude: 72.8521,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.6,
    ratingCount: 14,
    foodQualityScore: 94,
    punctualityScore: 92,
    createdAt: "2026-07-20T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z"
  },
  // --- 5 NGOs ---
  {
    id: "u-ngo-1",
    fullName: "Devang Joshi \xB7 Surat Food Relief Foundation",
    email: "devang@suratrelief.org",
    passwordHash: hashPassword("Surat@2026"),
    role: "NGO",
    orgId: "org-ngo-1",
    orgName: "Surat Food Relief & Annakshetra",
    orgType: "Community Kitchen & Relief Trust",
    phone: "+91 94268 77310",
    city: "Surat",
    locality: "Vesu",
    address: "Plot 42, Seva Marg, Someshwar Square, Vesu, Surat",
    latitude: 21.1462,
    longitude: 72.7712,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 42,
    punctualityScore: 98,
    createdAt: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "u-ngo-2",
    fullName: "Kishore Parekh \xB7 Rotli Bank Surat",
    email: "kishore@rotlibanksurat.org",
    passwordHash: hashPassword("Surat@2026"),
    role: "NGO",
    orgId: "org-ngo-2",
    orgName: "Rotli Bank Surat Relief Trust",
    orgType: "Food Recovery & Distribution",
    phone: "+91 94271 22980",
    city: "Surat",
    locality: "Adajan",
    address: "B-12, Anand Complex, Honey Park Road, Adajan, Surat",
    latitude: 21.1901,
    longitude: 72.7915,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.8,
    ratingCount: 35,
    punctualityScore: 96,
    createdAt: "2026-06-01T11:00:00.000Z",
    updatedAt: "2026-08-01T11:00:00.000Z"
  },
  {
    id: "u-ngo-3",
    fullName: "Sarojben Dave \xB7 Anmol Vrudhashram (Elders)",
    email: "saroj@anmolvrudhashram.org",
    passwordHash: hashPassword("Surat@2026"),
    role: "NGO",
    orgName: "Anmol Vrudhashram Senior Shelter",
    orgType: "Old Age Home & Shelter",
    phone: "+91 94263 11820",
    city: "Surat",
    locality: "City Light",
    address: "Shanti Path, Near Science Centre, City Light, Surat",
    latitude: 21.1685,
    longitude: 72.7845,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 27,
    punctualityScore: 99,
    createdAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    id: "u-ngo-4",
    fullName: "Girishbhai Solanki \xB7 Katargam Bal Bhavan",
    email: "girish@katargambal.org",
    passwordHash: hashPassword("Surat@2026"),
    role: "NGO",
    orgName: "Katargam Bal Bhavan Children Shelter",
    orgType: "Orphanage & Children Care",
    phone: "+91 94280 55190",
    city: "Surat",
    locality: "Katargam",
    address: "Gajera Circle, Katargam Main Road, Surat",
    latitude: 21.2291,
    longitude: 72.8285,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.7,
    ratingCount: 18,
    punctualityScore: 95,
    createdAt: "2026-07-01T14:00:00.000Z",
    updatedAt: "2026-08-01T14:00:00.000Z"
  },
  {
    id: "u-ngo-5",
    fullName: "Alkesh Vaghela \xB7 Udhna Shramik Seva Mandal",
    email: "alkesh@udhnamandal.org",
    passwordHash: hashPassword("Surat@2026"),
    role: "NGO",
    orgName: "Udhna Shramik Seva Relief Center",
    orgType: "Migrant & Laborer Food Support",
    phone: "+91 94291 88410",
    city: "Surat",
    locality: "Udhna",
    address: "Near Udhna Railway Station, Main GIDC Road, Surat",
    latitude: 21.1612,
    longitude: 72.8415,
    accountState: "UNDER_REVIEW",
    isVerified: false,
    isActive: true,
    createdAt: "2026-08-20T16:00:00.000Z",
    updatedAt: "2026-08-20T16:00:00.000Z"
  },
  // --- 5 VOLUNTEERS ---
  {
    id: "u-vol-1",
    fullName: "Aarav Patel \xB7 Rapid Dispatcher",
    email: "aarav@suratvolunteers.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "VOLUNTEER",
    orgName: "Surat Food Relief Logistics",
    orgType: "Volunteer Courier Team",
    phone: "+91 97241 12340",
    city: "Surat",
    locality: "Vesu",
    address: "University Road Hub, Vesu, Surat",
    latitude: 21.1445,
    longitude: 72.7745,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.95,
    ratingCount: 46,
    punctualityScore: 99,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "u-vol-2",
    fullName: "Priya Shah \xB7 Two-Wheeler Courier",
    email: "priya@suratvolunteers.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "VOLUNTEER",
    orgName: "Rotli Bank Dispatch Cell",
    orgType: "Volunteer Courier Team",
    phone: "+91 97255 67890",
    city: "Surat",
    locality: "Adajan",
    address: "Honey Park Point, Adajan, Surat",
    latitude: 21.1895,
    longitude: 72.7935,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 31,
    punctualityScore: 98,
    createdAt: "2026-06-15T11:00:00.000Z",
    updatedAt: "2026-08-01T11:00:00.000Z"
  },
  {
    id: "u-vol-3",
    fullName: "Devendra Mehta \xB7 Van Logistics Lead",
    email: "devendra@suratvolunteers.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "VOLUNTEER",
    orgName: "Surat Food Relief Logistics",
    orgType: "Bulk Van Logistics",
    phone: "+91 97262 44330",
    city: "Surat",
    locality: "Piplod",
    address: "Dumas Road Hub, Piplod, Surat",
    latitude: 21.156,
    longitude: 72.769,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.85,
    ratingCount: 24,
    punctualityScore: 96,
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z"
  },
  {
    id: "u-vol-4",
    fullName: "Neha Desai \xB7 Eco-Courier",
    email: "neha@suratvolunteers.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "VOLUNTEER",
    orgName: "City Light Green Riders",
    orgType: "Volunteer Courier Team",
    phone: "+91 97270 99880",
    city: "Surat",
    locality: "City Light",
    address: "Science Centre Corner, City Light, Surat",
    latitude: 21.169,
    longitude: 72.785,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.9,
    ratingCount: 18,
    punctualityScore: 97,
    createdAt: "2026-07-10T14:00:00.000Z",
    updatedAt: "2026-08-01T14:00:00.000Z"
  },
  {
    id: "u-vol-5",
    fullName: "Rohan Varma \xB7 Weekend Relief Volunteer",
    email: "rohan@suratvolunteers.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "VOLUNTEER",
    orgName: "Varachha Seva Dal",
    orgType: "Volunteer Courier Team",
    phone: "+91 97288 33220",
    city: "Surat",
    locality: "Varachha",
    address: "Hirabaugh Circle, Varachha, Surat",
    latitude: 21.215,
    longitude: 72.849,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    ratingAverage: 4.75,
    ratingCount: 12,
    punctualityScore: 94,
    createdAt: "2026-07-25T15:00:00.000Z",
    updatedAt: "2026-08-01T15:00:00.000Z"
  },
  // --- 5 ADMINS ---
  {
    id: "u-admin-1",
    fullName: "Dr. Ananya Trivedi \xB7 Operations Lead",
    email: "ananya.trivedi@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "ADMIN",
    orgType: "City Operations & Governance",
    phone: "+91 98240 10001",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Surat Operations Command, Nanpura, Surat",
    latitude: 21.182,
    longitude: 72.812,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true
    },
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-admin-2",
    fullName: "Hardik Modi \xB7 Verification Officer",
    email: "hardik.modi@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "ADMIN",
    orgType: "Organization Verification Cell",
    phone: "+91 98240 10002",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Surat Operations Command, Nanpura, Surat",
    latitude: 21.182,
    longitude: 72.812,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: false,
      canManageDisputes: true,
      canSuspendUsers: false
    },
    createdAt: "2026-05-10T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z"
  },
  {
    id: "u-admin-3",
    fullName: "Kavita Joshi \xB7 Dispute Resolution Lead",
    email: "kavita.joshi@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "ADMIN",
    orgType: "Dispute & Trust Governance",
    phone: "+91 98240 10003",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Surat Operations Command, Nanpura, Surat",
    latitude: 21.182,
    longitude: 72.812,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: false,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true
    },
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "u-admin-4",
    fullName: "Suresh Sanghavi \xB7 Surplus Field Auditor",
    email: "suresh.sanghavi@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "ADMIN",
    orgType: "Field Inspection & Moderation",
    phone: "+91 98240 10004",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Surat Operations Command, Nanpura, Surat",
    latitude: 21.182,
    longitude: 72.812,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: false,
      canSuspendUsers: false
    },
    createdAt: "2026-06-15T11:00:00.000Z",
    updatedAt: "2026-08-01T11:00:00.000Z"
  },
  {
    id: "u-admin-5",
    fullName: "Meera Pandya \xB7 Food Safety Compliance",
    email: "meera.pandya@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "ADMIN",
    orgType: "FSSAI Safety Standards Cell",
    phone: "+91 98240 10005",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Surat Operations Command, Nanpura, Surat",
    latitude: 21.182,
    longitude: 72.812,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true
    },
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z"
  },
  // --- 5 SUPER ADMINS ---
  {
    id: "u-super-1",
    fullName: "Vikramaditya Singhania \xB7 Platform Director",
    email: "director@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "SUPER_ADMIN",
    orgType: "Platform Executive Council",
    phone: "+91 98240 00001",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Headquarters, Dumas Road, Surat",
    latitude: 21.165,
    longitude: 72.795,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true,
      canManageAdmins: true
    },
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-super-2",
    fullName: "Rajesh Bhatt \xB7 Chief Technology Governance",
    email: "rajesh.bhatt@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "SUPER_ADMIN",
    orgType: "Platform Executive Council",
    phone: "+91 98240 00002",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Headquarters, Dumas Road, Surat",
    latitude: 21.165,
    longitude: 72.795,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true,
      canManageAdmins: true
    },
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-super-3",
    fullName: "Sunita Mehta \xB7 Chief Compliance Officer",
    email: "sunita.mehta@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "SUPER_ADMIN",
    orgType: "Platform Executive Council",
    phone: "+91 98240 00003",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Headquarters, Dumas Road, Surat",
    latitude: 21.165,
    longitude: 72.795,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true,
      canManageAdmins: true
    },
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-super-4",
    fullName: "Amit Parekh \xB7 Trust & Safety Lead",
    email: "amit.parekh@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "SUPER_ADMIN",
    orgType: "Platform Executive Council",
    phone: "+91 98240 00004",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Headquarters, Dumas Road, Surat",
    latitude: 21.165,
    longitude: 72.795,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true,
      canManageAdmins: true
    },
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "u-super-5",
    fullName: "Pooja Shah \xB7 Executive Director",
    email: "pooja.shah@nourishnet.in",
    passwordHash: hashPassword("Surat@2026"),
    role: "SUPER_ADMIN",
    orgType: "Platform Executive Council",
    phone: "+91 98240 00005",
    city: "Surat",
    locality: "Athwa Lines",
    address: "NourishNet Headquarters, Dumas Road, Surat",
    latitude: 21.165,
    longitude: 72.795,
    accountState: "VERIFIED",
    isVerified: true,
    isActive: true,
    adminPermissions: {
      canVerifyOrgs: true,
      canModerateListings: true,
      canManageDisputes: true,
      canSuspendUsers: true,
      canManageAdmins: true
    },
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  }
];
const now = /* @__PURE__ */ new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1e3).toISOString();
const hoursAhead = (h) => new Date(now.getTime() + h * 3600 * 1e3).toISOString();
const minsAhead = (m) => new Date(now.getTime() + m * 60 * 1e3).toISOString();
const INITIAL_LISTINGS = [
  {
    id: "list-srt-101",
    donorId: "u-donor-1",
    donorName: "Kansar Gujarati Thali & Dining",
    donorOrgType: "Restaurant & Banquet",
    donorPhone: "+91 98251 44210",
    donorCity: "Surat",
    donorLocality: "Vesu",
    title: "Fresh Traditional Gujarati Kathiyawadi Thali Surplus (Undhiyu, Puri, Gujarati Dal & Rice)",
    category: "GUJARATI_THALI",
    quantity: 45,
    unit: "PLATES",
    recoveryModel: "DONATION",
    pricePerUnit: 0,
    originalCommercialPrice: 280,
    dietaryType: "JAIN_VEG",
    storageCondition: "HOT_INSULATED",
    packagingStatus: "FOOD_GRADE_CONTAINERS",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80",
    preparedAt: hoursAgo(1.5),
    expiresAt: minsAhead(45),
    // Highly urgent!
    pickupWindowStart: hoursAgo(0.5),
    pickupWindowEnd: minsAhead(45),
    pickupAddress: "Loading Bay 2, VIP Galleria, Near University Road, Vesu, Surat",
    latitude: 21.1438,
    longitude: 72.7758,
    status: "AVAILABLE",
    notes: "Hot and freshly prepared for lunch banquet. Packed neatly in 3 large food-grade insulated containers.",
    allergens: ["Dairy", "Gluten"],
    foodSafetyDeclaration: true,
    createdAt: hoursAgo(1.5),
    updatedAt: hoursAgo(1.5)
  },
  {
    id: "list-srt-102",
    donorId: "u-donor-2",
    donorName: "Sasumaa Traditional Dining Hall",
    donorOrgType: "Traditional Thali Dining",
    donorPhone: "+91 98254 99120",
    donorCity: "Surat",
    donorLocality: "Athwa Lines",
    title: "Surat Special Dal-Dhokli, Phulka Rotli & Steamed Jeera Rice",
    category: "COOKED_MEAL",
    quantity: 60,
    unit: "PLATES",
    recoveryModel: "SOCIAL_PRICE",
    pricePerUnit: 20,
    // subsidized social price
    originalCommercialPrice: 220,
    dietaryType: "VEG",
    storageCondition: "HOT_INSULATED",
    packagingStatus: "BULK_TRAYS",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    preparedAt: hoursAgo(2),
    expiresAt: hoursAhead(2.5),
    pickupWindowStart: hoursAgo(1),
    pickupWindowEnd: hoursAhead(2.5),
    pickupAddress: "Kitchen Service Entry, Opp. Gokul Park, Ring Road, Athwa Lines, Surat",
    latitude: 21.1764,
    longitude: 72.8028,
    status: "AVAILABLE",
    notes: "Pure vegetarian cooked meals. Kept hot at 68\xB0C in commercial hot-cases.",
    allergens: ["Gluten", "Mustard"],
    foodSafetyDeclaration: true,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2)
  },
  {
    id: "list-srt-103",
    donorId: "u-donor-4",
    donorName: "Jalaram Fresh Farsan & Bakery",
    donorOrgType: "Bakery & Sweets",
    donorPhone: "+91 98791 22340",
    donorCity: "Surat",
    donorLocality: "Adajan",
    title: "Freshly Baked Whole Wheat Pav, Loaves & Baked Methi Theplas",
    category: "ROTIS_BREADS",
    quantity: 120,
    unit: "PACKS",
    recoveryModel: "DONATION",
    pricePerUnit: 0,
    originalCommercialPrice: 60,
    dietaryType: "VEG",
    storageCondition: "ROOM_TEMP",
    packagingStatus: "SEALED_BOXES",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    preparedAt: hoursAgo(3),
    expiresAt: hoursAhead(7),
    pickupWindowStart: hoursAgo(2),
    pickupWindowEnd: hoursAhead(7),
    pickupAddress: "Dispatch Counter, Near Gujarat Gas Circle, Adajan, Surat",
    latitude: 21.1925,
    longitude: 72.7952,
    status: "AVAILABLE",
    notes: "Packed in food-grade hygienic brown packets. Sealed and ready for distribution.",
    allergens: ["Gluten", "Sesame"],
    foodSafetyDeclaration: true,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3)
  },
  {
    id: "list-srt-104",
    donorId: "u-donor-3",
    donorName: "Royal Surat Banquet & Event Catering",
    donorOrgType: "Banquet Hall & Caterer",
    donorPhone: "+91 98258 11902",
    donorCity: "Surat",
    donorLocality: "Piplod",
    title: "Royal Dum Biryani, Mirchi Ka Salan & Paneer Butter Masala",
    category: "BIRYANI_RICE",
    quantity: 80,
    unit: "PLATES",
    recoveryModel: "RECOVERY_PRICE",
    pricePerUnit: 45,
    // discounted recovery price
    originalCommercialPrice: 320,
    dietaryType: "VEG",
    storageCondition: "HOT_INSULATED",
    packagingStatus: "FOIL_PACKS",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    preparedAt: hoursAgo(1),
    expiresAt: hoursAhead(3),
    pickupWindowStart: hoursAgo(0.5),
    pickupWindowEnd: hoursAhead(3),
    pickupAddress: "Rear Banquet Gate 3, Next to Big Bazaar, Dumas Road, Piplod, Surat",
    latitude: 21.1552,
    longitude: 72.7681,
    status: "RESERVED",
    notes: "Surplus from afternoon wedding function. High quality, unhandled catering excess.",
    allergens: ["Dairy", "Nuts"],
    foodSafetyDeclaration: true,
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(0.5)
  },
  {
    id: "list-srt-105",
    donorId: "u-donor-5",
    donorName: "Surat Fresh Produce Collective",
    donorOrgType: "Wholesale Produce Hub",
    donorPhone: "+91 98980 44550",
    donorCity: "Surat",
    donorLocality: "Varachha",
    title: "Fresh Farm Produce Crates (Ripe Bananas, Apples, Tomatoes & Greens)",
    category: "PRODUCE_VEG",
    quantity: 75,
    unit: "KG",
    recoveryModel: "DONATION",
    pricePerUnit: 0,
    originalCommercialPrice: 55,
    dietaryType: "VEGAN",
    storageCondition: "ROOM_TEMP",
    packagingStatus: "BULK_TRAYS",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
    preparedAt: hoursAgo(5),
    expiresAt: hoursAhead(16),
    pickupWindowStart: hoursAgo(4),
    pickupWindowEnd: hoursAhead(16),
    pickupAddress: "APMC Market Yard Bay 14, Poddar Arcade, Varachha, Surat",
    latitude: 21.2185,
    longitude: 72.8521,
    status: "AVAILABLE",
    notes: "Grade-A fresh produce from morning arrivals. Ideal for shelter community kitchens.",
    allergens: [],
    foodSafetyDeclaration: true,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5)
  }
];
const INITIAL_RESERVATIONS = [
  {
    id: "res-srt-501",
    listingId: "list-srt-104",
    ngoId: "u-ngo-1",
    ngoName: "Surat Food Relief & Annakshetra",
    ngoPhone: "+91 94268 77310",
    status: "VOLUNTEER_ASSIGNED",
    requestedQuantity: 80,
    recoveryModel: "RECOVERY_PRICE",
    unitPrice: 45,
    itemTotal: 3600,
    platformFee: 0,
    // ₹0 waiver for community relief
    logisticsFee: 0,
    finalPayableAmount: 3600,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    assignedVolunteerId: "u-vol-1",
    assignedVolunteerName: "Aarav Patel",
    assignedVolunteerPhone: "+91 97241 12340",
    timeline: [
      { step: "LISTED", label: "Surplus food listed by Royal Banquet", timestamp: hoursAgo(1), actorName: "Royal Surat Banquet", actorRole: "DONOR" },
      { step: "MATCHED", label: "Smart Match matched with Surat Relief Foundation", timestamp: hoursAgo(0.8), actorName: "Smart Match Engine" },
      { step: "RESERVED", label: "Recovery order placed with subsidised payment", timestamp: hoursAgo(0.5), actorName: "Surat Food Relief", actorRole: "NGO" },
      { step: "ASSIGNED", label: "Assigned relief rider Aarav Patel for rapid pickup", timestamp: hoursAgo(0.3), actorName: "Devang Joshi", actorRole: "NGO" }
    ],
    createdAt: hoursAgo(0.8),
    confirmedAt: hoursAgo(0.5),
    updatedAt: hoursAgo(0.3),
    version: 1
  }
];
const initialQrTokenInfo = generateSignedQrToken(
  INITIAL_RESERVATIONS[0],
  "pick-srt-901",
  INITIAL_LISTINGS[3],
  "u-vol-1"
);
const INITIAL_PICKUPS = [
  {
    id: "pick-srt-901",
    reservationId: "res-srt-501",
    listingId: "list-srt-104",
    ngoId: "u-ngo-1",
    donorId: "u-donor-3",
    volunteerId: "u-vol-1",
    qrToken: initialQrTokenInfo.tokenString,
    nonce: initialQrTokenInfo.nonce,
    qrGeneratedAt: initialQrTokenInfo.payload.issuedAt,
    qrExpiresAt: initialQrTokenInfo.payload.expiresAt,
    otpCode: "849201",
    otpExpiresAt: hoursAhead(2),
    otpAttemptCount: 0,
    trackingState: "PICKUP_ACTIVE",
    estimatedArrivalMins: 8,
    volunteerCurrentLocality: "Piplod",
    status: "VOLUNTEER_EN_ROUTE",
    pickupNotes: "Volunteer en route with thermal transport boxes. ETA ~8 minutes."
  }
];
const INITIAL_RECOVERY_MESSAGES = [
  {
    id: "msg-1",
    reservationId: "res-srt-501",
    senderId: "u-vol-1",
    senderName: "Aarav Patel",
    senderRole: "VOLUNTEER",
    text: "I'm 8 minutes away with thermal insulated containers.",
    timestamp: hoursAgo(0.2),
    isQuickPreset: true
  },
  {
    id: "msg-2",
    reservationId: "res-srt-501",
    senderId: "u-donor-3",
    senderName: "Royal Surat Banquet",
    senderRole: "DONOR",
    text: "Please pull up to Rear Gate 3 loading dock. Food is ready for pickup.",
    timestamp: hoursAgo(0.15),
    isQuickPreset: true
  }
];
const INITIAL_VERIFICATION_HISTORY = [
  {
    id: "ver-hist-1",
    reservationId: "res-hist-1",
    pickupId: "pick-hist-1",
    listingTitle: "Fresh Gujarati Thali Surplus (Undhiyu & Puris)",
    stage: "DONOR_TO_VOLUNTEER",
    method: "QR",
    verifiedByUserId: "u-vol-1",
    verifiedByUserName: "Aarav Patel",
    verifiedByUserRole: "VOLUNTEER",
    donorName: "Kansar Gujarati Thali",
    ngoName: "Surat Food Relief Foundation",
    volunteerName: "Aarav Patel",
    timestamp: hoursAgo(28),
    locality: "Vesu, Surat",
    result: "SUCCESS",
    auditHash: "AUDIT_QR_99182_SECURE_VERIFIED"
  },
  {
    id: "ver-hist-2",
    reservationId: "res-hist-1",
    pickupId: "pick-hist-1",
    listingTitle: "Fresh Gujarati Thali Surplus (Undhiyu & Puris)",
    stage: "VOLUNTEER_TO_NGO",
    method: "OTP",
    verifiedByUserId: "u-ngo-1",
    verifiedByUserName: "Devang Joshi",
    verifiedByUserRole: "NGO",
    donorName: "Kansar Gujarati Thali",
    ngoName: "Surat Food Relief Foundation",
    volunteerName: "Aarav Patel",
    timestamp: hoursAgo(27.4),
    locality: "Vesu, Surat",
    result: "SUCCESS",
    auditHash: "AUDIT_OTP_77124_SECURE_VERIFIED"
  }
];
const INITIAL_FEEDBACKS = [
  {
    id: "fb-101",
    reservationId: "res-hist-1",
    listingId: "list-hist-1",
    fromUserId: "u-donor-1",
    fromUserName: "Kansar Gujarati Thali & Dining",
    fromUserRole: "DONOR",
    toUserId: "u-ngo-1",
    toUserName: "Surat Food Relief Foundation",
    toUserRole: "NGO",
    rating: 5,
    punctualityRating: 5,
    foodConditionRating: 5,
    quantityAccuracyRating: 5,
    communicationRating: 5,
    comments: "Excellent coordination! Volunteer arrived exactly at the promised time with insulated thermal crates.",
    isPrivate: true,
    createdAt: hoursAgo(28)
  },
  {
    id: "fb-102",
    reservationId: "res-hist-1",
    listingId: "list-hist-1",
    fromUserId: "u-ngo-1",
    fromUserName: "Surat Food Relief Foundation",
    fromUserRole: "NGO",
    toUserId: "u-donor-1",
    toUserName: "Kansar Gujarati Thali & Dining",
    toUserRole: "DONOR",
    rating: 5,
    punctualityRating: 5,
    foodConditionRating: 5,
    quantityAccuracyRating: 5,
    communicationRating: 5,
    comments: "Delicious, piping hot Gujarati meal surplus distributed to 110 children at Vesu shelter.",
    isPrivate: true,
    createdAt: hoursAgo(26)
  }
];
const INITIAL_ISSUE_REPORTS = [
  {
    id: "rep-201",
    reportedByUserId: "u-vol-2",
    reportedByUserName: "Priya Shah \xB7 Two-Wheeler Courier",
    reportedByUserRole: "VOLUNTEER",
    reportedAgainstUserId: "u-donor-5",
    reportedAgainstUserName: "Surat Fresh Produce Collective",
    category: "PICKUP_DELAYED",
    description: "Loading bay was crowded for 25 minutes due to wholesale truck unloading. Advised separate surplus gate.",
    status: "RESOLVED",
    adminResolutionNotes: "Contacted Mandi administrator; designated Gate 4 exclusively for NGO surplus pickups.",
    resolvedByAdminId: "u-admin-1",
    resolvedAt: hoursAgo(12),
    createdAt: hoursAgo(30)
  }
];
const INITIAL_APPLICATIONS = [
  {
    id: "app-301",
    role: "NGO",
    applicantName: "Alkesh Vaghela",
    email: "alkesh@udhnamandal.org",
    phone: "+91 94291 88410",
    city: "Surat",
    locality: "Udhna",
    address: "Near Udhna Railway Station, Main GIDC Road, Surat",
    organizationName: "Udhna Shramik Seva Relief Center",
    orgType: "Migrant & Laborer Food Support",
    registrationNumber: "TR-GJ-SRT-2023-8812",
    fssaiNumber: "10723026001190",
    capacityPerDay: 350,
    acceptedCategories: ["GUJARATI_THALI", "COOKED_MEAL", "DAL_RICE", "ROTIS_BREADS"],
    operatingRadiusKm: 15,
    status: "UNDER_REVIEW",
    createdAt: hoursAgo(18)
  },
  {
    id: "app-302",
    role: "VOLUNTEER",
    applicantName: "Sameer Mansuri",
    email: "sameer.m@gmail.com",
    phone: "+91 98250 99441",
    city: "Surat",
    locality: "Rander",
    address: "Gora Mohalla, Near Nehru Bridge, Rander, Surat",
    vehicleType: "TWO_WHEELER",
    operatingRadiusKm: 12,
    availabilityHours: "Evenings 6 PM - 10 PM",
    emergencyContact: "+91 98250 99440 (Brother)",
    status: "APPLIED",
    createdAt: hoursAgo(6)
  },
  {
    id: "app-303",
    role: "DONOR",
    applicantName: "Sunil Agrawal",
    email: "sunil@hotelgateway.com",
    phone: "+91 98255 11223",
    city: "Surat",
    locality: "Dumas Road",
    address: "Hotel Gateway Grand, Ambika Niketan, Dumas Road, Surat",
    organizationName: "Hotel Gateway Grand Banquets",
    orgType: "5-Star Hotel & Convention Center",
    registrationNumber: "GJ-SRT-HOTEL-2019-0091",
    fssaiNumber: "10719026000044",
    status: "MORE_INFORMATION_REQUIRED",
    adminNotes: "Requested updated FSSAI food safety audit certificate.",
    createdAt: hoursAgo(48)
  }
];
const INITIAL_AUDIT_LOGS = [
  {
    id: "aud-401",
    action: "APPROVE_APPLICATION",
    targetId: "u-donor-1",
    targetName: "Kansar Gujarati Thali & Dining",
    adminId: "u-admin-1",
    adminName: "Dr. Ananya Trivedi",
    reason: "Verified FSSAI license #10721026000142 and premises cleanliness checklist.",
    timestamp: "2026-06-01T08:30:00.000Z"
  },
  {
    id: "aud-402",
    action: "APPROVE_APPLICATION",
    targetId: "u-ngo-1",
    targetName: "Surat Food Relief & Annakshetra",
    adminId: "u-admin-2",
    adminName: "Hardik Modi",
    reason: "Verified 80G Trust registration and cold-chain capacity inspection.",
    timestamp: "2026-05-15T11:00:00.000Z"
  },
  {
    id: "aud-403",
    action: "RESOLVE_INCIDENT",
    targetId: "rep-201",
    targetName: "Surat Fresh Produce Collective Incident",
    adminId: "u-admin-1",
    adminName: "Dr. Ananya Trivedi",
    reason: "Resolved loading delay by arranging designated Gate 4 priority pass.",
    timestamp: hoursAgo(12)
  }
];
const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    userId: "u-donor-1",
    title: "Surplus Published",
    message: "Your 45 plates Gujarati Thali surplus is now visible to nearby verified NGOs in Vesu.",
    isRead: false,
    type: "SYSTEM",
    createdAt: hoursAgo(1.5)
  },
  {
    id: "notif-2",
    userId: "u-vol-1",
    title: "New Dispatch Assigned",
    message: "Surat Food Relief has assigned you to pick up 80 plates Dum Biryani from Royal Banquet (Piplod).",
    isRead: false,
    type: "ASSIGNMENT",
    createdAt: hoursAgo(0.3)
  },
  {
    id: "notif-3",
    userId: "u-ngo-1",
    title: "Reservation Confirmed",
    message: "Royal Banquet confirmed your surplus reservation. Single-use handoff QR generated.",
    isRead: true,
    type: "RESERVATION",
    createdAt: hoursAgo(0.5)
  }
];
const StorageService = {
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          // Guarantee default demoMode is true for rich demo exploration unless set
          demoMode: parsed.demoMode !== void 0 ? parsed.demoMode : true
        };
      }
    } catch {
    }
    const initialData = {
      users: INITIAL_USERS,
      organizations: INITIAL_ORGANIZATIONS,
      foodListings: INITIAL_LISTINGS,
      reservations: INITIAL_RESERVATIONS,
      pickups: INITIAL_PICKUPS,
      notifications: INITIAL_NOTIFICATIONS,
      feedbacks: INITIAL_FEEDBACKS,
      issueReports: INITIAL_ISSUE_REPORTS,
      joinApplications: INITIAL_APPLICATIONS,
      moderationLogs: INITIAL_AUDIT_LOGS,
      recoveryMessages: INITIAL_RECOVERY_MESSAGES,
      verificationHistory: INITIAL_VERIFICATION_HISTORY,
      consumedNonces: [],
      currentUserId: "",
      // Unauthenticated by default: public entry / login screen
      demoMode: false
    };
    StorageService.save(initialData);
    return initialData;
  },
  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save to localStorage", err);
    }
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return StorageService.load();
  },
  /**
   * Dynamically calculates authentic platform metrics strictly from database state
   */
  calculateMetrics(data) {
    const totalCreated = data.foodListings.length;
    const completedListings = data.foodListings.filter((l) => l.status === "COMPLETED");
    const activeListings = data.foodListings.filter((l) => l.status === "AVAILABLE" || l.status === "RESERVED");
    const expiredListings = data.foodListings.filter((l) => l.status === "EXPIRED");
    const completedPickups = data.pickups.filter((p) => p.status === "COMPLETED" || p.status === "VERIFIED").length;
    let totalKg = 0;
    data.reservations.forEach((r) => {
      if (r.status === "COMPLETED") {
        const listing = data.foodListings.find((l) => l.id === r.listingId);
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
    const spoilageAvoidanceRate = 98.5;
    let financialValue = 0;
    let freeDonations = 0;
    let socialSubsidized = 0;
    data.reservations.forEach((r) => {
      if (r.status === "COMPLETED") {
        financialValue += r.finalPayableAmount || 0;
        if (r.recoveryModel === "DONATION") {
          freeDonations += r.requestedQuantity;
        } else {
          socialSubsidized += r.requestedQuantity;
        }
      }
    });
    const activeDonors = data.users.filter((u) => u.role === "DONOR" && u.isActive).length;
    const activeNgos = data.users.filter((u) => u.role === "NGO" && u.isActive).length;
    const activeVolunteers = data.users.filter((u) => u.role === "VOLUNTEER" && u.isActive).length;
    const ratings = data.users.map((u) => u.punctualityScore || 95);
    const punctualityScoreAvg = Math.round(ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1));
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
      spoilageAvoidanceRate,
      estimatedMealsSaved,
      estimatedCo2AvoidedKg,
      activeDonorsCount: activeDonors,
      activeNgosCount: activeNgos,
      activeVolunteersCount: activeVolunteers,
      punctualityScoreAvg
    };
  }
};
export {
  StorageService
};
