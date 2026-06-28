/**
 * Auto error recovery: catches global errors and unhandled promise rejections.
 * - Chunk load errors (after deploys) → silent one-shot reload
 * - Network/transient errors → log + swallow to avoid white-screen
 * - Everything else → log; ErrorBoundary handles UI
 */

const RELOAD_KEY = "__auto_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 30_000;

function isChunkError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("dynamically imported module") ||
    m.includes("failed to fetch dynamically imported") ||
    m.includes("loading chunk") ||
    m.includes("loading css chunk") ||
    m.includes("importing a module script failed")
  );
}

function maybeReloadForChunk(msg: string): boolean {
  if (!isChunkError(msg)) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    console.warn("[auto-recover] Chunk load error — reloading once:", msg);
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

let installed = false;
export function installAutoErrorRecovery() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    const msg = event?.message || event?.error?.message || "";
    if (maybeReloadForChunk(msg)) {
      event.preventDefault();
      return;
    }
    // Swallow ResizeObserver loop warnings (benign noise)
    if (msg.includes("ResizeObserver loop")) {
      event.preventDefault();
      return;
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: any = event?.reason;
    const msg = typeof reason === "string" ? reason : reason?.message || "";
    if (maybeReloadForChunk(msg)) {
      event.preventDefault();
      return;
    }
    // Swallow AbortError noise from fetch cancellations
    if (reason?.name === "AbortError") {
      event.preventDefault();
      return;
    }
    console.warn("[auto-recover] Unhandled rejection:", msg || reason);
  });
}
