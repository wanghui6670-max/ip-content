import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCommandText,
  buildDeployCommands,
  buildPrompt,
  buildWeekCommands,
} from "../src/lib/commands.js";

const values = {
  aiTopic: "T01",
  brandTopic: "T07",
  weekId: "2026-W17",
  dateMain: "2026-04-22",
  dateArticle: "2026-04-24",
  dateBrandPost: "2026-04-23",
};

test("buildWeekCommands includes week and topic ids", () => {
  const text = buildWeekCommands(values);
  assert.match(text, /T01/);
  assert.match(text, /T07/);
  assert.match(text, /2026-W17/);
});

test("buildDeployCommands uses repo-local commands", () => {
  const text = buildDeployCommands();
  assert.match(text, /npm run build:web/);
  assert.doesNotMatch(text, /\/Users\/wanghui/);
});

test("buildPrompt includes mode and topic context", () => {
  const text = buildPrompt({
    topic: { id: "T03", title: "内容自动化" },
    values,
    modeMeta: { label: "Fallback Snapshot" },
  });

  assert.match(text, /Fallback Snapshot/);
  assert.match(text, /T03 内容自动化/);
});

test("buildCommandText routes by tab", () => {
  assert.match(
    buildCommandText({ tab: "week", topic: { id: "T01", line: "主号-AI" }, values, modeMeta: { label: "Fallback Snapshot" } }),
    /ip week plan/,
  );
  assert.match(
    buildCommandText({ tab: "deploy", topic: { id: "T01", line: "主号-AI" }, values, modeMeta: { label: "Fallback Snapshot" } }),
    /vercel --prod/,
  );
});
