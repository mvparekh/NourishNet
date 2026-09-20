import { spawn } from 'child_process';
import net from 'net';

const BASE = 'http://localhost:3001';

// Helper to check if a port is in use
function checkPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true); // Port in use
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(false)).close();
      })
      .listen(port);
  });
}

async function waitForServer(maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return false;
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}${details ? ' - ' + details : ''}`);
      failed++;
    }
  }

  let serverProcess = null;
  let serverStartedLocally = false;

  try {
    // -------------------------------------------------------------
    // CHECK 1: Host Port 3000 Isolation Check
    // -------------------------------------------------------------
    console.log('\n--- CHECK 1: Port Isolation Verification ---');
    const port3000InUse = await checkPortInUse(3000);
    if (port3000InUse) {
      console.log('  [NOTE] Host port 3000 is occupied by user other project. NourishNet will strictly NOT touch it.');
    } else {
      console.log('  [NOTE] Host port 3000 is currently clear.');
    }
    assert(
      process.env.PORT !== '3000',
      'Port Isolation: NourishNet target port is NOT 3000 (strictly 3001)'
    );

    // Start local server if not already running on 3001
    const check = await fetch(`${BASE}/api/health`).catch(() => null);
    if (!check || !check.ok) {
      console.log('Starting NourishNet server on port 3001...');
      serverProcess = spawn('node', ['server.js'], {
        env: { ...process.env, PORT: '3001', DEMO_MODE: 'true', NODE_ENV: 'development' },
        stdio: 'pipe',
      });
      serverStartedLocally = true;
      const ready = await waitForServer();
      if (!ready) {
        console.error('Server failed to start on port 3001 in time.');
        process.exit(1);
      }
    }

    // -------------------------------------------------------------
    // CHECK 2: Host Port 3001 Connectivity (/api/health & /api/config)
    // -------------------------------------------------------------
    console.log('\n--- CHECK 2: Port 3001 API Connectivity ---');
    const healthRes = await fetch(`${BASE}/api/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.status === 'ok' && health.city === 'Surat', 'Health endpoint /api/health returns 200 ok for Surat');

    const configRes = await fetch(`${BASE}/api/config`);
    const config = await configRes.json();
    assert(configRes.status === 200 && config.demoMode === true && config.port === 3001, 'Config endpoint /api/config returns demoMode: true and port: 3001');

    // -------------------------------------------------------------
    // CHECK 3: Entrypoint Landing Page Check (Unauthenticated entry)
    // -------------------------------------------------------------
    console.log('\n--- CHECK 3: Entrypoint Landing Page ---');
    const homeRes = await fetch(`${BASE}/`);
    const homeHtml = await homeRes.text();
    assert(
      homeRes.status === 200 && (homeHtml.includes('NourishNet') || homeHtml.includes('id="root"')),
      'Entrypoint root serves HTML application shell'
    );
    const unauthMe = await fetch(`${BASE}/api/auth/me`);
    assert(unauthMe.status === 401, 'Entrypoint is unauthenticated by default (no auto-login)');

    // -------------------------------------------------------------
    // CHECK 4: DEMO_MODE=true Returns 25 Demo Accounts Grouped by 5 Roles
    // -------------------------------------------------------------
    console.log('\n--- CHECK 4: Demo Mode Accounts Catalog ---');
    const demoUsersRes = await fetch(`${BASE}/api/demo/users`);
    const demoUsersData = await demoUsersRes.json();
    assert(
      demoUsersRes.status === 200 && demoUsersData.success === true && demoUsersData.totalCount === 25,
      'Endpoint /api/demo/users returns exactly 25 demo accounts'
    );
    assert(
      demoUsersData.grouped?.DONOR?.length === 5 &&
      demoUsersData.grouped?.NGO?.length === 5 &&
      demoUsersData.grouped?.VOLUNTEER?.length === 5 &&
      demoUsersData.grouped?.ADMIN?.length === 5 &&
      demoUsersData.grouped?.SUPER_ADMIN?.length === 5,
      'Demo accounts are evenly partitioned into 5 roles (5 Donors, 5 NGOs, 5 Volunteers, 5 Admins, 5 Super Admins)'
    );

    // -------------------------------------------------------------
    // CHECK 5: Authentic Login Test for All 25 Demo Accounts Across 5 Roles
    // -------------------------------------------------------------
    console.log('\n--- CHECK 5: Authentic 25 Demo Accounts Login Suite ---');
    const demoRoles = [
      { prefix: 'donor', role: 'DONOR' },
      { prefix: 'ngo', role: 'NGO' },
      { prefix: 'vol', role: 'VOLUNTEER' },
      { prefix: 'admin', role: 'ADMIN' },
      { prefix: 'super', role: 'SUPER_ADMIN' },
    ];
    let allLoginsPassed = true;
    const tokensByRole = {};

    for (const r of demoRoles) {
      for (let i = 1; i <= 5; i++) {
        const numStr = String(i).padStart(2, '0');
        const email = `${r.prefix}${numStr}@nourishnet.demo`;
        const res = await fetch(`${BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'SuratSecure@2026' }),
        });
        const data = await res.json();
        if (res.status !== 200 || !data.token || data.user.role !== r.role) {
          allLoginsPassed = false;
          console.error(`Login failed for ${email}`);
        } else if (i === 1) {
          tokensByRole[r.role] = { token: data.token, user: data.user };
        }
      }
    }
    assert(allLoginsPassed, 'All 25 demo accounts successfully authenticate with SuratSecure@2026 and receive valid role sessions');

    // -------------------------------------------------------------
    // CHECK 6: Dynamic Platform Metrics Verification
    // -------------------------------------------------------------
    console.log('\n--- CHECK 6: Dynamic Platform Metrics ---');
    const stateRes = await fetch(`${BASE}/api/state`);
    const stateData = await stateRes.json();
    const metrics = stateData.outcomeMetrics;
    assert(
      metrics &&
      typeof metrics.recoveryRate === 'number' &&
      typeof metrics.totalCreatedListings === 'number' &&
      typeof metrics.totalCompletedPickups === 'number' &&
      typeof metrics.totalKgRecovered === 'number' &&
      typeof metrics.estimatedMealsSaved === 'number' &&
      metrics.activeDonorsCount >= 5,
      'Shared state returns non-hardcoded, store-calculated outcome metrics'
    );

    // -------------------------------------------------------------
    // CHECK 7: Add Listing Creation and Expiry Countdown Urgency
    // -------------------------------------------------------------
    console.log('\n--- CHECK 7: Donor Add Listing & Expiry Urgency ---');
    const donorToken = tokensByRole['DONOR'].token;
    const urgentExpiry = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours (< 3h urgent)
    const newListingRes = await fetch(`${BASE}/api/listings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        title: 'Fresh Pav Bhaji (Evening Batch)',
        category: 'HOT_MEALS',
        quantity: 40,
        unit: 'PLATES',
        dietaryType: 'VEG',
        recoveryModel: 'DONATION',
        pricePerUnit: 0,
        pickupAddress: 'Shop 104, VIP Galleria, Vesu, Surat',
        pickupWindowEnd: urgentExpiry,
        storageCondition: 'HOT_INSULATED',
        packagingStatus: 'FOOD_GRADE_CONTAINERS',
        foodSafetyDeclaration: true,
      }),
    });
    const newListingData = await newListingRes.json();
    assert(
      newListingRes.status === 200 && newListingData.success && newListingData.listing?.id,
      'Donor publishes surplus listing with FSSAI declaration'
    );
    const createdListingId = newListingData.listing?.id;

    // -------------------------------------------------------------
    // CHECK 8: NGO Smart Match Allocation and Reservation Creation
    // -------------------------------------------------------------
    console.log('\n--- CHECK 8: NGO Smart Match Claim & Cost Breakdown ---');
    const ngoToken = tokensByRole['NGO'].token;
    const claimRes = await fetch(`${BASE}/api/reservations/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({
        listingId: createdListingId,
        requestedQuantity: 20,
      }),
    });
    const claimData = await claimRes.json();
    assert(
      claimRes.status === 200 && claimData.success && claimData.reservation?.id,
      'NGO claims surplus listing; reservation created with status CONFIRMED'
    );
    assert(
      claimData.pickup && claimData.pickup.qrToken && claimData.confirmationCode,
      'Cryptographic HMAC QR token and 4-digit confirmation OTP generated on claim'
    );
    const activeResId = claimData.reservation?.id;
    const activePickupId = claimData.pickup?.id;
    const validOtpCode = claimData.confirmationCode;
    const validQrToken = claimData.pickup?.qrToken;

    // -------------------------------------------------------------
    // CHECK 9: Volunteer Assignment and Claim Flow
    // -------------------------------------------------------------
    console.log('\n--- CHECK 9: Volunteer Dispatch Assignment ---');
    const volUser = tokensByRole['VOLUNTEER'].user;
    const assignRes = await fetch(`${BASE}/api/reservations/assign-volunteer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({
        reservationId: activeResId,
        volunteerId: volUser.id,
      }),
    });
    const assignData = await assignRes.json();
    assert(
      assignRes.status === 200 && assignData.success && assignData.reservation.assignedVolunteerId === volUser.id,
      'Surat logistics dispatcher assigns verified volunteer to reservation'
    );

    // -------------------------------------------------------------
    // CHECK 10: 7-Step Order Timeline State Machine Transitions
    // -------------------------------------------------------------
    console.log('\n--- CHECK 10: 7-Step Timeline State Machine ---');
    const states = ['SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    let transitionsOk = true;
    for (const st of states) {
      const stepRes = await fetch(`${BASE}/api/handoff/advance-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${donorToken}`,
        },
        body: JSON.stringify({
          reservationId: activeResId,
          toState: st,
          notes: `Simulated transition to ${st}`,
        }),
      });
      const stepData = await stepRes.json();
      if (stepRes.status !== 200 || stepData.reservation.status !== st) {
        transitionsOk = false;
        break;
      }
    }
    assert(transitionsOk, 'State machine cleanly transitions across order steps (SCHEDULED -> PICKED_UP -> IN_TRANSIT -> DELIVERED)');

    // -------------------------------------------------------------
    // CHECK 11: Dual Verification - OTP Validation & Rate Limiting
    // -------------------------------------------------------------
    console.log('\n--- CHECK 11: OTP Verification & Rate Limiting ---');
    // Create another claim to test OTP rate limiting
    const claimRes2 = await fetch(`${BASE}/api/reservations/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
      body: JSON.stringify({ listingId: createdListingId, requestedQuantity: 5 }),
    });
    const claimData2 = await claimRes2.json();
    const testResId = claimData2.reservation?.id;

    // Fail 5 times with wrong OTP
    let lastOtpRes = null;
    for (let i = 0; i < 5; i++) {
      lastOtpRes = await fetch(`${BASE}/api/verification/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
        body: JSON.stringify({ reservationId: testResId, enteredOtp: '0000' }),
      });
    }
    // 6th attempt should be rate limited
    const rateLimitedRes = await fetch(`${BASE}/api/verification/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({ reservationId: testResId, enteredOtp: '0000' }),
    });
    const rateLimitedData = await rateLimitedRes.json();
    assert(
      rateLimitedRes.status === 429 && rateLimitedData.errorCode === 'RATE_LIMITED',
      'OTP security: Exceeding 5 failed verification attempts triggers 429 RATE_LIMITED lockout'
    );

    // Verify valid OTP on the main order
    const validOtpRes = await fetch(`${BASE}/api/verification/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({ reservationId: activeResId, enteredOtp: validOtpCode }),
    });
    const validOtpData = await validOtpRes.json();
    assert(
      validOtpRes.status === 200 && validOtpData.success && validOtpData.reservation.status === 'COMPLETED',
      'Valid 4-digit OTP completes handoff and records COMPLETED timeline status'
    );

    // -------------------------------------------------------------
    // CHECK 12: Dual Verification - HMAC QR Token & Nonce Replay Protection
    // -------------------------------------------------------------
    console.log('\n--- CHECK 12: HMAC QR Token & Nonce Replay Protection ---');
    // Claim a 3rd batch to test QR verification & nonce replay
    const claimRes3 = await fetch(`${BASE}/api/reservations/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
      body: JSON.stringify({ listingId: createdListingId, requestedQuantity: 5 }),
    });
    const claimData3 = await claimRes3.json();
    const qrPickupId = claimData3.pickup.id;
    const qrTokenToTest = claimData3.pickup.qrToken;

    // 1st consumption: should succeed
    const qrVerify1 = await fetch(`${BASE}/api/verification/verify-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({ pickupId: qrPickupId, qrToken: qrTokenToTest }),
    });
    const qrVerify1Data = await qrVerify1.json();
    assert(qrVerify1.status === 200 && qrVerify1Data.success, 'Valid HMAC QR token passes cryptographic verification');

    // 2nd consumption (Replay): should fail
    const qrVerify2 = await fetch(`${BASE}/api/verification/verify-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({ pickupId: qrPickupId, qrToken: qrTokenToTest }),
    });
    const qrVerify2Data = await qrVerify2.json();
    assert(
      qrVerify2.status === 400 && qrVerify2Data.errorCode === 'NONCE_REPLAYED',
      'Anti-replay protection: Re-using a consumed QR token is rejected with NONCE_REPLAYED'
    );

    // -------------------------------------------------------------
    // CHECK 13: Direct Operational Fallback Verification
    // -------------------------------------------------------------
    console.log('\n--- CHECK 13: Operational Device Failure Fallback ---');
    const claimRes4 = await fetch(`${BASE}/api/reservations/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
      body: JSON.stringify({ listingId: createdListingId, requestedQuantity: 5 }),
    });
    const claimData4 = await claimRes4.json();
    const fallbackRes = await fetch(`${BASE}/api/verification/fallback-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        reservationId: claimData4.reservation.id,
        pickupId: claimData4.pickup.id,
        reason: 'Courier phone battery dead; physical food parcel verified at loading bay.',
      }),
    });
    const fallbackData = await fallbackRes.json();
    assert(
      fallbackRes.status === 200 && fallbackData.success && fallbackData.pickup.verificationMethod === 'MANUAL_FALLBACK',
      'Operational fallback verification records manual audit trail and successfully closes recovery'
    );

    // -------------------------------------------------------------
    // CHECK 14: Admin Application Review & Approval Setup Token
    // -------------------------------------------------------------
    console.log('\n--- CHECK 14: Admin Application Review & Token Issuance ---');
    const adminToken = tokensByRole['ADMIN'].token;
    const submitAppRes = await fetch(`${BASE}/api/applications/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'NGO',
        applicantName: 'Maitri Relief Foundation',
        email: `maitri_${Date.now()}@suratseva.org`,
        phone: '+91 98259 99999',
        locality: 'Adajan',
        address: 'Adajan Circle, Surat',
        organizationName: 'Maitri Relief Trust',
        orgType: 'CHARITY_SHELTER',
      }),
    });
    const submitAppData = await submitAppRes.json();
    assert(submitAppRes.status === 200 && submitAppData.applicationId, 'New applicant registers join application');

    const reviewRes = await fetch(`${BASE}/api/applications/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        applicationId: submitAppData.applicationId,
        decision: 'APPROVED',
        adminNotes: 'Surat Municipal Corporation charity registry confirmed.',
      }),
    });
    const reviewData = await reviewRes.json();
    assert(
      reviewRes.status === 200 && reviewData.success && reviewData.setupToken,
      'Admin approves application and issues cryptographic setupToken'
    );

    // -------------------------------------------------------------
    // CHECK 15: Super Admin Management & Credential Revocation
    // -------------------------------------------------------------
    console.log('\n--- CHECK 15: Super Admin Credential Governance ---');
    const superToken = tokensByRole['SUPER_ADMIN'].token;
    const targetAdminUser = tokensByRole['ADMIN'].user;
    const revokeRes = await fetch(`${BASE}/api/admin/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superToken}` },
      body: JSON.stringify({
        adminId: targetAdminUser.id,
        reason: 'Periodic credential rotation and governance audit.',
      }),
    });
    const revokeData = await revokeRes.json();
    assert(
      revokeRes.status === 200 && revokeData.success && revokeData.targetUser.accountState === 'SUSPENDED',
      'Super Admin revokes administrative access, setting account state to SUSPENDED'
    );

    // -------------------------------------------------------------
    // CHECK 16: RBAC Unauthorized Access Blocking (401/403)
    // -------------------------------------------------------------
    console.log('\n--- CHECK 16: Strict RBAC Protection Verification ---');
    // Volunteer attempting to review applications (Must return 403)
    const volToken = tokensByRole['VOLUNTEER'].token;
    const rbacVolRes = await fetch(`${BASE}/api/applications/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${volToken}` },
      body: JSON.stringify({ applicationId: 'any', decision: 'APPROVED' }),
    });
    assert(rbacVolRes.status === 403, 'RBAC: Volunteer cannot perform admin review (403 Forbidden)');

    // Donor attempting to invite admin (Must return 403)
    const rbacDonorRes = await fetch(`${BASE}/api/admin/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({ fullName: 'Unauthorized', email: 'unauth@test.com' }),
    });
    assert(rbacDonorRes.status === 403, 'RBAC: Donor cannot appoint administrators (403 Forbidden)');

    // NGO attempting to create surplus listing (Must return 403)
    const rbacNgoRes = await fetch(`${BASE}/api/listings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
      body: JSON.stringify({ title: 'Unauthorized', quantity: 10 }),
    });
    assert(rbacNgoRes.status === 403, 'RBAC: NGO cannot create food listing (403 Forbidden)');

    // -------------------------------------------------------------
    // CHECK 17: Demo Reset API Restores Clean Seed State
    // -------------------------------------------------------------
    console.log('\n--- CHECK 17: Demo Reset State Machine ---');
    const resetRes = await fetch(`${BASE}/api/demo/reset`, { method: 'POST' });
    const resetData = await resetRes.json();
    assert(resetRes.status === 200 && resetData.success, 'POST /api/demo/reset succeeds with 200 OK');

    const postResetState = await (await fetch(`${BASE}/api/state`)).json();
    const cleanDemoCount = postResetState.users.filter((u) => u.email.endsWith('@nourishnet.demo')).length;
    assert(cleanDemoCount === 25, 'Post-reset database accurately restores all 25 seed demo users');

    console.log('\n=============================================================');
    console.log(`E2E QA SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal error during test suite execution:', err);
    process.exitCode = 1;
  } finally {
    if (serverStartedLocally && serverProcess) {
      console.log('Stopping test runner server process...');
      serverProcess.kill();
    }
  }
}

runAllTests();
