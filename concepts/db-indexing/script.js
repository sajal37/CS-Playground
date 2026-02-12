import { qs, qsa } from "../shared/dom.js";
import { apiGet, apiPost } from "../shared/api.js";
import { animateNumber, sleep } from "../shared/timing.js";
import {
  PLAYGROUND_FAST_REACTIONS,
  PLAYGROUND_SLOW_REACTIONS,
  QUERIES,
  SAMPLE_CITY,
} from "../content/db-indexing.js";

const ROW_COUNT = 100_000;

const state = {
  slowResult: null,
  fastResult: null,
  indexes: { city: false, name: false, created_at: false },
  history: [],
  reactionTimer: null,
};

const reactionEl = qs("#reaction");
let lastReactionText = "";

function react(text, mood) {
  if (!reactionEl) return;
  if (text === lastReactionText) return;
  lastReactionText = text;

  clearTimeout(state.reactionTimer);
  reactionEl.className = "reaction";
  reactionEl.textContent = text;
  if (mood) reactionEl.classList.add("mood-" + mood);

  void reactionEl.offsetWidth;
  reactionEl.classList.add("show");

  state.reactionTimer = setTimeout(() => {
    reactionEl.classList.remove("show");
  }, 3000);
}

function reveal(id) {
  const el = qs("#" + id);
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.add("revealing");
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
}

const terminal = qs("#terminal");

function addLine(html) {
  if (!terminal) return null;
  const line = document.createElement("div");
  line.className = "line";
  line.innerHTML = html;
  terminal.appendChild(line);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => line.classList.add("visible"));
  });
  return line;
}

function updateLine(line, html) {
  if (line) line.innerHTML = html;
}

async function boot() {
  addLine("> connecting to MySQL server...");
  await sleep(200);

  try {
    const health = await apiGet("/health");
    if (health.status !== "ok") throw new Error(health.message || "connection failed");

    addLine('> MySQL <span class="ok">connected</span>');
    await sleep(150);

    addLine("> creating table + seeding data...");
    const progressLine = addLine('> inserting rows... <span class="accent">standby</span>');
    await sleep(100);

    const setup = await apiPost("/setup");
    if (setup.status !== "ok") throw new Error(setup.message || "setup failed");

    updateLine(
      progressLine,
      '> <span class="ok">' + setup.totalRows.toLocaleString() + " rows inserted</span>",
    );
    await sleep(150);

    addLine('> table: <span class="accent">users</span> <span class="ok">created</span>');
    addLine('<span class="muted">  (id, name, email, city, created_at)</span>');
    await sleep(100);

    addLine(
      '> verified: <span class="accent">' +
        setup.totalRows.toLocaleString() +
        " rows</span> in table",
    );
    addLine('> Mumbai: <span class="accent">' + setup.mumbaiRows.toLocaleString() + " rows</span>");
    await sleep(150);

    addLine('> indexes: <span class="fail">none</span>');
    addLine('> shortcuts: <span class="fail">none</span>');
    await sleep(300);

    addLine('> <span class="ok">ready.</span>');
    await sleep(500);

    reveal("stageChallenge");
    react("real database. real MySQL. zero simulation.", "thinking");
  } catch (err) {
    addLine('> <span class="fail">error: ' + err.message + "</span>");
    addLine(
      '> <span class="fail">make sure MySQL is running and the server is started (node server.js)</span>',
    );
    addLine('> <span class="muted">see setup instructions in server/README.md</span>');
  }
}

