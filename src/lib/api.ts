const configuredBase = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

export const API_BASE = configuredBase;

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  return API_BASE ? `${API_BASE}${path}` : path;
}
