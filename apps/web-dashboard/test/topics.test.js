import test from "node:test";
import assert from "node:assert/strict";

import {
  currentTopic,
  filteredTopics,
  lineCounts,
  resolveInitialTopicId,
} from "../src/lib/topics.js";

const dashboardData = {
  meta: {
    defaultPairing: { aiTopic: "T01" },
  },
  topics: [
    { id: "T01", title: "AI 五层结构", lineLabel: "AI 实战", subtitle: "老板", account: "主号", line: "主号-AI", platformText: "视频号", goal: "私信" },
    { id: "T07", title: "轻食案例", lineLabel: "品牌案例", subtitle: "品牌用户", account: "品牌号", line: "品牌号-案例", platformText: "小红书", goal: "预约" },
    { id: "T12", title: "经营复盘", lineLabel: "经营 / 成长", subtitle: "经营者", account: "主号", line: "主号-经营", platformText: "公众号", goal: "关注" },
  ],
};

test("resolveInitialTopicId prefers default pairing", () => {
  assert.equal(resolveInitialTopicId(dashboardData), "T01");
});

test("filteredTopics respects lineFilter and query", () => {
  const aiOnly = filteredTopics(dashboardData, { lineFilter: "ai", query: "", selectedId: "T01" });
  const queryOnly = filteredTopics(dashboardData, { lineFilter: "all", query: "轻食", selectedId: "T07" });

  assert.equal(aiOnly.length, 1);
  assert.equal(aiOnly[0].id, "T01");
  assert.equal(queryOnly.length, 1);
  assert.equal(queryOnly[0].id, "T07");
});

test("currentTopic keeps selected topic as fallback when filter excludes it", () => {
  const selected = currentTopic(dashboardData, { lineFilter: "all", query: "", selectedId: "T07" });
  const fallback = currentTopic(dashboardData, { lineFilter: "ai", query: "", selectedId: "T07" });

  assert.equal(selected.id, "T07");
  assert.equal(fallback.id, "T07");
});

test("lineCounts summarizes topic buckets", () => {
  assert.deepEqual(lineCounts(dashboardData), {
    all: 3,
    ai: 1,
    brand: 1,
    ops: 1,
  });
});
