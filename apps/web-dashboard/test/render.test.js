import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAssets,
  buildMetrics,
  buildReceipts,
  buildSteps,
  buildTasks,
  buildTopicList,
} from "../src/lib/render.js";

test("buildTopicList marks the selected topic as active", () => {
  const html = buildTopicList(
    [
      { id: "T01", statusType: "active", status: "进行中", title: "AI 五层结构", subtitle: "老板", account: "主号", lineLabel: "AI 实战", platformText: "视频号" },
      { id: "T07", statusType: "queued", status: "待挑选", title: "轻食案例", subtitle: "品牌用户", account: "品牌号", lineLabel: "品牌案例", platformText: "小红书" },
    ],
    "T07",
  );

  assert.match(html, /data-topic-id="T07"/);
  assert.match(html, /topic-card active/);
});

test("buildMetrics and buildSteps render card content", () => {
  const metrics = buildMetrics({ metrics: [{ label: "Assets", value: "2", delta: "来源资产" }] });
  const steps = buildSteps({ steps: [{ id: "01", name: "选题", state: "active", sub: "当前" }] });

  assert.match(metrics, /Assets/);
  assert.match(metrics, /来源资产/);
  assert.match(steps, /stage-card active/);
  assert.match(steps, /选题/);
});

test("buildAssets returns empty card when no source assets exist", () => {
  const html = buildAssets({ sourceAssets: [] });
  assert.match(html, /当前选题还没有挂到资产卡/);
});

test("buildTasks and buildReceipts render fallback copy", () => {
  const taskHtml = buildTasks({ title: "测试选题", tasks: [] });
  const receiptHtml = buildReceipts({ receipts: [] });

  assert.match(taskHtml, /飞书内容任务里还没有这个选题的任务行/);
  assert.match(receiptHtml, /发布回执已预留/);
});

test("buildTasks renders task rows when present", () => {
  const html = buildTasks({
    title: "测试选题",
    tasks: [{ 内容标题: "测试视频", 当前状态: "待审核", 目标平台: "视频号", 负责人: "王辉", 计划发布时间: "2026-04-25" }],
  });

  assert.match(html, /测试视频/);
  assert.match(html, /视频号/);
  assert.match(html, /王辉/);
});
