import { escapeHtml } from "./format.js";
import { buildHighPerfList } from "./render.js";
import { renderReviewPanel } from "./review-assets.js";
import { lineCounts } from "./topics.js";

export function renderCounters({ dashboardData, topics, syncMeta }) {
  const counts = lineCounts(dashboardData);
  document.getElementById("countTopics").textContent = String(dashboardData.meta?.counts?.topics || dashboardData.topics.length);
  document.getElementById("countTasks").textContent = String(dashboardData.meta?.counts?.tasks || 0);
  document.getElementById("countHighPerf").textContent = String(dashboardData.meta?.counts?.highPerf || 0);
  document.getElementById("countSync").textContent = syncMeta.isOnline ? "Live" : "Offline";
  document.getElementById("countFiltered").textContent = `${topics.length} / ${dashboardData.topics.length}`;
  document.getElementById("lineAll").textContent = String(counts.all);
  document.getElementById("lineAi").textContent = String(counts.ai);
  document.getElementById("lineBrand").textContent = String(counts.brand);
  document.getElementById("lineOps").textContent = String(counts.ops);
}

export function buildDataConfidenceCards(buildModeMeta, syncMeta) {
  const confidence = buildModeMeta.isFallbackMode ? "迁移期快照" : "完整源数据";
  const confidenceTone = buildModeMeta.isFallbackMode ? "warning" : "success";
  const syncTone = syncMeta.isOnline ? "success" : "muted";
  const mirrorTime = syncMeta.mirroredAt || "未拉镜像";
  const generatedAt = buildModeMeta.generatedAt || "未知";
  const fallbackCopy = buildModeMeta.isFallbackMode
    ? "当前可用于评审与持续部署；涉及最新飞书状态时，请先补回完整源数据或刷新镜像。"
    : "当前由完整源数据重新导出，可作为主要工作台数据参考。";

  return [
    {
      label: "Confidence",
      value: confidence,
      tone: confidenceTone,
      detail: fallbackCopy,
    },
    {
      label: "Generated",
      value: generatedAt,
      tone: "neutral",
      detail: "页面数据生成时间",
    },
    {
      label: "Mirror",
      value: mirrorTime,
      tone: syncTone,
      detail: syncMeta.mirrorSource || "飞书镜像来源未配置",
    },
    {
      label: "Sync",
      value: syncMeta.statusLabel || "离线",
      tone: syncTone,
      detail: syncMeta.isOnline ? "检测到镜像或配置" : "当前未检测到在线镜像配置",
    },
  ];
}

export function renderDataConfidencePanel(buildModeMeta, syncMeta) {
  const node = document.getElementById("dataConfidenceGrid");
  if (!node) return;

  node.innerHTML = buildDataConfidenceCards(buildModeMeta, syncMeta)
    .map(
      (item) => `
        <article class="data-confidence-card is-${escapeHtml(item.tone)}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <p>${escapeHtml(item.detail)}</p>
        </article>
      `,
    )
    .join("");
}

export function renderModePanel(buildModeMeta, syncMeta) {
  const badge = document.getElementById("buildModeBadge");
  badge.textContent = buildModeMeta.label;
  badge.classList.toggle("mode-badge--fallback", buildModeMeta.isFallbackMode);
  badge.classList.toggle("mode-badge--full", !buildModeMeta.isFallbackMode);

  document.getElementById("buildModeDescription").textContent = buildModeMeta.description;
  document.getElementById("buildModeValue").textContent = buildModeMeta.buildMode;
  document.getElementById("sourceContext").textContent = buildModeMeta.sourceContext;
  document.getElementById("generatedAt").textContent = buildModeMeta.generatedAt || "未知";
  if (syncMeta) renderDataConfidencePanel(buildModeMeta, syncMeta);
}

export function renderSyncPanel(syncMeta) {
  const link = document.getElementById("syncLink");
  document.getElementById("syncStatus").textContent = syncMeta.statusLabel;
  document.getElementById("syncBase").textContent = syncMeta.baseName || "未配置";
  document.getElementById("syncToken").textContent = syncMeta.tokenMasked || "未配置";
  document.getElementById("syncMirror").textContent = syncMeta.mirroredAt || "未拉镜像";
  link.href = syncMeta.url || "#";
  link.textContent = syncMeta.linkText;
  link.classList.toggle("disabled", !syncMeta.url);
}

export function renderReview(dashboardData) {
  document.getElementById("highPerfList").innerHTML = buildHighPerfList(dashboardData.highPerf || []);
  renderReviewPanel(dashboardData);
}
