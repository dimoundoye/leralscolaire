// Référentiel National des 16 IA et IEF du Sénégal structurées par Région Académique

export const REFERENTIEL_IA_IEF = [
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

// Helper: Obtenir toutes les IA (avec leur région)
export const getAllIas = () => {
  const list = [];
  REFERENTIEL_IA_IEF.forEach(r => {
    r.ias.forEach(ia => {
      list.push({ region: r.region, nom: ia.nom });
    });
  });
  return list;
};

// Helper: Obtenir les IA pour une région donnée
export const getIasByRegion = (regionNom) => {
  const reg = REFERENTIEL_IA_IEF.find(r => r.region.toLowerCase() === (regionNom || '').toLowerCase());
  return reg ? reg.ias.map(ia => ia.nom) : [];
};

// Helper: Obtenir les IEF pour une IA donnée
export const getIefsByIa = (iaNom) => {
  for (const reg of REFERENTIEL_IA_IEF) {
    const found = reg.ias.find(ia => ia.nom.toLowerCase() === (iaNom || '').toLowerCase());
    if (found) return found.iefs;
  }
  return [];
};
