// Outils de géolocalisation pour l'émargement

const EARTH_RADIUS_METRES = 6371000;

// Au-delà de cette imprécision annoncée par l'appareil, la position n'est pas exploitable
const MAX_PRECISION_METRES = 200;

/**
 * Distance en mètres entre deux points GPS (formule de haversine)
 */
function distanceMetres(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(a));
}

/**
 * Valide une position envoyée par le client.
 * @returns {{ latitude: number, longitude: number, precision: number|null } | null}
 */
function parsePosition(latitude, longitude, precision = null) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  const prec = precision === null || precision === undefined ? null : Number(precision);
  return { latitude: lat, longitude: lon, precision: Number.isFinite(prec) ? prec : null };
}

/**
 * Vérifie qu'une position se trouve dans le rayon autorisé autour d'un point de référence.
 * @returns {{ ok: boolean, distance: number, message?: string }}
 */
function checkInsideRadius(position, reference, rayonMetres, lieu) {
  if (position.precision !== null && position.precision > MAX_PRECISION_METRES) {
    return {
      ok: false,
      distance: null,
      message: `Signal GPS trop imprécis (± ${Math.round(position.precision)} m). Rapprochez-vous d'une fenêtre ou sortez, puis réessayez.`,
    };
  }
  const distance = Math.round(distanceMetres(position.latitude, position.longitude, reference.latitude, reference.longitude));
  if (distance > rayonMetres) {
    return {
      ok: false,
      distance,
      message: `Vous êtes à ${distance} m ${lieu} (maximum autorisé : ${rayonMetres} m).`,
    };
  }
  return { ok: true, distance };
}

module.exports = { distanceMetres, parsePosition, checkInsideRadius, MAX_PRECISION_METRES };
