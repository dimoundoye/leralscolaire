const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: (process.env.DB_PASS || '').replace(/^"|"$/g, ''),
  database: process.env.DB_NAME || 'leralscolaire',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const IA_IEF_DATA = [
  {
    region: 'Dakar',
    ias: [
      {
        nom: 'IA de Dakar',
        iefs: ['IEF Dakar-Centre', 'IEF Dakar-Plateau', 'IEF Almadies', 'IEF Grand-Dakar']
      },
      {
        nom: 'IA de Pikine-Guédiawaye',
        iefs: ['IEF Pikine', 'IEF Guédiawaye', 'IEF Thiaroye']
      },
      {
        nom: 'IA de Rufisque',
        iefs: ['IEF Rufisque-Commune', 'IEF Rufisque-Sangalcam']
      }
    ]
  },
  {
    region: 'Thiès',
    ias: [
      {
        nom: 'IA de Thiès',
        iefs: ['IEF Thiès-Ville', 'IEF Thiès-Département', 'IEF Tivaouane', 'IEF Mbour 1', 'IEF Mbour 2']
      }
    ]
  },
  {
    region: 'Diourbel',
    ias: [
      {
        nom: 'IA de Diourbel',
        iefs: ['IEF Diourbel', 'IEF Bambey', 'IEF Mbacké']
      }
    ]
  },
  {
    region: 'Saint-Louis',
    ias: [
      {
        nom: 'IA de Saint-Louis',
        iefs: ['IEF Saint-Louis-Commune', 'IEF Saint-Louis-Département', 'IEF Dagana', 'IEF Podor']
      }
    ]
  },
  {
    region: 'Louga',
    ias: [
      {
        nom: 'IA de Louga',
        iefs: ['IEF Louga', 'IEF Kebemer', 'IEF Linguère']
      }
    ]
  },
  {
    region: 'Fatick',
    ias: [
      {
        nom: 'IA de Fatick',
        iefs: ['IEF Fatick', 'IEF Foundiougne', 'IEF Gossas']
      }
    ]
  },
  {
    region: 'Kaolack',
    ias: [
      {
        nom: 'IA de Kaolack',
        iefs: ['IEF Kaolack-Commune', 'IEF Kaolack-Département', 'IEF Guinguinéo', 'IEF Ndoffane']
      }
    ]
  },
  {
    region: 'Kaffrine',
    ias: [
      {
        nom: 'IA de Kaffrine',
        iefs: ['IEF Kaffrine', 'IEF Birkelane', 'IEF Malem Hoddar', 'IEF Koungheul']
      }
    ]
  },
  {
    region: 'Ziguinchor',
    ias: [
      {
        nom: 'IA de Ziguinchor',
        iefs: ['IEF Ziguinchor', 'IEF Oussouye', 'IEF Bignona 1', 'IEF Bignona 2']
      }
    ]
  },
  {
    region: 'Kolda',
    ias: [
      {
        nom: 'IA de Kolda',
        iefs: ['IEF Kolda', 'IEF Vélingara', 'IEF Médina Yoro Foulah']
      }
    ]
  },
  {
    region: 'Sédhiou',
    ias: [
      {
        nom: 'IA de Sédhiou',
        iefs: ['IEF Sédhiou', 'IEF Bounkiling', 'IEF Goudomp']
      }
    ]
  },
  {
    region: 'Tambacounda',
    ias: [
      {
        nom: 'IA de Tambacounda',
        iefs: ['IEF Tambacounda', 'IEF Koumpentoum', 'IEF Bakel', 'IEF Goudiry']
      }
    ]
  },
  {
    region: 'Kédougou',
    ias: [
      {
        nom: 'IA de Kédougou',
        iefs: ['IEF Kédougou', 'IEF Salémata', 'IEF Saraya']
      }
    ]
  },
  {
    region: 'Matam',
    ias: [
      {
        nom: 'IA de Matam',
        iefs: ['IEF Matam', 'IEF Kanel', 'IEF Ranérou']
      }
    ]
  }
];

async function migrate() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Table IA
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspections_academie (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL UNIQUE,
        region VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Table IEF
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspections_education_formation (
        id SERIAL PRIMARY KEY,
        ia_id INT NOT NULL REFERENCES inspections_academie(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Colonnes ia_nom et ief_nom dans etablissements et demandes_inscription_office
    await client.query(`
      ALTER TABLE etablissements 
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100);
    `);

    await client.query(`
      ALTER TABLE demandes_inscription_office
      ADD COLUMN IF NOT EXISTS ia_nom VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ief_nom VARCHAR(100);
    `);

    // Populate IA and IEF
    let totalIaCount = 0;
    let totalIefCount = 0;

    for (const regData of IA_IEF_DATA) {
      for (const ia of regData.ias) {
        const iaRes = await client.query(`
          INSERT INTO inspections_academie (nom, region)
          VALUES ($1, $2)
          ON CONFLICT (nom) DO UPDATE SET region = EXCLUDED.region
          RETURNING id
        `, [ia.nom, regData.region]);
        const iaId = iaRes.rows[0].id;
        totalIaCount++;

        for (const iefNom of ia.iefs) {
          await client.query(`
            INSERT INTO inspections_education_formation (ia_id, nom)
            VALUES ($1, $2)
            ON CONFLICT (nom) DO UPDATE SET ia_id = EXCLUDED.ia_id
          `, [iaId, iefNom]);
          totalIefCount++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Référentiel national IA/IEF créé avec succès : ${totalIaCount} IA et ${totalIefCount} IEF.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur migration IA/IEF :', err);
  } finally {
    client.release();
    await db.end();
  }
}

migrate();