async function executeQuery(sql) {
  try {
    const result = await apiPost("/query", { sql: sql });
    if (result.error) return { error: result.error };
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

async function createIndex(column) {
  try {
    const result = await apiPost("/index/create", { column: column });
    state.indexes[column] = true;
    return result.time || 0;
  } catch (err) {
    return 0;
  }
}

async function dropIndex(column) {
  try {
    await apiPost("/index/drop", { column: column });
    state.indexes[column] = false;
  } catch (err) {
    return null;
  }
  return null;
}

function renderSampleTable(data, maxRows = 5) {
  if (!data || data.rowCount === 0) return '<p class="whisper">no results.</p>';

  const cols = data.columns;
  const sample = data.rows.slice(0, maxRows);

  let html = '<div class="result-table"><table>';
  html +=
    "<tr>" +
    cols
      .map((c) => {
        return "<th>" + c + "</th>";
      })
      .join("") +
    "</tr>";
  for (let ri = 0; ri < sample.length; ri++) {
    const row = sample[ri];
    const values = cols.map((c) => {
      return row[c];
    });
    html +=
      "<tr>" +
      values
        .map((v) => {
          return "<td>" + v + "</td>";
        })
        .join("") +
      "</tr>";
  }
  html += "</table>";
  if (data.rowCount > maxRows) {
    html +=
      '<div class="more-rows">+ ' + (data.rowCount - maxRows).toLocaleString() + " more rows</div>";
  }
  html += "</div>";
  return html;
}

const btnExecute = qs("#btnExecute");
const challengeWhisper = qs("#challengeWhisper");

if (btnExecute) {
  btnExecute.addEventListener("mouseenter", () => {
    if (challengeWhisper) challengeWhisper.textContent = "do it.";
  });
  btnExecute.addEventListener("mouseleave", () => {
    if (challengeWhisper) challengeWhisper.textContent = "go on.";
  });

  btnExecute.addEventListener("click", async () => {
    btnExecute.disabled = true;
    btnExecute.querySelector(".btn-text").textContent = "running...";
    react("executing on MySQL...", "thinking");
    await sleep(200);

    const sql = "SELECT * FROM users WHERE city = '" + SAMPLE_CITY + "'";
    const result = await executeQuery(sql);
    state.slowResult = result;

    if (result.error) {
      react("query failed: " + result.error, "danger");
      btnExecute.disabled = false;
      btnExecute.querySelector(".btn-text").textContent = "Execute";
      return;
    }

    reveal("stageSlow");
    await sleep(150);

    animateNumber(qs("#slowTime"), result.time, 800);

    const barSlow = qs("#barSlow");
    if (barSlow) {
      requestAnimationFrame(() => {
        barSlow.style.width = "85%";
      });
    }

    const slowPlan = qs("#slowPlan");
    if (slowPlan) slowPlan.textContent = result.plan;

    const slowRows = qs("#slowRows");
    if (slowRows) {
      const examined = result.rowsExamined
        ? result.rowsExamined.toLocaleString()
        : ROW_COUNT.toLocaleString();
      slowRows.textContent =
        result.rowCount.toLocaleString() + " found · " + examined + " rows examined";
    }

    const slowTable = qs("#slowTable");
    if (slowTable) slowTable.innerHTML = renderSampleTable(result);

    const slowReaction = qs("#slowReaction");
    if (slowReaction) slowReaction.textContent = "Every. Single. Row.";

    await sleep(600);
    react("your database just read a novel to find one chapter.", "danger");

    await sleep(2000);
    reveal("stageFix");
    react("what if there was a shortcut?", "thinking");
  });
}

const btnIndex = qs("#btnIndex");

if (btnIndex) {
  btnIndex.addEventListener("click", async () => {
    btnIndex.disabled = true;
    btnIndex.querySelector(".btn-text").textContent = "creating...";
    react("building index on MySQL...", "thinking");
    await sleep(400);

    const indexTime = await createIndex("city");

    reveal("stageRerun");
    const indexTimeEl = qs("#indexTime");
    if (indexTimeEl) indexTimeEl.textContent = indexTime.toFixed(1);

    react("index created. let's see if it was worth it.", "success");
  });
}

const btnRerun = qs("#btnRerun");

if (btnRerun) {
  btnRerun.addEventListener("click", async () => {
    btnRerun.disabled = true;
    btnRerun.querySelector(".btn-text").textContent = "running...";
    react("same query. same data.", "thinking");
    await sleep(150);

    const sql = "SELECT * FROM users WHERE city = '" + SAMPLE_CITY + "'";
    const result = await executeQuery(sql);
    state.fastResult = result;

    if (result.error) {
      react("query failed: " + result.error, "danger");
      return;
    }

    reveal("stageFast");
    await sleep(100);

    animateNumber(qs("#fastTime"), result.time, 400);

    const barFast = qs("#barFast");
    if (barFast) {
      requestAnimationFrame(() => {
        const pct = Math.max(2, (result.time / state.slowResult.time) * 85);
        barFast.style.width = pct + "%";
      });
    }

    const fastPlan = qs("#fastPlan");
    if (fastPlan) fastPlan.textContent = result.plan;

    const fastRows = qs("#fastRows");
    if (fastRows) {
      const examined = result.rowsExamined ? result.rowsExamined.toLocaleString() : "?";
      fastRows.textContent =
        result.rowCount.toLocaleString() + " found · " + examined + " rows examined";
    }

    await sleep(400);

    reveal("stageCompare");
    await sleep(200);

    const compSlow = qs("#compSlow");
    const compFast = qs("#compFast");
    const compSlowVal = qs("#compSlowVal");
    const compFastVal = qs("#compFastVal");

    setTimeout(() => {
      if (compSlow) compSlow.style.width = "90%";
      if (compFast) {
        const pct = Math.max(3, (result.time / state.slowResult.time) * 90);
        compFast.style.width = pct + "%";
      }
    }, 200);

    if (compSlowVal) {
      compSlowVal.textContent = state.slowResult.time.toFixed(1) + "ms";
    }
    if (compFastVal) {
      compFastVal.textContent = result.time.toFixed(1) + "ms";
    }

    const speedup = Math.max(1, Math.round(state.slowResult.time / result.time));
    const speedupEl = qs("#speedup");
    if (speedupEl) {
      speedupEl.textContent = speedup + "× faster. One line of SQL.";
    }

    await sleep(500);
    react(speedup + "× faster. that's the power of one line.", "success");

    await sleep(1800);
    reveal("stageExplain");

    await sleep(1200);
    reveal("stagePlayground");
    setupPlayground();

    await sleep(800);
    reveal("stageWrite");
    setupWriteDemo();

    await sleep(600);
    reveal("stageTakeaway");
    react("now you see it.", "success");
  });
}

function setupPlayground() {
  qsa(".pg-toggle").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const col = btn.dataset.col;
      btn.disabled = true;
      if (state.indexes[col]) {
        await dropIndex(col);
        btn.classList.remove("active");
        btn.textContent = col;
        react("dropped index on " + col + ". bold choice.", "danger");
      } else {
        const t = await createIndex(col);
        btn.classList.add("active");
        btn.textContent = col + " ✓";
        react("index on " + col + " created. " + t.toFixed(1) + "ms.", "success");
      }
      btn.disabled = false;
    });
  });

  const pgQuery = qs("#pgQuery");
  const pgPreview = qs("#pgSqlPreview");
  if (pgQuery) {
    pgQuery.addEventListener("change", () => {
      const key = pgQuery.value;
      if (pgPreview && QUERIES[key]) {
        pgPreview.textContent = QUERIES[key] + ";";
      }
    });
  }

  const btnPgRun = qs("#btnPgRun");
  if (btnPgRun) {
    btnPgRun.addEventListener("click", async () => {
      const key = pgQuery ? pgQuery.value : "city";
      const sql = QUERIES[key];
      if (!sql) return;

      btnPgRun.disabled = true;
      btnPgRun.querySelector(".btn-text").textContent = "running...";
      await sleep(50);

      const result = await executeQuery(sql);

      btnPgRun.disabled = false;
      btnPgRun.querySelector(".btn-text").textContent = "Execute";

      if (result.error) {
        react("error: " + result.error, "danger");
        return;
      }

      const pgResults = qs("#pgResults");
      if (pgResults) pgResults.classList.remove("hidden");

      const pgTime = qs("#pgTime");
      const pgBar = qs("#pgBar");
      const pgMeta = qs("#pgMeta");

      if (pgTime) {
        pgTime.style.color = result.time > 10 ? "var(--accent-red)" : "var(--accent-green)";
        animateNumber(pgTime, result.time, 400);
      }

      if (pgBar) {
        const pct = Math.min(100, Math.max(2, result.time));
        pgBar.style.width = "0";
        pgBar.className = "bar " + (result.time > 10 ? "bar-slow" : "bar-fast");
        requestAnimationFrame(() => {
          pgBar.style.width = pct + "%";
        });
      }

      if (pgMeta) {
        pgMeta.textContent = result.plan + " · " + result.rowCount.toLocaleString() + " rows";
      }

      state.history.push({
        query: key,
        time: result.time,
        plan: result.plan,
        rowCount: result.rowCount,
        indexes: Object.assign({}, state.indexes),
      });
      renderHistory();

      if (result.plan.indexOf("key: none") !== -1 && hasAnyIndex()) {
        react("you have indexes... just not the right one.", "thinking");
      } else if (result.time > 20) {
        react(
          PLAYGROUND_SLOW_REACTIONS[Math.floor(Math.random() * PLAYGROUND_SLOW_REACTIONS.length)],
          "danger",
        );
      } else if (result.time > 5) {
        react("not terrible. not great.", "thinking");
      } else {
        react(
          PLAYGROUND_FAST_REACTIONS[Math.floor(Math.random() * PLAYGROUND_FAST_REACTIONS.length)],
          "success",
        );
      }
    });
  }

  const btnReset = qs("#btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", async () => {
      btnReset.disabled = true;
      await apiPost("/reset");
      Object.keys(state.indexes).forEach((col) => {
        state.indexes[col] = false;
      });
      qsa(".pg-toggle").forEach((btn) => {
        btn.classList.remove("active");
        btn.textContent = btn.dataset.col;
      });
      state.history = [];
      renderHistory();
      const pgResults = qs("#pgResults");
      if (pgResults) pgResults.classList.add("hidden");
      react("clean slate. back to searching every row.", "danger");
      btnReset.disabled = false;
    });
  }
}

