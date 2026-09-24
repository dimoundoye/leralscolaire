require('dotenv').config();
const db = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5002;

// Le schéma de la base est géré par les migrations (npm run migrate), pas au démarrage.
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

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ PROMESSE NON GÉRÉE :', reason);
});
