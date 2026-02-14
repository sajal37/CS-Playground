// --- Inlined helpers ---
const byId = (id) => document.getElementById(id);
const $ = byId;
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

function resolveApiBase() {
  const metaBase = document.querySelector('meta[name="cs-api-base"]')?.content?.trim();
  const explicitBase = window.__CS_API_BASE__ || metaBase;
  if (explicitBase) return explicitBase.replace(/\/+$/u, "");

  const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (isLocalhost && location.port === "3000") {
    return `${location.protocol}//${location.hostname}:3001/api`;
  }

  return "/api";
}

const API_BASE = resolveApiBase();

async function apiGet(endpoint) {
  const res = await fetch(API_BASE + endpoint);
  return res.json();
}

async function apiPost(endpoint, body) {
  const res = await fetch(API_BASE + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function animateNumber(targetEl, to, duration = 600) {
  if (!targetEl) return;
  const start = performance.now();
  const from = 0;

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - p) ** 3;
    targetEl.textContent = (from + (to - from) * eased).toFixed(1);
    if (p < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// --- Inlined constants for Query Optimization ---
const ROUNDS = {
  r1: {
    bad: "SELECT COUNT(*) FROM users WHERE YEAR(created_at) = 2025",
    good: "SELECT COUNT(*) FROM users WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'",
  },
  r2: {
    bad: "SELECT * FROM users WHERE name LIKE '%Aarav%'",
    good: "SELECT * FROM users WHERE name LIKE 'Aarav%'",
  },
  r3: {
    bad: "SELECT * FROM orders ORDER BY order_date DESC",
    good: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 20",
  },
};

const PLAYGROUND = [
  {
    label: "Function: YEAR() vs range",
    bad: "SELECT COUNT(*) FROM users WHERE YEAR(created_at) = 2025",
    good: "SELECT COUNT(*) FROM users WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'",
  },
  {
    label: "Wildcard: %prefix vs prefix%",
    bad: "SELECT * FROM users WHERE name LIKE '%Aarav%'",
    good: "SELECT * FROM users WHERE name LIKE 'Aarav%'",
  },
  {
    label: "Limit: all rows vs LIMIT 20",
    bad: "SELECT * FROM orders ORDER BY order_date DESC",
    good: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 20",
  },
  {
    label: "Date function on orders",
    bad: "SELECT COUNT(*) FROM orders WHERE YEAR(order_date) = 2025",
    good: "SELECT COUNT(*) FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'",
  },
  {
    label: "Wildcard: %keyboard% vs keyboard%",
    bad: "SELECT * FROM orders WHERE product LIKE '%Keyboard%'",
    good: "SELECT * FROM orders WHERE product = 'Keyboard'",
  },
];

const SLOW_MSGS = [
  "you wrote that on purpose?",
  "full table scan. the index is crying.",
  "the database did exactly what you asked. badly.",
  "every. single. row.",
  "the index was right there. you ignored it.",
  "that's not a query. that's a punishment.",
];

const FAST_MSGS = [
  "better.",
  "see? the index was waiting.",
  "same data. you just asked correctly.",
  "that's what competent SQL looks like.",
  "the database thanks you.",
];

const ROUND_FLOW = {
  r1: {
    badStage: "r1Slow",
    fixStage: "r1Fix",
    goodStage: "r1Fast",
    compareStage: "r1Compare",
    nextStage: "r2Challenge",
  },
  r2: {
    badStage: "r2Slow",
    fixStage: "r2Fix",
    goodStage: "r2Fast",
    compareStage: "r2Compare",
    nextStage: "r3Challenge",
  },
  r3: {
    badStage: "r3Slow",
    fixStage: "r3Fix",
    goodStage: "r3Fast",
    compareStage: "r3Compare",
    nextStage: "stagePlayground",
  },
};

const reactionEl = $("reaction");
const terminal = $("terminal");

const state = {
  rounds: {
    r1: { bad: null, good: null },
    r2: { bad: null, good: null },
    r3: { bad: null, good: null },
  },
  pg: { index: 0, bad: null, good: null },
};

let reactionTimer = null;
let slowIdx = 0;
let fastIdx = 0;

function react(msg) {
  if (!reactionEl) return;
  clearTimeout(reactionTimer);
  reactionEl.textContent = msg;
  reactionEl.classList.add("visible");
  reactionTimer = setTimeout(() => reactionEl.classList.remove("visible"), 2400);
}

function addLine(text, cls = "") {
  if (!terminal) return null;
  const span = el("span", "line" + (cls ? " " + cls : ""), text);
  terminal.appendChild(span);
  terminal.scrollTop = terminal.scrollHeight;
  return span;
}

function updateLine(lineEl, text, cls) {
  if (!lineEl) return;
  lineEl.textContent = text;
  if (cls) lineEl.className = "line " + cls;
}

function reveal(id) {
  const stage = $(id);
  if (!stage) return;
  stage.classList.remove("hidden");
  stage.classList.add("revealing");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      stage.classList.remove("revealing");
      stage.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function setBtnState(btn, loading) {
  if (!btn) return;
  const textNode = btn.querySelector(".btn-text");
  if (!textNode) return;
  if (loading) {
    btn.disabled = true;
    textNode.dataset.idleText = textNode.textContent;
    textNode.textContent = "running...";
    return;
  }
  btn.disabled = false;
  textNode.textContent = textNode.dataset.idleText || "Run";
}

function setBarWidth(id, widthPct) {
  const bar = $(id);
  if (!bar) return;
  bar.style.width = `${widthPct}%`;
}

function showComparison(prefix, badTime, goodTime) {
  const slowBar = $(prefix + "BarSlow");
  const fastBar = $(prefix + "BarFast");
  const slowVal = $(prefix + "ValSlow");
  const fastVal = $(prefix + "ValFast");
  const speedupEl = $(prefix + "Speedup");
  if (!slowBar || !fastBar || !slowVal || !fastVal || !speedupEl) return;

  const maxTime = Math.max(badTime, goodTime, 0.1);
  slowVal.textContent = badTime.toFixed(1) + " ms";
  fastVal.textContent = goodTime.toFixed(1) + " ms";

  requestAnimationFrame(() => {
    slowBar.style.width = Math.max((badTime / maxTime) * 100, 2) + "%";
    fastBar.style.width = Math.max((goodTime / maxTime) * 100, 2) + "%";
  });

  const ratio = Math.max(1, Math.round(badTime / Math.max(goodTime, 0.01)));
  speedupEl.textContent = ratio + "x faster";
}

async function executeQuery(sql) {
  return apiPost("/query", { sql });
}

function applyRoundResult(roundKey, type, result) {
  const capType = type === "bad" ? "Bad" : "Good";
  const timeEl = $(roundKey + capType + "Time");
  const planEl = $(roundKey + capType + "Plan");
  const barElId = roundKey + capType + "Bar";

  animateNumber(timeEl, result.time, 500);
  if (planEl) planEl.textContent = result.plan;
  setBarWidth(barElId, 100);

  if (roundKey === "r3") {
    const extraId = type === "bad" ? "r3BadExtra" : "r3GoodExtra";
    const extraText =
      type === "bad" ? "No LIMIT means full table scan." : "LIMIT lets MySQL stop early.";
    const extraEl = $(extraId);
    if (extraEl) extraEl.textContent = extraText;
  }
}

function initRound(roundKey) {
  const flow = ROUND_FLOW[roundKey];
  const round = ROUNDS[roundKey];
  if (!flow || !round) return;

  const key = roundKey.toUpperCase();
  const btnBad = $("btn" + key + "Bad");
  const btnGood = $("btn" + key + "Good");
  if (!btnBad || !btnGood) return;

  const run = async (type) => {
    const btn = type === "bad" ? btnBad : btnGood;
    const sql = type === "bad" ? round.bad : round.good;
    setBtnState(btn, true);

    try {
      const result = await executeQuery(sql);
      if (result.error) {
        react(result.error);
        return;
      }

      state.rounds[roundKey][type] = result;
      if (type === "bad") {
        reveal(flow.badStage);
        reveal(flow.fixStage);
        applyRoundResult(roundKey, "bad", result);
        react(SLOW_MSGS[slowIdx++ % SLOW_MSGS.length]);
      } else {
        reveal(flow.goodStage);
        applyRoundResult(roundKey, "good", result);
        react(FAST_MSGS[fastIdx++ % FAST_MSGS.length]);
      }

      if (state.rounds[roundKey].bad && state.rounds[roundKey].good) {
        showComparison(roundKey, state.rounds[roundKey].bad.time, state.rounds[roundKey].good.time);
        reveal(flow.compareStage);
        reveal(flow.nextStage);
      }
    } catch (err) {
      react(err.message || "query failed");
    } finally {
      setBtnState(btn, false);
    }
  };

  btnBad.addEventListener("click", () => run("bad"));
  btnGood.addEventListener("click", () => run("good"));
}

function resetPlaygroundOutput() {
  state.pg.bad = null;
  state.pg.good = null;

  const idsToClear = ["pgBadPlan", "pgGoodPlan", "pgValSlow", "pgValFast", "pgSpeedup"];
  idsToClear.forEach((id) => {
    const node = $(id);
    if (node) node.textContent = "";
  });

  const badTimeEl = $("pgBadTime");
  const goodTimeEl = $("pgGoodTime");
  if (badTimeEl) badTimeEl.textContent = "--";
  if (goodTimeEl) goodTimeEl.textContent = "--";

  const badResult = $("pgBadResult");
  const goodResult = $("pgGoodResult");
  const compare = $("pgCompare");
  if (badResult) badResult.classList.add("hidden");
  if (goodResult) goodResult.classList.add("hidden");
  if (compare) compare.classList.add("hidden");

  setBarWidth("pgBarSlow", 0);
  setBarWidth("pgBarFast", 0);
}

function renderPlaygroundPair(index) {
  const pair = PLAYGROUND[index];
  if (!pair) return;
  state.pg.index = index;

  const badSql = $("pgBadSql");
  const goodSql = $("pgGoodSql");
  if (badSql) badSql.textContent = pair.bad;
  if (goodSql) goodSql.textContent = pair.good;

  resetPlaygroundOutput();
}

function initPlayground() {
  const pgSelect = $("pgSelect");
  const pgRunBad = $("pgRunBad");
  const pgRunGood = $("pgRunGood");
  if (!pgSelect || !pgRunBad || !pgRunGood) return;

  pgSelect.innerHTML = "";
  PLAYGROUND.forEach((pair, idx) => {
    const opt = el("option");
    opt.value = String(idx);
    opt.textContent = pair.label;
    pgSelect.appendChild(opt);
  });

  renderPlaygroundPair(0);

  pgSelect.addEventListener("change", (e) => {
    const nextIndex = Number.parseInt(e.target.value, 10);
    renderPlaygroundPair(Number.isFinite(nextIndex) ? nextIndex : 0);
  });

  const run = async (type) => {
    const pair = PLAYGROUND[state.pg.index];
    if (!pair) return;
    const btn = type === "bad" ? pgRunBad : pgRunGood;
    const sql = type === "bad" ? pair.bad : pair.good;

    setBtnState(btn, true);
    try {
      const result = await executeQuery(sql);
      if (result.error) {
        react(result.error);
        return;
      }

      if (type === "bad") {
        state.pg.bad = result;
        const badResult = $("pgBadResult");
        if (badResult) badResult.classList.remove("hidden");
        animateNumber($("pgBadTime"), result.time, 500);
        const badPlan = $("pgBadPlan");
        if (badPlan) badPlan.textContent = result.plan;
        react(SLOW_MSGS[slowIdx++ % SLOW_MSGS.length]);
      } else {
        state.pg.good = result;
        const goodResult = $("pgGoodResult");
        if (goodResult) goodResult.classList.remove("hidden");
        animateNumber($("pgGoodTime"), result.time, 500);
        const goodPlan = $("pgGoodPlan");
        if (goodPlan) goodPlan.textContent = result.plan;
        react(FAST_MSGS[fastIdx++ % FAST_MSGS.length]);
      }

      if (state.pg.bad && state.pg.good) {
        const compare = $("pgCompare");
        if (compare) compare.classList.remove("hidden");
        showComparison("pg", state.pg.bad.time, state.pg.good.time);
        reveal("stageTakeaway");
      }
    } catch (err) {
      react(err.message || "query failed");
    } finally {
      setBtnState(btn, false);
    }
  };

  pgRunBad.addEventListener("click", () => run("bad"));
  pgRunGood.addEventListener("click", () => run("good"));
}

async function boot() {
  addLine("> connecting to MySQL...");
  await sleep(300);

  try {
    const health = await apiGet("/health");
    if (health.status !== "ok") throw new Error("health check failed");
    addLine("  connected", "ok");
  } catch (err) {
    addLine("  connection failed", "fail");
    addLine("  start server: cd server && node server.js", "dim");
    return;
  }

  await sleep(200);
  addLine("");
  addLine("> setting up tables...");
  const setupLine = addLine("  creating users + orders...", "dim");

  try {
    const data = await apiPost("/qo/setup");
    if (data.status !== "ok") throw new Error(data.message || "setup failed");

    updateLine(
      setupLine,
      `  ${Number(data.users).toLocaleString()} users + ${Number(data.orders).toLocaleString()} orders`,
      "ok",
    );
    await sleep(150);
    addLine(`  ${data.indexes} indexes created`, "ok");
  } catch (err) {
    updateLine(setupLine, "  setup failed: " + err.message, "fail");
    return;
  }

  await sleep(300);
  addLine("");
  addLine("> ready.", "accent");
  react("you know what to do.");
  reveal("stageSchema");
  await sleep(300);
  reveal("r1Challenge");
}

initRound("r1");
initRound("r2");
initRound("r3");
initPlayground();
boot();
