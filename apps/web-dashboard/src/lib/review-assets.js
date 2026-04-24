import { escapeHtml } from "./format.js";

export function normalizeReview(row = {}) {
  return {
    week: row["周次"] || row.week || "当前周",
    summary: row["复盘结论"] || row.summary || "待补复盘结论",
    nextAction: row["下周动作"] || row.nextAction || "待补下周动作",
  };
}

export function getCurrentReview(reviews = []) {
  return normalizeReview(reviews[0] || {});
}

export function buildReviewInsightCards(review = {}) {
  const normalized = normalizeReview(review);
  return [
    {
      label: "Week",
      value: normalized.week,
      detail: "当前复盘周期",
    },
    {
      label: "Conclusion",
      value: normalized.summary,
      detail: "本周复盘结论",
    },
    {
      label: "Next Action",
      value: normalized.nextAction,
      detail: "下周动作建议",
    },
  ];
}

export function renderReviewPanel(dashboardData = {}) {
  const review = getCurrentReview(dashboardData.reviews || []);
  const weekNode = document.getElementById("reviewWeek");
  const summaryNode = document.getElementById("reviewSummary");
  const nextNode = document.getElementById("reviewNext");
  const insightNode = document.getElementById("reviewInsightGrid");

  if (weekNode) weekNode.textContent = review.week;
  if (summaryNode) summaryNode.textContent = review.summary;
  if (nextNode) nextNode.textContent = review.nextAction;

  if (insightNode) {
    insightNode.innerHTML = buildReviewInsightCards(review)
      .map(
        (item) => `
          <article class="review-insight-card">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
            <p>${escapeHtml(item.detail)}</p>
          </article>
        `,
      )
      .join("");
  }
}

export function normalizeAsset(asset = {}, linkedTopicId = "") {
  return {
    id: asset.id || asset["编号"] || "",
    title: asset.title || asset["标题"] || "未命名资产",
    line: asset.line || asset["内容线"] || "未分组",
    type: asset.type || asset["类型"] || "未分类",
    platformText: asset.platformText || asset["适配平台"] || "未指定平台",
    reuse: asset.reuse || asset["可转化方向"] || "待补复用方向",
    linkedTopicIds: linkedTopicId ? [linkedTopicId] : [],
  };
}

export function groupAssetsByLine(assets = [], linkedTopicId = "") {
  return assets.reduce((groups, asset) => {
    const item = normalizeAsset(asset, linkedTopicId);
    const key = item.line || "未分组";
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

export function buildGroupedAssetList(assets = [], linkedTopicId = "") {
  const groups = groupAssetsByLine(assets, linkedTopicId);
  const entries = Object.entries(groups);

  if (!entries.length) {
    return `<div class="empty-card">当前选题还没有挂到资产卡，先回资产库补来源。</div>`;
  }

  return entries
    .map(
      ([line, items]) => `
        <section class="asset-group">
          <div class="asset-group__head">
            <strong>${escapeHtml(line)}</strong>
            <span class="counter-pill">${items.length} assets</span>
          </div>
          <div class="asset-group__grid">
            ${items
              .map(
                (asset) => `
                  <article class="asset-card asset-card--grouped">
                    <div class="asset-card__top">
                      <span class="asset-card__id">${escapeHtml(asset.id)}</span>
                      <span class="counter-pill">${escapeHtml(asset.type)}</span>
                    </div>
                    <h4>${escapeHtml(asset.title)}</h4>
                    <p>${escapeHtml(asset.reuse)}</p>
                    <div class="asset-card__meta">
                      <span>${escapeHtml(asset.platformText)}</span>
                      <span>Linked: ${escapeHtml(asset.linkedTopicIds.join(" / ") || "待关联")}</span>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

export function renderAssetPanel(topic = {}) {
  const node = document.getElementById("assetGrid");
  if (!node) return;
  node.innerHTML = buildGroupedAssetList(topic.sourceAssets || [], topic.id || "");
}
