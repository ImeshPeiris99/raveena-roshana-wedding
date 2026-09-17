"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6c2.4 0 4.4 1.1 5.9 2.4M21 12s-3.5 6-9 6c-2.4 0-4.4-1.1-5.9-2.4M4 4l16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M9.7 9.7a3.2 3.2 0 0 0 4.6 4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  );
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label>
        Email address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="client@example.com"
          autoComplete="username"
          required
        />
      </label>

      <label>
        Password
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>
      </label>

      {error && <p className="admin-form-error">{error}</p>}
      <button className="admin-primary-button" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in to admin"}
      </button>
    </form>
  );
}
