const NoteModel = require('../models/noteModel');
const db = require('../config/db'); // For pool transactions
const response = require('../utils/response');

function getClasseSuivante(niveau, decision) {
  if (decision === 'REDOUBLEMENT') return niveau;
  const niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
  const idx = niveaux.indexOf(niveau);
  if (idx === -1 || idx >= niveaux.length - 1) return niveau;
  return niveaux[idx + 1];
}

function getNextAcademicYear(currentYear) {
  const parts = (currentYear || '').split('-');
  if (parts.length === 2) {
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);
    if (!isNaN(start) && !isNaN(end)) {
      return `${start + 1}-${end + 1}`;
    }
  }
  return currentYear;
}

const noteController = {
  async listMatieres(req, res, next) {
    try {
      const matieres = await NoteModel.getAllMatieres();
      return res.json(matieres);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des matières.', 500);
    }
  },

  async createMatiere(req, res, next) {
    const { nom, code } = req.body;
    try {
      const newMatiere = await NoteModel.createMatiere(nom, code);
      return res.status(201).json(newMatiere);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la création de la matière.', 500);
    }
  },

  async updateMatiere(req, res, next) {
    const { nom, code } = req.body;
    try {
      const updated = await NoteModel.updateMatiere(req.params.id, nom, code);
      return res.json(updated);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la modification.', 500);
    }
  },

  async deleteMatiere(req, res, next) {
    try {
      await NoteModel.deleteMatiere(req.params.id);
      return res.json({ message: 'Matière supprimée.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la suppression.', 500);
    }
  },

  async getNotesByClassAndMatiere(req, res, next) {
    const { classeId, matiereId } = req.params;
    const { semestre } = req.query;
    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      const notes = await NoteModel.getStudentNotesByClassAndMatiere(classeId, matiereId, semestre);

      const result = notes.map(n => ({
        ...n,
        readonly: n.etablissement_origine_id && n.etablissement_origine_id !== etablissementId
      }));

      return res.json(result);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur serveur.', 500);
    }
  },

  async saveBatchNotes(req, res, next) {
    const { notes, matiere_id, semestre, trimestre, type_note } = req.body;
    console.log(`[Batch Notes] Type: ${type_note}, Matiere: ${matiere_id}, Semestre: ${semestre}`);

    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        for (const item of notes) {
          if (item.valeur === '' || item.valeur === null || item.valeur === undefined) continue;

          // Check if note exists and its origin
          const oldNote = await NoteModel.checkExistingNote(item.eleve_id, matiere_id, semestre, trimestre, type_note, client);

          if (oldNote) {
            // Block modification if the note comes from another establishment
            if (oldNote.etablissement_origine_id && oldNote.etablissement_origine_id !== etablissementId) {
              console.log(`Skip note ${oldNote.id}: provenance autre établissement`);
              continue;
            }

            const oldVal = parseFloat(oldNote.valeur);
            const newVal = parseFloat(item.valeur);

            if (oldVal !== newVal || oldNote.appreciation !== item.appreciation) {
              console.log(`Updating note ${oldNote.id}: ${oldVal} -> ${newVal}`);
              // Log history
              await NoteModel.logNoteHistory(oldNote.id, oldNote.valeur, item.valeur, oldNote.appreciation, item.appreciation, req.user.id, client);
              // Update note value
              await NoteModel.updateNote(oldNote.id, item.valeur, item.appreciation, client);
            }
          } else {
            // New note: record origin
            console.log(`Inserting new note for eleve ${item.eleve_id}`);
            await NoteModel.insertNote({
              eleveId: item.eleve_id,
              matiereId: matiere_id,
              valeur: item.valeur,
              appreciation: item.appreciation,
              semestre,
              trimestre,
              typeNote: type_note,
              professeurId: req.user.id,
              etablissementId
            }, client);
          }
        }

        await client.query('COMMIT');
        return res.json({ message: 'Notes enregistrées avec succès !' });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Batch Error Inner]', err);
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('[Batch Error Outer]', err);
      return response.error(res, "Erreur lors de l'enregistrement des notes.", 500);
    }
  },

  async getClassMoyennes(req, res, next) {
    const { classeId } = req.params;
    const { semestre } = req.query;

    try {
      const averages = await NoteModel.calculateClassAverages(classeId, semestre);

      const finalResults = averages.map(row => {
        let moyenne = parseFloat(row.moyenne_generale) || 0;
        return {
          ...row,
          moyenne_finale: Math.max(0, moyenne - (row.total_points_perdus / 10)) // Deduct 1 point for every 10 points lost in absences
        };
      });

      return res.json(finalResults);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du calcul des moyennes.', 500);
    }
  },

  async getClassesMoyennesDashboard(req, res, next) {
    const { semestre, annee_scolaire } = req.query;
    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const classMoyennes = await NoteModel.getClassMoyennesForDashboard(etablissementId, semestre, annee_scolaire);
      return res.json(classMoyennes);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du calcul des moyennes par classe.', 500);
    }
  },

  async getPromotionRules(req, res, next) {
    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      let regles = await NoteModel.getPromotionRules(etablissementId);
      if (!regles) {
        regles = await NoteModel.createDefaultPromotionRules(etablissementId);
      }
      return res.json(regles);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur.', 500);
    }
  },

  async savePromotionRules(req, res, next) {
    const { seuil_passage_direct, seuil_passage, seuil_cours_vacances } = req.body;
    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const result = await NoteModel.savePromotionRules(etablissementId, seuil_passage_direct, seuil_passage, seuil_cours_vacances);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la sauvegarde.', 500);
    }
  },

  async getDecisions(req, res, next) {
    const { classeId } = req.params;
    const { annee_scolaire } = req.query;

    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      let regles = await NoteModel.getPromotionRules(etablissementId);
      if (!regles) {
        regles = await NoteModel.createDefaultPromotionRules(etablissementId);
      }

      const averages = await NoteModel.calculateYearlyClassAverages(classeId);
      const savedBulletins = await NoteModel.getSavedBulletins(classeId, annee_scolaire);

      const savedMap = {};
      savedBulletins.forEach(b => {
        savedMap[b.eleve_id] = { decision: b.decision, decision_detail: b.decision_detail };
      });

      const seuils = [
        { min: parseFloat(regles.seuil_passage), decision: 'PASSAGE', label: 'Passage' },
        { min: parseFloat(regles.seuil_cours_vacances), decision: 'COURS_VACANCES', label: 'Cours de vacances obligatoires' }
      ];

      const decisions = averages.map(row => {
        const moy = parseFloat(row.moyenne_annuelle) || 0;
        let decision = 'REDOUBLEMENT';
        let decision_detail = 'Redoublement';

        for (const s of seuils) {
          if (moy >= s.min) {
            decision = s.decision;
            decision_detail = s.label;
            break;
          }
        }

        const saved = savedMap[row.eleve_id];
        return {
          ...row,
          moyenne_annuelle: parseFloat(row.moyenne_annuelle) || 0,
          decision: saved ? saved.decision : decision,
          decision_detail: saved ? saved.decision_detail : decision_detail,
          saved: !!saved,
          niveau_suivant: getClasseSuivante(row.niveau, saved ? saved.decision : decision)
        };
      });

      return res.json(decisions);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du calcul des décisions.', 500);
    }
  },

  async saveDecisions(req, res, next) {
    const { classeId } = req.params;
    const { decisions, annee_scolaire } = req.body;

    if (!decisions || !Array.isArray(decisions)) {
      return response.error(res, 'Données invalides.', 400);
    }

    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        for (const d of decisions) {
          await NoteModel.saveBulletinDecision(
            d.eleve_id, classeId, annee_scolaire, d.moyenne_annuelle, d.decision, d.decision_detail, d.decision_auto !== false, client
          );

          if (d.decision_detail && d.decision !== 'EXCLUSION') {
            const nextYear = getNextAcademicYear(annee_scolaire);
            
            // Get current class details
            const currentClassRes = await client.query('SELECT nom, niveau FROM classes WHERE id = $1', [classeId]);
            const currentClass = currentClassRes.rows[0];
            
            if (currentClass) {
              // Resolve target class name: if it's a generic word like 'Passage', compute standard next class name
              let targetClassName = d.decision_detail;
              const isGeneric = ['passage', 'passage direct', 'redoublement', 'cours de vacances', 'cours de vacances obligatoires'].includes(targetClassName.toLowerCase().trim());
              const nextLevel = getClasseSuivante(currentClass.niveau, d.decision);
              
              if (isGeneric || !targetClassName) {
                const suffix = currentClass.nom.trim().split(/\s+/).pop();
                targetClassName = `${nextLevel} ${suffix}`;
              }

              // Search for the class in nextYear
              let targetClassRes = await client.query(`
                SELECT id FROM classes 
                WHERE nom = $1 AND etablissement_id = $2 AND annee_scolaire = $3
              `, [targetClassName, etablissementId, nextYear]);

              let targetClassId = null;
              if (targetClassRes.rows.length > 0) {
                targetClassId = targetClassRes.rows[0].id;
              } else {
                // Class doesn't exist for the next year - auto-create it!
                const insertRes = await client.query(`
                  INSERT INTO classes (nom, niveau, etablissement_id, annee_scolaire)
                  VALUES ($1, $2, $3, $4)
                  RETURNING id
                `, [targetClassName, nextLevel, etablissementId, nextYear]);
                targetClassId = insertRes.rows[0].id;
              }

              if (targetClassId) {
                // Check if student already has an inscription for the next school year
                const existingNextYearIns = await client.query(`
                  SELECT ic.id FROM inscription_classes ic
                  JOIN classes c ON ic.classe_id = c.id
                  WHERE ic.eleve_id = $1 AND c.annee_scolaire = $2
                `, [d.eleve_id, nextYear]);

                if (existingNextYearIns.rows.length > 0) {
                  await client.query(`
                    UPDATE inscription_classes 
                    SET classe_id = $1 
                    WHERE id = $2
                  `, [targetClassId, existingNextYearIns.rows[0].id]);
                } else {
                  await client.query(`
                    INSERT INTO inscription_classes (eleve_id, classe_id)
                    VALUES ($1, $2)
                  `, [d.eleve_id, targetClassId]);
                }
              }
            }
          } else if (d.decision === 'EXCLUSION') {
            const nextYear = getNextAcademicYear(annee_scolaire);
            await client.query(`
              DELETE FROM inscription_classes 
              WHERE eleve_id = $1 AND id IN (
                SELECT ic.id FROM inscription_classes ic
                JOIN classes c ON ic.classe_id = c.id
                WHERE c.annee_scolaire = $2
              )
            `, [d.eleve_id, nextYear]);
          }
        }

        await client.query('COMMIT');
        return res.json({ message: 'Décisions enregistrées.' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la sauvegarde.', 500);
    }
  },

  async getStudentNotesForAdmin(req, res, next) {
    const { eleveId } = req.params;
    try {
      // 1. Fetch student info including class school year
      const studentRes = await db.query(`
        SELECT DISTINCT ON (e.id) e.*, c.nom as classe_nom, ic.classe_id, c.annee_scolaire
        FROM eleves e
        LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
        LEFT JOIN classes c ON ic.classe_id = c.id
        WHERE e.id = $1
        ORDER BY e.id, ic.date_inscription DESC NULLS LAST
      `, [eleveId]);

      if (studentRes.rows.length === 0) {
        return response.error(res, 'Élève non trouvé.', 404);
      }
      const student = studentRes.rows[0];

      // 1b. Fetch jury decision for this student and current class
      let decisionJury = null;
      if (student.classe_id) {
        const bulletinRes = await db.query(`
          SELECT decision, decision_detail, observations_jury, moyenne_generale, decision_auto, appreciations_conseil
          FROM bulletins
          WHERE eleve_id = $1 AND classe_id = $2
        `, [eleveId, student.classe_id]);
        if (bulletinRes.rows.length > 0) {
          decisionJury = bulletinRes.rows[0];
        }
      }

      // 2. Fetch notes
      const notesRes = await db.query(`
        SELECT n.*, m.nom as matiere_nom, m.code_matiere, 
               COALESCE(cm.coefficient, n.coefficient, 1) as coefficient,
               COALESCE(c.nom, c_fb.nom) as classe_nom,
               COALESCE(c.annee_scolaire, c_fb.annee_scolaire, '2025-2026') as annee_scolaire
        FROM notes n
        JOIN matieres m ON n.matiere_id = m.id
        LEFT JOIN classes c ON n.classe_id = c.id
        LEFT JOIN inscription_classes ic ON (n.classe_id IS NULL AND ic.eleve_id = n.eleve_id)
        LEFT JOIN classes c_fb ON (n.classe_id IS NULL AND ic.classe_id = c_fb.id)
        LEFT JOIN classe_matieres cm ON cm.classe_id = COALESCE(n.classe_id, ic.classe_id) AND cm.matiere_id = n.matiere_id
        WHERE n.eleve_id = $1
        ORDER BY COALESCE(c.annee_scolaire, c_fb.annee_scolaire) DESC, n.semestre, n.trimestre, m.nom
      `, [eleveId]);

      const reportCard = {};

      notesRes.rows.forEach(row => {
        const annee = row.annee_scolaire || 'Année inconnue';
        const periode = `Semestre ${row.semestre || row.trimestre || 1}`;
        const codeMat = row.code_matiere;

        if (!reportCard[annee]) {
          reportCard[annee] = {
            classe: row.classe_nom || 'Non affectée',
            periodes: {}
          };
        }

        if (!reportCard[annee].periodes[periode]) {
          reportCard[annee].periodes[periode] = {
            matieres: {},
            moyenne_generale: 0,
            total_coefficients: 0
          };
        }

        const currentPeriod = reportCard[annee].periodes[periode];

        if (!currentPeriod.matieres[codeMat]) {
          currentPeriod.matieres[codeMat] = {
            nom: row.matiere_nom,
            coefficient: row.coefficient,
            notes: [],
            appreciation: ''
          };
        }

        const mat = currentPeriod.matieres[codeMat];
        mat.notes.push({
          id: row.id,
          valeur: parseFloat(row.valeur),
          type_note: row.type_note,
          date: row.date_saisie
        });

        if (row.appreciation) {
          mat.appreciation = row.appreciation;
        }
      });

      for (const annee of Object.keys(reportCard)) {
        for (const periode of Object.keys(reportCard[annee].periodes)) {
          const periodData = reportCard[annee].periodes[periode];
          let totalPoints = 0;
          let totalCoefficients = 0;

          for (const codeMat of Object.keys(periodData.matieres)) {
            const mat = periodData.matieres[codeMat];
            if (mat.notes.length > 0) {
              const sum = mat.notes.reduce((a, b) => a + b.valeur, 0);
              mat.moyenne = parseFloat((sum / mat.notes.length).toFixed(2));
              totalPoints += mat.moyenne * mat.coefficient;
              totalCoefficients += mat.coefficient;
            } else {
              mat.moyenne = null;
            }
          }

          periodData.total_coefficients = totalCoefficients;
          periodData.moyenne_generale = totalCoefficients > 0 
            ? parseFloat((totalPoints / totalCoefficients).toFixed(2)) 
            : 0;
        }
      }

      return res.json({
        student,
        notes: reportCard,
        decisionJury
      });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des notes de l\'élève.', 500);
    }
  },

  async saveStudentJuryDecision(req, res, next) {
    const { eleveId } = req.params;
    const { classeId, anneeScolaire, moyenneGenerale, decision, decisionDetail, observationsJury, appreciationsConseil } = req.body;

    try {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(`
          INSERT INTO bulletins (eleve_id, classe_id, annee_scolaire, moyenne_generale, decision, decision_detail, decision_auto, observations_jury, appreciations_conseil)
          VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
          ON CONFLICT (eleve_id, classe_id, annee_scolaire) 
          DO UPDATE SET decision = COALESCE($5, bulletins.decision), decision_detail = COALESCE($6, bulletins.decision_detail), decision_auto = false, observations_jury = $7, moyenne_generale = COALESCE($4, bulletins.moyenne_generale), appreciations_conseil = $8
        `, [
          eleveId,
          classeId,
          anneeScolaire || '',
          moyenneGenerale ? parseFloat(moyenneGenerale) : null,
          decision,
          decisionDetail,
          observationsJury || '',
          appreciationsConseil || ''
        ]);

        if (decisionDetail && decision !== 'EXCLUSION') {
          const etabRes = await client.query('SELECT etablissement_id FROM eleves WHERE id = $1', [eleveId]);
          const etablissementId = etabRes.rows[0]?.etablissement_id;
          
          if (etablissementId) {
            const nextYear = getNextAcademicYear(anneeScolaire);
            
            // Get current class details
            const currentClassRes = await client.query('SELECT nom, niveau FROM classes WHERE id = $1', [classeId]);
            const currentClass = currentClassRes.rows[0];
            
            if (currentClass) {
              // Resolve target class name: if it's a generic word like 'Passage', compute standard next class name
              let targetClassName = decisionDetail;
              const isGeneric = ['passage', 'passage direct', 'redoublement', 'cours de vacances', 'cours de vacances obligatoires'].includes(targetClassName.toLowerCase().trim());
              const nextLevel = getClasseSuivante(currentClass.niveau, decision);
              
              if (isGeneric || !targetClassName) {
                const suffix = currentClass.nom.trim().split(/\s+/).pop();
                targetClassName = `${nextLevel} ${suffix}`;
              }

              // Search for the class in nextYear
              let targetClassRes = await client.query(`
                SELECT id FROM classes 
                WHERE nom = $1 AND etablissement_id = $2 AND annee_scolaire = $3
              `, [targetClassName, etablissementId, nextYear]);

              let targetClassId = null;
              if (targetClassRes.rows.length > 0) {
                targetClassId = targetClassRes.rows[0].id;
              } else {
                // Class doesn't exist for the next year - auto-create it!
                const insertRes = await client.query(`
                  INSERT INTO classes (nom, niveau, etablissement_id, annee_scolaire)
                  VALUES ($1, $2, $3, $4)
                  RETURNING id
                `, [targetClassName, nextLevel, etablissementId, nextYear]);
                targetClassId = insertRes.rows[0].id;
              }

              if (targetClassId) {
                // Check if student already has an inscription for the next school year
                const existingNextYearIns = await client.query(`
                  SELECT ic.id FROM inscription_classes ic
                  JOIN classes c ON ic.classe_id = c.id
                  WHERE ic.eleve_id = $1 AND c.annee_scolaire = $2
                `, [eleveId, nextYear]);

                if (existingNextYearIns.rows.length > 0) {
                  await client.query(`
                    UPDATE inscription_classes 
                    SET classe_id = $1 
                    WHERE id = $2
                  `, [targetClassId, existingNextYearIns.rows[0].id]);
                } else {
                  await client.query(`
                    INSERT INTO inscription_classes (eleve_id, classe_id)
                    VALUES ($1, $2)
                  `, [eleveId, targetClassId]);
                }
              }
            }
          }
        } else if (decision === 'EXCLUSION') {
          const nextYear = getNextAcademicYear(anneeScolaire);
          await client.query(`
            DELETE FROM inscription_classes 
            WHERE eleve_id = $1 AND id IN (
              SELECT ic.id FROM inscription_classes ic
              JOIN classes c ON ic.classe_id = c.id
              WHERE c.annee_scolaire = $2
            )
          `, [eleveId, nextYear]);
        }

        await client.query('COMMIT');
        return res.json({ message: 'Décision et observations du jury enregistrées avec succès !' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de l\'enregistrement de la décision du jury.', 500);
    }
  },

  async getClassRanking(req, res, next) {
    const { classeId } = req.params;
    const { period } = req.query; // ex: 'Semestre 1', 'Semestre 2', etc.

    try {
      // 1. Fetch all students in the class
      const studentsRes = await db.query(`
        SELECT e.id, e.nom, e.prenom, e.photo_url, e.identifiant_national
        FROM eleves e
        JOIN inscription_classes ic ON e.id = ic.eleve_id
        WHERE ic.classe_id = $1
        ORDER BY e.nom, e.prenom
      `, [classeId]);

      if (studentsRes.rows.length === 0) {
        return res.json([]);
      }

      const students = studentsRes.rows;

      // Parse the period
      let semestre = null;
      let trimestre = null;
      if (period) {
        if (period.startsWith('Semestre') || period.startsWith('Trimestre')) {
          semestre = parseInt(period.split(' ')[1]) || null;
        }
      }

      // 2. Fetch all notes for this class and period
      let notesQuery = `
        SELECT n.eleve_id, n.valeur, n.type_note, m.code_matiere, 
               COALESCE(cm.coefficient, n.coefficient, 1) as coefficient
        FROM notes n
        JOIN matieres m ON n.matiere_id = m.id
        LEFT JOIN inscription_classes ic ON n.eleve_id = ic.eleve_id
        LEFT JOIN classes c ON ic.classe_id = c.id
        LEFT JOIN classe_matieres cm ON cm.classe_id = c.id AND cm.matiere_id = n.matiere_id
        WHERE ic.classe_id = $1
      `;
      const queryParams = [classeId];

      if (semestre !== null) {
        notesQuery += ` AND n.semestre = $2`;
        queryParams.push(semestre);
      } else if (trimestre !== null) {
        notesQuery += ` AND n.trimestre = $2`;
        queryParams.push(trimestre);
      }

      const notesRes = await db.query(notesQuery, queryParams);
      const allNotes = notesRes.rows;

      // 3. Fetch saved bulletins to get decisions if any
      const bulletinsRes = await db.query(`
        SELECT eleve_id, decision, decision_detail
        FROM bulletins
        WHERE classe_id = $1
      `, [classeId]);
      const bulletins = bulletinsRes.rows;

      // 4. Compute general average for each student
      const studentAverages = students.map(student => {
        const studentNotes = allNotes.filter(n => n.eleve_id === student.id);
        
        // Group notes by code_matiere
        const matieres = {};
        studentNotes.forEach(n => {
          if (!matieres[n.code_matiere]) {
            matieres[n.code_matiere] = {
              coefficient: n.coefficient,
              notes: []
            };
          }
          matieres[n.code_matiere].notes.push(parseFloat(n.valeur));
        });

        let totalPoints = 0;
        let totalCoefficients = 0;
        const hasNotes = Object.keys(matieres).length > 0;

        for (const codeMat of Object.keys(matieres)) {
          const mat = matieres[codeMat];
          if (mat.notes.length > 0) {
            const sum = mat.notes.reduce((a, b) => a + b, 0);
            const moyenneMatiere = sum / mat.notes.length;
            totalPoints += moyenneMatiere * mat.coefficient;
            totalCoefficients += mat.coefficient;
          }
        }

        const average = totalCoefficients > 0 
          ? parseFloat((totalPoints / totalCoefficients).toFixed(2)) 
          : null;

        const savedB = bulletins.find(b => b.eleve_id === student.id);

        return {
          id: student.id,
          nom: student.nom,
          prenom: student.prenom,
          photo_url: student.photo_url,
          identifiant_national: student.identifiant_national,
          moyenne_generale: average,
          total_coefficients: totalCoefficients,
          has_notes: hasNotes,
          decision_detail: savedB ? savedB.decision_detail : ''
        };
      });

      // 5. Sort students
      studentAverages.sort((a, b) => {
        if (a.moyenne_generale === null && b.moyenne_generale === null) return 0;
        if (a.moyenne_generale === null) return 1;
        if (b.moyenne_generale === null) return -1;
        return b.moyenne_generale - a.moyenne_generale;
      });

      // Add ranks
      let rank = 1;
      let prevAvg = null;
      const rankedStudents = studentAverages.map((student, index) => {
        if (student.moyenne_generale !== null) {
          if (prevAvg !== null && student.moyenne_generale < prevAvg) {
            rank = index + 1;
          }
          prevAvg = student.moyenne_generale;
          return { ...student, rang: rank };
        } else {
          return { ...student, rang: null };
        }
      });

      return res.json(rankedStudents);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors du calcul du classement de la classe.', 500);
    }
  },

  async getSuiviRemplissage(req, res, next) {
    const { semestre, annee_scolaire } = req.query;
    const sem = semestre ? parseInt(semestre) : 1;

    try {
      const etablissementId = await NoteModel.getEtablissementIdByAdminId(req.user.id);
      if (!etablissementId) {
        return response.error(res, 'Établissement non trouvé.', 404);
      }

      const { rows } = await db.query(`
        SELECT 
          c.id as classe_id,
          c.nom as classe_nom,
          c.niveau,
          c.annee_scolaire,
          COALESCE(sc.student_count, 0) as student_count,
          COALESCE(mc.subject_count, 0) as subject_count,
          COALESCE(sc.student_count * mc.subject_count, 0) as expected_slots,
          COALESCE(n.filled_devoirs, 0) as filled_devoirs,
          COALESCE(n.filled_examens, 0) as filled_examens,
          COALESCE(ba.autorise, false) as bulletin_autorise
        FROM classes c
        LEFT JOIN (
          SELECT classe_id, COUNT(eleve_id) as student_count
          FROM inscription_classes
          GROUP BY classe_id
        ) sc ON c.id = sc.classe_id
        LEFT JOIN (
          SELECT classe_id, COUNT(DISTINCT matiere_id) as subject_count
          FROM (
            SELECT classe_id, matiere_id FROM classe_matieres
            UNION
            SELECT classe_id, matiere_id FROM professeur_matieres
          ) sub
          GROUP BY classe_id
        ) mc ON c.id = mc.classe_id
        LEFT JOIN (
          SELECT 
            ic.classe_id,
            COUNT(CASE WHEN n.type_note = 'DEVOIR' AND n.valeur IS NOT NULL THEN 1 END) as filled_devoirs,
            COUNT(CASE WHEN n.type_note = 'EXAMEN' AND n.valeur IS NOT NULL THEN 1 END) as filled_examens
          FROM inscription_classes ic
          JOIN notes n ON ic.eleve_id = n.eleve_id
          WHERE (n.semestre = $1 OR n.trimestre = $1)
          GROUP BY ic.classe_id
        ) n ON c.id = n.classe_id
        LEFT JOIN bulletins_autorises ba ON ba.classe_id = c.id AND ba.semestre = $1 AND ba.annee_scolaire = c.annee_scolaire
        WHERE c.etablissement_id = $2 AND (c.annee_scolaire = $3 OR $3 IS NULL)
        ORDER BY c.niveau, c.nom
      `, [sem, etablissementId, annee_scolaire || null]);

      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération du suivi du remplissage.', 500);
    }
  },

  async getBulletinsPublication(req, res) {
    const { classeId } = req.params;
    const { annee_scolaire } = req.query;
    try {
      const { rows } = await db.query(`
        SELECT semestre, autorise FROM bulletins_autorises 
        WHERE classe_id = $1 AND annee_scolaire = $2
      `, [classeId, annee_scolaire]);
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de la récupération des autorisations.', 500);
    }
  },

  async saveBulletinsPublication(req, res) {
    const { classeId } = req.params;
    const { semestre, annee_scolaire, autorise } = req.body;
    try {
      await db.query(`
        INSERT INTO bulletins_autorises (classe_id, semestre, annee_scolaire, autorise)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (classe_id, semestre, annee_scolaire)
        DO UPDATE SET autorise = EXCLUDED.autorise
      `, [classeId, semestre, annee_scolaire, autorise]);
      return res.json({ message: 'Statut de publication enregistré avec succès.' });
    } catch (err) {
      console.error(err);
      return response.error(res, 'Erreur lors de l\'enregistrement de l\'autorisation.', 500);
    }
  }
};

module.exports = noteController;
