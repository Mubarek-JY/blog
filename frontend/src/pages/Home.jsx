import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error | unauthenticated
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // The backend requires a token for GET /post, so a logged-out visitor
    // can't see the feed. Treat that case separately from a real failure.
    if (!isAuthenticated) {
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");
    api
      .getPosts()
      .then((posts) => {
        if (cancelled) return;
        setPosts(posts);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function handleDeleted(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Latest dispatches</h1>
        {isAuthenticated && (
          <Link to="/new" className="btn btn-primary btn-sm">
            New post
          </Link>
        )}
      </div>

      {status === "unauthenticated" && (
        <p className="muted">
          <Link to="/login">Log in</Link> to see the feed.
        </p>
      )}

      {status === "loading" && <p className="muted">Loading posts…</p>}

      {status === "error" && (
        <p className="error-text">{errorMessage || "Couldn't load posts. Try refreshing the page."}</p>
      )}

      {status === "ready" && posts.length === 0 && (
        <p className="muted">No posts yet. Be the first to write one.</p>
      )}

      {status === "ready" && (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
