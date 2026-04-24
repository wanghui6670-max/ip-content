import test from "node:test";
import assert from "node:assert/strict";

import {
  buildExecutionFilterBar,
  buildExecutionReceipts,
  buildExecutionSummary,
  buildExecutionTasks,
  collectExecutionItems,
  filterReceipts,
  filterTasks,
  normalizeTask,
} from "../src/lib/execution.js";

const topic = {
  title: "AI 五层结构",
  tasks: [
    { 内容标题: "短视频脚本", 当前状态: "待审核", 目标平台: "视频号", 负责人: "王辉", 计划发布时间: "2026-04-25" },
    { 内容标题: "长文草稿", 当前状态: "待发布", 目标平台: "公众号", 负责人: "协作者", 计划发布时间: "2026-04-26" },
  ],
  receipts: [
    { 内容标题: "短视频脚本", 平台: "视频号", 结论: "待观察", "24h数据": "1000", "72h数据": "待回填", "7d数据": "待回填" },
    { 内容标题: "长文草稿", 平台: "公众号", 结论: "待发布", "24h数据": "待回填" },
  ],
};

test("normalizeTask falls back to topic title and default fields", () => {
  const task = normalizeTask({}, { title: "默认标题" });
  assert.equal(task.title, "默认标题");
  assert.equal(task.status, "待处理");
  assert.equal(task.platform, "未指定平台");
});

test("collectExecutionItems normalizes tasks and receipts", () => {
  const items = collectExecutionItems(topic);
  assert.equal(items.tasks.length, 2);
  assert.equal(items.receipts.length, 2);
  assert.equal(items.tasks[0].owner, "王辉");
  assert.equal(items.receipts[0].platform, "视频号");
});

test("filterTasks filters by status and platform", () => {
  const { tasks } = collectExecutionItems(topic);
  const filtered = filterTasks(tasks, { taskStatusFilter: "待审核", taskPlatformFilter: "视频号" });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, "短视频脚本");
});

test("filterReceipts filters by platform", () => {
  const { receipts } = collectExecutionItems(topic);
  const filtered = filterReceipts(receipts, { taskPlatformFilter: "公众号" });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, "长文草稿");
});

test("buildExecutionSummary counts filtered items", () => {
  const summary = buildExecutionSummary(topic, { taskStatusFilter: "待审核", taskPlatformFilter: "视频号" });
  assert.equal(summary.taskCount, 1);
  assert.equal(summary.receiptCount, 1);
  assert.equal(summary.totalTaskCount, 2);
});

test("buildExecutionFilterBar renders status and platform chips", () => {
  const html = buildExecutionFilterBar(topic, { taskStatusFilter: "待审核", taskPlatformFilter: "视频号" });
  assert.match(html, /全部状态/);
  assert.match(html, /待审核/);
  assert.match(html, /视频号/);
  assert.match(html, /data-execution-filter="platform"/);
});

test("buildExecutionTasks renders filtered task cards and empty state", () => {
  const html = buildExecutionTasks(topic, { taskStatusFilter: "待发布", taskPlatformFilter: "公众号" });
  const empty = buildExecutionTasks(topic, { taskStatusFilter: "已复盘", taskPlatformFilter: "视频号" });

  assert.match(html, /长文草稿/);
  assert.match(html, /协作者/);
  assert.match(empty, /当前过滤条件下没有匹配的内容任务/);
});

test("buildExecutionReceipts renders filtered receipt cards and empty state", () => {
  const html = buildExecutionReceipts(topic, { taskPlatformFilter: "视频号" });
  const empty = buildExecutionReceipts(topic, { taskPlatformFilter: "抖音" });

  assert.match(html, /短视频脚本/);
  assert.match(html, /待观察/);
  assert.match(empty, /当前过滤条件下没有匹配的发布回执/);
});
