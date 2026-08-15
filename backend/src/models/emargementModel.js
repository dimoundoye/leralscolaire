const db = require('../config/db');
const crypto = require('crypto');

const EmargementModel = {
  // 1. Secret unique d'établissement pour TOTP 20s
  getEtablissementSecret(etablissementId) {
    const masterSecret = process.env.JWT_SECRET || 'leralscolaire_secret_key_2026';
    return crypto.createHmac('sha256', masterSecret).update(String(etablissementId)).digest('hex');
  },

  // 2. Générer le token QR Code TOTP 20s
  generateLiveQrToken(etablissementId) {
    const timestamp20s = Math.floor(Date.now() / 20000); // Tranche de 20 secondes
    const secret = this.getEtablissementSecret(etablissementId);
    
    const payload = `${etablissementId}:${timestamp20s}`;
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex').substring(0, 16);

    const token = Buffer.from(JSON.stringify({
      etabId: etablissementId,
      time: timestamp20s,
      hash: hmac
    })).toString('base64');

    return {
      token,
      expiresInSeconds: 20 - (Math.floor(Date.now() / 1000) % 20),
      timestamp20s
    };
  },

  // 3. Valider un Token QR Code 20s
  verifyQrToken(etablissementId, tokenString) {
    try {
      const decoded = JSON.parse(Buffer.from(tokenString, 'base64').toString('utf8'));
      const current20s = Math.floor(Date.now() / 20000);

      if (decoded.etabId !== String(etablissementId)) {
        return { valid: false, reason: "Ce QR Code appartient à un autre établissement !" };
      }

      if (Math.abs(current20s - decoded.time) > 1) {
        return { valid: false, reason: "QR Code expiré (plus de 20 secondes). Veuillez rescanner !" };
      }

      const secret = this.getEtablissementSecret(etablissementId);
      const expectedPayload = `${etablissementId}:${decoded.time}`;
      const expectedHmac = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex').substring(0, 16);

      if (decoded.hash !== expectedHmac) {
        return { valid: false, reason: "Signature du QR Code invalide ou corrompue." };
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, reason: "Format de QR Code illisible." };
    }
  },

  // 4. Créer ou récupérer une séance de cours
  async findOrCreateSeance(profId, etablissementId, classeId, matiereCode, matiereNom, heureDebut, heureFin, typeSeance = 'REGULIER') {
    const today = new Date().toISOString().split('T')[0];

    const { rows: existing } = await db.query(`
      SELECT * FROM seances_cours 
      WHERE professeur_id = $1 AND etablissement_id = $2 AND date_seance = $3 
        AND heure_debut = $4 LIMIT 1
    `, [profId, etablissementId, today, heureDebut]);

    if (existing.length > 0) {
      return existing[0];
    }

    const { rows: inserted } = await db.query(`
      INSERT INTO seances_cours (
        etablissement_id, professeur_id, classe_id, matiere_code, matiere_nom, 
        date_seance, heure_debut, heure_fin, type_seance, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'EMARGE_PRESENCE')
      RETURNING *
    `, [etablissementId, profId, classeId, matiereCode, matiereNom, today, heureDebut, heureFin, typeSeance]);

    return inserted[0];
  },

  // 5. Enregistrer un Émargement
  async createEmargement(seanceId, profId, etablissementId, modeEmargement, lat, lng, distMetres, tokenUtilise) {
    const { rows } = await db.query(`
      INSERT INTO emargements (
        seance_id, professeur_id, etablissement_id, mode_emargement, 
        latitude, longitude, distance_etablissement_metres, token_totp_utilise, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'VALIDE')
      RETURNING *
    `, [seanceId, profId, etablissementId, modeEmargement, lat, lng, distMetres, tokenUtilise]);

    await db.query(`
      UPDATE seances_cours SET statut = 'EMARGE_PRESENCE', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [seanceId]);

    return rows[0];
  },

  // 6. Remplir le Cahier de Texte
  async completeSeanceCahierTexte(seanceId, profId, titre, contenu, devoirs) {
    const { rows } = await db.query(`
      UPDATE seances_cours 
      SET cahier_texte_titre = $1, 
          cahier_texte_contenu = $2, 
          cahier_texte_devoirs = $3,
          date_remplissage_cahier = CURRENT_TIMESTAMP,
          statut = 'VALIDE_COMPLET',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND professeur_id = $5
      RETURNING *
    `, [titre, contenu, devoirs, seanceId, profId]);

    return rows[0];
  },

  // 7. Demande et Approbation des cours de Rattrapage
  async demandRattrapage(profId, etablissementId, classeId, matiereCode, matiereNom, dateSeance, heureDebut, heureFin, motif) {
    const { rows } = await db.query(`
      INSERT INTO seances_cours (
        etablissement_id, professeur_id, classe_id, matiere_code, matiere_nom,
        date_seance, heure_debut, heure_fin, type_seance, statut_rattrapage, motif_rattrapage, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'RATTRAPAGE', 'DEMANDE', $9, 'PROGRAMME')
      RETURNING *
    `, [etablissementId, profId, classeId, matiereCode, matiereNom, dateSeance, heureDebut, heureFin, motif]);

    return rows[0];
  },

  async approveRattrapage(seanceId, etablissementId) {
    const { rows } = await db.query(`
      UPDATE seances_cours
      SET statut_rattrapage = 'APPROUVE', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND etablissement_id = $2
      RETURNING *
    `, [seanceId, etablissementId]);

    return rows[0];
  },

  // 8. Calcul du Score National Enseignant sur 1 000 Points
  async calculateProfScore1000(profId) {
    const { rows: statsSeances } = await db.query(`
      SELECT 
        COUNT(*) filter (where statut IN ('EMARGE_PRESENCE', 'VALIDE_COMPLET')) as effectues,
        COUNT(*) as total
      FROM seances_cours WHERE professeur_id = $1
    `, [profId]);

    const total = parseInt(statsSeances[0]?.total || 0, 10);
    const effectues = parseInt(statsSeances[0]?.effectues || 0, 10);
    const ratioAssiduite = total > 0 ? (effectues / total) : 0.95;
    const ptsAssiduite = Math.round(ratioAssiduite * 350);

    const { rows: statsCahier } = await db.query(`
      SELECT COUNT(*) as complets FROM seances_cours 
      WHERE professeur_id = $1 AND statut = 'VALIDE_COMPLET'
    `, [profId]);
    const complets = parseInt(statsCahier[0]?.complets || 0, 10);
    const ratioCahier = total > 0 ? (complets / total) : 0.90;
    const ptsCahier = Math.round(ratioCahier * 250);

    const { rows: profInfo } = await db.query(`
      SELECT note_inspection, diplome_eleve, est_eligible_jury_bac, nombre_participations_bac
      FROM professeurs WHERE id = $1
    `, [profId]);

    const noteInspection = parseFloat(profInfo[0]?.note_inspection || 16.5);
    const ptsInspection = Math.round((noteInspection / 20.0) * 200);

    const { rows: evalStats } = await db.query(`
      SELECT 
        AVG(q1_pedagogie) as avg_q1,
        AVG(q2_assiduite) as avg_q2,
        AVG(q3_ecoute) as avg_q3,
        AVG(q4_corrections) as avg_q4,
        AVG(q5_climat) as avg_q5,
        COUNT(*) as total_votes
      FROM evaluations_eleves WHERE professeur_id = $1
    `, [profId]);

    let avgGlobalScore = 4.2;
    if (evalStats[0] && parseInt(evalStats[0].total_votes, 10) > 0) {
      const q1 = parseFloat(evalStats[0].avg_q1 || 4);
      const q2 = parseFloat(evalStats[0].avg_q2 || 4);
      const q3 = parseFloat(evalStats[0].avg_q3 || 4);
      const q4 = parseFloat(evalStats[0].avg_q4 || 4);
      const q5 = parseFloat(evalStats[0].avg_q5 || 4);
      avgGlobalScore = (q1 + q2 + q3 + q4 + q5) / 5.0;
    }
    const ptsEleves = Math.round((avgGlobalScore / 5.0) * 100);

    const participations = parseInt(profInfo[0]?.nombre_participations_bac || 3, 10);
    const ptsExperience = Math.min(100, 50 + (participations * 10));

    const totalScore = Math.min(1000, ptsAssiduite + ptsCahier + ptsInspection + ptsEleves + ptsExperience);

    let gradeTier = 'BRONZE';
    let badgeLabel = 'Professeur Titulaire';
    if (totalScore >= 880) {
      gradeTier = 'OR';
      badgeLabel = 'Professeur Émérite (Prioritaire Président de Jury)';
    } else if (totalScore >= 750) {
      gradeTier = 'ARGENT';
      badgeLabel = 'Professeur Senior (Éligible Correcteur Principal)';
    }

    return {
      totalScore,
      gradeTier,
      badgeLabel,
      breakdown: {
        ptsAssiduite,
        ptsCahier,
        ptsInspection,
        ptsEleves,
        ptsExperience,
        avgGlobalScore: avgGlobalScore.toFixed(1)
      }
    };
  },

  // 9. Carte d'Identité Numérique Enseignant pour l'Office du BAC
  async getProfFullIdentityCard(profId) {
    const { rows: profDetails } = await db.query(`
      SELECT 
        u.id, u.email, u.identifiant_national, 
        p.nom, p.prenom, p.telephone, p.matiere_principale, p.matricule_national,
        p.note_inspection, p.diplome_eleve, p.parcours_academique, p.photo_url,
        p.est_eligible_jury_bac, p.nombre_participations_bac
      FROM users u
      LEFT JOIN professeurs p ON u.id = p.id
      WHERE u.id = $1
    `, [profId]);

    if (!profDetails[0]) return null;

    const prof = profDetails[0];

    const { rows: classesEnseignees } = await db.query(`
      SELECT DISTINCT c.id, c.nom as classe_nom, c.niveau, e.nom_etablissement, e.ville
      FROM seances_cours s
      JOIN classes c ON s.classe_id = c.id
      JOIN etablissements e ON s.etablissement_id = e.id
      WHERE s.professeur_id = $1
      ORDER BY c.niveau DESC, c.nom ASC
    `, [profId]);

    const scoreData = await this.calculateProfScore1000(profId);

    const { rows: evalDetail } = await db.query(`
      SELECT 
        COALESCE(ROUND(AVG(q1_pedagogie), 1), 4.5) as q1,
        COALESCE(ROUND(AVG(q2_assiduite), 1), 4.7) as q2,
        COALESCE(ROUND(AVG(q3_ecoute), 1), 4.3) as q3,
        COALESCE(ROUND(AVG(q4_corrections), 1), 4.4) as q4,
        COALESCE(ROUND(AVG(q5_climat), 1), 4.6) as q5,
        COUNT(*) as total_votes
      FROM evaluations_eleves WHERE professeur_id = $1
    `, [profId]);

    return {
      professeur: prof,
      classesEnseignees,
      score1000: scoreData,
      evaluationsElevesDetail: evalDetail[0]
    };
  }
};

module.exports = EmargementModel;
