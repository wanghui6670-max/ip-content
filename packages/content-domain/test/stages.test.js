import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStageSteps,
  stageIndexForTopic,
  statusTypeFromTopicStatus,
} from "../src/stages.js";

test("statusTypeFromTopicStatus maps known statuses", () => {
  assert.equal(statusTypeFromTopicStatus("进行中"), "active");
  assert.equal(statusTypeFromTopicStatus("待排期"), "review");
  assert.equal(statusTypeFromTopicStatus("已发布"), "done");
  assert.equal(statusTypeFromTopicStatus("未知状态"), "queued");
});

test("stageIndexForTopic prefers the furthest task stage", () => {
  const stageIndex = stageIndexForTopic("待排期", [
    { 当前状态: "待生产" },
    { 当前状态: "待审核" },
  ]);

  assert.equal(stageIndex, 3);
});

test("buildStageSteps marks all stages done for 已复盘 topics", () => {
  const steps = buildStageSteps("已复盘", []);
  assert.ok(steps.every((step) => step.state === "done"));
  assert.equal(steps.at(-1)?.sub, "完成");
});

test("buildStageSteps returns an active current stage for in-progress topics", () => {
  const steps = buildStageSteps("进行中", [{ 当前状态: "待审核" }]);
  const active = steps.find((step) => step.state === "active");

  assert.ok(active);
  assert.equal(active?.name, "审核");
});
