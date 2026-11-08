// CSRF verification script using Node's built-in fetch
const base = 'http://localhost:3000/api/v1';
async function main() {
  // Login to obtain JWT cookie
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'comprador1@tvs.pe', password: 'Password12345' }),
    redirect: 'manual',
  });
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status);
    process.exit(1);
  }
  const setCookie = loginRes.headers.get('set-cookie');
  const cookie = setCookie?.split(';')[0] ?? '';

  // Helper to POST cart items
  async function postCart(originHeader) {
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    };
    if (originHeader) headers['Origin'] = originHeader;
    const res = await fetch(`${base}/cart/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ variantId: 'dummy', quantity: 1 }),
      redirect: 'manual',
    });
    const body = await res.text();
    console.log(`Origin: ${originHeader || 'none'} -> status ${res.status}`);
    console.log('Response body:', body);
  }

  // 1. No Origin header (should trigger CSRF error)
  await postCart(null);

  // 2. Allowed Origin header (should pass auth but may still be 400 due to dummy variant, but not CSRF)
  await postCart('http://localhost:5173');
}

main().catch(err => console.error('Error', err));
