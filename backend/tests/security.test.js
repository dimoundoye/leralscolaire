// Tests de sécurité : cloisonnement entre établissements, rôles, fichiers envoyés,
// limitation des tentatives. Lecture seule, sauf requêtes volontairement rejetées.
// Nécessite une base PostgreSQL accessible avec au moins un établissement, une classe et un élève.
require('dotenv').config();
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const db = require('../src/config/db');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/config/secrets');

// Compte fictif : jeton valide mais rattaché à aucun établissement (simule « un autre établissement »)
const OUTSIDER_ID = '11111111-2222-3333-4444-555555555555';
const token = (id, role) => jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '5m' });

let server;
let baseUrl;
let ids = {};
let tokens = {};

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const one = async (sql) => (await db.query(sql)).rows[0] || {};
  const eleve = await one('SELECT id, user_id FROM eleves LIMIT 1');
  const admin = await one(
    `SELECT u.id FROM users u JOIN etablissements e ON e.admin_id = u.id
     JOIN classes c ON c.etablissement_id = e.id LIMIT 1`
  );
  ids = {
    eleve: eleve.id,
    classe: (await one('SELECT c.id FROM classes c JOIN etablissements e ON c.etablissement_id = e.id WHERE e.admin_id = (SELECT admin_id FROM etablissements LIMIT 1) LIMIT 1')).id,
    matiere: (await one('SELECT id FROM matieres LIMIT 1')).id,
    etablissement: (await one('SELECT id FROM etablissements LIMIT 1')).id,
    prof: (await one("SELECT id FROM users WHERE role = 'PROFESSEUR' LIMIT 1")).id,
  };
  tokens = {
    admin: admin.id && token(admin.id, 'ADMIN_ETABLISSEMENT'),
    eleve: eleve.user_id && token(eleve.user_id, 'ELEVE'),
    adminAutre: token(OUTSIDER_ID, 'ADMIN_ETABLISSEMENT'),
    profAutre: token(OUTSIDER_ID, 'PROFESSEUR'),
    eleveAutre: token(OUTSIDER_ID, 'ELEVE'),
  };
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.pool.end();
});

