/**
 * The API's exact shape for "who wrote this post" isn't fixed, so this
 * checks the common shapes a backend might return:
 *   post.authorId / post.userId / post.author.id / post.author (string id)
 *   post.username / post.author.username
 * If none of these are present, ownership is unknown and edit/delete
 * controls are hidden rather than guessed at.
 */
export function isPostOwner(post, user) {
  if (!post || !user) return false;

  const candidateIds = [
    post.authorId,
    post.userId,
    post.author?.id,
    typeof post.author === "string" || typeof post.author === "number" ? post.author : undefined,
  ].filter((value) => value !== undefined && value !== null);

  if (user.id !== null && candidateIds.some((id) => String(id) === String(user.id))) {
    return true;
  }

  const candidateUsernames = [post.username, post.author?.username].filter(Boolean);
  if (user.username && candidateUsernames.some((name) => name === user.username)) {
    return true;
  }

  return false;
}

export function authorLabel(post) {
  if (post.author?.username) return post.author.username;
  if (post.author?.name) return post.author.name;
  if (typeof post.author === "string") return post.author;
  if (post.username) return post.username;
  if (post.authorName) return post.authorName;
  return "Unknown";
}

export function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const AVATAR_PALETTE = ["#3730A3", "#0F766E", "#9A3412", "#4338CA", "#166534", "#9D174D"];

export function initials(label) {
  if (!label) return "?";
  const parts = label.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[1][0]] : [parts[0][0]];
  return chars.join("").toUpperCase();
}

export function avatarColor(label) {
  if (!label) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
