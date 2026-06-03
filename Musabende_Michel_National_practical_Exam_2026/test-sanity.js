/**
 * Sanity Test Script for SRMS
 * 
 * Prerequisites:
 * - Backend running at http://localhost:5000
 * - Database seeded with `npm run seed`
 * 
 * Run: node test-sanity.js
 */

const API = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  const results = [];
  let cookieHeader = '';

  function log(name, passed, detail = '') {
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`  [${status}] ${name}${detail ? ` - ${detail}` : ''}`);
    results.push({ name, passed, detail });
  }

  console.log('=== SRMS Sanity Test Suite ===\n');

  // 1. Health Check
  console.log('1. Health Check');
  const health = await fetch(`${API}/health`);
  log('API Health', health.ok, health.ok ? 'API is running' : 'API unreachable');

  // 2. Login with seeded admin
  console.log('\n2. Authentication');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'Admin@123' }),
  });
  const loggedIn = loginRes.ok && loginRes.data.success;
  const sessionCookie = loginRes.headers?.getSetCookie?.()?.[0] || '';
  log('Admin Login', loggedIn, loggedIn ? 'admin logged in successfully' : loginRes.data?.message);

  if (!loggedIn) {
    console.log('\n=== Login failed, skipping remaining tests ===');
    printSummary(results);
    return;
  }

  // 3. Check session
  const sessionRes = await request('/auth/session');
  log('Session Check', sessionRes.data.success, `User: ${sessionRes.data.data?.username}, Role: ${sessionRes.data.data?.role}`);

  // 4. Create a customer
  console.log('\n3. CRUD Operations');
  const custRes = await request('/customers', {
    method: 'POST',
    body: JSON.stringify({ firstName: 'Test', lastName: 'User', telephone: '+250789999999', address: 'Test Address, Kigali' }),
  });
  log('Create Customer', custRes.data.success, custRes.data.data ? `Number: ${custRes.data.data.customerNumber}` : custRes.data.message);

  // 5. Create a product
  const prodRes = await request('/products', {
    method: 'POST',
    body: JSON.stringify({ productName: 'Test Product', quantitySold: 10, unitPrice: 50000 }),
  });
  log('Create Product', prodRes.data.success, prodRes.data.data ? `Code: ${prodRes.data.data.productCode}` : prodRes.data.message);

  // 6. Create a sale
  let customerId = custRes.data.data?._id || '';
  let productId = prodRes.data.data?._id || '';
  
  // Try to get existing data if create failed
  if (!customerId) {
    const listRes = await request('/customers');
    if (listRes.data.data?.length) customerId = listRes.data.data[0]._id;
  }
  if (!productId) {
    const listRes = await request('/products');
    if (listRes.data.data?.length) productId = listRes.data.data[0]._id;
  }

  if (customerId && productId) {
    const saleRes = await request('/sales', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        salesDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        products: [{ product: productId, quantity: 2, unitPrice: 50000 }],
      }),
    });
    log('Create Sale', saleRes.data.success, saleRes.data.data ? `Invoice: ${saleRes.data.data.invoiceNumber}` : saleRes.data.message);
  } else {
    log('Create Sale - Skipped', false, 'No customer/product available');
  }

  // 7. Generate report
  console.log('\n4. Reports');
  const reportRes = await request('/reports/data?type=sales');
  log('Generate Sales Report', reportRes.ok, reportRes.data.success ? `${reportRes.data.data?.totalRecords || 0} records` : 'Failed');

  // 8. Logout
  console.log('\n5. Logout');
  const logoutRes = await request('/auth/logout', { method: 'POST' });
  log('Logout', logoutRes.data.success, 'Session destroyed');

  // Summary
  console.log('\n=== Summary ===');
  printSummary(results);
}

function printSummary(results) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter((r) => !r.passed).forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
  }
  console.log(`\n${failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
}

run().catch((err) => {
  console.error('Test error:', err.message);
  process.exit(1);
});
