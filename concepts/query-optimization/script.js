import { byId } from "../shared/dom.js";
import { apiGet, apiPost } from "../shared/api.js";
import { animateNumber, sleep } from "../shared/timing.js";
import { FAST_MSGS, PLAYGROUND, ROUNDS, SLOW_MSGS } from "../content/query-optimization.js";

const $ = byId;
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

const reactionEl = $("reaction");
let reactionTimer = null;

function react(msg) {
  clearTimeout(reactionTimer);
  reactionEl.textContent = msg;
  reactionEl.classList.add("visible");
  reactionTimer = setTimeout(() => reactionEl.classList.remove("visible"), 2400);
}

const terminal = $("terminal");

function addLine(text, cls = "") {
  const span = el("span", "line" + (cls ? " " + cls : ""), text);
  terminal.appendChild(span);
  terminal.scrollTop = terminal.scrollHeight;
  return span;
}

function updateLine(lineEl, text, cls) {
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

async function executeQuery(sql) {
  return apiPost("/query", { sql });
}

const state = {
  r1: { bad: null, good: null },
  r2: { bad: null, good: null },
  r3: { bad: null, good: null },
};

let slowIdx = 0;
let fastIdx = 0;

function showComparison(prefix, badTime, goodTime) {
  const maxTime = Math.max(badTime, goodTime, 0.1);
  const slowBar = $(prefix + "BarSlow");
  const fastBar = $(prefix + "BarFast");
  const slowVal = $(prefix + "ValSlow");
  const fastVal = $(prefix + "ValFast");
  const speedupEl = $(prefix + "Speedup");

  slowVal.textContent = badTime.toFixed(1) + " ms";
  fastVal.textContent = goodTime.toFixed(1) + " ms";

  requestAnimationFrame(() => {
    slowBar.style.width = Math.max((badTime / maxTime) * 100, 2) + "%";
    fastBar.style.width = Math.max((goodTime / maxTime) * 100, 2) + "%";
  });

  const ratio = badTime > 0 ? Math.max(1, Math.round(badTime / goodTime)) : 1;
  speedupEl.textContent = ratio + "× faster";
}

async function boot() {
  addLine("> connecting to MySQL...");
  await sleep(300);

  try {
    const hData = await apiGet("/health");
    if (hData.status !== "ok") throw new Error("health check failed");
    addLine("  connected ✓", "ok");
  } catch (e) {
    addLine("  connection failed ✗", "fail");
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
      `  ${Number(data.users).toLocaleString()} users + ${Number(data.orders).toLocaleString()} orders ✓`,
      "ok",
    );
    await sleep(150);
    addLine(`  ${data.indexes} indexes created ✓`, "ok");
  } catch (e) {
    updateLine(setupLine, "  setup failed: " + e.message, "fail");
    return;
  }

  await sleep(300);
  addLine("");
  addLine("> ready.", "accent");
  react("you know what to do.");
  reveal("stageSchema");
  await sleep(300);
  reveal("stageR1");
}

