import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { authorLabel, formatDate, isPostOwner } from "../utils/ownership";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const owner = isPostOwner(post, user);
  const author = authorLabel(post);
  const date = formatDate(post.createdAt ?? post.date ?? post.postedAt);

  async function handleDelete() {
    if (!window.confirm("Delete this post? This can't be undone.")) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <article className="post-card">
      <div className="post-byline">
        <Avatar label={author} />
        <div>
          <p className="post-author">{author}</p>
          {date && <p className="post-date">{date}</p>}
        </div>
      </div>

      <h2 className="post-title">{post.title}</h2>
      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button className="chip" onClick={() => setShowComments((s) => !s)}>
          {showComments ? "Hide comments" : "Comments"}
        </button>

        {owner && (
          <>
            <button className="chip" onClick={() => navigate(`/post/${post.id}/edit`)}>
              Edit
            </button>
            <button className="chip chip-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        )}
      </div>

      {deleteError && <p className="error-text">{deleteError}</p>}
      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
}
