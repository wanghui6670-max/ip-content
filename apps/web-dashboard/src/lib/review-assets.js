import { escapeHtml } from "./format.js";
import { buildHighPerfList } from "./render.js";

export function normalizeReview(review = {}) {
  return {
    week: review["周次"] || "当前周",
    summary: review["复盘结论"] || "待补复盘结论",
    nextAction: review["下周动作"] || "待补下周动作",
  };
}

export function buildReviewInsightCards(review = {}, dashboardData = {}) {
  const normalized = normalizeReview(review);
  const counts = dashboardData.meta?.counts || {};
  return [
    {
      label: "Week",
      value: normalized.week,
      detail: "当前复盘口径",
    },
    {
      label: "Topics",
      value: String(counts.topics || dashboardData.topics?.length || 0),
      detail: "候选与推进中的选题数量",
    },
    {
      label: "Tasks",
      value: String(counts.tasks || 0),
      detail: "当前镜像中的任务数量",
    },
    {
      label: "High Perf",
      value: String(counts.highPerf || dashboardData.highPerf?.length || 0),
      detail: "高表现候选素材数量",
    },
  ];
}

function ensureReviewInsightHost() {
  if (document.getElementById("reviewInsightGrid")) return;
  const reviewWeek = document.getElementById("reviewWeek");
  const panel = reviewWeek?.closest(".panel");
  const firstReviewBlock = panel?.querySelector(".review-block");
  if (!panel || !firstReviewBlock) return;

  const host = document.createElement("div");
  host.id = "reviewInsightGrid";
  host.className = "review-insight-grid";
  panel.insertBefore(host, firstReviewBlock);
}

export function renderReviewPanel(dashboardData = {}) {
  const review = normalizeReview(dashboardData.reviews?.[0]);
  document.getElementById("highPerfList").innerHTML = buildHighPerfList(dashboardData.highPerf || []);
  document.getElementById("reviewWeek").textContent = review.week;
  document.getElementById("reviewSummary").textContent = review.summary;
  document.getElementById("reviewNext").textContent = review.nextAction;

  ensureReviewInsightHost();
  const host = document.getElementById("reviewInsightGrid");
  if (!host) return;

  host.innerHTML = buildReviewInsightCards(dashboardData.reviews?.[0], dashboardData)
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

export function normalizeAsset(asset = {}, topic = {}) {
  return {
    id: asset.id || "未编号",
    title: asset.title || "未命名资产",
    line: asset.line || topic.lineLabel || "未分组",
    type: asset.type || "资产",
    reuse: asset.reuse || "待补复用方向",
    platformText: asset.platformText || "未指定平台",
    linkedTopicIds: asset.linkedTopicIds || topic.sourceAssetIds?.includes(asset.id) ? [topic.id].filter(Boolean) : [],
  };
}

export function groupAssetsByLine(assets = [], topic = {}) {
  return assets.reduce((groups, asset) => {
    const normalized = normalizeAsset(asset, topic);
    const key = normalized.line || "未分组";
    groups[key] = groups[key] || [];
    groups[key].push(normalized);
    return groups;
  }, {});
}

export function buildAssetGroupCards(topic = {}) {
  const sourceAssets = topic.sourceAssets || [];
  if (!sourceAssets.length) {
    return `<div class="empty-card">当前选题还没有挂到资产卡，先回资产库补来源。</div>`;
  }

  const groups = groupAssetsByLine(sourceAssets, topic);
  return Object.entries(groups)
    .map(
      ([line, assets]) => `
        <section class="asset-group-card">
          <div class="asset-group-head">
            <div>
              <span>Content line</span>
              <strong>${escapeHtml(line)}</strong>
            </div>
            <em>${assets.length} assets</em>
          </div>
          <div class="asset-group-list">
            ${assets
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
                      <span>Linked: ${escapeHtml(asset.linkedTopicIds.join(" / ") || topic.id || "待关联")}</span>
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
  node.innerHTML = buildAssetGroupCards(topic);
}
