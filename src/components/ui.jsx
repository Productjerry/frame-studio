import React, { useEffect } from "react";
import { TrendingUp, MapPin } from "lucide-react";

export const BLUE = "#2563eb";
export const BLUE_DARK = "#1d4ed8";
export const INK = "#0f172a";
export const SLATE = "#64748b";
export const LINE = "#eef1f6";
export const BG = "#f7f8fb";
export const FONT_DISPLAY = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";
export const FONT_BODY = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

export function Avatar({ src, name, size = 34, ring }) {
  const initials = (name || "?").replace("@", "").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: src ? `url(${src}) center/cover` : "linear-gradient(135deg,#dbeafe,#bfdbfe)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: BLUE_DARK,
      boxShadow: ring ? `0 0 0 2.5px ${ring}, 0 0 0 5px #fff` : "none",
    }}>
      {!src && initials}
    </div>
  );
}

export function LogoMark({ size = 36 }) {
  const [ok, setOk] = React.useState(true);
  // Drop your logo at public/logo.png (or .svg and change the src below).
  // If the file is missing or fails to load, we fall back to the lettermark.
  if (ok) {
    return (
      <img
        src="/logo.png"
        alt="Logo"
        onError={() => setOk(false)}
        style={{ height: size, width: "auto", maxWidth: size * 5, objectFit: "contain", flexShrink: 0, display: "block" }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      border: `2px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700,
      fontSize: size * 0.4, color: INK, background: "#fff",
    }}>Rᴄ</div>
  );
}

export function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 23, borderRadius: 20, border: "none", cursor: "pointer",
      background: on ? BLUE : "#cbd5e1", position: "relative", transition: "background .2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 2.5, left: on ? 20 : 2.5, width: 18, height: 18,
        borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

export function StatCard({ icon: Icon, tint, label, value, sub, subColor }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: "20px 22px",
      border: `1px solid ${LINE}`, boxShadow: "0 1px 2px rgba(15,23,42,.04)", flex: 1, minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: SLATE, fontSize: 14, fontWeight: 600 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: tint.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={tint.fg} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: INK, marginTop: 12, letterSpacing: "-1px" }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: subColor || SLATE, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
        {subColor === "#16a34a" && <TrendingUp size={14} />}{sub}
      </div>
    </div>
  );
}

export function AnalyticsChart() {
  const pts = [500, 540, 600, 560, 690, 660, 780, 720, 880, 840, 1000, 1010, 980, 1080,
    1140, 1100, 1240, 1210, 1340, 1300, 1480, 1440, 1560, 1520, 1660, 1700, 1640, 1820, 1760, 1900];
  const W = 560, H = 250, pad = 30, maxV = 2000;
  const x = (i) => pad + (i * (W - pad * 2)) / (pts.length - 1);
  const y = (v) => H - pad - (v / maxV) * (H - pad * 2);
  const line = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const area = `${line} L${x(pts.length - 1)},${H - pad} L${x(0)},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.18" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 500, 1000, 1500, 2000].map((g) => (
        <g key={g}>
          <line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke={LINE} strokeWidth="1" />
          <text x={pad - 6} y={y(g) + 4} fontSize="9" fill={SLATE} textAnchor="end">{g}</text>
        </g>
      ))}
      <path d={area} fill="url(#fill)" />
      <path d={line} fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FrameCanvas({ photo, x, y, scale, imageUrl, round, size = 360, shape = "circle", ratio = "square", slot = null }) {
  // Mirrors composeFramedDP exactly so preview == export.
  const [nat, setNat] = React.useState(null);
  React.useEffect(() => {
    if (!photo) { setNat(null); return; }
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = photo;
  }, [photo]);

  // canvas dimensions in px (scaled so the longer side == size)
  const portrait = ratio === "portrait";
  const aspectH = portrait ? 1350 / 1080 : 1; // height/width
  const W = size;
  const H = size * aspectH;

  // default slot (fractions of canvas) when none provided
  const s = slot || (shape === "circle"
    ? { x: 0.15, y: (H - 0.70 * W) / 2 / H, w: 0.70, h: (0.70 * W) / H }
    : { x: 0.08, y: 0.08, w: 0.84, h: 0.84 });
  const slotX = s.x * W, slotY = s.y * H, slotW = s.w * W, slotH = s.h * H;

  let imgStyle = null;
  if (photo && nat) {
    const cover = Math.max(slotW / nat.w, slotH / nat.h);
    const drawW = nat.w * cover * (scale || 1);
    const drawH = nat.h * cover * (scale || 1);
    const left = slotW / 2 + (x || 0) * slotW - drawW / 2;
    const top = slotH / 2 + (y || 0) * slotH - drawH / 2;
    imgStyle = { position: "absolute", width: drawW, height: drawH, left, top, maxWidth: "none" };
  }

  const isCircle = shape === "circle";
  return (
    <div style={{
      position: "relative", width: W, height: H, borderRadius: round ? 24 : 16,
      overflow: "hidden", background: imageUrl ? "#0b1220" : "linear-gradient(160deg,#8aa4c8,#5b7da8 45%,#33576f)",
    }}>
      {!imageUrl && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 25%, rgba(255,255,255,.35), transparent 45%)" }} />}

      {/* photo slot */}
      <div style={{
        position: "absolute", left: slotX, top: slotY, width: slotW, height: slotH,
        borderRadius: isCircle ? "50%" : Math.min(slotW, slotH) * 0.06,
        overflow: "hidden",
        border: isCircle ? `${Math.min(slotW, slotH) * 0.03}px solid rgba(255,255,255,.92)` : "none",
        boxSizing: "border-box", background: "#e8eef5",
      }}>
        {photo && imgStyle ? (
          <img src={photo} alt="" style={imgStyle} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No photo</div>
        )}
      </div>

      {/* frame on top */}
      {imageUrl ? (
        <img src={imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none" }} />
      ) : (
        <svg viewBox="0 0 360 360" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <path id="ringtop" d="M 180,180 m -150,0 a 150,150 0 1 1 300,0" fill="none" />
            <path id="ringbot" d="M 180,180 m -130,0 a 130,130 0 0 0 260,0" fill="none" />
          </defs>
          <text fill="#fff" fontFamily={FONT_DISPLAY} fontWeight="800" fontSize="20" letterSpacing="2px" style={{ textShadow: "0 1px 4px rgba(0,0,0,.4)" }}>
            <textPath href="#ringtop" startOffset="6%">RAIN CONFERENCE '26 · ANOTHER MEASURE</textPath>
          </text>
          <text fill="#fff" fontFamily={FONT_DISPLAY} fontWeight="700" fontSize="13" letterSpacing="2px" style={{ textShadow: "0 1px 4px rgba(0,0,0,.4)" }}>
            <textPath href="#ringbot" startOffset="14%">ABUJA JUNE 26–28 · LAGOS JULY 3–5</textPath>
          </text>
        </svg>
      )}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#475569", width: 14 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)}
        style={{ flex: 1, height: 6, borderRadius: 4, appearance: "none", cursor: "pointer",
          background: `linear-gradient(90deg, ${BLUE} ${pct}%, #e2e8f0 ${pct}%)` }} />
    </div>
  );
}

// Zoom control: minus button, slider, plus button. value is a scale multiplier.
export function ZoomControl({ value, min = 1, max = 3, onChange }) {
  const clamp = (v) => Math.min(max, Math.max(min, +v.toFixed(2)));
  const pct = ((value - min) / (max - min)) * 100;
  const btn = {
    width: 34, height: 34, borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff",
    cursor: "pointer", fontSize: 20, fontWeight: 700, color: "#475569", lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Zoom</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={btn} onClick={() => onChange(clamp(value - 0.1))}>−</button>
        <input type="range" min={min} max={max} step={0.01} value={value} onChange={(e) => onChange(+e.target.value)}
          style={{ flex: 1, height: 6, borderRadius: 4, appearance: "none", cursor: "pointer",
            background: `linear-gradient(90deg, ${BLUE} ${pct}%, #e2e8f0 ${pct}%)` }} />
        <button style={btn} onClick={() => onChange(clamp(value + 0.1))}>+</button>
      </div>
    </div>
  );
}

// Two minimalist countdown cards: Abuja (Jun 26) and Lagos (Jul 3), 2026.
function CountdownCard({ city, dateLabel, target }) {
  const [t, setT] = React.useState(() => target - new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(target - new Date()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = (() => {
    if (t < 0) return null;
    const d = Math.floor(t / 86400000);
    const h = Math.floor(t / 3600000) % 24;
    const m = Math.floor(t / 60000) % 60;
    const s = Math.floor(t / 1000) % 60;
    return [[d, "Days"], [h, "Hrs"], [m, "Min"], [s, "Sec"]];
  })();

  return (
    <div style={{ background: "#fff", border: `0.5px solid ${LINE}`, borderRadius: 14, padding: "20px 16px", flex: 1, minWidth: 240 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{city}</div>
          <div style={{ fontSize: 12, color: SLATE }}>{dateLabel}</div>
        </div>
        <MapPin size={18} color={BLUE} />
      </div>
      {cells ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {cells.map(([v, label]) => (
            <div key={label} style={{ background: "#eef2fb", borderRadius: 8, padding: "10px 4px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{String(v).padStart(2, "0")}</div>
              <div style={{ fontSize: 10, letterSpacing: "1px", color: "#94a3b8", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: BLUE, padding: "8px 0" }}>Happening now</div>
      )}
    </div>
  );
}

export function ConferenceCountdown() {
  const abuja = new Date("2026-06-26T00:00:00");
  const lagos = new Date("2026-07-03T00:00:00");
  return (
    <div>
      <p style={{ textAlign: "center", fontSize: 13, letterSpacing: "1.5px", color: SLATE, margin: "0 0 16px", textTransform: "uppercase" }}>
        Counting down to Rain Conference '26
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <CountdownCard city="Abuja" dateLabel="June 26, 2026" target={abuja} />
        <CountdownCard city="Lagos" dateLabel="July 3, 2026" target={lagos} />
      </div>
    </div>
  );
}
