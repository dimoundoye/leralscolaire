// Contrôles d'accès par ressource (à utiliser après le middleware d'authentification).
// Principe : un utilisateur n'accède qu'aux données de son propre établissement.
const db = require('../config/db');

const forbidden = (res, message = 'Accès refusé.') => res.status(403).json({ message });

// Établissement administré par un compte ADMIN_ETABLISSEMENT
async function getAdminEtablissementId(userId) {
  const { rows } = await db.query('SELECT id FROM etablissements WHERE admin_id = $1', [userId]);
  return rows[0]?.id || null;
}

// Un professeur est rattaché (invitation acceptée) à l'établissement
async function isProfAffiliated(profId, etablissementId) {
  const { rows } = await db.query(
    "SELECT 1 FROM professeurs_etablissements WHERE professeur_id = $1 AND etablissement_id = $2 AND statut = 'ACCEPTE'",
    [profId, etablissementId]
  );
  return rows.length > 0;
}

// Un professeur enseigne dans la classe (et la matière si précisée), par affectation ou
// emploi du temps — même règle que ProfModel.getTeacherClasses
async function isProfOfClasse(profId, classeId, matiereId = null) {
  const { rows } = await db.query(
    `SELECT 1
     FROM (
       SELECT classe_id, matiere_id FROM professeur_matieres WHERE professeur_id = $1
       UNION
       SELECT classe_id, matiere_id FROM emplois_du_temps WHERE professeur_id = $1
     ) AS pm
     JOIN classes c1 ON pm.classe_id = c1.id
     JOIN classes c2 ON c1.nom = c2.nom AND c1.etablissement_id = c2.etablissement_id
     JOIN professeurs_etablissements pe
       ON pe.etablissement_id = c2.etablissement_id AND pe.professeur_id = $1 AND pe.statut = 'ACCEPTE'
     WHERE c2.id = $2 AND ($3::uuid IS NULL OR pm.matiere_id = $3)
     LIMIT 1`,
    [profId, classeId, matiereId]
  );
  return rows.length > 0;
}

// Un professeur enseigne la matière dans une classe où l'élève est inscrit
async function isProfOfEleve(profId, eleveId, matiereId) {
  const { rows } = await db.query('SELECT classe_id FROM inscription_classes WHERE eleve_id = $1', [eleveId]);
  for (const { classe_id } of rows) {
    if (await isProfOfClasse(profId, classe_id, matiereId)) return true;
  }
  return false;
}

/**
 * L'utilisateur peut-il consulter le dossier de cet élève ?
 * - OFFICE_BAC : tous les élèves
 * - ELEVE : uniquement lui-même
 * - ADMIN_ETABLISSEMENT : élèves de son établissement ; en lecture (allowIncomingTransfer),
 *   aussi l'élève dont le transfert vers son établissement est en attente (inspection du livret)
 * - PROFESSEUR : élèves des établissements auxquels il est rattaché (si allowProf)
 */
async function canAccessEleve(user, eleveId, { allowProf = false, allowIncomingTransfer = false } = {}) {
  if (user.role === 'OFFICE_BAC') return true;

  const { rows } = await db.query('SELECT user_id, etablissement_id FROM eleves WHERE id = $1', [eleveId]);
  const eleve = rows[0];
  if (!eleve) return false;

  if (user.role === 'ELEVE') return eleve.user_id === user.id;

  if (user.role === 'ADMIN_ETABLISSEMENT') {
    const etabId = await getAdminEtablissementId(user.id);
    if (!etabId) return false;
    if (eleve.etablissement_id === etabId) return true;
    if (!allowIncomingTransfer) return false;
    const { rows: transfer } = await db.query(
      "SELECT 1 FROM transferts_eleves WHERE eleve_id = $1 AND nouveau_etablissement_id = $2 AND statut_transfert = 'EN_ATTENTE'",
      [eleveId, etabId]
    );
    return transfer.length > 0;
  }

  if (user.role === 'PROFESSEUR' && allowProf) {
    return isProfAffiliated(user.id, eleve.etablissement_id);
  }

  return false;
}

/**
 * L'utilisateur peut-il accéder à cette classe ?
 * - ADMIN_ETABLISSEMENT : classes de son établissement
 * - PROFESSEUR : classes où il enseigne (si allowProf)
 */
