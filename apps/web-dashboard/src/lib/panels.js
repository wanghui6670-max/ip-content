import { buildHighPerfList } from "./render.js";
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

export function renderModePanel(buildModeMeta) {
  const badge = document.getElementById("buildModeBadge");
  badge.textContent = buildModeMeta.label;
  badge.classList.toggle("mode-badge--fallback", buildModeMeta.isFallbackMode);
  badge.classList.toggle("mode-badge--full", !buildModeMeta.isFallbackMode);

  document.getElementById("buildModeDescription").textContent = buildModeMeta.description;
  document.getElementById("buildModeValue").textContent = buildModeMeta.buildMode;
  document.getElementById("sourceContext").textContent = buildModeMeta.sourceContext;
  document.getElementById("generatedAt").textContent = buildModeMeta.generatedAt || "未知";
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
  const review = dashboardData.reviews?.[0];
  document.getElementById("highPerfList").innerHTML = buildHighPerfList(dashboardData.highPerf || []);
  if (!review) {
    document.getElementById("reviewWeek").textContent = "当前周";
    document.getElementById("reviewSummary").textContent = "待补复盘结论";
    document.getElementById("reviewNext").textContent = "待补下周动作";
    return;
  }
  document.getElementById("reviewWeek").textContent = review["周次"] || "当前周";
  document.getElementById("reviewSummary").textContent = review["复盘结论"] || "待补复盘结论";
  document.getElementById("reviewNext").textContent = review["下周动作"] || "待补下周动作";
}
