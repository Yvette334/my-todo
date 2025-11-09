"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/80 p-8 text-slate-100 shadow-2xl shadow-slate-950/40">
        <h1 className="text-center text-2xl font-semibold">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:from-emerald-300 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
        {error && <p className="text-center text-sm text-rose-300">{error}</p>}
      </div>
    </div>
  );
}

