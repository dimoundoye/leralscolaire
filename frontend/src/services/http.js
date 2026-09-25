// Point d'entrée unique des appels à l'API : même signature et même réponse que fetch.
// Centralise le traitement commun à toutes les requêtes, en particulier la session expirée :
// une réponse 401 prévient l'application, qui ferme la session et renvoie vers la connexion.

const sessionExpiredListeners = new Set();

export function onSessionExpired(listener) {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

// Les routes d'authentification gèrent elles-mêmes leurs 401 (identifiants erronés, vérification de session)
const isAuthRoute = (input) => String(input?.url ?? input).includes('/api/auth/');

export async function apiFetch(input, init) {
  const response = await fetch(input, init);
  if (response.status === 401 && !isAuthRoute(input)) {
    sessionExpiredListeners.forEach((listener) => listener());
  }
  return response;
}