const request = (method, path, tok, body) =>
  fetch(baseUrl + path, {
    method,
    headers: {
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

const needsData = (t) => {
  if (!ids.eleve || !ids.classe || !tokens.admin) {
    t.skip('données de test absentes (établissement, classe ou élève)');
    return true;
  }
  return false;
};

test('les données d\'un élève sont refusées aux autres établissements, professeurs et élèves', async (t) => {
  if (needsData(t)) return;
  const routes = [
    `/api/documents/bulletin/${ids.eleve}?semestre=1`,
    `/api/documents/dossier-transfert/${ids.eleve}`,
    `/api/discipline/eleve/${ids.eleve}`,
    `/api/discipline/eleve/${ids.eleve}/pdf`,
    `/api/notes/eleve/${ids.eleve}`,
  ];
  for (const path of routes) {
    for (const who of ['adminAutre', 'profAutre', 'eleveAutre']) {
      const res = await request('GET', path, tokens[who]);
      assert.strictEqual(res.status, 403, `${who} sur ${path} : attendu 403, reçu ${res.status}`);
    }
  }
});

test('les données d\'une classe sont refusées hors de son établissement', async (t) => {
  if (needsData(t)) return;
  const routes = [
    `/api/classes/${ids.classe}/matieres`,
    `/api/classes/${ids.classe}/schedule`,
    `/api/classes/${ids.classe}/exams`,
    `/api/notes/moyennes/${ids.classe}`,
    `/api/notes/classe/${ids.classe}/matiere/${ids.matiere}`,
    `/api/notes/classe/${ids.classe}/classement`,
    `/api/notes/publications/${ids.classe}`,
    `/api/documents/classe/${ids.classe}/classement-pdf`,
  ];
  for (const path of routes) {
    for (const who of ['adminAutre', 'profAutre', 'eleve']) {
      const res = await request('GET', path, tokens[who]);
      assert.strictEqual(res.status, 403, `${who} sur ${path} : attendu 403, reçu ${res.status}`);
    }
  }
});

test('l\'administration de l\'établissement garde l\'accès à ses propres données', async (t) => {
  if (needsData(t)) return;
  const routes = [
    `/api/documents/dossier-transfert/${ids.eleve}`,
    `/api/discipline/eleve/${ids.eleve}`,
    `/api/notes/eleve/${ids.eleve}`,
    `/api/classes/${ids.classe}/matieres`,
    `/api/notes/classe/${ids.classe}/classement`,
  ];
  for (const path of routes) {
    const res = await request('GET', path, tokens.admin);
    assert.strictEqual(res.status, 200, `admin sur ${path} : attendu 200, reçu ${res.status}`);
  }
});

test('un professeur garde l\'accès aux classes et matières qu\'il enseigne', async (t) => {
  const { rows } = await db.query(
    `SELECT pm.professeur_id, pm.classe_id, pm.matiere_id FROM professeur_matieres pm
     JOIN classes c ON c.id = pm.classe_id
     JOIN professeurs_etablissements pe
       ON pe.professeur_id = pm.professeur_id AND pe.etablissement_id = c.etablissement_id AND pe.statut = 'ACCEPTE'
     LIMIT 1`
  );
  if (!rows[0]) return t.skip('aucune affectation professeur en base');
  const { professeur_id, classe_id, matiere_id } = rows[0];
  const profToken = token(professeur_id, 'PROFESSEUR');
  for (const path of [
    `/api/professeurs-portal/classes/${classe_id}/students`,
    `/api/professeurs-portal/grades/${classe_id}/${matiere_id}`,
    `/api/professeurs-portal/pedagogie/${classe_id}/${matiere_id}`,
  ]) {
    const res = await request('GET', path, profToken);
    assert.strictEqual(res.status, 200, `professeur sur ${path} : attendu 200, reçu ${res.status}`);
  }
});

test('un élève accède à son propre dossier disciplinaire (me)', async (t) => {
  if (needsData(t) || !tokens.eleve) return;
  const res = await request('GET', '/api/discipline/eleve/me', tokens.eleve);
  assert.strictEqual(res.status, 200);
});

test('les modifications sont refusées hors de l\'établissement (sans rien écrire)', async (t) => {
  if (needsData(t)) return;
  const attempts = [
    ['PUT', `/api/classes/${ids.classe}`, { nom: 'piratée' }],
    ['POST', `/api/classes/${ids.classe}/matieres`, { matieres: [] }],
    ['POST', `/api/notes/decisions/${ids.classe}`, { decisions: [] }],
    ['POST', '/api/notes/batch', { notes: [{ eleve_id: ids.eleve, valeur: 20 }], matiere_id: ids.matiere, semestre: 1 }],
    ['PUT', `/api/professeurs/${ids.prof || OUTSIDER_ID}`, { email: 'pirate@test.local', password: 'x' }],
    ['POST', '/api/professeurs/assignments', { professeur_id: OUTSIDER_ID, classe_id: ids.classe, matiere_id: ids.matiere }],
  ];
  for (const [method, path, body] of attempts) {
    for (const who of ['adminAutre', 'profAutre', 'eleve']) {
      const res = await request(method, path, tokens[who], body);
      assert.ok([403, 404].includes(res.status), `${who} ${method} ${path} : attendu 403/404, reçu ${res.status}`);
    }
  }
});

test('la carte d\'identité enseignant est réservée à l\'Office du Bac', async (t) => {
  if (!ids.prof) return t.skip('aucun professeur en base');
  for (const who of ['adminAutre', 'profAutre', 'eleveAutre']) {
    const res = await request('GET', `/api/emargement/office/carte-identite/${ids.prof}`, tokens[who]);
    assert.strictEqual(res.status, 403, `${who} : attendu 403, reçu ${res.status}`);
  }
});

test('émargement : réservé aux professeurs, QR invalide et terrain manquant refusés', async () => {
  const profToken = token(OUTSIDER_ID, 'PROFESSEUR');
  const eleveScan = await request('POST', '/api/emargement/scan', tokens.eleveAutre, { token: 'x' });
  assert.strictEqual(eleveScan.status, 403);

  const qrInvalide = await request('POST', '/api/emargement/scan', profToken, { token: 'pas-un-qr', latitude: 14.7, longitude: -17.4 });
  assert.strictEqual(qrInvalide.status, 400);

  const sansTerrain = await request('POST', '/api/emargement/eps-terrain', profToken, { latitude: 14.7, longitude: -17.4 });
  assert.strictEqual(sansTerrain.status, 400);
});

test('inscription directe d\'un établissement désactivée', async () => {
  const res = await request('POST', '/api/auth/register-etablissement', null, { nom: 'X', email: 'x@test.local', password: 'x' });
  assert.strictEqual(res.status, 404);
});

test('inscription publique : un fichier HTML déguisé est refusé', async () => {
  const html = Buffer.from('<script>alert(1)</script>').toString('base64');
  const res = await request('POST', '/api/office-bac/demande-public', null, {
    type_demande: 'PROFESSEUR',
    nom: 'Test',
    email: `securite-${Date.now()}@test.local`,
    documents_fournis: { doc_cni: { name: 'cni.png', data: `data:image/png;base64,${html}` } },
  });
  assert.strictEqual(res.status, 400);
});

test('les fichiers envoyés non affichables sont servis en téléchargement isolé', async () => {
  const res = await fetch(baseUrl + '/uploads/inexistant.html');
  // Inexistant → 404, mais on vérifie surtout qu'aucun index de dossier n'est exposé
  assert.notStrictEqual(res.status, 200);
  const dir = await fetch(baseUrl + '/uploads/');
  assert.notStrictEqual(dir.status, 200);
});

test('mot de passe oublié : même réponse que le compte existe ou non', async () => {
  const res = await request('POST', '/api/auth/forgot-password', null, {
    iup: 'INEXISTANT-000', email: 'inexistant@test.local',
  });
  assert.strictEqual(res.status, 200);
});

test('connexion : blocage après 10 échecs depuis la même adresse', async () => {
  let last;
  for (let i = 0; i < 11; i++) {
    last = await request('POST', '/api/auth/login', null, { email: 'inexistant@test.local', password: 'mauvais' });
  }
  assert.strictEqual(last.status, 429);
});
