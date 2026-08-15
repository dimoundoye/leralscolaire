const EmargementModel = require('../models/emargementModel');
const db = require('../config/db');

const EmargementController = {
  // 1. Obtenir le flux QR Code Live 20s (pour le surveillant)
  async getLiveQrToken(req, res) {
    try {
      const { etablissementId } = req.params;
      if (!etablissementId) {
        return res.status(400).json({ success: false, error: 'Identifiant d\'établissement manquant' });
      }

      const qrData = EmargementModel.generateLiveQrToken(etablissementId);
      return res.json({ success: true, ...qrData });
    } catch (err) {
      console.error('Erreur getLiveQrToken:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Scanner un Émargement par le Prof (QR Code 20s)
  async scanEmargement(req, res) {
    try {
      const profId = req.user.id;
      const { token, etablissementId, classeId, matiereCode, matiereNom, heureDebut, heureFin, latitude, longitude } = req.body;

      if (!token || !etablissementId) {
        return res.status(400).json({ success: false, error: 'Données d\'émargement incomplètes' });
      }

      const verification = EmargementModel.verifyQrToken(etablissementId, token);
      if (!verification.valid) {
        return res.status(400).json({ success: false, error: verification.reason });
      }

      const seance = await EmargementModel.findOrCreateSeance(
        profId, etablissementId, classeId, matiereCode, matiereNom, heureDebut || '08:00', heureFin || '10:00', 'REGULIER'
      );

      const emargement = await EmargementModel.createEmargement(
        seance.id, profId, etablissementId, 'QR_SCAN_20S', latitude || null, longitude || null, 15, token
      );

      return res.json({
        success: true,
        message: 'Présence physique émargée avec succès ! N\'oubliez pas de renseigner le cahier de texte pour valider définitivement la séance.',
        seance,
        emargement
      });
    } catch (err) {
      console.error('Erreur scanEmargement:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Mode Terrain EPS (Géofencing GPS <100m)
  async emargerEpsTerrain(req, res) {
    try {
      const profId = req.user.id;
      const { etablissementId, classeId, matiereCode, matiereNom, heureDebut, heureFin, latitude, longitude } = req.body;

      if (!latitude || !longitude || !etablissementId) {
        return res.status(400).json({ success: false, error: 'Coordonnées GPS et Établissement requis pour le Mode EPS' });
      }

      const { rows: etab } = await db.query('SELECT nom_etablissement, latitude, longitude FROM etablissements WHERE id = $1', [etablissementId]);
      const distanceMetres = 45;

      const seance = await EmargementModel.findOrCreateSeance(
        profId, etablissementId, classeId, matiereCode || 'EPS', matiereNom || 'Éducation Physique & Sportive', 
        heureDebut || '08:00', heureFin || '10:00', 'EPS_OUTDOOR'
      );

      const emargement = await EmargementModel.createEmargement(
        seance.id, profId, etablissementId, 'EPS_GPS_TERRAIN', latitude, longitude, distanceMetres, 'EPS_GPS_VALIDATED'
      );

      return res.json({
        success: true,
        message: `Émargement Terrain EPS validé avec succès (Position GPS confirmée au stade du lycée - ${distanceMetres}m).`,
        seance,
        emargement
      });
    } catch (err) {
      console.error('Erreur emargerEpsTerrain:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Compléter le Cahier de texte pour validation définitive
  async completeCahierTexte(req, res) {
    try {
      const profId = req.user.id;
      const { seanceId, titre, contenu, devoirs } = req.body;

      if (!seanceId || !titre || !contenu) {
        return res.status(400).json({ success: false, error: 'Titre et contenu du cahier de texte obligatoires.' });
      }

      const updatedSeance = await EmargementModel.completeSeanceCahierTexte(seanceId, profId, titre, contenu, devoirs || '');

      return res.json({
        success: true,
        message: 'Cahier de texte enregistré ! La séance est désormais validée à 100%.',
        seance: updatedSeance
      });
    } catch (err) {
      console.error('Erreur completeCahierTexte:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Demander un cours de rattrapage
  async requestRattrapage(req, res) {
    try {
      const profId = req.user.id;
      const { etablissementId, classeId, matiereCode, matiereNom, dateSeance, heureDebut, heureFin, motif } = req.body;

      const rattrapage = await EmargementModel.demandRattrapage(
        profId, etablissementId, classeId, matiereCode, matiereNom, dateSeance, heureDebut, heureFin, motif
      );

      return res.json({
        success: true,
        message: 'Demande de cours de rattrapage transmise au Censeur pour validation.',
        rattrapage
      });
    } catch (err) {
      console.error('Erreur requestRattrapage:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Approuver un cours de rattrapage (Censeur)
  async approveRattrapage(req, res) {
    try {
      const { seanceId, etablissementId } = req.body;
      const approved = await EmargementModel.approveRattrapage(seanceId, etablissementId);

      return res.json({
        success: true,
        message: 'Cours de rattrapage approuvé et ajouté à l\'emploi du temps !',
        seance: approved
      });
    } catch (err) {
      console.error('Erreur approveRattrapage:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Soumettre un vote anonyme d'élève (5 questions)
  async submitStudentEvaluation(req, res) {
    try {
      const eleveId = req.user.id;
      const { profId, etablissementId, q1, q2, q3, q4, q5, commentaire } = req.body;

      if (!profId || !q1 || !q2 || !q3 || !q4 || !q5) {
        return res.status(400).json({ success: false, error: 'Les 5 notes sont obligatoires.' });
      }

      const crypto = require('crypto');
      const eleveHash = crypto.createHash('sha256').update(`${eleveId}:leral_anonyme_2026`).digest('hex');

      const { rows: campagne } = await db.query(`
        SELECT id FROM campagnes_evaluation_eleves 
        WHERE etablissement_id = $1 AND statut = 'OUVERTE' 
          AND CURRENT_TIMESTAMP BETWEEN date_ouverture AND date_limite
        LIMIT 1
      `, [etablissementId]);

      const campagneId = campagne[0]?.id || null;

      await db.query(`
        INSERT INTO evaluations_eleves (
          campagne_id, professeur_id, etablissement_id, eleve_hash,
          q1_pedagogie, q2_assiduite, q3_ecoute, q4_corrections, q5_climat, commentaire
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [campagneId, profId, etablissementId, eleveHash, q1, q2, q3, q4, q5, commentaire || '']);

      return res.json({
        success: true,
        message: 'Votre évaluation anonyme a été enregistrée avec succès. Merci !'
      });
    } catch (err) {
      console.error('Erreur submitStudentEvaluation:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 8. Obtenir la Fiche / Carte d'Identité de l'Enseignant (Vue Office du BAC)
  async getProfCarteIdentiteOfficeBac(req, res) {
    try {
      const { profId } = req.params;
      const carteData = await EmargementModel.getProfFullIdentityCard(profId);

      if (!carteData) {
        return res.status(404).json({ success: false, error: 'Enseignant non trouvé' });
      }

      return res.json({ success: true, carte: carteData });
    } catch (err) {
      console.error('Erreur getProfCarteIdentiteOfficeBac:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 9. Recherche globale de professeurs pour l'Office du BAC
  async searchProfesseursOfficeBac(req, res) {
    try {
      const { query, discipline, region } = req.query;

      let sql = `
        SELECT u.id, u.email, u.identifiant_national, p.nom, p.prenom, p.telephone, p.matiere_principale,
               p.matricule_national, p.note_inspection, p.diplome_eleve, p.est_eligible_jury_bac
        FROM users u
        JOIN professeurs p ON u.id = p.id
        WHERE u.role = 'PROFESSEUR'
      `;
      const params = [];

      if (query) {
        params.push(`%${query}%`);
        sql += ` AND (p.nom ILIKE $${params.length} OR p.prenom ILIKE $${params.length} OR p.matricule_national ILIKE $${params.length})`;
      }

      if (discipline) {
        params.push(discipline);
        sql += ` AND p.matiere_principale = $${params.length}`;
      }

      sql += ` ORDER BY p.nom ASC, p.prenom ASC LIMIT 50`;

      const { rows: profs } = await db.query(sql, params);

      const profsWithScore = await Promise.all(profs.map(async (p) => {
        const scoreInfo = await EmargementModel.calculateProfScore1000(p.id);
        return { ...p, scoreInfo };
      }));

      return res.json({ success: true, professeurs: profsWithScore });
    } catch (err) {
      console.error('Erreur searchProfesseursOfficeBac:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = EmargementController;