async function runRound(roundKey) {
  const round = ROUNDS[roundKey];
  const prefix = roundKey.toUpperCase();

  const btnBad = $("btn" + prefix + "Bad");
  const btnGood = $("btn" + prefix + "Good");
  const badTimeEl = $(prefix + "BadTime");
  const goodTimeEl = $(prefix + "GoodTime");
  const badPlanEl = $(prefix + "BadPlan");
  const goodPlanEl = $(prefix + "GoodPlan");
  const badRowsEl = $(prefix + "BadRows");
  const goodRowsEl = $(prefix + "GoodRows");
  const slowWrap = $(prefix + "BadWrap");
  const fastWrap = $(prefix + "GoodWrap");

  const runQuery = async (type) => {
    const btn = type === "bad" ? btnBad : btnGood;
    btn.disabled = true;
    btn.querySelector(".btn-text").textContent = "running...";

    const sql = type === "bad" ? round.bad : round.good;
    const result = await executeQuery(sql);

    btn.disabled = false;
    btn.querySelector(".btn-text").textContent = "Run";

    if (result.error) {
      react(result.error);
      return;
    }

    if (type === "bad") {
      state[roundKey].bad = result;
      slowWrap.classList.remove("hidden");
      animateNumber(badTimeEl, result.time, 500);
      badPlanEl.textContent = result.plan;
      badRowsEl.textContent = result.rowCount.toLocaleString() + " rows";
      react(SLOW_MSGS[slowIdx++ % SLOW_MSGS.length]);
      if (roundKey === "r3") {
        const extra = $("R3BadExtra");
        if (extra) extra.textContent = "No LIMIT means full table scan.";
      }
    } else {
      state[roundKey].good = result;
      fastWrap.classList.remove("hidden");
      animateNumber(goodTimeEl, result.time, 500);
      goodPlanEl.textContent = result.plan;
      goodRowsEl.textContent = result.rowCount.toLocaleString() + " rows";
      react(FAST_MSGS[fastIdx++ % FAST_MSGS.length]);
      if (roundKey === "r3") {
        const extra = $("R3GoodExtra");
        if (extra) extra.textContent = "LIMIT lets MySQL stop early.";
      }
    }

    if (state[roundKey].bad && state[roundKey].good) {
      showComparison(prefix, state[roundKey].bad.time, state[roundKey].good.time);
      const compWrap = $(prefix + "Compare");
      compWrap.classList.remove("hidden");
      if (roundKey === "r1") reveal("stageR2");
      if (roundKey === "r2") reveal("stageR3");
      if (roundKey === "r3") reveal("stagePlayground");
    }
  };

  btnBad.addEventListener("click", () => runQuery("bad"));
  btnGood.addEventListener("click", () => runQuery("good"));
}

function buildPlayground() {
  const container = $("playgroundList");
  PLAYGROUND.forEach((pair, idx) => {
    const row = el("div", "pg-row");

    const title = el("div", "pg-title", pair.label);
    const sqlBad = el("pre", "pg-sql bad", pair.bad);
    const sqlGood = el("pre", "pg-sql good", pair.good);

    const btnBad = el("button", "btn btn-danger");
    btnBad.innerHTML = '<span class="btn-text">Run bad</span> <span class="btn-arrow">→</span>';
    const btnGood = el("button", "btn btn-primary");
    btnGood.innerHTML = '<span class="btn-text">Run good</span> <span class="btn-arrow">→</span>';

    const result = el("div", "pg-result");

    row.appendChild(title);
    row.appendChild(sqlBad);
    row.appendChild(sqlGood);
    row.appendChild(btnBad);
    row.appendChild(btnGood);
    row.appendChild(result);
    container.appendChild(row);

    const run = async (type) => {
      const btn = type === "bad" ? btnBad : btnGood;
      const sql = type === "bad" ? pair.bad : pair.good;
      btn.disabled = true;
      btn.querySelector(".btn-text").textContent = "running...";
      const res = await executeQuery(sql);
      btn.disabled = false;
      btn.querySelector(".btn-text").textContent = type === "bad" ? "Run bad" : "Run good";
      if (res.error) {
        react(res.error);
        return;
      }
      result.innerHTML =
        '<div class="pg-time">' +
        res.time.toFixed(1) +
        " ms</div>" +
        '<div class="pg-plan">' +
        res.plan +
        "</div>" +
        '<div class="pg-rows">' +
        res.rowCount.toLocaleString() +
        " rows</div>";
      react(
        type === "bad"
          ? SLOW_MSGS[slowIdx++ % SLOW_MSGS.length]
          : FAST_MSGS[fastIdx++ % FAST_MSGS.length],
      );
    };

    btnBad.addEventListener("click", () => run("bad"));
    btnGood.addEventListener("click", () => run("good"));
  });
}

runRound("r1");
runRound("r2");
runRound("r3");
buildPlayground();
boot();