function hasAnyIndex() {
  return Object.values(state.indexes).some((v) => v);
}

function renderHistory() {
  const container = qs("#pgHistory");
  if (!container) return;

  if (state.history.length === 0) {
    container.innerHTML = "";
    return;
  }

  const maxTime = Math.max(...state.history.map((h) => h.time).concat([1]));
  const recent = state.history.slice(-8);

  let html = '<h3 class="pg-history-title">History</h3>';
  for (let i = 0; i < recent.length; i++) {
    const h = recent[i];
    const pct = Math.max(3, (h.time / maxTime) * 100);
    const isFast = h.time < 10;
    const idxEntries = Object.entries(h.indexes)
      .filter((e) => e[1])
      .map((e) => e[0]);
    const idxList = idxEntries.join(", ") || "none";

    html +=
      '<div class="pg-history-row">' +
      '<div class="pg-history-detail">' +
      '<div class="pg-history-bar-track">' +
      '<div class="pg-history-bar ' +
      (isFast ? "bar-fast" : "bar-slow") +
      '" style="width:' +
      pct +
      '%"></div>' +
      "</div>" +
      '<span class="pg-history-label">' +
      h.query +
      " · idx: " +
      idxList +
      "</span>" +
      "</div>" +
      '<span class="pg-history-time">' +
      h.time.toFixed(1) +
      "ms</span>" +
      "</div>";
  }
  container.innerHTML = html;
}

