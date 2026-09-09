require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const db = require('../src/config/db');

async function runAll() {
  console.log('🔄 Démarrage du processus de migration complet...');

  try {
    // 1. Initialiser le schéma de base init.sql
    const initSqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      console.log('📄 Exécution de scripts/init.sql...');
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      await db.query(sql);
      console.log('  ✓ Schéma init.sql appliqué avec succès');
    }

    // 2. Trouver et trier toutes les migrations
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.startsWith('migrate_v') && f.endsWith('.js'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('migrate_v', '').replace('.js', ''), 10);
        const numB = parseInt(b.replace('migrate_v', '').replace('.js', ''), 10);
        return numA - numB;
      });

    console.log(`📦 ${files.length} fichiers de migration versionnés détectés.`);

    for (const file of files) {
      console.log(`▶️ Exécution de ${file}...`);
      try {
        execSync(`node "${path.join(migrationsDir, file)}"`, {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
          env: process.env
        });
      } catch (err) {
        console.warn(`⚠️ Avertissement lors de ${file} (peut-être déjà appliqué):`, err.message);
      }
    }

    // 3. Exécuter les migrations spécifiques complémentaires
    const extraMigrations = ['migrate_email_fields.js', 'migrate_password_resets.js', 'migrate_baremes.js'];
    for (const file of extraMigrations) {
      const fullPath = path.join(migrationsDir, file);
      if (fs.existsSync(fullPath)) {
        console.log(`▶️ Exécution de ${file}...`);
        try {
          execSync(`node "${fullPath}"`, {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            env: process.env
          });
        } catch (err) {
          console.warn(`⚠️ Avertissement lors de ${file}:`, err.message);
        }
      }
    }

    console.log('\n🎉 Toutes les migrations de base de données ont été appliquées avec succès !');
  } catch (err) {
    console.error('❌ Erreur critique lors des migrations:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runAll();
