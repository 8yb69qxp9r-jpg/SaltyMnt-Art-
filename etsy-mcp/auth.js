/**
 * Etsy OAuth 2.0 + PKCE — first-time token setup
 *
 * Run once to get your access_token and refresh_token:
 *   ETSY_API_KEY=your_key node auth.js
 *
 * It will save tokens to .tokens.json which the server reads automatically.
 */

import 'dotenv/config';
import { createServer } from 'http';
import { randomBytes, createHash } from 'crypto';
import { writeFileSync } from 'fs';

const PORT = 3003;
const API_KEY = process.env.ETSY_API_KEY;

if (!API_KEY) {
  console.error('\n❌  ETSY_API_KEY is not set.\n');
  console.error('    1. Copy .env.example to .env');
  console.error('    2. Fill in your API key from https://www.etsy.com/developers/your-account');
  console.error('    3. Re-run: npm run auth\n');
  process.exit(1);
}

// PKCE helpers
const b64url = (buf) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const codeVerifier = b64url(randomBytes(32));
const codeChallenge = b64url(createHash('sha256').update(codeVerifier).digest());
const state = randomBytes(16).toString('hex');

// Scopes required for full shop management
const SCOPES = [
  'shops_r',        // read shop info
  'shops_w',        // update shop info
  'listings_r',     // read listings
  'listings_w',     // create/update listings
  'listings_d',     // delete listings
  'transactions_r', // read orders & transactions
  'billing_r',      // read payment/billing
  'profile_r',      // read user profile (needed to auto-detect shop_id)
].join(' ');

const REDIRECT = `http://localhost:${PORT}/callback`;

const authUrl =
  `https://www.etsy.com/oauth/connect` +
  `?response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&client_id=${API_KEY}` +
  `&state=${state}` +
  `&code_challenge=${codeChallenge}` +
  `&code_challenge_method=S256`;

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║       Etsy MCP — First-Time OAuth Setup          ║');
console.log('╚══════════════════════════════════════════════════╝\n');
console.log('Step 1 — Open this URL in your browser:\n');
console.log('  ' + authUrl + '\n');
console.log('Step 2 — Sign in to Etsy and approve the permissions.');
console.log('Step 3 — You will be redirected back automatically.\n');

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    const msg = url.searchParams.get('error_description') || error;
    res.writeHead(400, { 'Content-Type': 'text/html' }).end(`<h2>❌ Error: ${msg}</h2>`);
    console.error(`\n❌  Etsy returned an error: ${msg}\n`);
    setTimeout(() => process.exit(1), 500);
    return;
  }

  if (returnedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/html' }).end('<h2>❌ State mismatch — possible CSRF</h2>');
    console.error('\n❌  State mismatch — aborting.\n');
    setTimeout(() => process.exit(1), 500);
    return;
  }

  try {
    const tokenRes = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: API_KEY,
        redirect_uri: REDIRECT,
        code,
        code_verifier: codeVerifier,
      }),
    });

    const data = await tokenRes.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    const tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60_000,
    };

    writeFileSync('.tokens.json', JSON.stringify(tokens, null, 2));

    console.log('\n✅  Authentication successful!\n');
    console.log('Tokens saved to .tokens.json — the server will use these automatically.');
    console.log('\nYou can also add them to your .env file if you prefer:');
    console.log(`  ETSY_ACCESS_TOKEN=${data.access_token}`);
    console.log(`  ETSY_REFRESH_TOKEN=${data.refresh_token}\n`);

    res.writeHead(200, { 'Content-Type': 'text/html' }).end(`
      <html><body style="font-family:sans-serif;padding:2rem;max-width:500px">
        <h2>✅ Authentication successful!</h2>
        <p>Tokens have been saved. You can close this window and return to the terminal.</p>
        <p>Run <code>npm start</code> to start the MCP server.</p>
      </body></html>
    `);

    setTimeout(() => process.exit(0), 1000);
  } catch (err) {
    console.error('\n❌  Token exchange failed:', err.message, '\n');
    res.writeHead(500, { 'Content-Type': 'text/html' }).end(`<h2>❌ Error: ${err.message}</h2>`);
    setTimeout(() => process.exit(1), 500);
  }
});

httpServer.listen(PORT, () => {
  console.log(`Waiting for Etsy callback on http://localhost:${PORT}/callback ...\n`);
});
