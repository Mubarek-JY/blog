import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

const initialForm = { email: "", username: "", name: "", password: "" };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | error | done
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await api.register(form);
      setStatus("done");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="page-narrow">
      <h1>Create an account</h1>

      {status === "done" ? (
        <p className="success-text">Account created. Taking you to log in…</p>
      ) : (
        <form onSubmit={handleSubmit} className="form card">
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Username
            <input type="text" name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={status === "submitting"}>
            {status === "submitting" ? "Creating account…" : "Register"}
          </button>
        </form>
      )}

      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
