import { spawn } from 'child_process';

const BASE = 'http://localhost:3001';

async function waitForServer(maxRetries = 15) {
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

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // Check if server is running; if not, spin it up
  let serverProcess = null;
  let serverStartedLocally = false;

  try {
    const check = await fetch(`${BASE}/api/health`).catch(() => null);
    if (!check || !check.ok) {
      console.log('Starting local test server on port 3001...');
      serverProcess = spawn('node', ['server.js'], {
        env: { ...process.env, PORT: '3001', NODE_ENV: 'development' },
        stdio: 'pipe',
      });
      serverStartedLocally = true;
      const ready = await waitForServer();
      if (!ready) {
        console.error('Server failed to start in time.');
        process.exit(1);
      }
    }

    console.log('--- Running Phase 1 Test Suite ---');

    // Test 1: Health check
    const healthRes = await fetch(`${BASE}/api/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.status === 'ok', 'Health check returns status 200 and ok');

    // Test 2: Shared State
    const stateRes = await fetch(`${BASE}/api/state`);
    const state = await stateRes.json();
    assert(
      stateRes.status === 200 &&
      Array.isArray(state.users) &&
      Array.isArray(state.foodListings) &&
      state.outcomeMetrics !== undefined,
      'Shared state returns users, listings, and metrics'
    );

    // Test 3: Invalid Login Rejection
    const invalidLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'donor@kansar.in', password: 'WrongPassword123' }),
    });
    assert(invalidLoginRes.status === 401, 'Invalid login rejected with 401 Unauthorized');

    // Test 4: Missing Credentials Rejection
    const missingCredsRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' }),
    });
    assert(missingCredsRes.status === 400, 'Missing credentials rejected with 400 Bad Request');

    // Test 5: Valid Login (Donor)
    const validLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'donor@kansar.in', password: 'SuratSecure@2026' }),
    });
    const validLogin = await validLoginRes.json();
    assert(
      validLoginRes.status === 200 &&
      validLogin.success === true &&
      validLogin.token &&
      validLogin.user.role === 'DONOR',
      'Valid donor login succeeds with 200 and session token'
    );
    const donorToken = validLogin.token;

    // Test 6: Valid Login (NGO)
    const ngoLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ngo@suratfoodrelief.org', password: 'SuratSecure@2026' }),
    });
    const ngoLogin = await ngoLoginRes.json();
    assert(
      ngoLoginRes.status === 200 &&
      ngoLogin.success === true &&
      ngoLogin.user.role === 'NGO',
      'Valid NGO login succeeds with 200 and role NGO'
    );
    const ngoToken = ngoLogin.token;

    // Test 7: Protected Route /api/auth/me without token
    const unauthMeRes = await fetch(`${BASE}/api/auth/me`);
    assert(unauthMeRes.status === 401, '/api/auth/me without token returns 401 Unauthorized');

    // Test 8: Protected Route /api/auth/me with Bearer token
    const authMeRes = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    const authMe = await authMeRes.json();
    assert(
      authMeRes.status === 200 &&
      authMe.user.email === 'donor@kansar.in' &&
      authMe.user.passwordHash === undefined,
      '/api/auth/me with Bearer token returns authenticated user without passwordHash'
    );

    // Test 9: RBAC - NGO attempting to create surplus listing (Must be forbidden for NGO)
    const rbacListingRes = await fetch(`${BASE}/api/listings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Surplus',
        quantity: 10,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }),
    });
    assert(rbacListingRes.status === 403, 'RBAC: NGO cannot create food listing (403 Forbidden)');

    // Test 10: RBAC - Donor attempting to claim reservation (Must be forbidden for Donor)
    const rbacClaimRes = await fetch(`${BASE}/api/reservations/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        listingId: 'list-srt-101',
        requestedQuantity: 5,
      }),
    });
    assert(rbacClaimRes.status === 403, 'RBAC: Donor cannot claim reservation (403 Forbidden)');

    // Test 11: RBAC - Donor attempting to invite admin (Must be forbidden for non-superadmin)
    const rbacAdminRes = await fetch(`${BASE}/api/admin/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({ fullName: 'Hacker Admin', email: 'hacker@admin.com' }),
    });
    assert(rbacAdminRes.status === 403, 'RBAC: Donor cannot invite admin (403 Forbidden)');

    // Test 12: Logout
    const logoutRes = await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert(logoutRes.status === 200, 'Logout succeeds with 200');

    // Test 13: Revoked session rejection after logout
    const postLogoutMeRes = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert(postLogoutMeRes.status === 401, 'Logged out session token is revoked and returns 401');

    // Test 14: Frontend HTML Delivery
    const frontendRes = await fetch(`${BASE}/`);
    const htmlText = await frontendRes.text();
    assert(
      frontendRes.status === 200 &&
      htmlText.includes('NourishNet') &&
      htmlText.includes('/src/main.jsx'),
      'Frontend HTML served correctly referencing /src/main.jsx'
    );

    console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exitCode = 1;
  } finally {
    if (serverStartedLocally && serverProcess) {
      serverProcess.kill();
    }
  }
}

runTests();
