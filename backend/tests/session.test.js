// Tests de la session par cookie httpOnly
require('dotenv').config();
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const db = require('../src/config/db');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/config/secrets');
const { startSession, SESSION_COOKIE } = require('../src/utils/session');

let server;
let baseUrl;
const sessionToken = jwt.sign(
  { id: '11111111-2222-3333-4444-555555555555', role: 'ELEVE', user: { id: 'x', role: 'ELEVE', email: 'eleve@test.local' } },
  JWT_SECRET,
  { expiresIn: '5m' }
);

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.pool.end();
});

test('le cookie de session est httpOnly, Secure et SameSite=Strict, et le jeton n\'est pas renvoyé', () => {
  let cookie;
  let body;
  const res = {
    cookie: (name, value, options) => { cookie = { name, value, options }; },
    json: (data) => { body = data; return data; },
  };
  startSession(res, { id: 'u1', role: 'ELEVE' }, { id: 'u1', role: 'ELEVE' });
  assert.strictEqual(cookie.name, SESSION_COOKIE);
  assert.strictEqual(cookie.options.httpOnly, true);
  assert.strictEqual(cookie.options.secure, true);
  assert.strictEqual(cookie.options.sameSite, 'strict');
  assert.deepStrictEqual(body, { user: { id: 'u1', role: 'ELEVE' } });
  assert.strictEqual(jwt.verify(cookie.value, JWT_SECRET).role, 'ELEVE');
});

test('/api/auth/me accepte le cookie de session', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: `${SESSION_COOKIE}=${sessionToken}` } });
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).user.email, 'eleve@test.local');
});

test('le jeton dans l\'URL (?token=) n\'est plus accepté', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me?token=${sessionToken}`);
  assert.strictEqual(res.status, 401);
});

test('la déconnexion efface le cookie', async () => {
  const res = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
  assert.strictEqual(res.status, 200);
  assert.match(res.headers.get('set-cookie') || '', new RegExp(`${SESSION_COOKIE}=;.*Expires=Thu, 01 Jan 1970`));
});
