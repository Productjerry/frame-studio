import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Layers, Users, Settings, Bell, Search, Image as ImageIcon,
  Grid3x3, Zap, Crown, UploadCloud, Trash2, Plus, Pencil, LogOut,
} from "lucide-react";
import {
  BLUE, INK, SLATE, LINE, BG, FONT_BODY,
  Avatar, LogoMark, Toggle, StatCard, AnalyticsChart,
} from "../components/ui.jsx";
import AdminLogin from "../components/AdminLogin.jsx";
import { getSession, onAuthChange, signOut } from "../lib/auth.js";
import {
  fetchTemplates, createTemplate, setActive, publishAll, deleteTemplate, subscribeTemplates,
} from "../lib/templates.js";

export default function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = loading
  useEffect(() => {
    getSession().then(setSession);
    const unsub = onAuthChange((s) => setSession(s));
    return unsub;
  }, []);

  if (session === undefined) {
    return <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: SLATE, fontFamily: FONT_BODY }}>Loading…</div>;
  }
  if (!session) {
    return <AdminLogin onSignedIn={() => getSession().then(setSession)} />;
  }
  return <AdminDashboard email={session.user?.email} />;
}

function AdminDashboard({ email }) {
  const [nav, setNav] = useState("Dashboard");
  const [period, setPeriod] = useState("Daily");
  const [templates, setTemplates] = useState([]);
  const fileRef = useRef(null);

  async function refresh() { setTemplates(await fetchTemplates()); }
  useEffect(() => {
    refresh();
    const unsub = subscribeTemplates(refresh);
    return unsub;
  }, []);

  const navItems = [
    { k: "Dashboard", icon: LayoutDashboard },
    { k: "Templates", icon: Layers },
    { k: "Users", icon: Users },
    { k: "Settings", icon: Settings },
  ];
  const recentGen = [
    { user: "@alex_dev", tpl: "OpenToWork v2", status: "Success", time: "2m ago" },
    { user: "@sarah_m", tpl: "RAIN '26 Classic", status: "Success", time: "9m ago" },
    { user: "@mike_w", tpl: "Another Measure", status: "Processing", time: "14m ago" },
    { user: "@jess_k", tpl: "Lagos Edition", status: "Success", time: "21m ago" },
  ];

  async function handleUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    await createTemplate(f);
    await refresh();
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", height: "100%", background: BG, fontFamily: FONT_BODY }}>
      <aside style={{ width: 256, background: "#fff", borderRight: `1px solid ${LINE}`, display: "flex", flexDirection: "column", padding: "22px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 22px" }}>
          <LogoMark size={34} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: INK, letterSpacing: "-.5px", lineHeight: 1 }}>RAIN CONFERENCE</div>
            <div style={{ fontSize: 7.5, letterSpacing: "1.5px", color: SLATE, marginTop: 3 }}>A CHARISMATIC RENEWAL CONFERENCE</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ k, icon: Icon }) => {
            const on = nav === k;
            return (
              <button key={k} onClick={() => setNav(k)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 11,
                border: "none", cursor: "pointer", textAlign: "left",
                background: on ? "#eef4ff" : "transparent", color: on ? BLUE : "#475569",
                fontWeight: on ? 700 : 600, fontSize: 14.5, fontFamily: FONT_BODY,
              }}>
                <Icon size={18} strokeWidth={2.1} /> {k}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 11, padding: "10px 8px", borderTop: `1px solid ${LINE}` }}>
          <Avatar name="JR" size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{email ? email.split("@")[0] : "Admin"}</div>
            <div style={{ fontSize: 12, color: SLATE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email || "Admin Access"}</div>
          </div>
          <button onClick={() => signOut()} title="Sign out" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 6, display: "flex" }}>
            <LogOut size={17} color={SLATE} />
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${LINE}`, background: BG, position: "sticky", top: 0, zIndex: 5 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: INK, letterSpacing: "-.5px" }}>Admin Dashboard</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: SLATE }}>Overview of Frame Studio performance</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 11, padding: "10px 14px", width: 260 }}>
              <Search size={16} color={SLATE} />
              <input placeholder="Search data..." style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: INK, width: "100%", fontFamily: FONT_BODY }} />
            </div>
            <button style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={18} color="#475569" />
              <span style={{ position: "absolute", top: 9, right: 11, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
            </button>
          </div>
        </div>

        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <StatCard icon={ImageIcon} tint={{ bg: "#eff6ff", fg: BLUE }} label="Total Generations" value="124,892" sub="+12.5% this month" subColor="#16a34a" />
            <StatCard icon={Grid3x3} tint={{ bg: "#faf5ff", fg: "#9333ea" }} label="Active Templates" value={templates.filter((t) => t.active).length} sub="published to users" />
            <StatCard icon={Zap} tint={{ bg: "#fff7ed", fg: "#ea580c" }} label="Daily Active Users" value="3,412" sub="+5.2% from yesterday" subColor="#16a34a" />
            <StatCard icon={Crown} tint={{ bg: "#ecfdf5", fg: "#059669" }} label="Pro Upgrades" value="892" sub="Lifetime conversion 8%" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${LINE}`, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>Generation Analytics</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: SLATE }}>Daily volume over the last 30 days</p>
                </div>
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 9, padding: 3 }}>
                  {["Daily", "Weekly", "Monthly"].map((p) => (
                    <button key={p} onClick={() => setPeriod(p)} style={{
                      border: "none", cursor: "pointer", padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 700, fontFamily: FONT_BODY,
                      background: period === p ? "#fff" : "transparent", color: period === p ? INK : SLATE,
                      boxShadow: period === p ? "0 1px 2px rgba(0,0,0,.08)" : "none",
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 16 }}><AnalyticsChart /></div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${LINE}`, padding: 26 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>New Template</h3>
              <p style={{ margin: "4px 0 18px", fontSize: 13, color: SLATE }}>Upload a transparent PNG frame</p>
              <input ref={fileRef} type="file" accept="image/png,image/*" hidden onChange={handleUpload} />
              <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed #c7d6f0`, borderRadius: 16, padding: "34px 20px", textAlign: "center", cursor: "pointer", background: "#fafbff" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <UploadCloud size={22} color={BLUE} />
                </div>
                <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>Click to upload</div>
                <div style={{ fontSize: 12.5, color: SLATE, marginTop: 5 }}>PNG with transparency (2000×2000px)</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: SLATE, margin: "22px 0 12px" }}>QUICK ACTIONS</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={async () => { await publishAll(); refresh(); }} style={{ flex: 1, background: BLUE, color: "#fff", border: "none", borderRadius: 11, padding: "13px", fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: FONT_BODY }}>Publish All</button>
                <button onClick={async () => { if (templates[0]) { await deleteTemplate(templates[0].id); refresh(); } }} style={{ width: 50, border: `1px solid ${LINE}`, background: "#fff", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Trash2 size={18} color="#64748b" />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${LINE}`, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>Recent Generations</h3>
                <a style={{ color: BLUE, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>View Full Log</a>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    {["USER", "TEMPLATE", "STATUS", "TIME"].map((h) => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".5px", color: SLATE, padding: "0 0 12px", borderBottom: `1px solid ${LINE}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentGen.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: "13px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar name={r.user} size={28} /><span style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{r.user}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13.5, color: "#475569" }}>{r.tpl}</td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: r.status === "Success" ? "#ecfdf5" : "#fff7ed", color: r.status === "Success" ? "#16a34a" : "#ea580c" }}>{r.status}</span>
                      </td>
                      <td style={{ fontSize: 13, color: SLATE }}>{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${LINE}`, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>Active Templates</h3>
                <button onClick={() => fileRef.current?.click()} style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Plus size={18} color={BLUE} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflow: "auto" }}>
                {templates.length === 0 && (
                  <div style={{ fontSize: 13, color: SLATE, padding: "20px 0", textAlign: "center" }}>No templates yet — upload one above.</div>
                )}
                {templates.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: 12, borderRadius: 14, border: `1px solid ${LINE}` }}>
                    <div style={{ width: 46, height: 46, borderRadius: 11, flexShrink: 0, background: t.image_url ? `url(${t.image_url}) center/cover` : `linear-gradient(135deg,${t.color}22,${t.color}11)`, border: `1px solid ${LINE}` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: SLATE }}>Used {(t.uses || 0).toLocaleString()} times · Updated {t.updated}</div>
                    </div>
                    <Pencil size={16} color={SLATE} style={{ cursor: "pointer" }} />
                    <Toggle on={t.active} onClick={async () => { await setActive(t.id, !t.active); refresh(); }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
