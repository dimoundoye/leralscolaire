require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Points to the new database pool config


const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const elevesRoutes = require('./routes/eleves');
const notesRoutes = require('./routes/notes');
const professeursRoutes = require('./routes/professeurs');
const etablissementRoutes = require('./routes/etablissement');
const documentsRoutes = require('./routes/documents');
const messagesRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const partagesRoutes = require('./routes/partages');
const elevePortalRoutes = require('./routes/elevePortal');
const preInscriptionsRoutes = require('./routes/preInscriptions');
const professeursPortalRoutes = require('./routes/professeursPortal');
const officeBacRoutes = require('./routes/officeBac');

const app = express();
const PORT = 5002; // Force port 5002

const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../../frontend/public/uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../../frontend/public')));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
 });

const cahierTexteRoutes = require('./routes/cahierTexte');
const juryBacRoutes = require('./routes/juryBac');
const disciplineRoutes = require('./routes/discipline');

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
app.use('/api/partages', partagesRoutes);
app.use('/api/eleve-portal', elevePortalRoutes);
app.use('/api/pre-inscriptions', preInscriptionsRoutes);
app.use('/api/professeurs-portal', professeursPortalRoutes);
app.use('/api/cahier-texte', cahierTexteRoutes);
app.use('/api/office-bac', officeBacRoutes);
const emargementRoutes = require('./routes/emargement');
app.use('/api/emargement', emargementRoutes);
app.use('/api/jury', juryBacRoutes);
app.use('/api/discipline', disciplineRoutes);

app.get('/', (req, res) => {
  res.send('Serveur LeralScolaire opérationnel (MVC) 🚀');
});

// Test database connection before starting express server
db.pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ ERREUR DE CONNEXION POSTGRESQL :', err.stack);
  }
  console.log('✅ Base de données connectée avec succès (MVC)');
  release();
  
  // Start server
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

// Capture unexpected process errors
process.on('uncaughtException', (err) => {
  console.error('💥 CRASH INATTENDU :', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ PROMESSE NON GÉRÉE :', reason);
});
