/**
 * Normalizes API URLs by removing trailing slashes
 * This prevents double slashes when concatenating paths
 */
export const normalizeApiUrl = (url: string | undefined): string => {
  if (!url) return '';
  return url.replace(/\/+$/, '');
};

export const SUPPORT_API_URL = normalizeApiUrl(import.meta.env.VITE_SUPPORT_API_URL);
export const ECOMMERCE_API_URL = normalizeApiUrl(import.meta.env.VITE_ECOMMERCE_API_URL);

