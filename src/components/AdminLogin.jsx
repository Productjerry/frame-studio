import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { BLUE, INK, SLATE, LINE, BG, FONT_BODY, LogoMark } from "./ui.jsx";
import { signIn } from "../lib/auth.js";

export default function AdminLogin({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    const { user, error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) { setError(error); return; }
    if (user) onSignedIn(user);
  }

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BG, fontFamily: FONT_BODY }}>
      <div style={{ width: 380, background: "#fff", borderRadius: 22, border: `1px solid ${LINE}`, padding: "38px 34px", boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <LogoMark size={48} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: INK, letterSpacing: "-.5px" }}>Admin Sign In</div>
            <div style={{ fontSize: 13.5, color: SLATE, marginTop: 4 }}>Frame Studio control panel</div>
          </div>
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: ".4px" }}>EMAIL</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{ width: "100%", marginTop: 7, marginBottom: 16, padding: "13px 14px", borderRadius: 11, border: `1px solid ${LINE}`, fontSize: 14.5, outline: "none", fontFamily: FONT_BODY, background: "#fafbfc" }} />

        <label style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: ".4px" }}>PASSWORD</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{ width: "100%", marginTop: 7, padding: "13px 14px", borderRadius: 11, border: `1px solid ${LINE}`, fontSize: 14.5, outline: "none", fontFamily: FONT_BODY, background: "#fafbfc" }} />

        {error && <div style={{ marginTop: 14, fontSize: 13, color: "#dc2626", background: "#fef2f2", padding: "10px 12px", borderRadius: 9 }}>{error}</div>}

        <button onClick={submit} disabled={busy || !email || !password} style={{
          width: "100%", marginTop: 22, background: BLUE, color: "#fff", border: "none", borderRadius: 12,
          padding: "14px", fontWeight: 700, fontSize: 15.5, cursor: busy ? "wait" : "pointer",
          opacity: (!email || !password) ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: FONT_BODY,
        }}>
          <LogIn size={18} /> {busy ? "Signing in…" : "Sign In"}
        </button>

        <div style={{ marginTop: 18, fontSize: 12, color: SLATE, textAlign: "center", lineHeight: 1.5 }}>
          Accounts are created in your Supabase dashboard.<br />No public sign-up.
        </div>
      </div>
    </div>
  );
}
