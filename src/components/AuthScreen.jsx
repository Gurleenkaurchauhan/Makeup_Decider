import { useState } from "react";
import { signUp, logIn } from "../auth.js";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const signup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { onAuth(await (signup ? signUp(f) : logIn(f))); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <div className="auth">
      <form className="combo auth-card" onSubmit={submit}>
        <h1>💄 Makeup combo wheel ✨</h1>
        <h2 style={{ textAlign: "center" }}>{signup ? "Create your account 🎀" : "Welcome back 💖"}</h2>
        {signup && <label className="field">Your name<input value={f.name} onChange={set("name")} autoComplete="name" /></label>}
        <label className="field">Email<input type="email" value={f.email} onChange={set("email")} autoComplete="email" required /></label>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <span className="pw">
            <input id="pw" type={show ? "text" : "password"} value={f.password} onChange={set("password")} autoComplete={signup ? "new-password" : "current-password"} required />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>{show ? "🙈" : "👁️"}</button>
          </span>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="big" type="submit" disabled={busy} style={{ animation: "none" }}>{busy ? "Please wait…" : signup ? "Sign up" : "Log in"}</button>
        <p className="muted small" style={{ textAlign: "center" }}>
          {signup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="link" onClick={() => { setMode(signup ? "login" : "signup"); setErr(""); }}>{signup ? "Log in" : "Create an account"}</button>
        </p>
        <p className="muted small" style={{ textAlign: "center" }}>Accounts are saved in this browser only, so they don’t sync to other devices.</p>
      </form>
    </div>
  );
}
