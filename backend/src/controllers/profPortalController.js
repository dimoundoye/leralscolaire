const db = require('../config/db');
const ProfModel = require('../models/profModel');
const response = require('../utils/response');

const profPortalController = {
  // 1. Profil de l'enseignant
  async getProfile(req, res) {
    try {
      const prof = await ProfModel.findProfById(req.user.id);
      if (!prof) {
        return response.error(res, 'Profil enseignant non trouvé.', 404);
      }
      return res.json(prof);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement du profil.', 500);
    }
  },

  async updateProfile(req, res) {
    const { nom, prenom, telephone, photo_url, matiere_principale } = req.body;
    try {
      await db.query(`
        INSERT INTO professeurs (id, nom, prenom, telephone, photo_url, matiere_principale)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET 
          nom = EXCLUDED.nom, 
          prenom = EXCLUDED.prenom, 
          telephone = EXCLUDED.telephone,
          photo_url = EXCLUDED.photo_url, 
          matiere_principale = EXCLUDED.matiere_principale
      `, [req.user.id, nom, prenom, telephone, photo_url || null, matiere_principale]);

      const updated = await ProfModel.findProfById(req.user.id);
      return res.json(updated);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la mise à jour du profil.', 500);
    }
  },

  // 2. Invitations
  async getInvitations(req, res) {
    try {
      const invs = await ProfModel.getInvitations(req.user.id);
      return res.json(invs);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des invitations.', 500);
    }
  },

  async respondToInvitation(req, res) {
    const { etablissementId } = req.params;
    const { accept } = req.body; // true ou false
    try {
      const result = await ProfModel.respondToInvitation(req.user.id, etablissementId, accept);
      return res.json({ message: accept ? 'Invitation acceptée.' : 'Invitation refusée.', result });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la réponse à l\'invitation.', 500);
    }
  },

  // 3. Tableau de bord
  async getSummary(req, res) {
    try {
      const summary = await ProfModel.getDashboardSummary(req.user.id);
      return res.json(summary);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des données.', 500);
    }
  },

  async getDashboardDetails(req, res) {
    try {
      const details = await ProfModel.getDashboardDetails(req.user.id);
      return res.json(details);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des détails consolidés.', 500);
    }
  },

  async getClasses(req, res) {
    try {
      const classes = await ProfModel.getTeacherClasses(req.user.id);
      return res.json(classes);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des classes.', 500);
    }
  },

  async getSchedule(req, res) {
    try {
      const schedule = await ProfModel.getConsolidatedSchedule(req.user.id);
      return res.json(schedule);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération de l\'emploi du temps.', 500);
    }
  },

  async getClassStudents(req, res) {
    const { classeId } = req.params;
    try {
      // Vérifier que le prof enseigne dans cette classe
      const classes = await ProfModel.getTeacherClasses(req.user.id);
      const isAssigned = classes.some(c => c.classe_id === classeId);
      if (!isAssigned) {
        return response.error(res, 'Accès refusé. Vous n\'enseignez pas dans cette classe.', 403);
      }

      const students = await ProfModel.getClassStudentsForTeacher(classeId);
      return res.json(students);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement des élèves.', 500);
    }
  },

  // 4. Assiduité (Saisie des Absences & Retards par cours)
  async saveAttendance(req, res) {
    const { classeId } = req.params;
    const { date, matiere_id, roster } = req.body;
    // roster format: [{ eleve_id: '...', type_presence: 'ABSENCE'|'RETARD', duree_retard: 15, motif: '...' }]
    try {
      // Vérifier affectation — on vérifie juste que le prof enseigne dans cette classe
      const classes = await ProfModel.getTeacherClasses(req.user.id);
      const isAssigned = classes.some(c => c.classe_id === classeId);
      if (!isAssigned) {
        return response.error(res, 'Accès refusé. Vous n\'enseignez pas dans cette classe.', 403);
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Nettoyer les absences déjà saisies par ce prof pour ce cours/matière à cette date
        await client.query(
          `DELETE FROM absences 
           WHERE classe_id = $1 AND matiere_id = $2 AND date_absence = $3 AND professeur_id = $4`,
          [classeId, matiere_id, date, req.user.id]
        );

        // 2. Insérer le nouveau roster d'absences/retards
        for (const item of roster) {
          if (item.type_presence === 'ABSENCE' || item.type_presence === 'RETARD') {
            await client.query(
              `INSERT INTO absences (eleve_id, date_absence, justifiee, type_presence, duree_retard, matiere_id, classe_id, professeur_id, motif)
               VALUES ($1, $2, FALSE, $3, $4, $5, $6, $7, $8)`,
              [
                item.eleve_id, 
                date, 
                item.type_presence, 
                item.type_presence === 'RETARD' ? (item.duree_retard || 0) : 0,
                matiere_id, 
                classeId, 
                req.user.id, 
                item.motif || null
              ]
            );
          }
        }

        await client.query('COMMIT');
        return res.json({ message: 'Appel enregistré avec succès !' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de l\'enregistrement de l\'appel.', 500);
    }
  },

  async getAttendanceHistory(req, res) {
    const { classeId } = req.params;
    const { matiere_id } = req.query;
    try {
      const { rows } = await db.query(
        `SELECT a.id, a.eleve_id, a.date_absence, a.type_presence, a.duree_retard, a.justifiee, a.motif,
                e.nom, e.prenom
         FROM absences a
         JOIN eleves e ON a.eleve_id = e.id
         WHERE a.classe_id = $1 AND a.matiere_id = $2
         ORDER BY a.date_absence DESC, e.nom ASC`,
        [classeId, matiere_id]
      );
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération de l\'historique d\'assiduité.', 500);
    }
  },

  // 5. Gestion des Notes & Audit de Modification
  async getClassGrades(req, res) {
    const { classeId, matiereId } = req.params;
    const { periode } = req.query; // ex: Trimestre 1

    // Parse trimestre / semestre number from string (same integer value 1, 2 or 3)
    let periodeNum = 1;
    if (periode && periode.includes('1')) periodeNum = 1;
    if (periode && periode.includes('2')) periodeNum = 2;
    if (periode && periode.includes('3')) periodeNum = 3;

    try {
      // Students in the class
      const { rows: students } = await db.query(
        `SELECT DISTINCT e.id, e.nom, e.prenom, e.identifiant_national
         FROM eleves e
         JOIN inscription_classes ic ON e.id = ic.eleve_id
         WHERE ic.classe_id = $1
         ORDER BY e.nom ASC, e.prenom ASC`,
        [classeId]
      );

      // Get all student IDs in this class
      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) return res.json({ students: [], grades: [] });

      // Fetch notes: match on semestre OR trimestre (both are used in the codebase)
      // DISTINCT ON ensures one row per (eleve_id, type_note) — most recent first
      const { rows: grades } = await db.query(
        `SELECT DISTINCT ON (n.eleve_id, n.type_note)
           n.id, n.eleve_id, n.valeur as note, n.type_note, n.date_saisie, n.appreciation,
           n.semestre, n.trimestre
         FROM notes n
         WHERE n.eleve_id = ANY($1)
           AND n.matiere_id = $2
           AND (
             n.trimestre = $3
             OR n.semestre = $3
             OR (n.trimestre IS NULL AND n.semestre = $3)
             OR (n.semestre IS NULL AND n.trimestre = $3)
           )
         ORDER BY n.eleve_id, n.type_note, n.date_saisie DESC`,
        [studentIds, matiereId, periodeNum]
      );

      return res.json({ students, grades });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement des notes.', 500);
    }
  },

  async saveGrade(req, res) {
    const { eleve_id, classe_id, matiere_id, type_note, note, appreciation, periode } = req.body;
    try {
      // 1. Vérifier affectation
      const classes = await ProfModel.getTeacherClasses(req.user.id);
      const isAssigned = classes.some(c => c.classe_id === classe_id && c.matiere_id === matiere_id);
      if (!isAssigned) {
        return response.error(res, 'Accès refusé. Vous n\'enseignez pas cette matière dans cette classe.', 403);
      }

      // Convert "Trimestre X" to integer
      let trimestre = 1;
      if (periode && periode.includes('1')) trimestre = 1;
      if (periode && periode.includes('2')) trimestre = 2;
      if (periode && periode.includes('3')) trimestre = 3;

      // 2. Insérer ou mettre à jour la note (valeur)
      const exist = await db.query(
        `SELECT id FROM notes 
         WHERE eleve_id = $1 AND matiere_id = $2 AND type_note = $3 AND trimestre = $4`,
        [eleve_id, matiere_id, type_note, trimestre]
      );

      let result;
      if (exist.rows.length > 0) {
        // Update
        result = await db.query(
          `UPDATE notes 
           SET valeur = $1, appreciation = $2, professeur_id = $3, date_saisie = CURRENT_TIMESTAMP
           WHERE id = $4 RETURNING id, eleve_id, valeur as note, type_note`,
          [note, appreciation || null, req.user.id, exist.rows[0].id]
        );
      } else {
        // Insert
        result = await db.query(
          `INSERT INTO notes (eleve_id, matiere_id, valeur, type_note, trimestre, professeur_id, appreciation, date_saisie)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
           RETURNING id, eleve_id, valeur as note, type_note`,
          [eleve_id, matiere_id, note, type_note, trimestre, req.user.id, appreciation || null]
        );
      }

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la saisie de la note.', 500);
    }
  },

  async updateGrade(req, res) {
    const { noteId } = req.params;
    const { note, appreciation, motif } = req.body;

    if (!motif || !motif.trim()) {
      return response.error(res, 'Un motif de modification est obligatoire pour modifier une note.', 400);
    }

    try {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // Fetch old note values
        const oldNoteRes = await client.query('SELECT * FROM notes WHERE id = $1', [noteId]);
        if (oldNoteRes.rows.length === 0) {
          client.release();
          return response.error(res, 'Note introuvable.', 404);
        }
        const oldNote = oldNoteRes.rows[0];

        // Record history log (Audit Trail / pending request)
        await client.query(`
          CREATE TABLE IF NOT EXISTS historique_notes (
            id SERIAL PRIMARY KEY,
            note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
            ancienne_valeur NUMERIC,
            nouvelle_valeur NUMERIC,
            ancienne_appreciation TEXT,
            nouvelle_appreciation TEXT,
            motif TEXT,
            auteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
            date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            statut VARCHAR(20) DEFAULT 'EN_ATTENTE'
          )
        `);

        await client.query(
          `INSERT INTO historique_notes (note_id, ancienne_valeur, nouvelle_valeur, ancienne_appreciation, nouvelle_appreciation, motif, auteur_id, statut)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'EN_ATTENTE')`,
          [
            noteId, 
            oldNote.valeur, 
            note, 
            oldNote.appreciation, 
            appreciation || null, 
            motif,
            req.user.id
          ]
        );

        await client.query('COMMIT');
        return res.json({ message: 'Demande de modification soumise avec succès. En attente de validation par l\'établissement.' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification de la note.', 500);
    }
  },

  // 6. Barèmes d'appréciation
  async getBaremes(req, res) {
    const { etablissementId } = req.params;
    try {
      const { rows } = await db.query(
        `SELECT id, note_min, note_max, appreciation, couleur
         FROM baremes_appreciation
         WHERE etablissement_id = $1
         ORDER BY note_min ASC`,
        [etablissementId]
      );
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des barèmes.', 500);
    }
  },

  // 7. Notifications
  async getNotifications(req, res) {
    try {
      const { rows } = await db.query(
        `SELECT id, titre, description, type, lu, created_at 
         FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 100`,
        [req.user.id]
      );
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du chargement des notifications.', 500);
    }
  },

  async markNotificationRead(req, res) {
    const { id } = req.params;
    try {
      await db.query(
        `UPDATE notifications 
         SET lu = TRUE 
         WHERE id = $1 AND user_id = $2`,
        [id, req.user.id]
      );
      return res.json({ message: 'Notification marquée comme lue.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification de la notification.', 500);
    }
  },

  async exportSchedulePDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const slots = await ProfModel.getConsolidatedSchedule(req.user.id);
      
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `emploi_du_temps_consolide.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      doc.pipe(res);

      doc.fillColor('#1e3a8a').fontSize(22).font('Helvetica-Bold').text('LeralScolaire', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#4b5563').fontSize(14).font('Helvetica').text('Emploi du Temps Consolidé Enseignant', { align: 'center' });
      doc.moveDown(0.5);
      
      const { rows: profInfo } = await db.query(
        `SELECT nom, prenom, email, telephone FROM professeurs p JOIN users u ON p.id = u.id WHERE p.id = $1`,
        [req.user.id]
      );
      if (profInfo.length > 0) {
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(`Enseignant : ${profInfo[0].prenom} ${profInfo[0].nom}`);
        doc.font('Helvetica').text(`Email : ${profInfo[0].email} | Téléphone : ${profInfo[0].telephone || 'N/A'}`);
      }
      
      doc.moveDown(1.5);
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      
      days.forEach(day => {
        const daySlots = slots.filter(s => s.jour_semaine === day)
          .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
          
        doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text(day.toUpperCase());
        doc.moveDown(0.3);
        
        if (daySlots.length === 0) {
          doc.fillColor('#9ca3af').fontSize(10).font('Helvetica-Oblique').text('Aucun cours planifié ce jour.');
          doc.moveDown(1);
        } else {
          daySlots.forEach(s => {
            const start = s.heure_debut.slice(0, 5);
            const end = s.heure_fin.slice(0, 5);
            doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(
              `${start} - ${end}   |   ${s.matiere_nom} (${s.classe_nom})`,
              { indent: 15 }
            );
            doc.fillColor('#4b5563').fontSize(9.5).font('Helvetica').text(
              `Établissement : ${s.etablissement_nom}   |   Salle : ${s.salle || 'N/A'}`,
              { indent: 15 }
            );
            doc.moveDown(0.4);
          });
          doc.moveDown(0.6);
        }
        
        doc.strokeColor('#f3f4f6').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.8);
      });
      
      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF.' });
    }
  },

  async exportScheduleICal(req, res) {
    try {
      const { profId } = req.params;
      const slots = await ProfModel.getConsolidatedSchedule(profId);
      
      const dayOffsets = {
        'Lundi': '20260720',
        'Mardi': '20260721',
        'Mercredi': '20260722',
        'Jeudi': '20260723',
        'Vendredi': '20260724',
        'Samedi': '20260725',
        'Dimanche': '20260726'
      };

      let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LeralScolaire//Timetable Feed//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:LeralScolaire - Emploi du temps consolidé'
      ];

      slots.forEach(s => {
        const dateStr = dayOffsets[s.jour_semaine] || '20260720';
        const startStr = s.heure_debut.replace(/:/g, '').slice(0, 6);
        const endStr = s.heure_fin.replace(/:/g, '').slice(0, 6);
        
        ics.push('BEGIN:VEVENT');
        ics.push(`UID:slot-${s.id}@leralscolaire.sn`);
        ics.push(`DTSTAMP:20260716T120000Z`);
        ics.push(`DTSTART:${dateStr}T${startStr}`);
        ics.push(`DTEND:${dateStr}T${endStr}`);
        ics.push(`RRULE:FREQ=WEEKLY`);
        ics.push(`SUMMARY:${s.matiere_nom} (${s.classe_nom})`);
        ics.push(`LOCATION:${s.salle || 'N/A'} - ${s.etablissement_nom}`);
        ics.push(`DESCRIPTION:Cours de ${s.matiere_nom} consolidé via LeralScolaire.`);
        ics.push('END:VEVENT');
      });

      ics.push('END:VCALENDAR');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=agenda_leralscolaire.ics');
      return res.send(ics.join('\r\n'));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la génération de l\'agenda.' });
    }
  },

  async getPedagogyStats(req, res) {
    const { classeId, matiereId } = req.params;
    try {
      const { rows: meta } = await db.query(
        `SELECT c.nom as classe_nom, m.nom as matiere_nom, c.etablissement_id, et.nom as etablissement_nom
         FROM classes c
         JOIN matieres m ON m.id = $2
         JOIN etablissements et ON c.etablissement_id = et.id
         WHERE c.id = $1`,
        [classeId, matiereId]
      );
      if (meta.length === 0) return response.error(res, 'Classe ou matière non trouvée.', 404);
      const { classe_nom, matiere_nom, etablissement_id, etablissement_nom } = meta[0];

      const { rows: rules } = await db.query(
        `SELECT seuil_passage FROM regles_passage WHERE etablissement_id = $1 LIMIT 1`,
        [etablissement_id]
      );
      const criticalThreshold = rules.length > 0 ? parseFloat(rules[0].seuil_passage) : 10;

      const { rows: students } = await db.query(
        `SELECT e.id, e.nom, e.prenom, e.identifiant_national, e.photo_url
         FROM eleves e
         JOIN inscription_classes ic ON e.id = ic.eleve_id
         WHERE ic.classe_id = $1
         ORDER BY e.nom ASC, e.prenom ASC`,
        [classeId]
      );

      if (students.length === 0) {
        return res.json({
          meta: { classe_nom, matiere_nom, etablissement_nom, criticalThreshold },
          stats: { classAvg: 0, maxGrade: 0, minGrade: 0, criticalCount: 0, distribution: {} },
          students: []
        });
      }

      const studentIds = students.map(s => s.id);

      const { rows: grades } = await db.query(
        `SELECT id, eleve_id, valeur as note, type_note, semestre, trimestre
         FROM notes
         WHERE eleve_id = ANY($1) AND matiere_id = $2`,
        [studentIds, matiereId]
      );

      const calculateAverage = (studentGrades) => {
        if (studentGrades.length === 0) return null;
        
        const devoirs = studentGrades.filter(g => g.type_note === 'DEVOIR');
        const examens = studentGrades.filter(g => g.type_note !== 'DEVOIR');

        let devoirsAvg = 0;
        if (devoirs.length > 0) {
          devoirsAvg = devoirs.reduce((sum, g) => sum + parseFloat(g.note), 0) / devoirs.length;
        }

        if (examens.length > 0) {
          const examVal = parseFloat(examens[0].note);
          if (devoirs.length > 0) {
            return (devoirsAvg + examVal) / 2;
          }
          return examVal;
        }

        return devoirs.length > 0 ? devoirsAvg : null;
      };

      const studentsData = students.map(s => {
        const sGrades = grades.filter(g => g.eleve_id === s.id);
        
        const s1Grades = sGrades.filter(g => g.semestre === 1 || g.trimestre === 1);
        const s1Avg = calculateAverage(s1Grades);

        const s2Grades = sGrades.filter(g => g.semestre === 2 || g.trimestre === 2);
        const s2Avg = calculateAverage(s2Grades);

        let currentAvg = null;
        if (s2Avg !== null) currentAvg = s2Avg;
        else if (s1Avg !== null) currentAvg = s1Avg;

        let trend = 'STABLE';
        if (s1Avg !== null && s2Avg !== null) {
          if (s2Avg > s1Avg) trend = 'UP';
          else if (s2Avg < s1Avg) trend = 'DOWN';
        }

        return {
          ...s,
          s1Avg: s1Avg !== null ? parseFloat(s1Avg.toFixed(2)) : null,
          s2Avg: s2Avg !== null ? parseFloat(s2Avg.toFixed(2)) : null,
          currentAvg: currentAvg !== null ? parseFloat(currentAvg.toFixed(2)) : null,
          trend,
          isCritical: currentAvg !== null && currentAvg < criticalThreshold
        };
      });

      const populatedAverages = studentsData.map(s => s.currentAvg).filter(a => a !== null);
      const classAvg = populatedAverages.length > 0 
        ? parseFloat((populatedAverages.reduce((sum, a) => sum + a, 0) / populatedAverages.length).toFixed(2))
        : 0;
      const maxGrade = populatedAverages.length > 0 ? Math.max(...populatedAverages) : 0;
      const minGrade = populatedAverages.length > 0 ? Math.min(...populatedAverages) : 0;
      const criticalCount = studentsData.filter(s => s.isCritical).length;

      const distribution = {
        '0-5': studentsData.filter(s => s.currentAvg !== null && s.currentAvg < 5).length,
        '5-10': studentsData.filter(s => s.currentAvg !== null && s.currentAvg >= 5 && s.currentAvg < 10).length,
        '10-12': studentsData.filter(s => s.currentAvg !== null && s.currentAvg >= 10 && s.currentAvg < 12).length,
        '12-14': studentsData.filter(s => s.currentAvg !== null && s.currentAvg >= 12 && s.currentAvg < 14).length,
        '14-16': studentsData.filter(s => s.currentAvg !== null && s.currentAvg >= 14 && s.currentAvg < 16).length,
        '16-20': studentsData.filter(s => s.currentAvg !== null && s.currentAvg >= 16).length,
      };

      return res.json({
        meta: { classe_nom, matiere_nom, etablissement_nom, criticalThreshold },
        stats: { classAvg, maxGrade, minGrade, criticalCount, distribution },
        students: studentsData
      });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du calcul des statistiques pédagogiques.', 500);
    }
  },

  async getPlanning(req, res) {
    try {
      const { rows: planning } = await db.query(
        `SELECT ep.id, ep.etablissement_id, ep.classe_id, ep.matiere_id, ep.type_examen, ep.date_examen, ep.salle, ep.statut,
                c.nom as classe_nom, m.nom as matiere_nom, et.nom as etablissement_nom,
                p.prenom as prof_prenom, p.nom as prof_nom
         FROM examens_planification ep
         JOIN classes c ON ep.classe_id = c.id
         JOIN matieres m ON ep.matiere_id = m.id
         JOIN etablissements et ON ep.etablissement_id = et.id
         LEFT JOIN professeurs p ON ep.professeur_id = p.id
         WHERE (ep.classe_id, ep.matiere_id) IN (
           SELECT pm.classe_id, pm.matiere_id FROM professeur_matieres pm WHERE pm.professeur_id = $1
           UNION
           SELECT edt.classe_id, edt.matiere_id FROM emplois_du_temps edt WHERE edt.professeur_id = $1
         )
         ORDER BY ep.date_examen DESC`,
        [req.user.id]
      );
      return res.json(planning);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération du planning.', 500);
    }
  },

  async proposeDevoirDate(req, res) {
    const { etablissement_id, classe_id, matiere_id, type_examen, date_examen, salle } = req.body;
    if (!etablissement_id || !classe_id || !matiere_id || !type_examen || !date_examen) {
      return response.error(res, 'Paramètres requis manquants.', 400);
    }
    try {
      const { rows } = await db.query(
        `INSERT INTO examens_planification (id, etablissement_id, classe_id, matiere_id, type_examen, date_examen, salle, statut, professeur_id)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'EN_ATTENTE', $7)
         RETURNING *`,
        [etablissement_id, classe_id, matiere_id, type_examen, date_examen, salle || null, req.user.id]
      );
      return res.status(201).json({ message: 'Proposition soumise à la validation de l\'administrateur.', proposition: rows[0] });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la soumission de la proposition.', 500);
    }
  }
};

module.exports = profPortalController;
