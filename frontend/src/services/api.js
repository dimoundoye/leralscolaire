const API_BASE_URL = 'http://localhost:5002/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const getUploadHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const api = {
  // Authentication & Session
  async login(identifier, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Identifiants incorrects');
    }
    return res.json();
  },

  async registerEtablissement(registerData) {
    const res = await fetch(`${API_BASE_URL}/auth/register-etablissement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Erreur lors de l'inscription");
    }
    return res.json();
  },

  // Classes
  async getClasses() {
    const res = await fetch(`${API_BASE_URL}/classes`, { headers: getHeaders() });
    return res.json();
  },

  async createClass(classeData) {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(classeData),
    });
    return res.json();
  },

  async updateClass(id, classeData) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(classeData),
    });
    return res.json();
  },

  async deleteClass(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Class Coefficients
  async getClassMatieres(classeId) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/matieres`, { headers: getHeaders() });
    return res.json();
  },

  async saveClassCoefs(classeId, matieres) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/matieres`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ matieres }),
    });
    return res.json();
  },

  // Students
  async getStudents() {
    const res = await fetch(`${API_BASE_URL}/eleves`, { headers: getHeaders() });
    return res.json();
  },

  async enrollStudent(formData) {
    const res = await fetch(`${API_BASE_URL}/eleves`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData, // FormData contains file
    });
    return res.json();
  },

  async updateStudent(id, formData) {
    const res = await fetch(`${API_BASE_URL}/eleves/${id}`, {
      method: 'PUT',
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  async deleteStudent(id) {
    const res = await fetch(`${API_BASE_URL}/eleves/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async importStudents(formData) {
    const res = await fetch(`${API_BASE_URL}/eleves/import`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Erreur d'importation");
    }
    return res.json();
  },

  async transferStudent(id, nouveauEtablissementId, motif) {
    const res = await fetch(`${API_BASE_URL}/eleves/${id}/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nouveau_etablissement_id: nouveauEtablissementId, motif }),
    });
    return res.json();
  },

  // Subjects (Matieres)
  async getMatieres() {
    const res = await fetch(`${API_BASE_URL}/notes/matieres`, { headers: getHeaders() });
    return res.json();
  },

  async createMatiere(matiereData) {
    const res = await fetch(`${API_BASE_URL}/notes/matieres`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(matiereData),
    });
    return res.json();
  },

  async updateMatiere(id, matiereData) {
    const res = await fetch(`${API_BASE_URL}/notes/matieres/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(matiereData),
    });
    return res.json();
  },

  async deleteMatiere(id) {
    const res = await fetch(`${API_BASE_URL}/notes/matieres/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Teachers (Corps Enseignant)
  async getTeachers() {
    const res = await fetch(`${API_BASE_URL}/professeurs`, { headers: getHeaders() });
    return res.json();
  },

  async createTeacher(teacherData) {
    const res = await fetch(`${API_BASE_URL}/professeurs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
    });
    return res.json();
  },

  async updateTeacher(id, teacherData) {
    const res = await fetch(`${API_BASE_URL}/professeurs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
    });
    return res.json();
  },

  async deleteTeacher(id) {
    const res = await fetch(`${API_BASE_URL}/professeurs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Profile (Etablissement)
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/etablissement/profile`, { headers: getHeaders() });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE_URL}/etablissement/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  async searchEtablissements(query) {
    const res = await fetch(`${API_BASE_URL}/etablissement/search?q=${query}`, { headers: getHeaders() });
    return res.json();
  },

  // Messages (Messagerie)
  async getInboxMessages() {
    const res = await fetch(`${API_BASE_URL}/messages/inbox`, { headers: getHeaders() });
    return res.json();
  },

  async sendMessage(messageData) {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messageData),
    });
    return res.json();
  },

  // Document Sharing (Partages)
  async getReceivedPartages() {
    const res = await fetch(`${API_BASE_URL}/partages/received`, { headers: getHeaders() });
    return res.json();
  },

  async getSentPartages() {
    const res = await fetch(`${API_BASE_URL}/partages/sent`, { headers: getHeaders() });
    return res.json();
  },

  async sendPartage(formData) {
    const res = await fetch(`${API_BASE_URL}/partages`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors du partage');
    }
    return res.json();
  },

  async deletePartage(id) {
    const res = await fetch(`${API_BASE_URL}/partages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Pre-Inscriptions
  async getPreInscriptions() {
    const res = await fetch(`${API_BASE_URL}/pre-inscriptions`, { headers: getHeaders() });
    return res.json();
  },

  async updatePreInscription(id, fields) {
    const res = await fetch(`${API_BASE_URL}/pre-inscriptions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(fields),
    });
    return res.json();
  },

  async validatePreInscription(id) {
    const res = await fetch(`${API_BASE_URL}/pre-inscriptions/${id}/validate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async rejectPreInscription(id) {
    const res = await fetch(`${API_BASE_URL}/pre-inscriptions/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Notes & Decisions
  async getNotesGrid(classeId, matiereId, semestre) {
    const res = await fetch(`${API_BASE_URL}/notes/classe/${classeId}/matiere/${matiereId}?semestre=${semestre}`, { headers: getHeaders() });
    return res.json();
  },

  async saveBatchNotes(batchData) {
    const res = await fetch(`${API_BASE_URL}/notes/batch`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(batchData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors de la sauvegarde des notes');
    }
    return res.json();
  },

  async getClassesMoyennesDashboard(semestre) {
    const res = await fetch(`${API_BASE_URL}/notes/moyennes-classes?semestre=${semestre}`, { headers: getHeaders() });
    return res.json();
  },

  async getPromotionRules() {
    const res = await fetch(`${API_BASE_URL}/notes/regles-passage`, { headers: getHeaders() });
    return res.json();
  },

  async savePromotionRules(rules) {
    const res = await fetch(`${API_BASE_URL}/notes/regles-passage`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(rules),
    });
    return res.json();
  },

  async getPromotionDecisions(classeId, anneeScolaire) {
    const res = await fetch(`${API_BASE_URL}/notes/decisions/${classeId}?annee_scolaire=${anneeScolaire}`, { headers: getHeaders() });
    return res.json();
  },

  async savePromotionDecisions(classeId, decisions, anneeScolaire) {
    const res = await fetch(`${API_BASE_URL}/notes/decisions/${classeId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ decisions, annee_scolaire: anneeScolaire }),
    });
    return res.json();
  },

  // Timetable (Emploi du temps)
  async getClassSchedule(classeId) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/schedule`, { headers: getHeaders() });
    return res.json();
  },

  async addScheduleEntry(classeId, entry) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/schedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry),
    });
    return res.json();
  },

  async deleteScheduleEntry(classeId, scheduleId) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/schedule/${scheduleId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Exams (Planification examens)
  async getClassExams(classeId) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/exams`, { headers: getHeaders() });
    return res.json();
  },

  async addExamPlan(classeId, exam) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/exams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(exam),
    });
    return res.json();
  },

  async updateExamPlan(classeId, examId, exam) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/exams/${examId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(exam),
    });
    return res.json();
  },

  async deleteExamPlan(classeId, examId) {
    const res = await fetch(`${API_BASE_URL}/classes/${classeId}/exams/${examId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAllExamsCalendar(debut, fin) {
    const res = await fetch(`${API_BASE_URL}/classes/exams/all?debut=${debut}&fin=${fin}`, { headers: getHeaders() });
    return res.json();
  },

  // AI OCR Scan
  async scanStudents(formData) {
    const res = await fetch(`${API_BASE_URL}/ai/scan-students`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  // Discipline & Vie Scolaire
  async createDiscipline(disciplineData) {
    const res = await fetch(`${API_BASE_URL}/discipline`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(disciplineData),
    });
    return res.json();
  },

  async getDisciplineEtablissement(typeAction = '', statut = '') {
    const res = await fetch(`${API_BASE_URL}/discipline/etablissement?type_action=${typeAction}&statut=${statut}`, { headers: getHeaders() });
    return res.json();
  },

  async getDisciplineProfesseur() {
    const res = await fetch(`${API_BASE_URL}/discipline/professeur`, { headers: getHeaders() });
    return res.json();
  },

  async getDisciplineEleve(eleveId = 'me') {
    const res = await fetch(`${API_BASE_URL}/discipline/eleve/${eleveId}`, { headers: getHeaders() });
    return res.json();
  },

  async updateDisciplineStatut(id, statut, compte_rendu_rdv = '') {
    const res = await fetch(`${API_BASE_URL}/discipline/${id}/statut`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ statut, compte_rendu_rdv }),
    });
    return res.json();
  },

  async downloadDossierPdf(eleveId) {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/discipline/eleve/${eleveId}/pdf?token=${token}`, '_blank');
  }
};
