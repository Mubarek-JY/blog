import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { authorLabel, formatDate } from "../utils/ownership";
import Avatar from "./Avatar";

export default function CommentSection({ postId }) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getComments(postId)
      .then((comments) => {
        if (cancelled) return;
        setComments(comments);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const newComment = await api.createComment(postId, { content: draft.trim() });
      setComments((prev) => [...prev, newComment ?? { content: draft.trim() }]);
      setDraft("");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="comment-section">
      {status === "loading" && <p className="muted">Loading comments…</p>}
      {status === "error" && <p className="error-text">Couldn't load comments.</p>}

      {status === "ready" && (
        <ul className="comment-list">
          {comments.length === 0 && <li className="muted">No comments yet.</li>}
          {comments.map((comment, index) => {
            const author = authorLabel(comment);
            const date = formatDate(comment.createdAt ?? comment.date ?? comment.postedAt);
            return (
              <li key={comment.id ?? index} className="comment">
                <Avatar label={author} size={28} />
                <div className="comment-body">
                  <p className="comment-meta">
                    <span className="comment-author">{author}</span>
                    {date && <span className="comment-date">{date}</span>}
                  </p>
                  <p className="comment-content">{comment.content}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment"
            rows={2}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? "Posting…" : "Comment"}
          </button>
          {submitError && <p className="error-text">{submitError}</p>}
        </form>
      ) : (
        <p className="muted">Log in to leave a comment.</p>
      )}
    </div>
  );
}
