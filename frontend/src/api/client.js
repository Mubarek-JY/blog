const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * The backend expects the raw JWT in the Authorization header,
 * with no "Bearer " prefix:
 *   Authorization: <token>
 * That's non-standard, so it's isolated here in one place.
 */
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, authHeader());

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error(
      "Couldn't reach the server. Check your connection and that the API is running."
    );
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * This backend's auth middleware responds with HTTP 200 (not 401) and a
 * `{ message: "..." }` body when a token is missing/invalid, and login
 * sends `{ message: "Incorrect password" }` the same way on failure. A
 * 200 status alone doesn't mean the request actually succeeded here, so
 * anywhere we expect a specific shape back, check for it explicitly
 * rather than trusting response.ok.
 */
export const api = {
  register: async (payload) => {
    const data = await request("/auth/register", { method: "POST", body: payload });
    if (!data?.token) {
      throw new Error(data?.message || "Registration failed.");
    }
    return data;
  },

  login: async (payload) => {
    const data = await request("/auth/login", { method: "POST", body: payload });
    if (!data?.token) {
      throw new Error(data?.message || "Login failed.");
    }
    return data;
  },

  getPosts: async () => {
    const data = await request("/post", { auth: true });
    if (!data || !Array.isArray(data.posts)) {
      throw new Error(data?.message || "Couldn't load posts.");
    }
    return data.posts;
  },

  createPost: (payload) => request("/post", { method: "POST", body: payload, auth: true }),
  updatePost: (id, payload) =>
    request(`/post/${id}`, { method: "PATCH", body: payload, auth: true }),
  deletePost: (id) => request(`/post/${id}`, { method: "DELETE", auth: true }),

  getComments: async (postId) => {
    const data = await request(`/post/comments/${postId}`, { auth: true });
    if (!data || !Array.isArray(data.comments)) {
      throw new Error(data?.message || "Couldn't load comments.");
    }
    return data.comments;
  },

  createComment: (postId, payload) =>
    request(`/post/comments/${postId}`, { method: "POST", body: payload, auth: true }),
};
