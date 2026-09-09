const db = require('../config/db');

/**
 * Dictionnaire officiel des trigrammes des 14 régions académiques du Sénégal
 */
const REGION_TRIGRAMMES = {
  'DAKAR': 'DKR',
  'THIES': 'THS',
  'THIÈS': 'THS',
  'SAINT-LOUIS': 'SLN',
  'SAINT LOUIS': 'SLN',
  'DIOURBEL': 'DBL',
  'FATICK': 'FTK',
  'KAOLACK': 'KLK',
  'KOLDA': 'KLD',
  'LOUGA': 'LGA',
  'MATAM': 'MAT',
  'KEDOUGOU': 'KDG',
  'KÉDOUGOU': 'KDG',
  'KAFFRINE': 'KFR',
  'SEDHIOU': 'SDH',
  'SÉDHIOU': 'SDH',
  'TAMBACOUNDA': 'TBA',
  'ZIGUINCHOR': 'ZIG'
};

/**
 * Normalise le nom ou trigramme d'une région vers son trigramme officiel à 3 lettres
 */
function resolveTrigramme(regionInput) {
  if (!regionInput) return 'DKR';
  const clean = String(regionInput).trim().toUpperCase();
  if (REGION_TRIGRAMMES[clean]) {
    return REGION_TRIGRAMMES[clean];
  }
  if (/^[A-Z]{3}$/.test(clean)) {
    return clean;
  }
  for (const [nom, tri] of Object.entries(REGION_TRIGRAMMES)) {
    if (clean.includes(nom) || nom.includes(clean)) {
      return tri;
    }
  }
  const alpha = clean.replace(/[^A-Z]/g, '');
  return (alpha.substring(0, 3) || 'DKR').padEnd(3, 'X');
}

/**
 * Formate la séquence numérique selon la règle d'auto-extension dynamique :
 * - De 1 à 9999 : 4 chiffres de base (0001 à 9999)
 * - > 9999 : nombre direct sans limite (10000, 100000, etc.)
 */
function formatDynamicSequence(seq) {
  const num = parseInt(seq, 10) || 1;
  return num <= 9999 ? String(num).padStart(4, '0') : String(num);
}

/**
 * Génère un IUP unique conforme au standard :
 * IUP = PREFIXE_ROLE - ANNEE - CODE_TRIGRAMME - SEQUENCE_NUMERIQUE_DYNAMIQUE
 *
 * @param {('SN'|'ETAB'|'ENS')} prefix
 * @param {string} region
 * @param {number|string} [year]
 * @param {object} [client]
 * @returns {Promise<string>}
 */
async function generateIUP(prefix, region, year = null, client = db) {
  const annee = year ? String(year).substring(0, 4) : String(new Date().getFullYear());
  const trigramme = resolveTrigramme(region);
  const patternPrefix = `${prefix}-${annee}-${trigramme}-`;

  let lastSeq = 0;

  if (prefix === 'SN') {
    const query = `
      SELECT identifiant_national FROM eleves 
      WHERE identifiant_national LIKE $1
    `;
    const { rows } = await client.query(query, [`${patternPrefix}%`]);
    rows.forEach(r => {
      const parts = (r.identifiant_national || '').split('-');
      if (parts.length >= 4) {
        const seqVal = parseInt(parts[3], 10);
        if (!isNaN(seqVal) && seqVal > lastSeq) {
          lastSeq = seqVal;
        }
      }
    });
  } else if (prefix === 'ETAB') {
    const query = `
      SELECT code_etablissement FROM etablissements 
      WHERE code_etablissement LIKE $1
    `;
    const { rows } = await client.query(query, [`${patternPrefix}%`]);
    rows.forEach(r => {
      const parts = (r.code_etablissement || '').split('-');
      if (parts.length >= 4) {
        const seqVal = parseInt(parts[3], 10);
        if (!isNaN(seqVal) && seqVal > lastSeq) {
          lastSeq = seqVal;
        }
      }
    });
  } else if (prefix === 'ENS') {
    const query = `
      SELECT identifiant_national FROM users 
      WHERE role = 'PROFESSEUR' AND identifiant_national LIKE $1
    `;
    const { rows } = await client.query(query, [`${patternPrefix}%`]);
    rows.forEach(r => {
      const parts = (r.identifiant_national || '').split('-');
      if (parts.length >= 4) {
        const seqVal = parseInt(parts[3], 10);
        if (!isNaN(seqVal) && seqVal > lastSeq) {
          lastSeq = seqVal;
        }
      }
    });
  }

  const nextSeq = lastSeq + 1;
  const seqFormatted = formatDynamicSequence(nextSeq);
  return `${patternPrefix}${seqFormatted}`;
}

module.exports = {
  REGION_TRIGRAMMES,
  resolveTrigramme,
  formatDynamicSequence,
  generateIUP
};
