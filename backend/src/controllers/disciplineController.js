const DisciplineModel = require('../models/disciplineModel');
const { sendParentNotification } = require('../utils/notificationService');
const { generateDossierScolairePdf } = require('../utils/dossierPdfService');
const response = require('../utils/response');
const db = require('../config/db');

// Helper pour trouver l'etablissement_id de l'utilisateur
async function resolveEtablissementId(user, eleveId = null) {
  if (user.etablissement_id) return user.etablissement_id;
  
  if (user.role === 'ADMIN_ETABLISSEMENT') {
    const res = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [user.id]);
    if (res.rows[0]) return res.rows[0].id;
  } else if (user.role === 'PROFESSEUR') {
    const res = await db.query('SELECT etablissement_id FROM professeurs WHERE user_id = $1 OR id = $1', [user.id]);
    if (res.rows[0]?.etablissement_id) return res.rows[0].etablissement_id;
  }
  
  if (eleveId) {
    const res = await db.query('SELECT etablissement_id FROM eleves WHERE id = $1', [eleveId]);
    if (res.rows[0]?.etablissement_id) return res.rows[0].etablissement_id;
  }

  return null;
}

exports.createSignalement = async (req, res) => {
  try {
    const {
      eleve_id,
      type_action,
      gravite,
      motif,
      description,
      date_rendez_vous,
      lieu_rendez_vous,
      matiere_code,
      matiere_nom
    } = req.body;

    if (!eleve_id || !type_action || !motif) {
      return response.error(res, 'Veuillez fournir l\'élève, le type d\'action et le motif.', 400);
    }

    const etablissement_id = await resolveEtablissementId(req.user, eleve_id);
    const auteur_type = req.user.role === 'PROFESSEUR' ? 'PROFESSEUR' : 'ETABLISSEMENT';

    // Récupérer les infos de l'élève & parent pour la notification
    const eleveRes = await db.query(
      `SELECT e.*, et.nom as etablissement_nom 
       FROM eleves e 
       LEFT JOIN etablissements et ON e.etablissement_id = et.id 
       WHERE e.id = $1`, 
      [eleve_id]
    );
    const eleveInfo = eleveRes.rows[0] || {};

    // Déclencher l'envoi de notification (SMS / Email)
    const notifResult = await sendParentNotification({
      type_action,
      eleve_nom: eleveInfo.nom,
      eleve_prenom: eleveInfo.prenom,
      parent_email: eleveInfo.email_parent || eleveInfo.email,
      parent_telephone: eleveInfo.telephone_parent || eleveInfo.telephone,
      motif,
      description,
      date_rendez_vous,
      lieu_rendez_vous,
      etablissement_nom: eleveInfo.etablissement_nom
    });

    const signalement = await DisciplineModel.createSignalement({
      etablissement_id,
      eleve_id,
      auteur_id: req.user.id,
      auteur_type,
      type_action,
      gravite,
      matiere_code,
      matiere_nom,
      motif,
      description,
      date_rendez_vous,
      lieu_rendez_vous,
      notifie_email: notifResult.emailSent,
      notifie_sms: notifResult.smsSent
    });

    return response.success(res, signalement, 'Élément enregistré et notification transmise avec succès.', 201);
  } catch (err) {
    console.error('Erreur createSignalement:', err);
    return response.error(res, 'Erreur lors de la création du signalement/convocation.');
  }
};

exports.getSignalementsEtablissement = async (req, res) => {
  try {
    const etablissementId = await resolveEtablissementId(req.user);
    if (!etablissementId) {
      return response.error(res, 'Établissement non trouvé.', 404);
    }

    const { type_action, statut } = req.query;
    const signalements = await DisciplineModel.getByEtablissement(etablissementId, { type_action, statut });

    return response.success(res, signalements);
  } catch (err) {
    console.error('Erreur getSignalementsEtablissement:', err);
    return response.error(res, 'Erreur lors de la récupération du registre Vie Scolaire.');
  }
};

exports.getSignalementsProfesseur = async (req, res) => {
  try {
    const etablissementId = await resolveEtablissementId(req.user);
    const signalements = await DisciplineModel.getByProfesseur(req.user.id, etablissementId);
    return response.success(res, signalements);
  } catch (err) {
    console.error('Erreur getSignalementsProfesseur:', err);
    return response.error(res, 'Erreur lors de la récupération de vos signalements.');
  }
};

exports.getSignalementsEleve = async (req, res) => {
  try {
    let eleveId = req.params.id;

    // Si c'est un élève connecté qui demande son propre profil
    if (req.user.role === 'ELEVE' || eleveId === 'me') {
      const eleveRes = await db.query('SELECT id FROM eleves WHERE user_id = $1', [req.user.id]);
      if (!eleveRes.rows[0]) {
        return response.error(res, 'Profil élève introuvable.', 404);
      }
      eleveId = eleveRes.rows[0].id;
    }

    const isStudentView = req.user.role === 'ELEVE';
    const dossierComplet = await DisciplineModel.getEleveDossierComplet(eleveId);
    if (!dossierComplet) {
      return response.error(res, 'Élève non trouvé.', 404);
    }

    const signalementsFormatted = await DisciplineModel.getByEleve(eleveId, isStudentView);

    return response.success(res, {
      eleve: dossierComplet.eleve,
      signalements: signalementsFormatted
    });
  } catch (err) {
    console.error('Erreur getSignalementsEleve:', err);
    return response.error(res, 'Erreur lors de la récupération du dossier de l\'élève.');
  }
};

exports.updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, compte_rendu_rdv } = req.body;

    if (!statut) {
      return response.error(res, 'Veuillez préciser le nouveau statut.', 400);
    }

    const updated = await DisciplineModel.updateStatut(id, statut, compte_rendu_rdv);
    return response.success(res, updated, 'Statut mis à jour avec succès.');
  } catch (err) {
    console.error('Erreur updateStatut:', err);
    return response.error(res, 'Erreur lors de la mise à jour du statut.');
  }
};

exports.downloadDossierPdf = async (req, res) => {
  try {
    let eleveId = req.params.id;

    if (req.user.role === 'ELEVE' || eleveId === 'me') {
      const eleveRes = await db.query('SELECT id FROM eleves WHERE user_id = $1', [req.user.id]);
      if (!eleveRes.rows[0]) return response.error(res, 'Élève non trouvé.', 404);
      eleveId = eleveRes.rows[0].id;
    }

    const dossierData = await DisciplineModel.getEleveDossierComplet(eleveId);
    if (!dossierData || !dossierData.eleve) {
      return response.error(res, 'Dossier élève introuvable.', 404);
    }

    await generateDossierScolairePdf(
      dossierData.eleve,
      dossierData.signalements,
      { nom: dossierData.eleve.etablissement_nom, region: dossierData.eleve.region, ville: dossierData.eleve.ville },
      res
    );
  } catch (err) {
    console.error('Erreur downloadDossierPdf:', err);
    return response.error(res, 'Erreur lors de la génération du dossier PDF.');
  }
};
