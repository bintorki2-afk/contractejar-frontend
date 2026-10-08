/**
 * Defers non-critical work (monitoring, analytics, service workers) until the
 * customer interacts with the page, or until `maxDelayMs` after `load` —
 * whichever comes first — then runs it in an idle callback. Keeps third-party
 * scripts off the critical path (#27) without losing them for real visitors.
 */
const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

export function runWhenIdle(fn: () => void, { maxDelayMs = 6000 } = {}): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let done = false;
  let timeoutId: number | null = null;
  let idleId: number | null = null;

  const cleanupListeners = () => {
    for (const event of INTERACTION_EVENTS) {
      window.removeEventListener(event, trigger);
    }
    window.removeEventListener("load", armTimer);
  };

  const run = () => {
    if (done) return;
    done = true;
    cleanupListeners();
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => fn(), { timeout: 2000 });
    } else {
      fn();
    }
  };

  const trigger = () => run();

  const armTimer = () => {
    if (done) return;
    timeoutId = window.setTimeout(run, maxDelayMs);
  };

  for (const event of INTERACTION_EVENTS) {
    window.addEventListener(event, trigger, { once: true, passive: true });
  }

  if (document.readyState === "complete") {
    armTimer();
  } else {
    window.addEventListener("load", armTimer, { once: true });
  }

  return () => {
    done = true;
    cleanupListeners();
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    if (idleId !== null && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleId);
    }
  };
}
