const express = require('express');
const router = express.Router();
const Tesseract = require('tesseract.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

// --- SCANNER UNE LISTE D'ÉLÈVES ---
router.post('/scan-students', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image manquante.' });

  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'fra', // Français
      { logger: m => console.log(m) }
    );

    // Nettoyage sommaire: split par ligne, filtrer les lignes vides
    const names = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);

    fs.unlinkSync(req.file.path);
    res.json({ message: 'Scan terminé', names });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erreur lors de l\'OCR.' });
  }
});

// --- SCANNER UNE FICHE DE NOTES ---
router.post('/scan-notes', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image manquante.' });

  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'fra',
      { logger: m => console.log(m) }
    );

    // Logique de parsing (très simplifiée)
    // On cherche des motifs "Nom : Note"
    const lines = text.split('\n');
    const results = [];
    
    lines.forEach(line => {
        // Regex simple pour détecter un nom suivi d'un nombre
        const match = line.match(/([a-zA-Z\s]+)[\s:]+(\d{1,2}[.,]?\d{0,2})/);
        if (match) {
            results.push({ nom: match[1].trim(), note: match[2].replace(',', '.') });
        }
    });

    fs.unlinkSync(req.file.path);
    res.json({ message: 'Scan de notes terminé', results });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erreur lors du scan.' });
  }
});

module.exports = router;
