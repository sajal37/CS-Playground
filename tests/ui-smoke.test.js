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
  "terminal",
  "btnR1Bad",
  "btnR1Good",
  "btnR2Bad",
  "btnR2Good",
  "btnR3Bad",
  "btnR3Good",
  "playgroundList",
]);

console.log("UI smoke tests passed.");
