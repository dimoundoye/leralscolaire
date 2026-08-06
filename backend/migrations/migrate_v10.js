const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v10 ---');

    // 1. Table portfolio_items (pour les projets, sports, activités artistiques)
    await db.query(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        type VARCHAR(50) CHECK (type IN ('PROJET', 'SPORT', 'ART', 'AUTRE')),
        titre VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        annee_scolaire VARCHAR(20) NOT NULL, -- ex: 2025-2026
        date_realisation DATE NOT NULL,
        media_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table portfolio_items créée');

    // 2. Table resultats_examens_nationaux (pour BFEM et BAC avec mention)
    await db.query(`
      CREATE TABLE IF NOT EXISTS resultats_examens_nationaux (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        type_examen VARCHAR(20) CHECK (type_examen IN ('BFEM', 'BAC')),
        annee VARCHAR(4) NOT NULL,
        session VARCHAR(50) DEFAULT 'Normale',
        serie VARCHAR(50), -- ex: S1, L'1, T1
        mention VARCHAR(50) CHECK (mention IN ('PASSABLE', 'ASSEZ_BIEN', 'BIEN', 'TRES_BIEN', 'EXCELLENT', 'ECHEC')),
        moyenne DECIMAL(4,2),
        statut_resultat VARCHAR(20) CHECK (statut_resultat IN ('ADMIS', 'REFUSE', 'SECOND_TOUR')),
        details JSONB, -- notes détaillées par matière
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (eleve_id, type_examen, annee)
      );
    `);
    console.log('✅ Table resultats_examens_nationaux créée');

    // 3. Table notifications (pour alertes de notes, documents, messages)
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        titre VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'GENERAL', -- e.g. 'NOTE', 'EXAMEN', 'MESSAGE', 'DOCUMENT'
        lu BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table notifications créée');

    // 4. Seeding optionnel de données d'exemple pour les élèves existants
    const elevesRes = await db.query('SELECT id, user_id FROM eleves LIMIT 5');
    if (elevesRes.rows.length > 0) {
      console.log('Seeding des exemples pour le portail élève...');
      for (const eleve of elevesRes.rows) {
        // Portfolio item
        await db.query(`
          INSERT INTO portfolio_items (eleve_id, type, titre, description, annee_scolaire, date_realisation)
          VALUES (
            $1, 
            'PROJET', 
            'Application de suivi des notes solaires', 
            'Création d''un prototype de suivi en HTML/CSS et JS pour aider mes camarades.', 
            '2025-2026', 
            '2026-04-15'
          ) ON CONFLICT DO NOTHING
        `, [eleve.id]);

        await db.query(`
          INSERT INTO portfolio_items (eleve_id, type, titre, description, annee_scolaire, date_realisation)
          VALUES (
            $1, 
            'SPORT', 
            'Championnat scolaire d''Athlétisme', 
            'Médaille de bronze au 100m lors des compétitions régionales inter-lycées.', 
            '2024-2025', 
            '2025-05-10'
          ) ON CONFLICT DO NOTHING
        `, [eleve.id]);

        // Résultats nationaux (simulation d'un BFEM obtenu l'année précédente)
        await db.query(`
          INSERT INTO resultats_examens_nationaux (eleve_id, type_examen, annee, session, serie, mention, moyenne, statut_resultat, details)
          VALUES (
            $1,
            'BFEM',
            '2024',
            'Normale',
            'Général',
            'ASSEZ_BIEN',
            13.45,
            'ADMIS',
            '{"Maths": 14, "Français": 12, "Histoire-Géo": 13, "Anglais": 15}'::jsonb
          ) ON CONFLICT (eleve_id, type_examen, annee) DO NOTHING
        `, [eleve.id]);

        // Notifications
        await db.query(`
          INSERT INTO notifications (user_id, titre, description, type)
          VALUES ($1, 'Nouvelle note disponible', 'Votre devoir de Mathématiques a été saisi par le professeur. Note: 14.5/20', 'NOTE')
        `, [eleve.user_id]);

        await db.query(`
          INSERT INTO notifications (user_id, titre, description, type)
          VALUES ($1, 'Emploi du temps mis à jour', 'L''emploi du temps de votre classe a été mis à jour par l''administration.', 'EXAMEN')
        `, [eleve.user_id]);

        await db.query(`
          INSERT INTO notifications (user_id, titre, description, type)
          VALUES ($1, 'Nouveau message de l''établissement', 'Veuillez prendre note de la note d''information concernant la fin des cours le 14 juillet.', 'MESSAGE')
        `, [eleve.user_id]);
      }
      console.log('✅ Seeding terminé');
    }

    console.log('--- Migration v10 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v10:', err);
  }
  process.exit();
}

migrate();
