/**
 * API base path/URL used by Axios.
 * Local:  VITE_API_URL=http://localhost:5000/api
 * Prod:   always /api (Vercel rewrites /api/* → Railway; browser never resolves Railway DNS)
 */
export function getApiBaseUrl() {
  // Hard guarantee for Option A: production never calls Railway directly
  if (import.meta.env.PROD) {
    return '/api';
  }

  const raw = import.meta.env.VITE_API_URL || '/api';
  return String(raw).replace(/\/$/, '');
}

/**
 * Resolve a backend-relative path (e.g. /api/files/...) for fetch/download.
 * Absolute http(s) URLs are returned unchanged (e.g. S3 signed URLs).
 */
export function resolveApiUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;

  const base = getApiBaseUrl();
  const origin = base.replace(/\/api$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export default { getApiBaseUrl, resolveApiUrl };
