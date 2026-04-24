import test from "node:test";
import assert from "node:assert/strict";

import { knownMirrorFiles, requiredHeadersForFile } from "../src/table-contracts.js";

test("knownMirrorFiles lists required mirror csv files", () => {
  assert.deepEqual(knownMirrorFiles(), ["内容任务.csv", "发布回执.csv", "周复盘.csv"]);
});

test("requiredHeadersForFile returns known table headers", () => {
  assert.deepEqual(requiredHeadersForFile("内容任务.csv"), [
    "所属选题",
    "内容标题",
    "负责人",
    "当前状态",
    "目标平台",
    "计划发布时间",
  ]);
});

test("requiredHeadersForFile returns empty array for unknown files", () => {
  assert.deepEqual(requiredHeadersForFile("unknown.csv"), []);
});
