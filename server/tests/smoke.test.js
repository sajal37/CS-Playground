const assert = require("assert/strict");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";

async function get(path) {
  const res = await fetch(BASE_URL + path);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}

(async () => {
  try {
    const health = await get("/api/health");
    assert.equal(health.status, "ok");

    if (process.env.RUN_DB_TESTS === "1") {
      const setup = await post("/api/setup");
      assert.equal(setup.status, "ok");
    }

    console.log("API smoke tests passed.");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();
