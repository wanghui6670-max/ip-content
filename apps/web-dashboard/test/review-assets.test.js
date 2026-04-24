import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGroupedAssetList,
  buildReviewInsightCards,
  getCurrentReview,
  groupAssetsByLine,
  normalizeAsset,
  normalizeReview,
  renderAssetPanel,
  renderReviewPanel,
} from "../src/lib/review-assets.js";

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

test("normalizeReview maps review fields and defaults", () => {
  const review = normalizeReview({ 周次: "2026-W17", 复盘结论: "选题有效", 下周动作: "继续放大" });
  const fallback = normalizeReview({});

  assert.equal(review.week, "2026-W17");
  assert.equal(review.summary, "选题有效");
  assert.equal(review.nextAction, "继续放大");
  assert.equal(fallback.week, "当前周");
});

test("getCurrentReview returns first review row", () => {
  const review = getCurrentReview([{ 周次: "2026-W18", 复盘结论: "稳定", 下周动作: "扩写" }]);
  assert.equal(review.week, "2026-W18");
});

test("buildReviewInsightCards creates week conclusion and next action cards", () => {
  const cards = buildReviewInsightCards({ week: "2026-W18", summary: "稳定", nextAction: "扩写" });

  assert.equal(cards.length, 3);
  assert.equal(cards[0].label, "Week");
  assert.equal(cards[1].value, "稳定");
  assert.equal(cards[2].value, "扩写");
});

test("normalizeAsset maps mixed asset fields", () => {
  const asset = normalizeAsset({ 编号: "A01", 标题: "案例素材", 内容线: "AI 实战", 类型: "视频", 适配平台: "视频号", 可转化方向: "二创" }, "T01");

  assert.equal(asset.id, "A01");
  assert.equal(asset.title, "案例素材");
  assert.equal(asset.line, "AI 实战");
  assert.deepEqual(asset.linkedTopicIds, ["T01"]);
});

test("groupAssetsByLine groups assets by content line", () => {
  const groups = groupAssetsByLine([
    { id: "A01", title: "AI 资产", line: "AI 实战" },
    { id: "A02", title: "品牌资产", line: "品牌案例" },
    { id: "A03", title: "AI 资产 2", line: "AI 实战" },
  ], "T01");

  assert.equal(groups["AI 实战"].length, 2);
  assert.equal(groups["品牌案例"].length, 1);
});

test("buildGroupedAssetList renders grouped assets and empty state", () => {
  const html = buildGroupedAssetList([{ id: "A01", title: "AI 资产", line: "AI 实战", type: "视频", platformText: "视频号", reuse: "二创" }], "T01");
  const empty = buildGroupedAssetList([], "T01");

  assert.match(html, /AI 实战/);
  assert.match(html, /Linked: T01/);
  assert.match(empty, /当前选题还没有挂到资产卡/);
});

test("renderReviewPanel writes review nodes and insight cards", () => {
  const nodes = installDocument(["reviewWeek", "reviewSummary", "reviewNext", "reviewInsightGrid"]);

  renderReviewPanel({ reviews: [{ 周次: "2026-W19", 复盘结论: "有效", 下周动作: "继续" }] });

  assert.equal(nodes.reviewWeek.textContent, "2026-W19");
  assert.equal(nodes.reviewSummary.textContent, "有效");
  assert.equal(nodes.reviewNext.textContent, "继续");
  assert.match(nodes.reviewInsightGrid.innerHTML, /Conclusion/);
});

test("renderAssetPanel writes grouped asset HTML", () => {
  const nodes = installDocument(["assetGrid"]);

  renderAssetPanel({
    id: "T01",
    sourceAssets: [{ id: "A01", title: "AI 资产", line: "AI 实战", type: "视频", platformText: "视频号", reuse: "二创" }],
  });

  assert.match(nodes.assetGrid.innerHTML, /AI 资产/);
  assert.match(nodes.assetGrid.innerHTML, /Linked: T01/);
});
