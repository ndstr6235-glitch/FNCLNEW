"use client";

import { useEffect } from "react";

const IDLE_MS = 30 * 60 * 1000; // stejné jako SESSION_IDLE_MS
const PING_MS = 5 * 60 * 1000;

/**
 * Hlídá nečinnost v prohlížeči: při aktivitě jednou za 5 min prodlouží session,
 * po 30 min bez aktivity odhlásí a přesměruje na /login (i když je stránka jen otevřená).
 */
export default function IdleLogout() {
  useEffect(() => {
    let lastActivity = Date.now();
    let lastPing = Date.now();
    let loggingOut = false;

    const logout = async () => {
      if (loggingOut) return;
      loggingOut = true;
      try {
        await fetch("/api/crm/logout", { method: "POST", redirect: "manual" });
      } catch {}
      window.location.href = "/login";
    };

    const onActivity = () => {
      lastActivity = Date.now();
    };

    const tick = async () => {
      const now = Date.now();
      if (now - lastActivity > IDLE_MS) return logout();
      if (lastActivity > lastPing && now - lastPing > PING_MS) {
        lastPing = now;
        try {
          const r = await fetch("/api/crm/session", { method: "POST" });
          if (r.status === 401) return logout();
        } catch {}
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    const id = window.setInterval(tick, 30 * 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(id);
    };
  }, []);

  return null;
}
