import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud, ArrowLeft, MoreVertical, Maximize2, RotateCw, ZoomIn, Wand2,
  Share2, Download, Trash2,
} from "lucide-react";
import {
  BLUE, INK, SLATE, LINE, BG, FONT_BODY,
  Avatar, LogoMark, FrameCanvas, Slider, ZoomControl, ConferenceCountdown,
} from "../components/ui.jsx";
import { fetchPublishedTemplates, subscribeTemplates } from "../lib/templates.js";
import { downloadFramedDP } from "../lib/compose.js";

function useResponsive() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 720 : false);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 720);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}

export default function UserPage() {
  const mobile = useResponsive();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(0);

  async function refresh() { setTemplates(await fetchPublishedTemplates()); }
  useEffect(() => {
    refresh();
    const unsub = subscribeTemplates(refresh);
    return unsub;
  }, []);

  const activeFrame = templates[selected]?.image_url || null;
  return mobile
    ? <UserMobile activeFrame={activeFrame} />
    : <UserDesktop activeFrame={activeFrame} />;
}

const recent = ["@alex.d", "@sarah_m", "@mike.w", "@jess_k"];

function ToolBtn({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, background: "#f8fafc", border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: FONT_BODY }}>
      <Icon size={20} color="#475569" />
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>{label}</span>
    </button>
  );
}
function OutlineBtn({ icon: Icon, label, danger, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 15, color: danger ? "#dc2626" : "#334155", fontFamily: FONT_BODY }}>
      <Icon size={17} /> {label}
    </button>
  );
}
function MobileTool({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, fontFamily: FONT_BODY }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color="#475569" />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>{label}</span>
    </button>
  );
}

function UserDesktop({ activeFrame }) {
  const [photo, setPhoto] = useState(null);
  const [x, setX] = useState(0);      // fraction of circle diameter
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rot, setRot] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  function onPick(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { setPhoto(r.result); setX(0); setY(0); setScale(1); }; r.readAsDataURL(f); }
  async function handleDownload() {
    if (!photo) return;
    setBusy(true);
    try { await downloadFramedDP({ photo, frameUrl: activeFrame, x, y, scale, rotation: rot }); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ height: "100%", overflow: "auto", background: BG, fontFamily: FONT_BODY }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px", borderBottom: `1px solid ${LINE}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ArrowLeft size={18} /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={40} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ background: "#eff6ff", color: BLUE, fontWeight: 700, fontSize: 13, padding: "7px 15px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: BLUE }} /> FREE
          </span>
          <MoreVertical size={20} color={SLATE} style={{ cursor: "pointer" }} />
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 36px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          <div style={{ background: "#eef4ff", borderRadius: 18, padding: "34px 26px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 2px 8px rgba(37,99,235,.12)" }}>
              <UploadCloud size={26} color={BLUE} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: INK }}>Upload your photo</div>
            <div style={{ fontSize: 13.5, color: SLATE, marginTop: 6 }}>Supports JPG, PNG up to 5MB</div>
            <button onClick={() => fileRef.current?.click()} style={{ width: "100%", marginTop: 20, background: BLUE, color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontWeight: 700, fontSize: 15.5, cursor: "pointer", fontFamily: FONT_BODY }}>Select Image</button>
          </div>

          <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${LINE}`, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", color: SLATE, marginBottom: 18 }}>POSITIONING</div>
            <Slider label="X" value={x} min={-0.4} max={0.4} step={0.005} onChange={setX} />
            <Slider label="Y" value={y} min={-0.4} max={0.4} step={0.005} onChange={setY} />
            <ZoomControl value={scale} min={1} max={3} onChange={setScale} />
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <ToolBtn icon={RotateCw} label="Rotate" onClick={() => setRot((r) => r + 90)} />
              <ToolBtn icon={ZoomIn} label="Zoom In" onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))} />
              <ToolBtn icon={Wand2} label="Reset" onClick={() => { setX(0); setY(0); setScale(1); setRot(0); }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: INK }}>Recent Frames</span>
              <a style={{ color: SLATE, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>View All</a>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              {recent.map((n, i) => (
                <div key={n} style={{ textAlign: "center" }}>
                  <Avatar name={n} size={56} ring={i === 1 ? BLUE : "#e2e8f0"} />
                  <div style={{ fontSize: 12, color: i === 1 ? INK : SLATE, fontWeight: i === 1 ? 700 : 500, marginTop: 7 }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 22, border: `1px solid ${LINE}`, padding: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: INK }}>Preview</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "#eff6ff", color: BLUE, fontWeight: 700, fontSize: 12.5, padding: "6px 13px", borderRadius: 20 }}>FREE</span>
              <button style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Maximize2 size={16} color={SLATE} /></button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ transform: `rotate(${rot}deg)`, transition: "transform .3s" }}>
              <FrameCanvas photo={photo} x={x} y={y} scale={scale} imageUrl={activeFrame} round size={420} />
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${LINE}`, margin: "28px 0 22px" }} />
          <div style={{ display: "flex", gap: 14, justifyContent: "flex-end" }}>
            <OutlineBtn icon={Share2} label="Share" />
            <OutlineBtn icon={Trash2} label="Discard" danger onClick={() => setPhoto(null)} />
            <button onClick={handleDownload} disabled={!photo || busy} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 12, padding: "14px 26px", fontWeight: 700, fontSize: 15, cursor: photo && !busy ? "pointer" : "not-allowed", opacity: photo ? 1 : 0.55, display: "flex", alignItems: "center", gap: 9, fontFamily: FONT_BODY }}>
              <Download size={18} /> {busy ? "Preparing…" : "Download Framed DP"}
            </button>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "0 36px 28px", fontSize: 14, color: SLATE }}>
        Want more Petra frames? <a style={{ color: BLUE, fontWeight: 700, cursor: "pointer" }}>Browse our Community Gallery</a>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 36px 48px" }}>
        <ConferenceCountdown />
      </div>
    </div>
  );
}

