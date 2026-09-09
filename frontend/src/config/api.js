/**
 * Configuration centralisée de l'API LeralScolaire
 * - En développement local : utilise VITE_API_URL ou les chemins relatifs proxyfiés par Vite
 * - En production Docker/Nginx : utilise des chemins relatifs ('') redirigés vers le conteneur backend
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Construit l'URL complète pour un endpoint API donné
 * @param {string} endpoint - Ex: '/api/auth/login' ou 'api/eleves'
 * @returns {string} URL finale
 */
export function getApiUrl(endpoint) {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
}

/**
 * Résout l'URL d'un média (photo, document, avatar)
 * Gère automatiquement Cloudinary (https://...) et le stockage local (/uploads/...)
 * @param {string} url - URL ou chemin relatif
 * @returns {string} URL finale
 */
export function getFileUrl(url) {
  if (!url) return '';
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${clean}`;
}
