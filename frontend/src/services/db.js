import Dexie from 'dexie';

// Initialisation de la base de données IndexedDB locale pour LeralScolaire
export const db = new Dexie('LeralScolaireOfflineDB');

// Déclaration du schéma de la base
// outbox: file d'attente des requêtes en attente (POST, PUT, DELETE)
// cacheStore: cache clé-valeur pour les données de lecture (classes, élèves, etc.)
db.version(1).stores({
  outbox: '++id, clientMutationId, endpoint, method, status, createdAt',
  cacheStore: 'key, updatedAt'
});

export default db;
