import React, { useState, useRef, useEffect } from "react";
import { X, Move } from "lucide-react";
import { BLUE, INK, SLATE, LINE, FONT_BODY, Toggle } from "./ui.jsx";

/* Admin editor shown after picking a frame PNG. Lets the admin choose:
   - shape: circle | square (how the user's photo is masked)
   - ratio: square (1080x1080) | portrait (1080x1350)
   - slot:  {x,y,w,h} fractions — where the photo shows through, set by dragging.
   Photo always sits BEHIND the frame. */
export default function ThemeEditor({ file, onCancel, onSave }) {
  const [shape, setShape] = useState("square");
  const [ratio, setRatio] = useState("portrait");
  const [name, setName] = useState(file?.name?.replace(/\.[^.]+$/, "") || "New Theme");
  const [frameUrl, setFrameUrl] = useState(null);
  const [slot, setSlot] = useState({ x: 0.15, y: 0.18, w: 0.7, h: 0.55 });
  const [dynOn, setDynOn] = useState(false);
  const [dynText, setDynText] = useState("WE REGRET TO INFORM YOU: PASTOR {name} IS");
  const [dynBox, setDynBox] = useState({ x: 0.08, y: 0.58, w: 0.84, h: 0.1 });
  const [dynSize, setDynSize] = useState(0.045);   // fraction of width
  const [dynColor, setDynColor] = useState("#ffffff");
  const [dynAlign, setDynAlign] = useState("center");
  const [busy, setBusy] = useState(false);
  const stageRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => { import("../lib/fonts.js").then((m) => m.ensureBender()); }, []);

  useEffect(() => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setFrameUrl(r.result);
    r.readAsDataURL(file);
  }, [file]);

  const portrait = ratio === "portrait";
  const stageW = 320;
  const stageH = portrait ? stageW * (1350 / 1080) : stageW;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  // target: 'slot' or 'dyn'
  function onPointerDown(e, mode, target = "slot") {
    e.preventDefault();
    const rect = stageRef.current.getBoundingClientRect();
    drag.current = {
      mode, target,
      startX: e.clientX, startY: e.clientY,
      orig: { ...(target === "dyn" ? dynBox : slot) }, rect,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e) {
    const d = drag.current; if (!d) return;
    const dx = (e.clientX - d.startX) / d.rect.width;
    const dy = (e.clientY - d.startY) / d.rect.height;
    const setter = d.target === "dyn" ? setDynBox : setSlot;
    if (d.mode === "move") {
      setter({ ...d.orig, x: clamp01(d.orig.x + dx), y: clamp01(d.orig.y + dy) });
    } else {
      setter({
        ...d.orig,
        w: Math.max(0.08, Math.min(1 - d.orig.x, d.orig.w + dx)),
        h: Math.max(0.04, Math.min(1 - d.orig.y, d.orig.h + dy)),
      });
    }
  }
  function onPointerUp() {
    drag.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  async function save() {
    setBusy(true);
    const dyntext = dynOn
      ? { text: dynText, box: dynBox, fontSize: dynSize, color: dynColor, align: dynAlign, font: "Bender" }
      : null;
    try { await onSave({ name, shape, ratio, slot, dyntext }); }
    finally { setBusy(false); }
  }

  const seg = (active) => ({
    flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${active ? BLUE : LINE}`,
    background: active ? "#eff6ff" : "#fff", color: active ? BLUE : "#475569",
    fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: FONT_BODY,
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, fontFamily: FONT_BODY }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 720, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: INK }}>New Theme</div>
          <button onClick={onCancel} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={22} color={SLATE} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
          {/* stage with draggable slot */}
          <div>
            <div ref={stageRef} style={{ position: "relative", width: stageW, height: stageH, borderRadius: 12, overflow: "hidden", background: "#0b1220", userSelect: "none" }}>
              {/* the photo slot region the admin is positioning */}
              <div
                onPointerDown={(e) => onPointerDown(e, "move")}
                style={{
                  position: "absolute",
                  left: `${slot.x * 100}%`, top: `${slot.y * 100}%`,
                  width: `${slot.w * 100}%`, height: `${slot.h * 100}%`,
                  borderRadius: shape === "circle" ? "50%" : 10,
                  background: "rgba(37,99,235,.25)", border: `2px solid ${BLUE}`,
                  cursor: "move", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <Move size={18} color="#fff" />
                {/* resize handle */}
                <div
                  onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, "resize"); }}
                  style={{ position: "absolute", right: -7, bottom: -7, width: 16, height: 16, borderRadius: 4, background: "#fff", border: `2px solid ${BLUE}`, cursor: "nwse-resize" }}
                />
              </div>
              {/* frame on top so admin sees how it overlaps */}
              {frameUrl && <img src={frameUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none" }} />}

              {/* dynamic text box (draggable, sits above frame) */}
              {dynOn && (
                <div
                  onPointerDown={(e) => onPointerDown(e, "move", "dyn")}
                  style={{
                    position: "absolute",
                    left: `${dynBox.x * 100}%`, top: `${dynBox.y * 100}%`,
                    width: `${dynBox.w * 100}%`, height: `${dynBox.h * 100}%`,
                    border: `2px dashed #f59e0b`, background: "rgba(245,158,11,.12)",
                    cursor: "move", display: "flex", alignItems: "center",
                    justifyContent: dynAlign === "left" ? "flex-start" : dynAlign === "right" ? "flex-end" : "center",
                    overflow: "hidden",
                  }}>
                  <span style={{
                    fontFamily: "'Bender', sans-serif", fontWeight: 700,
                    fontSize: dynSize * stageW, color: dynColor, lineHeight: 1.1,
                    textAlign: dynAlign, width: "100%", pointerEvents: "none",
                  }}>{dynText.replace(/\{name\}/gi, "Nathaniel Bassey")}</span>
                  <div
                    onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, "resize", "dyn"); }}
                    style={{ position: "absolute", right: -7, bottom: -7, width: 16, height: 16, borderRadius: 4, background: "#fff", border: `2px solid #f59e0b`, cursor: "nwse-resize" }}
                  />
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: SLATE, marginTop: 10, lineHeight: 1.5 }}>
              Drag the blue box to where the user's photo should show. Drag the corner to resize.
            </div>
          </div>

          {/* controls */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: ".4px" }}>THEME NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", marginTop: 7, marginBottom: 18, padding: "11px 13px", borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, outline: "none", fontFamily: FONT_BODY }} />

            <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: ".4px", marginBottom: 8 }}>PHOTO SHAPE</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button style={seg(shape === "circle")} onClick={() => setShape("circle")}>Circle</button>
              <button style={seg(shape === "square")} onClick={() => setShape("square")}>Square / Free</button>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: ".4px", marginBottom: 8 }}>CANVAS SIZE</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button style={seg(ratio === "square")} onClick={() => setRatio("square")}>Square 1080×1080</button>
              <button style={seg(ratio === "portrait")} onClick={() => setRatio("portrait")}>Portrait 1080×1350</button>
            </div>

            <div style={{ borderTop: `1px solid ${LINE}`, margin: "4px 0 18px", paddingTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: dynOn ? 14 : 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: ".4px" }}>DYNAMIC NAME TEXT</div>
                <Toggle on={dynOn} onClick={() => setDynOn(!dynOn)} />
              </div>
              {dynOn && (
                <div>
                  <textarea value={dynText} onChange={(e) => setDynText(e.target.value)} rows={2}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 13.5, outline: "none", fontFamily: FONT_BODY, resize: "vertical", marginBottom: 6 }} />
                  <div style={{ fontSize: 11.5, color: SLATE, marginBottom: 14, lineHeight: 1.5 }}>
                    Use <b>{"{name}"}</b> where the user's name should appear. The orange box on the left is draggable/resizable.
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SLATE, width: 60 }}>Size</span>
                    <input type="range" min={0.02} max={0.12} step={0.002} value={dynSize} onChange={(e) => setDynSize(+e.target.value)} style={{ flex: 1 }} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SLATE, width: 60 }}>Color</span>
                    <input type="color" value={dynColor} onChange={(e) => setDynColor(e.target.value)} style={{ width: 42, height: 30, border: "none", background: "none", cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    {["left", "center", "right"].map((a) => (
                      <button key={a} style={seg(dynAlign === a)} onClick={() => setDynAlign(a)}>{a[0].toUpperCase() + a.slice(1)}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={save} disabled={busy} style={{ flex: 2, background: BLUE, color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontWeight: 700, fontSize: 14.5, cursor: busy ? "wait" : "pointer", fontFamily: FONT_BODY }}>{busy ? "Saving…" : "Save Theme"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