function UserMobile({ activeFrame }) {
  const [photo, setPhoto] = useState(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  function onPick(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { setPhoto(r.result); setX(0); setY(0); setScale(1); }; r.readAsDataURL(f); }
  async function handleDownload() {
    if (!photo) return;
    setBusy(true);
    try { await downloadFramedDP({ photo, frameUrl: activeFrame, x, y, scale }); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "26px 0", background: BG, height: "100%", overflow: "auto", fontFamily: FONT_BODY }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 14px" }}>
          <button style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowLeft size={18} /></button>
          <span style={{ fontWeight: 800, fontSize: 18, color: INK }}>Frame Studio</span>
          <button style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><MoreVertical size={18} /></button>
        </div>

        <div style={{ padding: "8px 20px 24px", flex: 1 }}>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          <div onClick={() => fileRef.current?.click()} style={{ background: "#eef4ff", border: "2px dashed #c7d6f0", borderRadius: 18, padding: "30px 20px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UploadCloud size={26} color={BLUE} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, color: INK }}>Upload your photo</div>
            <div style={{ fontSize: 13, color: SLATE, marginTop: 5 }}>JPG, PNG up to 5MB</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "26px 0 16px" }}>
            <span style={{ fontWeight: 800, fontSize: 19, color: INK }}>Preview</span>
            <span style={{ background: "#eff6ff", color: BLUE, fontWeight: 700, fontSize: 13, padding: "6px 13px", borderRadius: 20 }}>Pro Frame</span>
          </div>

          <div style={{ background: "#fff", borderRadius: 22, border: `1px solid ${LINE}`, padding: 16, boxShadow: "0 2px 10px rgba(15,23,42,.05)" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <FrameCanvas photo={photo} x={x} y={y} scale={scale} imageUrl={activeFrame} round size={300} />
            </div>
            <div style={{ marginTop: 18, padding: "0 4px" }}>
              <Slider label="X" value={x} min={-0.4} max={0.4} step={0.005} onChange={setX} />
              <Slider label="Y" value={y} min={-0.4} max={0.4} step={0.005} onChange={setY} />
              <ZoomControl value={scale} min={1} max={3} onChange={setScale} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16 }}>
              <MobileTool icon={ZoomIn} label="Zoom In" onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))} />
              <MobileTool icon={Wand2} label="Reset" onClick={() => { setX(0); setY(0); setScale(1); }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "26px 0 14px" }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: INK }}>Recent Frames</span>
            <a style={{ color: SLATE, fontSize: 14, fontWeight: 600 }}>View All</a>
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6 }}>
            {recent.map((n, i) => (
              <div key={n} style={{ textAlign: "center", flexShrink: 0 }}>
                <Avatar name={n} size={62} ring={i === 1 ? BLUE : "#e2e8f0"} />
                <div style={{ fontSize: 12, color: i === 1 ? INK : SLATE, fontWeight: i === 1 ? 700 : 500, marginTop: 7 }}>{n}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            <ConferenceCountdown />
          </div>
        </div>

        <div style={{ padding: "16px 20px 26px", borderTop: `1px solid ${LINE}` }}>
          <button onClick={handleDownload} disabled={!photo || busy} style={{ width: "100%", background: BLUE, color: "#fff", border: "none", borderRadius: 16, padding: "17px", fontWeight: 700, fontSize: 16, cursor: photo && !busy ? "pointer" : "not-allowed", opacity: photo ? 1 : 0.55, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: FONT_BODY }}>
            <Download size={19} /> {busy ? "Preparing…" : "Download Framed DP"}
          </button>
        </div>
      </div>
    </div>
  );
}
