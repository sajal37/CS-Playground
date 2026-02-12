const API_BASE = "/api";

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
