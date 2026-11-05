import { FormEvent, useState } from "react";
import { useLanguage } from "@/i18n/language";
import { ProjectFooter } from "@/components/project-footer";

export function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          username: username.normalize("NFKC").replace(/[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu, "").trim(),
          password: password.normalize("NFKC").replace(/^[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]+|[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]+$/gu, ""),
        }),
      });
      if (response.ok) {
        onAuthenticated();
        return;
      }
      const payload = await response.json().catch(() => null) as { code?: string } | null;
      setError(payload?.code === "auth_not_configured" ? t.auth.unavailable : t.auth.invalid);
    } catch {
      setError(t.auth.invalid);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="athara-login-screen flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="athara-login-card w-full max-w-sm rounded-[28px] border border-border bg-card p-6 shadow-lg sm:p-8" dir="auto">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">{t.auth.title}</h1>
        <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="username">{t.auth.username}</label>
        <input id="username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="mb-4 h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground outline-none focus:border-primary" />
        <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="password">{t.auth.password}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mb-5 h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground outline-none focus:border-primary" />
        {error && <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground disabled:opacity-60">
          {submitting ? t.auth.signingIn : t.auth.submit}
        </button>
        </form>
      </main>
      <ProjectFooter />
    </div>
  );
}
