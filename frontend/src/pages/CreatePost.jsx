import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function CreatePost() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createPost(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-narrow">
      <h1>New dispatch</h1>
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
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
