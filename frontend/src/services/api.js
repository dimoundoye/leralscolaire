import { syncEngine } from './syncEngine';
import { API_BASE_URL as BASE_URL } from '../config/api';
import { apiFetch } from './http';

const API_BASE_URL = `${BASE_URL}/api`;

// La session est portée par un cookie httpOnly envoyé automatiquement : aucun jeton à ajouter
const getHeaders = () => ({ 'Content-Type': 'application/json' });

const getUploadHeaders = () => ({});

const normalizeCacheKey = (url) => {
  try {
    if (typeof window !== 'undefined' && (url.startsWith('http://') || url.startsWith('https://'))) {
      const u = new URL(url);
      return u.pathname + u.search;
    }
    return url;
  } catch {
    return url;
  }
};

/**
 * offlineFetch: Client HTTP universel pour LeralScolaire
 * - Si GET et hors-ligne : lit dans le cache IndexedDB
 * - Si GET et en ligne : requête le serveur et met en cache pour le mode hors-ligne
 * - Si POST/PUT/DELETE et hors-ligne ou coupure : stocke dans l'Outbox (IndexedDB)
 *   et renvoie une réponse optimiste immédiate (style WhatsApp)
 */
export async function offlineFetch(url, options = {}, label = 'Action') {
  const method = (options.method || 'GET').toUpperCase();
  const isRead = method === 'GET';
  const cacheKey = normalizeCacheKey(url);

  // --- REQUÊTE DE LECTURE (GET) ---
  if (isRead) {
    // Si déconnecté, on vérifie d'abord le cache local
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = await syncEngine.getCache(cacheKey);
      if (cached !== null && cached !== undefined) {
        console.info(`[Offline-First] Récupération depuis le cache local: ${cacheKey}`);
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Si aucune donnée dans le cache hors-ligne, renvoyer un tableau vide pour éviter un crash
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const res = await apiFetch(url, options);
      if (res.ok) {
        const cloned = res.clone();
        cloned
          .json()
          .then((data) => {
            syncEngine.setCache(cacheKey, data);
          })
          .catch(() => {});
      }
      return res;
    } catch (err) {
      // Erreur réseau (ex: serveur éteint ou réseau coupé en cours de route)
      const cached = await syncEngine.getCache(cacheKey);
      if (cached !== null && cached !== undefined) {
        console.warn(`[Offline-First] Erreur réseau, bascule sur le cache local: ${cacheKey}`);
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Renvoyer une réponse vide gracieuse en cas de coupure sans cache
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // --- REQUÊTE D'ÉCRITURE (POST, PUT, DELETE) ---
  // Si le navigateur est hors-ligne, mise directe dans la file Outbox
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    let parsedBody = options.body;
    try {
      if (typeof options.body === 'string') {
        parsedBody = JSON.parse(options.body);
      }
    } catch {
      // conserver tel quel
    }

    const item = await syncEngine.enqueue({
      endpoint: url,
      method,
      body: parsedBody,
      headers: options.headers || {},
      label,
    });

    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        queued: true,
        message: `${label} enregistré localement (sera synchronisé automatiquement dès le retour du réseau)`,
        clientMutationId: item.clientMutationId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Si on est en ligne, on tente l'envoi immédiat
  try {
    const res = await apiFetch(url, options);
    return res;
  } catch (err) {
    // Si la requête échoue en cours de route à cause du réseau, on ne perd pas la donnée !
    console.warn(`[Offline-First] Échec réseau lors de l'envoi, bascule dans l'Outbox: ${label}`);
    let parsedBody = options.body;
    try {
      if (typeof options.body === 'string') {
        parsedBody = JSON.parse(options.body);
      }
    } catch {
      // Corps non JSON : conservé tel quel
    }

    const item = await syncEngine.enqueue({
      endpoint: url,
      method,
      body: parsedBody,
      headers: options.headers || {},
      label,
    });

    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        queued: true,
        message: `${label} sauvegardé localement (synchronisation dès le retour du réseau)`,
        clientMutationId: item.clientMutationId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export const api = {
  // Authentication & Session
  async login(identifier, password) {
    const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Identifiants incorrects');
    }
    return res.json();
  },

  // Classes
  async getClasses() {
    const res = await offlineFetch(`${API_BASE_URL}/classes`, { headers: getHeaders() });
    return res.json();
  },

  async createClass(classeData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(classeData),
      },
      'Création de classe'
    );
    return res.json();
  },

  async updateClass(id, classeData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(classeData),
      },
      'Mise à jour de classe'
    );
    return res.json();
  },

  async deleteClass(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      'Suppression de classe'
    );
    return res.json();
  },

  // Class Coefficients
  async getClassMatieres(classeId) {
    const res = await offlineFetch(`${API_BASE_URL}/classes/${classeId}/matieres`, { headers: getHeaders() });
    return res.json();
  },

  async saveClassCoefs(classeId, matieres) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${classeId}/matieres`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ matieres }),
      },
      'Sauvegarde coefficients'
    );
    return res.json();
  },

  // Students
  async getStudents() {
    const res = await offlineFetch(`${API_BASE_URL}/eleves`, { headers: getHeaders() });
    return res.json();
  },

  async enrollStudent(formData) {
    const res = await apiFetch(`${API_BASE_URL}/eleves`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  async updateStudent(id, formData) {
    const res = await apiFetch(`${API_BASE_URL}/eleves/${id}`, {
      method: 'PUT',
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  async deleteStudent(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/eleves/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      "Suppression d'élève"
    );
    return res.json();
  },

  async importStudents(formData) {
    const res = await apiFetch(`${API_BASE_URL}/eleves/import`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erreur d'importation");
    }
    return res.json();
  },

  async transferStudent(id, nouveauEtablissementId, motif) {
    const res = await offlineFetch(
      `${API_BASE_URL}/eleves/${id}/transfer`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nouveau_etablissement_id: nouveauEtablissementId, motif }),
      },
      "Transfert d'élève"
    );
    return res.json();
  },

  // Subjects (Matieres)
  async getMatieres() {
    const res = await offlineFetch(`${API_BASE_URL}/notes/matieres`, { headers: getHeaders() });
    return res.json();
  },

  async createMatiere(matiereData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/matieres`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(matiereData),
      },
      'Ajout matière'
    );
    return res.json();
  },

  async updateMatiere(id, matiereData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/matieres/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(matiereData),
      },
      'Modification matière'
    );
    return res.json();
  },

  async deleteMatiere(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/matieres/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      'Suppression matière'
    );
    return res.json();
  },

  // Teachers (Corps Enseignant)
  async getTeachers() {
    const res = await offlineFetch(`${API_BASE_URL}/professeurs`, { headers: getHeaders() });
    return res.json();
  },

  async createTeacher(teacherData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/professeurs`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(teacherData),
      },
      'Création professeur'
    );
    return res.json();
  },

  async updateTeacher(id, teacherData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/professeurs/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(teacherData),
      },
      'Mise à jour professeur'
    );
    return res.json();
  },

  async deleteTeacher(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/professeurs/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      'Suppression professeur'
    );
    return res.json();
  },

  // Profile (Etablissement)
  async getProfile() {
    const res = await offlineFetch(`${API_BASE_URL}/etablissement/profile`, { headers: getHeaders() });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/etablissement/profile`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      },
      'Mise à jour profil'
    );
    return res.json();
  },

  async searchEtablissements(query) {
    const res = await apiFetch(`${API_BASE_URL}/etablissement/search?q=${query}`, { headers: getHeaders() });
    return res.json();
  },

  // Messages (Messagerie)
  async getInboxMessages() {
    const res = await offlineFetch(`${API_BASE_URL}/messages/inbox`, { headers: getHeaders() });
    return res.json();
  },

  async sendMessage(messageData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/messages`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(messageData),
      },
      'Envoi message'
    );
    return res.json();
  },

  // Document Sharing (Partages)
  async getReceivedPartages() {
    const res = await offlineFetch(`${API_BASE_URL}/partages/received`, { headers: getHeaders() });
    return res.json();
  },

  async getSentPartages() {
    const res = await offlineFetch(`${API_BASE_URL}/partages/sent`, { headers: getHeaders() });
    return res.json();
  },

  async sendPartage(formData) {
    const res = await apiFetch(`${API_BASE_URL}/partages`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur lors du partage');
    }
    return res.json();
  },

  async deletePartage(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/partages/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      'Suppression document'
    );
    return res.json();
  },

  // Pre-Inscriptions
  async getPreInscriptions() {
    const res = await offlineFetch(`${API_BASE_URL}/pre-inscriptions`, { headers: getHeaders() });
    return res.json();
  },

  async updatePreInscription(id, fields) {
    const res = await offlineFetch(
      `${API_BASE_URL}/pre-inscriptions/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
      },
      'Mise à jour pré-inscription'
    );
    return res.json();
  },

  async validatePreInscription(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/pre-inscriptions/${id}/validate`,
      {
        method: 'POST',
        headers: getHeaders(),
      },
      'Validation pré-inscription'
    );
    return res.json();
  },

  async rejectPreInscription(id) {
    const res = await offlineFetch(
      `${API_BASE_URL}/pre-inscriptions/${id}/reject`,
      {
        method: 'POST',
        headers: getHeaders(),
      },
      'Rejet pré-inscription'
    );
    return res.json();
  },

  // Notes & Decisions (Critique pour le mode Offline-First)
  async getNotesGrid(classeId, matiereId, semestre) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/classe/${classeId}/matiere/${matiereId}?semestre=${semestre}`,
      { headers: getHeaders() }
    );
    return res.json();
  },

  async saveBatchNotes(batchData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/batch`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(batchData),
      },
      'Saisie des notes'
    );
    return res.json();
  },

  async getClassesMoyennesDashboard(semestre) {
    const res = await offlineFetch(`${API_BASE_URL}/notes/moyennes-classes?semestre=${semestre}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getPromotionRules() {
    const res = await offlineFetch(`${API_BASE_URL}/notes/regles-passage`, { headers: getHeaders() });
    return res.json();
  },

  async savePromotionRules(rules) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/regles-passage`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(rules),
      },
      'Règles de passage'
    );
    return res.json();
  },

  async getPromotionDecisions(classeId, anneeScolaire) {
    const res = await offlineFetch(`${API_BASE_URL}/notes/decisions/${classeId}?annee_scolaire=${anneeScolaire}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async savePromotionDecisions(classeId, decisions, anneeScolaire) {
    const res = await offlineFetch(
      `${API_BASE_URL}/notes/decisions/${classeId}`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ decisions, annee_scolaire: anneeScolaire }),
      },
      'Décisions de passage'
    );
    return res.json();
  },

  // Timetable (Emploi du temps)
  async getClassSchedule(classeId) {
    const res = await offlineFetch(`${API_BASE_URL}/classes/${classeId}/schedule`, { headers: getHeaders() });
    return res.json();
  },

  async addScheduleEntry(classeId, entry) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${classeId}/schedule`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entry),
      },
      'Ajout créneau emploi du temps'
    );
    return res.json();
  },

  async deleteScheduleEntry(classeId, scheduleId) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${classeId}/schedule/${scheduleId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      'Suppression créneau emploi du temps'
    );
    return res.json();
  },

  // Exams (Planification examens)
  async getClassExams(classeId) {
    const res = await offlineFetch(`${API_BASE_URL}/classes/${classeId}/exams`, { headers: getHeaders() });
    return res.json();
  },

  async addExamPlan(classeId, exam) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${classeId}/exams`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(exam),
      },
      'Planification examen'
    );
    return res.json();
  },

  async updateExamPlan(classeId, examId, exam) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${classeId}/exams/${examId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(exam),
      },
      'Mise à jour examen'
    );
    return res.json();
  },

  async deleteExamPlan(classeId, examId) {
    const res = await offlineFetch(
      `${API_BASE_URL}/classes/${classeId}/exams/${examId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
      'Suppression examen'
    );
    return res.json();
  },

  async getAllExamsCalendar(debut, fin) {
    const res = await offlineFetch(`${API_BASE_URL}/classes/exams/all?debut=${debut}&fin=${fin}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // AI OCR Scan
  async scanStudents(formData) {
    const res = await apiFetch(`${API_BASE_URL}/ai/scan-students`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  // Discipline & Vie Scolaire
  async createDiscipline(disciplineData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/discipline`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(disciplineData),
      },
      'Enregistrement incident/discipline'
    );
    return res.json();
  },

  async getDisciplineEtablissement(typeAction = '', statut = '') {
    const res = await offlineFetch(
      `${API_BASE_URL}/discipline/etablissement?type_action=${typeAction}&statut=${statut}`,
      { headers: getHeaders() }
    );
    return res.json();
  },

  async getDisciplineProfesseur() {
    const res = await offlineFetch(`${API_BASE_URL}/discipline/professeur`, { headers: getHeaders() });
    return res.json();
  },

  async getDisciplineEleve(eleveId = 'me') {
    const res = await offlineFetch(`${API_BASE_URL}/discipline/eleve/${eleveId}`, { headers: getHeaders() });
    return res.json();
  },

  async updateDisciplineStatut(id, statut, compte_rendu_rdv = '') {
    const res = await offlineFetch(
      `${API_BASE_URL}/discipline/${id}/statut`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ statut, compte_rendu_rdv }),
      },
      'Mise à jour statut discipline'
    );
    return res.json();
  },

  async downloadDossierPdf(eleveId) {
    window.open(`${API_BASE_URL}/discipline/eleve/${eleveId}/pdf`, '_blank');
  },

  // Actions Enseignants Spécifiques (Notes, Présences, Émargement)
  async saveProfGrade(gradeData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/professeurs-portal/grades`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(gradeData),
      },
      'Saisie note élève'
    );
    return res.json();
  },

  async updateProfGrade(gradeId, gradeData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/professeurs-portal/grades/${gradeId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(gradeData),
      },
      'Modification note élève'
    );
    return res.json();
  },

  async saveProfAttendance(classeId, attendanceData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/professeurs-portal/attendance/${classeId}`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attendanceData),
      },
      'Appel / Présences classe'
    );
    return res.json();
  },

  async scanEmargement(emargementData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/emargement/scan`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(emargementData),
      },
      'Émargement QR séance'
    );
    return res.json();
  },

  async saveCahierTexte(cahierData) {
    const res = await offlineFetch(
      `${API_BASE_URL}/cahier-texte`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cahierData),
      },
      'Cahier de texte'
    );
    return res.json();
  },

  // Géolocalisation de l'émargement (administration) — nécessite le réseau : pas de file hors ligne
  async getGeolocalisation() {
    return jsonOrThrow(await apiFetch(`${API_BASE_URL}/etablissement/geolocalisation`, { headers: getHeaders() }));
  },

  async updatePositionEtablissement({ latitude, longitude, rayon_metres }) {
    return jsonOrThrow(
      await apiFetch(`${API_BASE_URL}/etablissement/geolocalisation`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ latitude, longitude, rayon_metres }),
      })
    );
  },

  async createTerrainEps({ nom, latitude, longitude, rayon_metres }) {
    return jsonOrThrow(
      await apiFetch(`${API_BASE_URL}/etablissement/terrains-eps`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nom, latitude, longitude, rayon_metres }),
      })
    );
  },

  async deleteTerrainEps(id) {
    return jsonOrThrow(
      await apiFetch(`${API_BASE_URL}/etablissement/terrains-eps/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    );
  },

  // Terrains d'EPS d'un établissement de rattachement (professeur)
  async getTerrainsEps(etablissementId) {
    return jsonOrThrow(
      await apiFetch(`${API_BASE_URL}/emargement/terrains-eps/${etablissementId}`, { headers: getHeaders() })
    );
  },
};

// Réponse JSON, ou erreur portant le message renvoyé par le serveur
async function jsonOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Erreur de communication avec le serveur.');
  }
  return data;
}
