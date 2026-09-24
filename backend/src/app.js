const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

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
const cahierTexteRoutes = require('./routes/cahierTexte');
const juryBacRoutes = require('./routes/juryBac');
const emargementRoutes = require('./routes/emargement');
const disciplineRoutes = require('./routes/discipline');

const app = express();

// Derrière nginx (réseau Docker privé) : l'IP réelle du client est lue dans X-Forwarded-For.
// Seuls les proxys des réseaux privés sont reconnus, un client ne peut donc pas usurper son IP.
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

// Origines autorisées à appeler l'API depuis un autre domaine (séparées par des virgules).
// En production, le frontend est servi par nginx sur le même domaine : CORS n'intervient pas.
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Taille maximale d'une requête : couvre les pièces justificatives envoyées en base64
// par l'inscription publique (4 fichiers de 4 Mo maximum, +37 % d'encodage).
const BODY_LIMIT = '25mb';

// Middlewares
// En-têtes de sécurité HTTP (l'API ne sert que du JSON, des PDF et les fichiers envoyés)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));
// Fichiers envoyés par les utilisateurs : jamais interprétés comme page ou script.
// Images et PDF restent affichables ; tout autre type (.html, .svg...) est forcé en
// téléchargement et isolé, pour qu'il ne puisse pas exécuter de code sur le domaine.
const INLINE_UPLOAD_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf']);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!INLINE_UPLOAD_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
      res.setHeader('Content-Disposition', 'attachment');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    }
  },
}));

// Request logger middleware
app.use((req, res, next) => {
  // Le jeton passé en paramètre d'URL (téléchargements PDF) ne doit jamais apparaître dans les logs
  const url = req.url.replace(/([?&]token=)[^&]*/gi, '$1[masqué]');
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${url}`);
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
app.use('/api/partages', partagesRoutes);
app.use('/api/eleve-portal', elevePortalRoutes);
app.use('/api/pre-inscriptions', preInscriptionsRoutes);
app.use('/api/professeurs-portal', professeursPortalRoutes);
app.use('/api/cahier-texte', cahierTexteRoutes);
app.use('/api/office-bac', officeBacRoutes);
app.use('/api/emargement', emargementRoutes);
app.use('/api/jury', juryBacRoutes);
app.use('/api/discipline', disciplineRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Serveur LeralScolaire opérationnel (MVC) 🚀');
});

module.exports = app;
