import { auth } from "./firebase";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function authHeaders(forceRefresh = false) {
  const token = await auth.currentUser?.getIdToken();
  const refreshedToken = forceRefresh ? await auth.currentUser?.getIdToken(true) : token;
  return refreshedToken ? { Authorization: `Bearer ${refreshedToken}` } : {};
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders(Boolean(options.forceRefreshToken))),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function publicApi(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return payload;
}
