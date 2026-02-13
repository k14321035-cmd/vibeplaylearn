export const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://vibeplaylearn.onrender.com";

export const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Robustly joins BACKEND_URL with a media path.
 * Ensures a single slash between domain and path.
 */
export function getMediaPath(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
}

