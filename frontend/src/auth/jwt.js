/**
 * Decodes a JWT payload on the client for display and ownership checks
 * only. This is NOT verification — the backend is the source of truth
 * for whether a token is valid.
 */
export function decodeToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "="));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Different backends put the user id/username under different keys.
 * Try the common ones so ownership checks work without knowing the
 * exact shape this API uses.
 */
export function userFromToken(token) {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.id ?? payload.userId ?? payload.sub ?? null,
    username: payload.username ?? payload.name ?? null,
    email: payload.email ?? null,
    raw: payload,
  };
}
