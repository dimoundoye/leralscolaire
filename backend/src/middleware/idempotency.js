/**
 * Middleware d'Idempotence Express pour LeralScolaire
 * Empêche la ré-exécution en doublon des requêtes différées réémises par le SyncEngine
 */

// Cache mémoire des mutations récentes (Clé: X-Client-Mutation-Id -> Valeur: Réponse HTTP)
const processedMutations = new Map();

const idempotencyMiddleware = async (req, res, next) => {
  const mutationId = req.headers['x-client-mutation-id'] || req.headers['x-mutation-id'];

  // Si aucun identifiant de mutation n'est présent (requête directe classique), poursuivre le traitement
  if (!mutationId) {
    return next();
  }

  // 1. Vérification dans le cache d'idempotence
  if (processedMutations.has(mutationId)) {
    const cachedResponse = processedMutations.get(mutationId);
    console.log(`[Idempotency] Mutation ${mutationId} déjà exécutée. Retour HTTP ${cachedResponse.status} (Replay neutre).`);
    return res.status(cachedResponse.status).json({
      ...cachedResponse.data,
      idempotentReplay: true
    });
  }

  // 2. Interception de res.json pour mémoriser la réponse officielle
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      processedMutations.set(mutationId, {
        status: res.statusCode,
        data: body,
        timestamp: Date.now()
      });
      // Purge automatique du cache après 24 heures pour libérer la mémoire
      setTimeout(() => processedMutations.delete(mutationId), 86400000);
    }
    return originalJson.call(this, body);
  };

  next();
};

module.exports = idempotencyMiddleware;
