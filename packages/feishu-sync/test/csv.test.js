import test from "node:test";
import assert from "node:assert/strict";

import { csvHeaders, csvToObjects, parseCsv, validateCsvText } from "../src/csv.js";

test("parseCsv handles simple and quoted cells", () => {
  const rows = parseCsv('标题,平台\n"A, B",视频号\n');

  assert.deepEqual(rows, [["标题", "平台"], ["A, B", "视频号"]]);
});

test("csvToObjects maps rows to header keys", () => {
  const rows = csvToObjects("内容标题,平台\n测试视频,视频号\n");

  assert.equal(rows.length, 1);
  assert.equal(rows[0].内容标题, "测试视频");
  assert.equal(rows[0].平台, "视频号");
});

test("csvHeaders returns trimmed header names", () => {
  assert.deepEqual(csvHeaders(" 内容标题 , 平台 \n测试,视频号\n"), ["内容标题", "平台"]);
});

test("validateCsvText reports missing required headers", () => {
  const result = validateCsvText("内容标题,平台\n测试,视频号\n", ["内容标题", "平台", "结论"]);

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ["结论"]);
});
