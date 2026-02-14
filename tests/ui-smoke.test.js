const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
const { JSDOM } = require("jsdom");

function loadDoc(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(html);
  return dom.window.document;
}

function expectIds(doc, file, ids) {
  ids.forEach((id) => {
    assert.ok(doc.getElementById(id), `${file} missing #${id}`);
  });
}

const root = path.resolve(__dirname, "..");

const indexDoc = loadDoc(path.join(root, "index.html"));
expectIds(indexDoc, "index.html", [
  "scrollContainer",
  "heroBtn",
  "categoryFilter",
  "conceptsGrid",
  "conceptsWhisper",
  "philosophy",
]);

const dbDoc = loadDoc(path.join(root, "concepts", "db-indexing", "index.html"));
expectIds(dbDoc, "concepts/db-indexing/index.html", [
  "terminal",
  "btnExecute",
  "btnIndex",
  "btnRerun",
  "btnPgRun",
  "btnWriteTest",
  "stageTakeaway",
]);

const qoDoc = loadDoc(path.join(root, "concepts", "query-optimization", "index.html"));
expectIds(qoDoc, "concepts/query-optimization/index.html", [
  "reaction",
  "terminal",
  "stageSchema",
  "r1Challenge",
  "btnR1Bad",
  "btnR1Good",
  "r1BadTime",
  "r1GoodTime",
  "btnR2Bad",
  "btnR2Good",
  "r2BadTime",
  "r2GoodTime",
  "btnR3Bad",
  "btnR3Good",
  "r3BadTime",
  "r3GoodTime",
  "stagePlayground",
  "pgSelect",
  "pgBadSql",
  "pgGoodSql",
  "pgRunBad",
  "pgRunGood",
  "pgCompare",
  "stageTakeaway",
]);

console.log("UI smoke tests passed.");
