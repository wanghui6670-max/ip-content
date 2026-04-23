import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDataConfidenceCards,
  renderCounters,
  renderDataConfidencePanel,
  renderModePanel,
  renderReview,
  renderSyncPanel,
} from "../src/lib/panels.js";

function makeElement() {
  return {
    textContent: "",
    innerHTML: "",
    href: "",
    classList: {
      values: new Set(),
      toggle(name, enabled) {
        if (enabled) this.values.add(name);
        else this.values.delete(name);
      },
      has(name) {
        return this.values.has(name);
      },
    },
  };
}

function installDocument(ids) {
  const store = Object.fromEntries(ids.map((id) => [id, makeElement()]));
  global.document = {
    getElementById(id) {
      return store[id];
    },
  };
  return store;
}

test("renderModePanel writes mode metadata", () => {
  const nodes = installDocument(["buildModeBadge", "buildModeDescription", "buildModeValue", "sourceContext", "generatedAt", "dataConfidenceGrid"]);

  renderModePanel(
    {
      label: "Fallback Snapshot",
      isFallbackMode: true,
      description: "回退构建",
      buildMode: "generated_fallback",
      sourceContext: "repo_workspace",
      generatedAt: "2026-04-23T12:00:00",
    },
    {
      isOnline: false,
      statusLabel: "离线",
      mirroredAt: "",
      mirrorSource: "",
    },
  );

  assert.equal(nodes.buildModeBadge.textContent, "Fallback Snapshot");
  assert.equal(nodes.buildModeDescription.textContent, "回退构建");
  assert.equal(nodes.buildModeValue.textContent, "generated_fallback");
  assert.equal(nodes.sourceContext.textContent, "repo_workspace");
  assert.match(nodes.dataConfidenceGrid.innerHTML, /Confidence/);
});

test("buildDataConfidenceCards distinguishes fallback and full source modes", () => {
  const fallbackCards = buildDataConfidenceCards(
    { isFallbackMode: true, generatedAt: "2026-04-23T12:00:00" },
    { isOnline: false, statusLabel: "离线", mirroredAt: "", mirrorSource: "" },
  );
  const fullCards = buildDataConfidenceCards(
    { isFallbackMode: false, generatedAt: "2026-04-23T12:00:00" },
    { isOnline: true, statusLabel: "在线", mirroredAt: "2026-04-23T11:00:00", mirrorSource: "latest" },
  );

  assert.equal(fallbackCards[0].value, "迁移期快照");
  assert.equal(fallbackCards[0].tone, "warning");
  assert.equal(fullCards[0].value, "完整源数据");
  assert.equal(fullCards[2].value, "2026-04-23T11:00:00");
});

test("renderDataConfidencePanel writes card HTML", () => {
  const nodes = installDocument(["dataConfidenceGrid"]);

  renderDataConfidencePanel(
    { isFallbackMode: true, generatedAt: "2026-04-23T12:00:00" },
    { isOnline: false, statusLabel: "离线", mirroredAt: "", mirrorSource: "" },
  );

  assert.match(nodes.dataConfidenceGrid.innerHTML, /迁移期快照/);
  assert.match(nodes.dataConfidenceGrid.innerHTML, /未拉镜像/);
});

test("renderSyncPanel writes sync metadata and link state", () => {
  const nodes = installDocument(["syncStatus", "syncBase", "syncToken", "syncMirror", "syncLink"]);

  renderSyncPanel({
    statusLabel: "在线",
    baseName: "IP内容中台",
    tokenMasked: "app_***_1234",
    mirroredAt: "2026-04-23T12:00:00",
    url: "https://example.com/base",
    linkText: "打开飞书主库",
  });

  assert.equal(nodes.syncStatus.textContent, "在线");
  assert.equal(nodes.syncBase.textContent, "IP内容中台");
  assert.equal(nodes.syncLink.href, "https://example.com/base");
  assert.equal(nodes.syncLink.textContent, "打开飞书主库");
});

test("renderCounters writes headline counts", () => {
  const nodes = installDocument([
    "countTopics",
    "countTasks",
    "countHighPerf",
    "countSync",
    "countFiltered",
    "lineAll",
    "lineAi",
    "lineBrand",
    "lineOps",
  ]);

  renderCounters({
    dashboardData: {
      meta: { counts: { topics: 3, tasks: 2, highPerf: 4 } },
      topics: [
        { lineLabel: "AI 实战" },
        { lineLabel: "品牌案例" },
        { lineLabel: "经营 / 成长" },
      ],
    },
    topics: [{}, {}],
    syncMeta: { isOnline: false },
  });

  assert.equal(nodes.countTopics.textContent, "3");
  assert.equal(nodes.countTasks.textContent, "2");
  assert.equal(nodes.countSync.textContent, "Offline");
  assert.equal(nodes.countFiltered.textContent, "2 / 3");
});

test("renderReview writes fallback copy when no review exists", () => {
  const nodes = installDocument(["highPerfList", "reviewWeek", "reviewSummary", "reviewNext"]);

  renderReview({ highPerf: [], reviews: [] });

  assert.equal(nodes.reviewWeek.textContent, "当前周");
  assert.equal(nodes.reviewSummary.textContent, "待补复盘结论");
  assert.equal(nodes.reviewNext.textContent, "待补下周动作");
});
