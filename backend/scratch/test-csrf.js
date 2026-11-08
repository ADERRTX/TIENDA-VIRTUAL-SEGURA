// Temporary script to test CSRF behavior on cart endpoint
const fetch = require('node-fetch');
const base = 'http://localhost:3000/api/v1';
async function test() {
  // No Origin header
  let res = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId: 'dummy', quantity: 1 }),
    redirect: 'manual',
  });
  console.log('No Origin status:', res.status);
  const txt1 = await res.text();
  console.log('Response body:', txt1);

  // With allowed Origin header
  res = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
    body: JSON.stringify({ variantId: 'dummy', quantity: 1 }),
    redirect: 'manual',
  });
  console.log('Allowed Origin status:', res.status);
  const txt2 = await res.text();
  console.log('Response body:', txt2);
}

test().catch(err => console.error(err));
