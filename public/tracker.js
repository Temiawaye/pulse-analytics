(() => {
  "use strict";

  const script = document.currentScript;
  if (!(script instanceof HTMLScriptElement)) return;

  const trackingId = script.dataset.websiteId;
  if (!trackingId || script.dataset.disabled === "true") return;

  const hostname = window.location.hostname;
  const isDevelopment =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost");
  if (isDevelopment && script.dataset.trackLocalhost !== "true") return;

  const endpoint =
    script.dataset.endpoint || new URL("/api/track", script.src).toString();
  const storageKey = `pulse_visitor_${trackingId}`;
  let memoryId;

  function randomId() {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replaceAll("-", "");
    }
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  function visitorId() {
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return existing;
      const created = randomId();
      localStorage.setItem(storageKey, created);
      return created;
    } catch {
      memoryId ||= randomId();
      return memoryId;
    }
  }

  function safeReferrer(value) {
    if (!value) return undefined;
    try {
      const url = new URL(value, window.location.origin);
      return `${url.origin}${url.pathname}`;
    } catch {
      return undefined;
    }
  }

  function sendPageView(referrer) {
    const payload = JSON.stringify({
      trackingId,
      event: "page_view",
      path: window.location.pathname || "/",
      title: document.title.slice(0, 300),
      referrer: safeReferrer(referrer),
      anonymousId: visitorId(),
      timestamp: new Date().toISOString(),
    });

    if (
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(
        endpoint,
        new Blob([payload], { type: "text/plain;charset=UTF-8" }),
      )
    ) {
      return;
    }

    void fetch(endpoint, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).catch(() => undefined);
  }

  let lastPath = window.location.pathname;
  function handleNavigation(previousUrl) {
    queueMicrotask(() => {
      const nextPath = window.location.pathname;
      if (nextPath === lastPath) return;
      lastPath = nextPath;
      sendPageView(previousUrl);
    });
  }

  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) {
      const previousUrl = window.location.href;
      const result = original.apply(this, args);
      handleNavigation(previousUrl);
      return result;
    };
  }

  window.addEventListener("popstate", () =>
    handleNavigation(document.referrer),
  );
  sendPageView(document.referrer);
})();
