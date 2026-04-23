import test from "node:test";
import assert from "node:assert/strict";

import { hydrateStaticMeta, renderSidebar } from "../src/lib/app-shell.js";

function makeElement() {
  return {
    textContent: "",
    innerHTML: "",
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

const dashboardData = {
  meta: {
    projectName: "IP Factory",
    projectSubtitle: "测试副标题",
    counts: { topics: 2, tasks: 1, highPerf: 0 },
  },
  topics: [
    { id: "T01", title: "AI 选题", lineLabel: "AI 实战", subtitle: "老板", account: "主号", line: "主号-AI", platformText: "视频号", goal: "私信", status: "进行中", statusType: "active" },
    { id: "T07", title: "品牌选题", lineLabel: "品牌案例", subtitle: "会员", account: "品牌号", line: "品牌号", platformText: "小红书", goal: "预约", status: "待挑选", statusType: "queued" },
  ],
};

test("hydrateStaticMeta writes brand copy", () => {
  const nodes = installDocument(["brandName", "brandSubtitle"]);
  hydrateStaticMeta(dashboardData);

  assert.equal(nodes.brandName.textContent, "IP Factory");
  assert.equal(nodes.brandSubtitle.textContent, "测试副标题");
});

test("renderSidebar writes filtered topic list", () => {
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
    "topicList",
  ]);

  renderSidebar({
    dashboardData,
    state: { query: "AI", lineFilter: "all", selectedId: "T01" },
    syncMeta: { isOnline: true },
  });

  assert.equal(nodes.countFiltered.textContent, "1 / 2");
  assert.match(nodes.topicList.innerHTML, /AI 选题/);
  assert.doesNotMatch(nodes.topicList.innerHTML, /品牌选题/);
});
