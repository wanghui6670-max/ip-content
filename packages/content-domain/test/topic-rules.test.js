import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTopicSummary,
  buildTopicViewModel,
  resolveDefaultPairing,
} from "../src/topic-rules.js";

test("buildTopicSummary includes core view, assets, and goal", () => {
  const summary = buildTopicSummary(
    { coreView: "AI 不是工具堆，是系统", goal: "私信领取框架图" },
    ["A01", "A02"],
  );

  assert.match(summary, /核心观点：AI 不是工具堆，是系统/);
  assert.match(summary, /来源资产：A01 \/ A02/);
  assert.match(summary, /转化动作：私信领取框架图/);
});

test("buildTopicViewModel derives statusType and stage steps", () => {
  const viewModel = buildTopicViewModel(
    { status: "待排期", coreView: "示例观点", goal: "示例动作" },
    [{ 当前状态: "待发布" }],
    ["A09"],
  );

  assert.equal(viewModel.statusType, "review");
  assert.ok(Array.isArray(viewModel.steps));
  assert.equal(viewModel.steps.find((step) => step.state === "active")?.name, "发布");
  assert.match(viewModel.summary, /来源资产：A09/);
});

test("resolveDefaultPairing falls back to T01 and T07", () => {
  assert.deepEqual(resolveDefaultPairing({}), {
    aiTopic: "T01",
    brandTopic: "T07",
  });

  assert.deepEqual(
    resolveDefaultPairing({ defaultPairing: { aiTopic: "T03", brandTopic: "T08" } }),
    { aiTopic: "T03", brandTopic: "T08" },
  );
});
