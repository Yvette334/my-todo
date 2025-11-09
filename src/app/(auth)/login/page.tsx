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
    <div>
      <div >
        <h1>Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input placeholder="Email" type="email" value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              ...submit,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}

