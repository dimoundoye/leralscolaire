const db = require('./db');

async function migrate() {
  try {
    console.log('--- Démarrage de la migration v3 ---');

    // 1. Ajouter l'appréciation aux notes
    await db.query(`
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS appreciation TEXT;
    `);
    console.log('✅ Colonne appreciation ajoutée aux notes');

    // 2. Table historique_notes pour l'audit
    await db.query(`
      CREATE TABLE IF NOT EXISTS historique_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
        ancienne_valeur DECIMAL(4,2),
        nouvelle_valeur DECIMAL(4,2),
        ancienne_appreciation TEXT,
        nouvelle_appreciation TEXT,
        auteur_id UUID REFERENCES users(id),
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table historique_notes créée');

    // 3. Table classe_matieres pour les coefficients par classe
    await db.query(`
      CREATE TABLE IF NOT EXISTS classe_matieres (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        matiere_id UUID REFERENCES matieres(id) ON DELETE CASCADE,
        coefficient INTEGER DEFAULT 1,
        UNIQUE (classe_id, matiere_id)
      );
    `);
    console.log('✅ Table classe_matieres créée');

    // 4. Table emplois_du_temps
    await db.query(`
      CREATE TABLE IF NOT EXISTS emplois_du_temps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        matiere_id UUID REFERENCES matieres(id),
        professeur_id UUID REFERENCES users(id),
        jour_semaine VARCHAR(20) NOT NULL, -- Lundi, Mardi...
        heure_debut TIME NOT NULL,
        heure_fin TIME NOT NULL,
        salle VARCHAR(50)
      );
    `);
    console.log('✅ Table emplois_du_temps créée');

    // 5. Table absences
    await db.query(`
      CREATE TABLE IF NOT EXISTS absences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        date_absence DATE DEFAULT CURRENT_DATE,
        justifiee BOOLEAN DEFAULT FALSE,
        points_deduits INTEGER DEFAULT 0
      );
    `);
    console.log('✅ Table absences créée');

    // 6. Table examens_planification
    await db.query(`
      CREATE TABLE IF NOT EXISTS examens_planification (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        etablissement_id UUID REFERENCES etablissements(id) ON DELETE CASCADE,
        classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        matiere_id UUID REFERENCES matieres(id),
        type_examen VARCHAR(20) CHECK (type_examen IN ('DEVOIR', 'COMPOSITION', 'EXAMEN')),
        date_examen TIMESTAMP NOT NULL,
        salle VARCHAR(50)
      );
    `);
    console.log('✅ Table examens_planification créée');

    // 7. Ajouter signature et cachet aux établissements
    await db.query(`
      ALTER TABLE etablissements 
      ADD COLUMN IF NOT EXISTS signature_url TEXT,
      ADD COLUMN IF NOT EXISTS cachet_url TEXT;
    `);
    console.log('✅ Colonnes signature et cachet ajoutées aux etablissements');

    // 8. Table pour les bulletins générés
    await db.query(`
      CREATE TABLE IF NOT EXISTS bulletins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
        periode VARCHAR(50), -- ex: Trimestre 1, Semestre 2
        annee_scolaire VARCHAR(20),
        moyenne_generale DECIMAL(4,2),
        decision VARCHAR(50), -- Passage, Redoublement, etc.
        qr_code_data TEXT,
        pdf_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table bulletins créée');

    console.log('--- Migration v3 terminée avec succès ---');
  } catch (err) {
    console.error('❌ Erreur de migration v3:', err);
  } finally {
    process.exit();
  }
}

migrate();
