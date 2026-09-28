import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [status, setStatus] = useState("loading"); // loading | ready | not-found | error
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // There's no GET /post/:id in the API, so the post is located from
    // the full list. If the backend adds a single-post endpoint later,
    // swap this for a direct fetch.
    api
      .getPosts()
      .then((posts) => {
        if (cancelled) return;
        const post = posts.find((p) => String(p.id) === String(id));
        if (!post) {
          setStatus("not-found");
          return;
        }
        setForm({ title: post.title ?? "", content: post.content ?? "" });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.updatePost(id, form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <p className="muted">Loading post…</p>;
  if (status === "not-found") return <p className="error-text">Post not found.</p>;
  if (status === "error") return <p className="error-text">Couldn't load this post.</p>;

  return (
    <div className="page-narrow">
      <h1>Edit dispatch</h1>
      <form onSubmit={handleSubmit} className="form card">
        <label>
          Title
          <input type="text" name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Content
          <textarea name="content" value={form.content} onChange={handleChange} rows={8} required />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
