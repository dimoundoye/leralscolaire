const Tesseract = require('tesseract.js');
const fs = require('fs');
const response = require('../utils/response');

const aiController = {
  async scanStudents(req, res, next) {
    if (!req.file) return response.error(res, 'Image manquante.', 400);

    try {
      const { data: { text } } = await Tesseract.recognize(
        req.file.path,
        'fra', // French language
        { logger: m => console.log(m) }
      );

      // Clean lines: split by line, filter out empty ones
      const names = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 2);

      fs.unlinkSync(req.file.path);
      return res.json({ message: 'Scan terminé', names });
    } catch (err) {
      console.error(err);
      if (req.file) fs.unlinkSync(req.file.path);
      return response.error(res, "Erreur lors de l'OCR.", 500);
    }
  },

  async scanNotes(req, res, next) {
    if (!req.file) return response.error(res, 'Image manquante.', 400);

    try {
      const { data: { text } } = await Tesseract.recognize(
        req.file.path,
        'fra',
        { logger: m => console.log(m) }
      );

      // Simple parsing: find "Name: Note" patterns
      const lines = text.split('\n');
      const results = [];

      lines.forEach(line => {
        // Regex to match a name followed by a decimal/integer score
        const match = line.match(/([a-zA-Z\s]+)[\s:]+(\d{1,2}[.,]?\d{0,2})/);
        if (match) {
          results.push({ nom: match[1].trim(), note: match[2].replace(',', '.') });
        }
      });

      fs.unlinkSync(req.file.path);
      return res.json({ message: 'Scan de notes terminé', results });
    } catch (err) {
      console.error(err);
      if (req.file) fs.unlinkSync(req.file.path);
      return response.error(res, 'Erreur lors du scan.', 500);
    }
  }
};

module.exports = aiController;
