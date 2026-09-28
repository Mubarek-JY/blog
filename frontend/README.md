# Dispatch — frontend

A React + Vite frontend for your posts/comments backend.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your backend's URL
npm run dev
```

## What's assumed about the API

Your spec listed some routes without an explicit `:id`, so this app assumes
the conventional REST shape. If your backend differs, these are the only
places to change:

- **`PATCH /post/`** → assumed to be `PATCH /post/:id` (see `src/api/client.js`, `updatePost`)
- **`DELETE /post/`** → assumed to be `DELETE /post/:id` (`deletePost`)
- **`GET /post/comments/`** → assumed to be `GET /post/comments/:postId` (`getComments`)
- **`POST /post/comments/`** → assumed to be `POST /post/comments/:postId` (`createComment`)
- **No `GET /post/:id`** was listed, so the Edit page loads the full list
  from `GET /post` and finds the matching post client-side
  (`src/pages/EditPost.jsx`). Swap this for a direct fetch if you add a
  single-post endpoint later.

## Auth

- `GET /post` and `GET /post/comments/:postId` require the token too, not
  just the write endpoints — the Home page shows "Log in to see the feed"
  for logged-out visitors as a result.
- The login response is expected as `{ "token": "..." }`.
- The JWT is sent as `Authorization: <token>` — **no** `Bearer ` prefix,
  matching what you described. That's isolated in one function
  (`authHeader` in `src/api/client.js`) if it ever changes.
- The token is stored in `localStorage` and decoded client-side (not
  verified — just read) to get the logged-in user's id/username, used to
  show Edit/Delete only on the current user's own posts. This only works
  if your JWT payload includes an id or username claim, and if your
  `/post` responses include matching author info (`authorId`, `userId`,
  `author.id`, `author.username`, or `username`). If neither lines up,
  edit/delete controls are hidden rather than guessed at — see
  `src/utils/ownership.js`.
- No refresh-token handling, as requested — a 401 just leaves the stale
  token in place until the user logs out and back in.

## Structure

```
src/
  api/client.js          fetch wrapper, one function per endpoint
  auth/                  AuthContext, JWT decode, ProtectedRoute
  components/            Navbar, PostCard, CommentSection
  pages/                 Home, Login, Register, CreatePost, EditPost
  utils/ownership.js     author/date display + ownership check
```
