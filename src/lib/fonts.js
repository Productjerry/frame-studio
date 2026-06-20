// Loads the Bender font (placed at public/fonts/bender.woff2) and exposes a
// promise that resolves once it's ready, so canvas export doesn't fall back
// to a default font.

let benderPromise = null;

export function ensureBender() {
  if (benderPromise) return benderPromise;
  benderPromise = (async () => {
    try {
      // Inject @font-face once for the HTML preview.
      if (!document.getElementById("bender-face")) {
        const style = document.createElement("style");
        style.id = "bender-face";
        style.textContent = `@font-face{font-family:'Bender';src:url('/fonts/bender.woff2') format('woff2'),url('/fonts/bender.ttf') format('truetype'),url('/fonts/bender.otf') format('opentype');font-weight:400 900;font-display:swap;}`;
        document.head.appendChild(style);
      }
      // Use the FontFace API so we can await actual readiness for canvas.
      if (document.fonts && document.fonts.load) {
        await document.fonts.load("700 48px Bender");
        await document.fonts.ready;
      }
    } catch (_) { /* fall back silently to default font */ }
    return true;
  })();
  return benderPromise;
}