function setupWriteDemo() {
  const btnWriteTest = qs("#btnWriteTest");
  const writeResults = qs("#writeResults");
  const writeBarWithout = qs("#writeBarWithout");
  const writeBarWith = qs("#writeBarWith");
  const writeTimeWithout = qs("#writeTimeWithout");
  const writeTimeWith = qs("#writeTimeWith");
  const writeTakeaway = qs("#writeTakeaway");

  if (btnWriteTest) {
    btnWriteTest.addEventListener("click", async () => {
      btnWriteTest.disabled = true;
      btnWriteTest.querySelector(".btn-text").textContent = "inserting...";
      react("writing 5,000 rows to MySQL...", "thinking");
      await sleep(200);

      try {
        const result = await apiPost("/write-test");

        if (result.error) {
          react("write test failed: " + result.error, "danger");
          btnWriteTest.disabled = false;
          btnWriteTest.querySelector(".btn-text").textContent = "Insert 5,000 rows";
          return;
        }

        if (writeResults) writeResults.classList.remove("hidden");

        if (writeTimeWithout) writeTimeWithout.textContent = result.timeWithout.toFixed(1) + "ms";
        if (writeTimeWith) writeTimeWith.textContent = result.timeWith.toFixed(1) + "ms";

        const maxTime = Math.max(result.timeWithout, result.timeWith, 1);
        setTimeout(() => {
          if (writeBarWithout)
            writeBarWithout.style.width = Math.max(5, (result.timeWithout / maxTime) * 90) + "%";
          if (writeBarWith)
            writeBarWith.style.width = Math.max(5, (result.timeWith / maxTime) * 90) + "%";
        }, 100);

        const overhead = (result.timeWith / result.timeWithout).toFixed(1);
        if (writeTakeaway) {
          writeTakeaway.classList.remove("hidden");
          writeTakeaway.textContent =
            "Writes with 3 indexes: " + overhead + "× slower. That's the trade-off.";
        }

        react("reads get faster. writes get slower. that's the trade-off.", "thinking");
      } catch (err) {
        react("write test failed: " + err.message, "danger");
      }

      btnWriteTest.disabled = false;
      btnWriteTest.querySelector(".btn-text").textContent = "Insert 5,000 rows";
    });
  }
}

console.log("%c{CS} DB Indexing", "font-size: 24px; font-weight: bold; color: #f59e0b;");
console.log(
  "%cReal MySQL. Real queries. Open your MySQL client — the data is there.",
  "font-size: 12px; color: #8a8a8d; font-style: italic;",
);

boot();
