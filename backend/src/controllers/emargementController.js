const EmargementModel = require('../models/emargementModel');
const db = require('../config/db');
const { getAdminEtablissementId, isProfAffiliated, isProfOfClasse } = require('../middleware/access');
const { parsePosition, checkInsideRadius } = require('../utils/geo');

const isValidUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val));

const EmargementController = {
  // 1. Obtenir le flux QR Code Live 20s (pour le surveillant)
  async getLiveQrToken(req, res) {
    try {
      let { etablissementId } = req.params;

      if (!etablissementId || !isValidUuid(etablissementId)) {
        // Résoudre l'établissement actif ou le premier en base
        const { rows: anyEtab } = await db.query('SELECT id FROM etablissements ORDER BY created_at ASC LIMIT 1');
        if (anyEtab.length > 0) {
          etablissementId = anyEtab[0].id;
        } else {
          return res.status(400).json({ success: false, error: 'Aucun établissement configuré.' });
        }
      }

      const qrData = EmargementModel.generateLiveQrToken(etablissementId);
      return res.json({ success: true, etablissementId, ...qrData });
    } catch (err) {
      console.error('Erreur getLiveQrToken:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Scanner un Émargement par le Prof (QR Code 20s + position dans l'établissement)
  async scanEmargement(req, res) {
    try {
      const profId = req.user.id;
      const { token, classeId, matiereCode, matiereNom, heureDebut, heureFin, latitude, longitude, precision } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token QR Code manquant' });
      }

      // L'établissement est celui encodé dans le QR Code, jamais celui envoyé par le client
      let etablissementId = null;
      try {
        etablissementId = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))?.etabId || null;
      } catch (e) {
        etablissementId = null;
      }
      if (!isValidUuid(etablissementId)) {
        return res.status(400).json({ success: false, error: 'QR Code invalide.' });
      }

      const verification = EmargementModel.verifyQrToken(etablissementId, token);
      if (!verification.valid) {
        return res.status(400).json({ success: false, error: verification.reason });
      }

      if (!(await isProfAffiliated(profId, etablissementId))) {
        return res.status(403).json({ success: false, error: 'Vous n\'êtes pas rattaché à cet établissement.' });
      }

      // Le professeur doit se trouver dans le rayon autorisé autour de l'établissement
      const position = parsePosition(latitude, longitude, precision);
      if (!position) {
        return res.status(400).json({ success: false, error: 'Position GPS requise : autorisez la localisation pour émarger.' });
      }
      const { rows: etabRows } = await db.query(
        'SELECT latitude, longitude, rayon_emargement_metres FROM etablissements WHERE id = $1',
        [etablissementId]
      );
      const etab = etabRows[0];
      if (!etab || etab.latitude === null || etab.longitude === null) {
        return res.status(409).json({
          success: false,
          error: 'La position GPS de l\'établissement n\'est pas encore enregistrée. Contactez l\'administration.'
        });
      }
      const geo = checkInsideRadius(position, etab, etab.rayon_emargement_metres, 'de l\'établissement');
      if (!geo.ok) {
        return res.status(403).json({ success: false, error: geo.message });
      }

      // Classe retenue uniquement si le professeur y enseigne
      const targetClasseId = isValidUuid(classeId) && await isProfOfClasse(profId, classeId) ? classeId : null;

      const seance = await EmargementModel.findOrCreateSeance(
        profId, etablissementId, targetClasseId, matiereCode || 'GEN', matiereNom || 'Cours Général', heureDebut || '08:00', heureFin || '10:00', 'REGULIER'
      );

      const emargement = await EmargementModel.createEmargement(
        seance.id, profId, etablissementId, 'QR_SCAN_20S', position.latitude, position.longitude, geo.distance, token
      );

      return res.json({
        success: true,
        message: `Présence physique émargée avec succès (${geo.distance} m de l'établissement) ! N'oubliez pas de renseigner le cahier de texte pour valider définitivement la séance.`,
        seance,
        emargement
      });
    } catch (err) {
      console.error('Erreur scanEmargement:', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de l\'émargement.' });
    }
  },

  // 3. Mode Terrain EPS : position comparée au terrain d'EPS déclaré par l'établissement
  // (un terrain peut se trouver à plusieurs kilomètres de l'établissement)
  async emargerEpsTerrain(req, res) {
    try {
      const profId = req.user.id;
      const { terrainId, classeId, heureDebut, heureFin, latitude, longitude, precision } = req.body;

      if (!isValidUuid(terrainId)) {
        return res.status(400).json({ success: false, error: 'Veuillez choisir le terrain d\'EPS où se déroule la séance.' });
      }
      const { rows: terrainRows } = await db.query('SELECT * FROM terrains_eps WHERE id = $1', [terrainId]);
      const terrain = terrainRows[0];
      if (!terrain) {
        return res.status(404).json({ success: false, error: 'Terrain d\'EPS introuvable.' });
      }
      if (!(await isProfAffiliated(profId, terrain.etablissement_id))) {
        return res.status(403).json({ success: false, error: 'Vous n\'êtes pas rattaché à l\'établissement de ce terrain.' });
      }

      const position = parsePosition(latitude, longitude, precision);
      if (!position) {
        return res.status(400).json({ success: false, error: 'Position GPS requise : autorisez la localisation pour émarger.' });
      }
      const geo = checkInsideRadius(position, terrain, terrain.rayon_metres, `du terrain « ${terrain.nom} »`);
      if (!geo.ok) {
        return res.status(403).json({ success: false, error: geo.message });
      }

      const targetClasseId = isValidUuid(classeId) && await isProfOfClasse(profId, classeId) ? classeId : null;

      const seance = await EmargementModel.findOrCreateSeance(
        profId, terrain.etablissement_id, targetClasseId, 'EPS', 'Éducation Physique & Sportive',
        heureDebut || '08:00', heureFin || '10:00', 'EPS_OUTDOOR'
      );

      const emargement = await EmargementModel.createEmargement(
        seance.id, profId, terrain.etablissement_id, 'EPS_GPS_TERRAIN', position.latitude, position.longitude, geo.distance, 'EPS_GPS_VALIDATED', terrain.id
      );

      return res.json({
        success: true,
        message: `Émargement EPS validé sur le terrain « ${terrain.nom} » (${geo.distance} m).`,
        seance,
        emargement
      });
    } catch (err) {
      console.error('Erreur emargerEpsTerrain:', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de l\'émargement EPS.' });
    }
  },

  // Terrains d'EPS d'un établissement, pour le choix du professeur
  async listTerrainsEps(req, res) {
    try {
      const { rows } = await db.query(
        'SELECT id, nom, latitude, longitude, rayon_metres FROM terrains_eps WHERE etablissement_id = $1 ORDER BY nom',
        [req.params.etablissementId]
      );
      return res.json({ success: true, terrains: rows });
    } catch (err) {
      console.error('Erreur listTerrainsEps:', err);
      return res.status(500).json({ success: false, error: 'Erreur lors du chargement des terrains d\'EPS.' });
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
      const { seanceId } = req.body;
      // L'établissement est celui de l'administrateur connecté, jamais celui envoyé par le client
      const etablissementId = await getAdminEtablissementId(req.user.id);
      const approved = etablissementId && await EmargementModel.approveRattrapage(seanceId, etablissementId);
      if (!approved) {
        return res.status(404).json({ success: false, error: 'Séance introuvable dans votre établissement.' });
      }

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
  },

  // 10. Obtenir les statistiques et l'historique d'émargement de l'enseignant connecté
  async getMyStats(req, res) {
    try {
      const profId = req.user.id;

      // 1. Calcul du Score 1000
      const scoreData = await EmargementModel.calculateProfScore1000(profId);

      // 2. Statistiques des séances
      const { rows: statsRows } = await db.query(`
        SELECT 
          COUNT(*) as total_seances,
          COUNT(*) filter (where statut IN ('EMARGE_PRESENCE', 'VALIDE_COMPLET')) as seances_effectuees,
          COUNT(*) filter (where statut = 'VALIDE_COMPLET') as cahiers_complets,
          COUNT(*) filter (where date_seance = CURRENT_DATE) as seances_aujourdhui
        FROM seances_cours 
        WHERE professeur_id = $1
      `, [profId]);

      const stat = statsRows[0] || {};
      const totalSeances = parseInt(stat.total_seances || 0, 10);
      const seancesEffectuees = parseInt(stat.seances_effectuees || 0, 10);
      const cahiersComplets = parseInt(stat.cahiers_complets || 0, 10);

      // Calcul des heures (2h par séance en moyenne)
      const quotaHeures = totalSeances > 0 ? (totalSeances * 2) : 0;
      const heuresEffectuees = seancesEffectuees * 2;
      const tauxEmargement = totalSeances > 0 ? Math.round((seancesEffectuees / totalSeances) * 100) : null;
      const tauxCahier = seancesEffectuees > 0 ? Math.round((cahiersComplets / seancesEffectuees) * 100) : null;

      // 3. Dernières séances & émargements
      const { rows: recentSeances } = await db.query(`
        SELECT s.*, e.mode_emargement, e.horodatage_scan, e.statut as statut_emargement,
               c.nom as classe_nom, c.niveau as classe_niveau, et.nom as nom_etablissement
        FROM seances_cours s
        LEFT JOIN emargements e ON s.id = e.seance_id
        LEFT JOIN classes c ON s.classe_id = c.id
        LEFT JOIN etablissements et ON s.etablissement_id = et.id
        WHERE s.professeur_id = $1
        ORDER BY s.date_seance DESC, s.heure_debut DESC
        LIMIT 10
      `, [profId]);

      // 4. Séances du jour
      const { rows: todaySeances } = await db.query(`
        SELECT s.*, c.nom as classe_nom, et.nom as nom_etablissement
        FROM seances_cours s
        LEFT JOIN classes c ON s.classe_id = c.id
        LEFT JOIN etablissements et ON s.etablissement_id = et.id
        WHERE s.professeur_id = $1 AND s.date_seance = CURRENT_DATE
        ORDER BY s.heure_debut ASC
      `, [profId]);

      return res.json({
        success: true,
        score1000: scoreData,
        metrics: {
          heuresEffectuees,
          heuresTotal: quotaHeures,
          tauxEmargement,
          tauxCahier,
          noteEleves: scoreData.breakdown?.avgGlobalScore ?? null,
          totalVotes: scoreData.breakdown?.totalVotes ?? 0,
          totalSeances,
          seancesEffectuees,
          cahiersComplets
        },
        recentSeances,
        todaySeances
      });
    } catch (err) {
      console.error('Erreur getMyStats:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = EmargementController;
