const express = require('express');
const router = express.Router();
const profPortalController = require('../controllers/profPortalController');
const auth = require('../middleware/authMiddleware');

// Security middleware to ensure role is PROFESSEUR
const checkProfRole = (req, res, next) => {
  if (req.user.role !== 'PROFESSEUR') {
    return res.status(403).json({ message: 'Accès interdit. Rôle professeur requis.' });
  }
  next();
};

// --- 1. PROFIL ---
router.get('/profile', auth, checkProfRole, profPortalController.getProfile);
router.put('/profile', auth, checkProfRole, profPortalController.updateProfile);

// --- 2. INVITATIONS ---
router.get('/invitations', auth, checkProfRole, profPortalController.getInvitations);
router.put('/invitations/:etablissementId', auth, checkProfRole, profPortalController.respondToInvitation);

// --- 3. INFOS GLOBALES & CLASSES ---
router.get('/summary', auth, checkProfRole, profPortalController.getSummary);
router.get('/dashboard-details', auth, checkProfRole, profPortalController.getDashboardDetails);
router.get('/classes', auth, checkProfRole, profPortalController.getClasses);
router.get('/schedule', auth, checkProfRole, profPortalController.getSchedule);
router.get('/classes/:classeId/students', auth, checkProfRole, profPortalController.getClassStudents);

// --- 4. ASSIDUITÉ (ABSENCES & RETARDS) ---
router.post('/attendance/:classeId', auth, checkProfRole, profPortalController.saveAttendance);
router.get('/attendance-history/:classeId', auth, checkProfRole, profPortalController.getAttendanceHistory);

// --- 5. GRILLES DE NOTES ---
router.get('/grades/:classeId/:matiereId', auth, checkProfRole, profPortalController.getClassGrades);
router.post('/grades', auth, checkProfRole, profPortalController.saveGrade);
router.put('/grades/:noteId', auth, checkProfRole, profPortalController.updateGrade);

// --- 6. BAREMES D'APPRECIATION ---
router.get('/baremes/:etablissementId', auth, checkProfRole, profPortalController.getBaremes);

// --- 7. NOTIFICATIONS ---
router.get('/notifications', auth, checkProfRole, profPortalController.getNotifications);
router.put('/notifications/:id/read', auth, checkProfRole, profPortalController.markNotificationRead);

// --- 8. EXPORTS DE L'EMPLOI DU TEMPS ---
router.get('/schedule/pdf', auth, checkProfRole, profPortalController.exportSchedulePDF);
router.get('/public-schedule/ical/:profId', profPortalController.exportScheduleICal);

// --- 9. SUIVI PEDAGOGIQUE ---
router.get('/pedagogie/:classeId/:matiereId', auth, checkProfRole, profPortalController.getPedagogyStats);

// --- 10. PLANIFICATION ET CALENDRIER ---
router.get('/planning', auth, checkProfRole, profPortalController.getPlanning);
router.post('/planning/propose', auth, checkProfRole, profPortalController.proposeDevoirDate);

module.exports = router;
