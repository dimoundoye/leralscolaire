import { db } from './db';

class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      // Détection automatique du retour de connexion (Online Event)
      window.addEventListener('online', () => {
        console.log('[SyncEngine] Connexion Internet rétablie. Démarrage de la synchronisation...');
        this.notifyListeners({ event: 'online' });
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        console.log('[SyncEngine] Déconnexion Internet détectée. Mode hors-ligne activé.');
        this.notifyListeners({ event: 'offline' });
      });

      // Vérification périodique toutes les 30s si des éléments sont en attente
      setInterval(() => {
        if (navigator.onLine && !this.isSyncing) {
          this.getPendingCount().then((count) => {
            if (count > 0) {
              this.processQueue();
            }
          });
        }
      }, 30000);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(data) {
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error('[SyncEngine] Erreur dans un listener:', err);
      }
    });
  }

  // Ajoute une requête dans la file d'attente sortante (Outbox)
  async enqueue({ endpoint, method = 'POST', body = null, headers = {}, label = 'Action' }) {
    const clientMutationId = `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const item = {
      clientMutationId,
      endpoint,
      method,
      body,
      headers,
      label,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    const id = await db.outbox.add(item);
    console.log(`[SyncEngine] Action mise en attente (Outbox #${id}): ${label} -> ${endpoint}`);
    
    this.notifyListeners({ event: 'enqueued', item: { ...item, id } });

    // Si on est actuellement en ligne, on tente immédiatement d'envoyer
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 500);
    }

    return { ...item, id };
  }

  async getPendingCount() {
    try {
      return await db.outbox.where('status').equals('pending').count();
    } catch {
      return 0;
    }
  }

  async getPendingItems() {
    try {
      return await db.outbox.where('status').equals('pending').sortBy('id');
    } catch {
      return [];
    }
  }

  // Dépile la file d'attente (Outbox) dans l'ordre chronologique (FIFO)
  async processQueue() {
    if (this.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[SyncEngine] Impossible de synchroniser : hors-ligne.');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners({ event: 'sync_start' });

    try {
      const items = await db.outbox.where('status').equals('pending').sortBy('id');
      if (items.length === 0) {
        this.isSyncing = false;
        this.notifyListeners({ event: 'sync_end', count: 0 });
        return;
      }

      console.log(`[SyncEngine] Début du dépilement de ${items.length} requête(s) en attente...`);

      let syncedCount = 0;

      for (const item of items) {
        // Marquer comme en cours de traitement
        await db.outbox.update(item.id, { status: 'syncing' });

        try {
          // Token d'authentification frais
          const token = localStorage.getItem('token');
          const finalHeaders = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...item.headers,
            'X-Client-Mutation-Id': item.clientMutationId
          };

          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: finalHeaders,
            body: item.body ? JSON.stringify(item.body) : undefined
          });

          if (response.ok || response.status === 409) {
            // Succès (ou déjà traité par le serveur)
            await db.outbox.delete(item.id);
            syncedCount++;
            console.log(`[SyncEngine] Succès pour l'action #${item.id} (${item.label})`);
            this.notifyListeners({ event: 'item_synced', itemId: item.id, item });
          } else if (response.status >= 400 && response.status < 500) {
            // Erreur client irrécupérable (ex: 400 validation, 403 interdit) -> on marque comme 'failed' pour ne pas bloquer la file
            const errData = await response.json().catch(() => ({}));
            console.warn(`[SyncEngine] Échec rejeté par le serveur #${item.id}:`, errData);
            await db.outbox.update(item.id, {
              status: 'failed',
              errorMessage: errData.message || `Erreur HTTP ${response.status}`
            });
            this.notifyListeners({ event: 'item_failed', itemId: item.id, error: errData });
          } else {
            // Erreur 500 serveur -> on remet en pending avec un compteur de réessai
            await db.outbox.update(item.id, {
              status: 'pending',
              retryCount: (item.retryCount || 0) + 1
            });
            console.warn(`[SyncEngine] Erreur serveur temporaire pour #${item.id}, arrêt de la boucle.`);
            break; // On s'arrête pour réessayer plus tard
          }
        } catch (networkErr) {
          // Vraie coupure réseau (NetworkError / Fetch failed)
          console.warn(`[SyncEngine] Coupure réseau pendant l'envoi de #${item.id}:`, networkErr.message);
          await db.outbox.update(item.id, { status: 'pending' });
          break; // Sort de la boucle, attendra le prochain retour de connexion
        }
      }

      this.notifyListeners({ event: 'sync_end', count: syncedCount });
    } catch (err) {
      console.error('[SyncEngine] Erreur globale lors du traitement de la file:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners({ event: 'idle' });
    }
  }

  // Cache des données de lecture pour affichage hors-ligne
  async setCache(key, data) {
    try {
      await db.cacheStore.put({ key, data, updatedAt: Date.now() });
    } catch (err) {
      console.warn('[SyncEngine] Impossible de mettre en cache:', key, err);
    }
  }

  async getCache(key) {
    try {
      const record = await db.cacheStore.get(key);
      return record ? record.data : null;
    } catch (err) {
      console.warn('[SyncEngine] Impossible de lire le cache:', key, err);
      return null;
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
