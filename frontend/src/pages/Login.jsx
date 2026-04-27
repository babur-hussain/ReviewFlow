import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Chrome, Mail } from "lucide-react";
import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "../lib/firebase";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

function readableAuthError(error) {
  if (error.message === "Failed to fetch") {
    return "Backend is not running at localhost:8080. Start the backend after adding MONGODB_URI in backend/.env.";
  }

  const code = error.code || "";
  if (code.includes("auth/email-already-in-use")) return "This email already has an account. Switch to Sign in.";
  if (code.includes("auth/invalid-credential")) return "Email or password is incorrect, or this account was created with Google.";
  if (code.includes("auth/operation-not-allowed")) return "Enable Email/Password sign-in in Firebase Authentication.";
  if (code.includes("auth/weak-password")) return "Use a password with at least 6 characters.";
  if (code.includes("auth/popup-closed-by-user")) return "Google sign-in was closed before it finished.";
  return error.message;
}

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function finishLogin() {
    await auth.currentUser?.getIdToken(true);
    const profile = await refreshProfile();
    const target = profile?.onboardingComplete ? "/dashboard" : "/onboarding";
    navigate(location.state?.from?.pathname || target, { replace: true });
  }

  async function handleEmail(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await api("/api/auth/me", { forceRefreshToken: true });
      await finishLogin();
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      await finishLogin();
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">ReviewFlow</p>
          <h1>Collect better Google reviews with a guided customer flow.</h1>
          <p className="muted">Sign in to set up your branded review page, QR code, and AI review assistant.</p>
        </div>
        <form onSubmit={handleEmail} className="auth-form">
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary-button" disabled={busy}><Mail size={18} />{mode === "signup" ? "Create account" : "Sign in"}</button>
        </form>
        <button className="secondary-button" onClick={handleGoogle} disabled={busy}><Chrome size={18} /> Continue with Google</button>
        <button className="link-button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </section>
    </main>
  );
}
