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
const PORT = process.env.PORT || 5002;

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Serveur LeralScolaire opérationnel (MVC) 🚀');
});

// Test database connection before starting express server
db.pool.connect(async (err, client, release) => {
  if (err) {
    return console.error('❌ ERREUR DE CONNEXION POSTGRESQL :', err.stack);
  }
  console.log('✅ Base de données connectée avec succès (MVC)');
  release();
  
  // Auto-vérification et ajout immédiat des colonnes critiques et tables
  try {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS identifiant_national VARCHAR(100),
      ADD COLUMN IF NOT EXISTS password_provisoire VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_users_identifiant_national ON users(identifiant_national);

      CREATE TABLE IF NOT EXISTS centres_examen_bac (
        id SERIAL PRIMARY KEY,
        nom_centre VARCHAR(255) NOT NULL,
        type_centre VARCHAR(50) DEFAULT 'PRINCIPAL',
        centre_principal_id INT REFERENCES centres_examen_bac(id) ON DELETE SET NULL,
        region VARCHAR(100) NOT NULL,
        zone_commune VARCHAR(100) NOT NULL,
        effectif_previsionnel INT DEFAULT 0,
        series_disponibles TEXT[] DEFAULT '{"S1", "S2", "L1", "L2"}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS office_bac_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE etablissements
      ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS telephone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS email_professionnel VARCHAR(255);

      ALTER TABLE professeurs
      ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M',
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50),
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ville VARCHAR(100),
      ADD COLUMN IF NOT EXISTS etablissement_nom VARCHAR(255);

      ALTER TABLE demandes_inscription_office
      ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) DEFAULT 'M',
      ADD COLUMN IF NOT EXISTS cni_numero VARCHAR(50),
      ADD COLUMN IF NOT EXISTS matricule_solde VARCHAR(50),
      ADD COLUMN IF NOT EXISTS documents_fournis TEXT,
      ADD COLUMN IF NOT EXISTS autorisation_numero VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100);

      ALTER TABLE jurys_bac
      ADD COLUMN IF NOT EXISTS type_examen VARCHAR(50) DEFAULT 'BAC',
      ADD COLUMN IF NOT EXISTS centre_examen_id INT,
      ADD COLUMN IF NOT EXISTS centre_secondaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS identifiant_temporaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS mot_de_passe_temporaire VARCHAR(150),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS date_expiration_acces TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS statut_acces VARCHAR(50) DEFAULT 'ACTIF';

      ALTER TABLE livrets_scolaires_bac
      ADD COLUMN IF NOT EXISTS statut_transmission VARCHAR(50) DEFAULT 'EN_ATTENTE',
      ADD COLUMN IF NOT EXISTS restitue_at TIMESTAMP WITH TIME ZONE;
    `);
  } catch (schemaErr) {
    console.warn('⚠️ Auto-vérification schéma :', schemaErr.message);
  }

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
