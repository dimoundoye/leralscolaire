const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Fonction pour générer l'Identifiant National Unique
// Format: SN-2025-AAA-000001
async function generateStudentId() {
  const year = new Date().getFullYear();
  
  // 1. Générer 3 lettres aléatoires
  const letters = Array.from({ length: 3 }, () => 
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');

  // 2. Récupérer le nombre total d'élèves pour la séquence
  const countRes = await db.query('SELECT COUNT(*) FROM eleves');
  const sequence = (parseInt(countRes.rows[0].count) + 1).toString().padStart(6, '0');

  return `SN-${year}-${letters}-${sequence}`;
}

// --- LISTER TOUS LES ÉLÈVES DE L'ÉTABLISSEMENT ---
router.get('/', auth, async (req, res) => {
  try {
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Établissement non trouvé.' });
    const etablissementId = etablissementRes.rows[0].id;

    const elevesRes = await db.query(`
      SELECT e.*, c.nom as classe_nom 
      FROM eleves e
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      WHERE e.etablissement_id = $1
      ORDER BY e.created_at DESC
    `, [etablissementId]);

    res.json(elevesRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- INSCRIRE UN ÉLÈVE ---
router.post('/', auth, async (req, res) => {
  const { nom, prenom, date_naissance, classe_id, photo_url, statut } = req.body;

  try {
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    if (etablissementRes.rows.length === 0) return res.status(404).json({ message: 'Établissement non trouvé.' });
    const etablissementId = etablissementRes.rows[0].id;

    const identifiant_national = await generateStudentId();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('sn-2025', salt);
    
    const userRes = await db.query(
      'INSERT INTO users (identifiant_national, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [identifiant_national, passwordHash, 'ELEVE']
    );
    const userId = userRes.rows[0].id;

    const eleveRes = await db.query(
      `INSERT INTO eleves (identifiant_national, user_id, etablissement_id, nom, prenom, date_naissance, photo_url, statut) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [identifiant_national, userId, etablissementId, nom, prenom, date_naissance, photo_url, statut || 'APTE']
    );
    const eleveId = eleveRes.rows[0].id;

    if (classe_id) {
      await db.query(
        'INSERT INTO inscription_classes (eleve_id, classe_id) VALUES ($1, $2)',
        [eleveId, classe_id]
      );
    }

    res.status(201).json({ 
      message: 'Élève inscrit avec succès !',
      identifiant: identifiant_national,
      eleve: eleveRes.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'inscription de l\'élève.' });
  }
});

// --- IMPORTATION EXCEL ---
router.post('/import', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

  try {
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    const etablissementId = etablissementRes.rows[0].id;

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const importedEleves = [];

    for (const row of data) {
      const { nom, prenom, date_naissance, classe_nom } = row;
      
      const identifiant_national = await generateStudentId();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('sn-2025', salt);
      
      const userRes = await db.query(
        'INSERT INTO users (identifiant_national, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [identifiant_national, passwordHash, 'ELEVE']
      );
      const userId = userRes.rows[0].id;

      const eleveRes = await db.query(
        `INSERT INTO eleves (identifiant_national, user_id, etablissement_id, nom, prenom, date_naissance) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [identifiant_national, userId, etablissementId, nom, prenom, date_naissance]
      );
      
      if (classe_nom) {
        const classeRes = await db.query('SELECT id FROM classes WHERE nom = $1 AND etablissement_id = $2', [classe_nom, etablissementId]);
        if (classeRes.rows.length > 0) {
          await db.query('INSERT INTO inscription_classes (eleve_id, classe_id) VALUES ($1, $2)', [eleveRes.rows[0].id, classeRes.rows[0].id]);
        }
      }
      importedEleves.push({ identifiant: identifiant_national, nom, prenom });
    }

    fs.unlinkSync(req.file.path); // Supprimer le fichier temporaire
    res.json({ message: `${importedEleves.length} élèves importés avec succès.`, eleves: importedEleves });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erreur lors de l\'importation.' });
  }
});

// --- EXPORTATION EXCEL ---
router.get('/export', auth, async (req, res) => {
  try {
    const etablissementRes = await db.query(
      'SELECT id FROM etablissements WHERE admin_id = $1',
      [req.user.id]
    );
    const etablissementId = etablissementRes.rows[0].id;

    const elevesRes = await db.query(`
      SELECT e.identifiant_national as "ID National", e.nom as Nom, e.prenom as Prenom, 'sn-2025' as "Mot de passe provisoire", c.nom as Classe
      FROM eleves e
      LEFT JOIN inscription_classes ic ON e.id = ic.eleve_id
      LEFT JOIN classes c ON ic.classe_id = c.id
      WHERE e.etablissement_id = $1
    `, [etablissementId]);

    const worksheet = XLSX.utils.json_to_sheet(elevesRes.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Eleves");

    const filePath = path.join(__dirname, `../../exports/eleves_${etablissementId}.xlsx`);
    if (!fs.existsSync(path.join(__dirname, '../../exports'))) {
      fs.mkdirSync(path.join(__dirname, '../../exports'), { recursive: true });
    }

    XLSX.writeFile(workbook, filePath);
    res.download(filePath, `liste_eleves.xlsx`, () => {
      fs.unlinkSync(filePath); // Supprimer après téléchargement
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'exportation.' });
  }
});

// --- MODIFIER UN ÉLÈVE ---
router.put('/:id', auth, async (req, res) => {
  const { nom, prenom, date_naissance, statut, photo_url } = req.body;
  try {
    const eleveRes = await db.query(
      `UPDATE eleves SET nom = $1, prenom = $2, date_naissance = $3, statut = $4, photo_url = $5 
       WHERE id = $6 RETURNING *`,
      [nom, prenom, date_naissance, statut, photo_url, req.params.id]
    );
    res.json(eleveRes.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la modification.' });
  }
});

// --- TRANSFERER UN ÉLÈVE ---
router.post('/:id/transfer', auth, async (req, res) => {
  const { nouveau_etablissement_id, motif } = req.body;
  try {
    // 1. Mettre à jour l'établissement de l'élève
    await db.query(
      'UPDATE eleves SET etablissement_id = $1, statut = $2 WHERE id = $3',
      [nouveau_etablissement_id, 'TRANSFERE', req.params.id]
    );
    
    // On pourrait aussi logger ce transfert dans une table d'historique
    res.json({ message: 'Élève transféré avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du transfert.' });
  }
});

module.exports = router;

