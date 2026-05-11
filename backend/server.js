const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import pour tester la connexion
require('dotenv').config();

const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const elevesRoutes = require('./routes/eleves');
const notesRoutes = require('./routes/notes');
const professeursRoutes = require('./routes/professeurs');
const etablissementRoutes = require('./routes/etablissement');
const documentsRoutes = require('./routes/documents');
const messagesRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = 5002; // On force le port 5002 pour être sûr

// Middlewares
app.use(cors());
app.use(express.json());

// Logger pour voir les requêtes entrantes
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/eleves', elevesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/professeurs', professeursRoutes);
app.use('/api/etablissement', etablissementRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/ai', aiRoutes);



app.get('/', (req, res) => {
  res.send('Serveur LeralScolaire opérationnel 🚀');
});

// Tester la connexion DB avant de lancer le serveur
db.pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ ERREUR DE CONNEXION POSTGRESQL :', err.stack);
  }
  console.log('✅ Base de données connectée avec succès');
  release();
  
  // Lancer le serveur seulement si la DB est OK
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Le port ${PORT} est déjà utilisé !`);
    } else {
      console.error('❌ Erreur serveur :', err);
    }
  });
});

// Capture des erreurs fatales pour éviter le crash silencieux
process.on('uncaughtException', (err) => {
  console.error('💥 CRASH INATTENDU :', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ PROMESSE NON GÉRÉE :', reason);
});
