function resolveApiBase() {
  if (typeof window === "undefined") return "/api";

  const metaBase = document.querySelector('meta[name="cs-api-base"]')?.content?.trim();
  const explicitBase = window.__CS_API_BASE__ || metaBase;
  if (explicitBase) return explicitBase.replace(/\/+$/u, "");

  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocalhost && window.location.port === "3000") {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }

  return "/api";
}

const API_BASE = resolveApiBase();

export async function apiGet(endpoint) {
  const res = await fetch(API_BASE + endpoint);
  return res.json();
}

export async function apiPost(endpoint, body) {
  const res = await fetch(API_BASE + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}