async function canAccessClasse(user, classeId, { allowProf = false } = {}) {
  const { rows } = await db.query('SELECT etablissement_id FROM classes WHERE id = $1', [classeId]);
  if (!rows[0]) return false;

  if (user.role === 'ADMIN_ETABLISSEMENT') {
    return rows[0].etablissement_id === (await getAdminEtablissementId(user.id));
  }
  if (user.role === 'PROFESSEUR' && allowProf) {
    return isProfOfClasse(user.id, classeId);
  }
  return false;
}

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value));

// Wrapper commun : paramètre invalide ou accès refusé → 403, erreur → 500
function guard(check, message) {
  return async (req, res, next) => {
    try {
      if (await check(req)) return next();
      return forbidden(res, message);
    } catch (err) {
      console.error("Erreur contrôle d'accès :", err.message);
      return res.status(500).json({ message: "Erreur lors de la vérification des droits d'accès." });
    }
  };
}

const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role) ? next() : forbidden(res, 'Accès refusé pour votre rôle.');

// L'élève « me » est résolu par le contrôleur : seul un élève connecté peut l'utiliser.
const requireEleveAccess = (param, options) =>
  guard(async (req) => {
    const id = req.params[param];
    if (id === 'me') return req.user.role === 'ELEVE';
    return isUuid(id) && canAccessEleve(req.user, id, options);
  }, 'Accès refusé. Cet élève ne relève pas de votre établissement.');

const requireClasseAccess = (param, options) =>
  guard(async (req) => {
    const id = req.params[param];
    return isUuid(id) && canAccessClasse(req.user, id, options);
  }, 'Accès refusé. Cette classe ne relève pas de votre établissement.');

// Requêtes (fixes, non modifiables par le client) donnant l'établissement propriétaire d'un enregistrement
const OWNER_QUERIES = {
  pre_inscriptions: 'SELECT etablissement_id FROM pre_inscriptions WHERE id = $1',
  cahier_de_texte: 'SELECT etablissement_id FROM cahier_de_texte WHERE id = $1',
  documents_partages_recu:
    'SELECT destinataire_etablissement_id AS etablissement_id FROM documents_partages WHERE id = $1',
  historique_notes: `SELECT e.etablissement_id FROM historique_notes h
                     JOIN notes n ON h.note_id = n.id
                     JOIN eleves e ON n.eleve_id = e.id
                     WHERE h.id = $1`,
};

// L'enregistrement (table, :param) appartient à l'établissement de l'administrateur connecté
const requireOwnRecord = (table, param = 'id') =>
  guard(async (req) => {
    if (req.user.role !== 'ADMIN_ETABLISSEMENT') return false;
    const id = req.params[param];
    if (!/^[0-9a-z-]{1,64}$/i.test(String(id))) return false;
    const { rows } = await db.query(OWNER_QUERIES[table], [id]);
    return Boolean(rows[0]) && rows[0].etablissement_id === (await getAdminEtablissementId(req.user.id));
  }, 'Accès refusé. Cet élément ne relève pas de votre établissement.');

// Professeur enseignant dans la classe (et la matière, si le paramètre est fourni)
const requireProfOfClasse = (classeParam, matiereParam = null) =>
  guard(async (req) => {
    const classeId = req.params[classeParam];
    const matiereId = matiereParam ? req.params[matiereParam] : null;
    if (req.user.role !== 'PROFESSEUR' || !isUuid(classeId)) return false;
    if (matiereParam && !isUuid(matiereId)) return false;
    return isProfOfClasse(req.user.id, classeId, matiereId);
  }, "Accès refusé. Vous n'enseignez pas dans cette classe.");

// Professeur rattaché à l'établissement passé en paramètre
const requireProfAffiliation = (param) =>
  guard(async (req) => {
    const id = req.params[param];
    return req.user.role === 'PROFESSEUR' && isUuid(id) && isProfAffiliated(req.user.id, id);
  }, "Accès refusé. Vous n'êtes pas rattaché à cet établissement.");

module.exports = {
  requireRole,
  requireEleveAccess,
  requireClasseAccess,
  requireProfAffiliation,
  requireProfOfClasse,
  requireOwnRecord,
  isProfAffiliated,
  canAccessEleve,
  canAccessClasse,
  getAdminEtablissementId,
  isProfOfClasse,
  isProfOfEleve,
};
