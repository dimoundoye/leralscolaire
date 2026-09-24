// Tests de fumée : vérifient que l'API démarre et que les routes principales
// répondent sans erreur serveur. Lecture seule (GET) — aucune écriture en base.
// Nécessite une base PostgreSQL accessible (variables du fichier .env).
require('dotenv').config();
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const db = require('../src/config/db');
const app = require('../src/app');

const { JWT_SECRET } = require('../src/config/secrets');

// Routes GET protégées, groupées par rôle attendu
const ROUTES_BY_ROLE = {
  ADMIN_ETABLISSEMENT: [
    '/api/classes',
    '/api/classes/exams/all',
    '/api/eleves',
    '/api/eleves/transfers/incoming',
    '/api/etablissement/profile',
    '/api/etablissement/baremes',
    '/api/notes/matieres',
    '/api/notes/moyennes-classes',
    '/api/notes/regles-passage',
    '/api/professeurs',
    '/api/pre-inscriptions',
    '/api/messages/inbox',
    '/api/messages/channels',
    '/api/partages/received',
    '/api/partages/sent',
    '/api/cahier-texte/admin',
    '/api/discipline/etablissement',
  ],
  PROFESSEUR: [
    '/api/professeurs-portal/profile',
    '/api/professeurs-portal/invitations',
    '/api/professeurs-portal/summary',
    '/api/cahier-texte/professeur',
    '/api/discipline/professeur',
    '/api/messages/inbox',
  ],
  ELEVE: ['/api/eleve-portal/profile', '/api/eleve-portal/portfolio', '/api/cahier-texte/eleve', '/api/messages/inbox'],
  OFFICE_BAC: [
    '/api/office-bac/stats',
    '/api/office-bac/carte-regionale',
    '/api/office-bac/palmares',
    '/api/emargement/office/search',
  ],
};

const ALL_PROTECTED = [...new Set(Object.values(ROUTES_BY_ROLE).flat())];

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.pool.end();
});

const get = (path, token) => fetch(baseUrl + path, token ? { headers: { Authorization: `Bearer ${token}` } } : {});

test('GET /api/health répond 200', async () => {
  const res = await get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
});

test('les routes protégées refusent les requêtes sans jeton (401)', async () => {
  for (const path of ALL_PROTECTED) {
    const res = await get(path);
    assert.strictEqual(res.status, 401, `${path} devrait répondre 401, reçu ${res.status}`);
  }
});

test("un jeton signé avec l'ancien secret par défaut est refusé (401)", async () => {
  const forged = jwt.sign(
    { id: '00000000-0000-0000-0000-000000000000', role: 'OFFICE_BAC' },
    'votre_secret_tres_prive'
  );
  const res = await get('/api/office-bac/stats', forged);
  assert.strictEqual(res.status, 401);
});

test("CORS : une origine inconnue n'est pas autorisée", async () => {
  const res = await fetch(baseUrl + '/api/health', { headers: { Origin: 'https://site-malveillant.example' } });
  assert.strictEqual(res.headers.get('access-control-allow-origin'), null);
});

test('CORS : FRONTEND_URL est autorisée', { skip: !process.env.FRONTEND_URL }, async () => {
  const origin = process.env.FRONTEND_URL;
  const res = await fetch(baseUrl + '/api/health', { headers: { Origin: origin } });
  assert.strictEqual(res.headers.get('access-control-allow-origin'), origin);
});

test("login avec de mauvais identifiants ne provoque pas d'erreur serveur", async () => {
  const res = await fetch(baseUrl + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'inexistant@test.local', password: 'mauvais' }),
  });
  assert.ok(res.status >= 400 && res.status < 500, `attendu 4xx, reçu ${res.status}`);
});

for (const [role, paths] of Object.entries(ROUTES_BY_ROLE)) {
  test(`routes ${role} : aucune erreur 500 avec un jeton valide`, async (t) => {
    const { rows } = await db.query('SELECT id FROM users WHERE role = $1 LIMIT 1', [role]);
    if (rows.length === 0) {
      t.skip(`aucun utilisateur ${role} en base`);
      return;
    }
    const token = jwt.sign({ id: rows[0].id, role }, JWT_SECRET, { expiresIn: '5m' });
    const failures = [];
    for (const path of paths) {
      const res = await get(path, token);
      if (res.status >= 500) failures.push(`${path} → ${res.status}`);
    }
    assert.deepStrictEqual(failures, [], `Erreurs serveur :\n${failures.join('\n')}`);
  });
}
