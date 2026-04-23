import test from "node:test";
import assert from "node:assert/strict";

import {
  hydrateScheduleForm,
  normalizeCommandTab,
  readScheduleValues,
  resetScheduleForm,
} from "../src/lib/command-dock.js";

function makeInput(value = "") {
  return { value };
}

function installDocument(values = {}) {
  const nodes = {
    aiTopic: makeInput(values.aiTopic),
    brandTopic: makeInput(values.brandTopic),
    weekId: makeInput(values.weekId),
    dateMain: makeInput(values.dateMain),
    dateArticle: makeInput(values.dateArticle),
    dateBrandPost: makeInput(values.dateBrandPost),
  };

  global.document = {
    getElementById(id) {
      return nodes[id];
    },
  };

  return nodes;
}

const dashboardData = {
  meta: {
    defaultPairing: { aiTopic: "T01", brandTopic: "T07" },
  },
};

test("hydrateScheduleForm writes values into inputs", () => {
  const nodes = installDocument();

  hydrateScheduleForm({
    aiTopic: "T02",
    brandTopic: "T08",
    weekId: "2026-W18",
    dateMain: "2026-04-29",
    dateArticle: "2026-05-01",
    dateBrandPost: "2026-04-30",
  });

  assert.equal(nodes.aiTopic.value, "T02");
  assert.equal(nodes.brandTopic.value, "T08");
  assert.equal(nodes.weekId.value, "2026-W18");
});

test("readScheduleValues falls back to defaults for empty fields", () => {
  installDocument({ aiTopic: "", brandTopic: "T09", weekId: "" });
  const values = readScheduleValues(dashboardData);

  assert.equal(values.aiTopic, "T01");
  assert.equal(values.brandTopic, "T09");
  assert.match(values.weekId, /^\d{4}-W\d{2}$/);
});

test("resetScheduleForm writes default pairing", () => {
  const nodes = installDocument();
  resetScheduleForm(dashboardData);

  assert.equal(nodes.aiTopic.value, "T01");
  assert.equal(nodes.brandTopic.value, "T07");
});

test("normalizeCommandTab accepts known tabs and falls back", () => {
  assert.equal(normalizeCommandTab("deploy"), "deploy");
  assert.equal(normalizeCommandTab("unknown"), "week");
  assert.equal(normalizeCommandTab(undefined), "week");
});
