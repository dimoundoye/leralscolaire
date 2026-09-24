// Tests du contrôle de position GPS de l'émargement
const { test } = require('node:test');
const assert = require('node:assert');
const { distanceMetres, parsePosition, checkInsideRadius } = require('../src/utils/geo');

// Lycée de référence (Dakar) et points de test
const LYCEE = { latitude: 14.7167, longitude: -17.4677 };

test('distance : même point = 0 m, environ 111 m pour 0,001° de latitude', () => {
  assert.strictEqual(Math.round(distanceMetres(LYCEE.latitude, LYCEE.longitude, LYCEE.latitude, LYCEE.longitude)), 0);
  const d = distanceMetres(LYCEE.latitude, LYCEE.longitude, LYCEE.latitude + 0.001, LYCEE.longitude);
  assert.ok(d > 110 && d < 112, `distance attendue ≈ 111 m, obtenu ${d}`);
});

test('position : valeurs invalides refusées', () => {
  assert.strictEqual(parsePosition('abc', 10), null);
  assert.strictEqual(parsePosition(95, 10), null);
  assert.strictEqual(parsePosition(10, 190), null);
  assert.deepStrictEqual(parsePosition('14.7', '-17.4', '25'), { latitude: 14.7, longitude: -17.4, precision: 25 });
});

test('rayon : dans le périmètre accepté, en dehors refusé avec la distance', () => {
  const dedans = parsePosition(LYCEE.latitude + 0.001, LYCEE.longitude, 20);
  assert.strictEqual(checkInsideRadius(dedans, LYCEE, 200, 'du lycée').ok, true);

  const dehors = parsePosition(LYCEE.latitude + 0.01, LYCEE.longitude, 20);
  const refus = checkInsideRadius(dehors, LYCEE, 200, 'du lycée');
  assert.strictEqual(refus.ok, false);
  assert.match(refus.message, /1112 m du lycée/);
});

test('rayon : signal GPS trop imprécis refusé', () => {
  const imprecis = parsePosition(LYCEE.latitude, LYCEE.longitude, 500);
  const res = checkInsideRadius(imprecis, LYCEE, 200, 'du lycée');
  assert.strictEqual(res.ok, false);
  assert.match(res.message, /trop imprécis/);
});
