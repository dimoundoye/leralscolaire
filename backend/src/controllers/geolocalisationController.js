// Paramètres de géolocalisation de l'émargement, gérés par l'administration de l'établissement :
// position GPS de l'établissement (cours en salle) et terrains d'EPS (cours en extérieur).
const db = require('../config/db');
const response = require('../utils/response');
const { getAdminEtablissementId } = require('../middleware/access');
const { parsePosition } = require('../utils/geo');

const RAYON_MIN = 50;
const RAYON_MAX = 2000;

// Rayon saisi, borné pour éviter un périmètre inutilisable ou trop permissif
function parseRayon(value, defaut) {
  const rayon = Number(value);
  if (!Number.isFinite(rayon)) return defaut;
  return Math.min(RAYON_MAX, Math.max(RAYON_MIN, Math.round(rayon)));
}

const geolocalisationController = {
  async getParametres(req, res) {
    try {
      const etablissementId = await getAdminEtablissementId(req.user.id);
      if (!etablissementId) return response.error(res, 'Établissement non trouvé.', 404);

      const { rows: etab } = await db.query(
        'SELECT latitude, longitude, rayon_emargement_metres FROM etablissements WHERE id = $1',
        [etablissementId]
      );
      const { rows: terrains } = await db.query(
        'SELECT id, nom, latitude, longitude, rayon_metres FROM terrains_eps WHERE etablissement_id = $1 ORDER BY nom',
        [etablissementId]
      );
      return res.json({ etablissementId, position: etab[0], terrains });
    } catch (err) {
      console.error('Erreur getParametres géolocalisation:', err);
      return response.error(res, 'Erreur lors du chargement de la géolocalisation.', 500);
    }
  },

  async updatePosition(req, res) {
    try {
      const etablissementId = await getAdminEtablissementId(req.user.id);
      if (!etablissementId) return response.error(res, 'Établissement non trouvé.', 404);

      const position = parsePosition(req.body.latitude, req.body.longitude);
      if (!position) return response.error(res, 'Coordonnées GPS invalides.', 400);

      const { rows } = await db.query(
        `UPDATE etablissements SET latitude = $1, longitude = $2, rayon_emargement_metres = $3
         WHERE id = $4
         RETURNING latitude, longitude, rayon_emargement_metres`,
        [position.latitude, position.longitude, parseRayon(req.body.rayon_metres, 200), etablissementId]
      );
      return res.json({ message: 'Position de l\'établissement enregistrée.', position: rows[0] });
    } catch (err) {
      console.error('Erreur updatePosition géolocalisation:', err);
      return response.error(res, 'Erreur lors de l\'enregistrement de la position.', 500);
    }
  },

  async createTerrain(req, res) {
    try {
      const etablissementId = await getAdminEtablissementId(req.user.id);
      if (!etablissementId) return response.error(res, 'Établissement non trouvé.', 404);

      const nom = String(req.body.nom || '').trim().slice(0, 150);
      const position = parsePosition(req.body.latitude, req.body.longitude);
      if (!nom || !position) return response.error(res, 'Le nom et la position GPS du terrain sont obligatoires.', 400);

      const { rows } = await db.query(
        `INSERT INTO terrains_eps (etablissement_id, nom, latitude, longitude, rayon_metres)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nom, latitude, longitude, rayon_metres`,
        [etablissementId, nom, position.latitude, position.longitude, parseRayon(req.body.rayon_metres, 300)]
      );
      return res.status(201).json({ message: 'Terrain d\'EPS ajouté.', terrain: rows[0] });
    } catch (err) {
      console.error('Erreur createTerrain:', err);
      return response.error(res, 'Erreur lors de l\'ajout du terrain.', 500);
    }
  },

  async deleteTerrain(req, res) {
    try {
      const etablissementId = await getAdminEtablissementId(req.user.id);
      const { rowCount } = await db.query(
        'DELETE FROM terrains_eps WHERE id = $1 AND etablissement_id = $2',
        [req.params.id, etablissementId]
      );
      if (rowCount === 0) return response.error(res, 'Terrain introuvable dans votre établissement.', 404);
      return res.json({ message: 'Terrain d\'EPS supprimé.' });
    } catch (err) {
      console.error('Erreur deleteTerrain:', err);
      return response.error(res, 'Erreur lors de la suppression du terrain.', 500);
    }
  },
};

module.exports = geolocalisationController;
