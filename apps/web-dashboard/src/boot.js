import "./styles.css";
import "./mode.css";
import { dashboardData } from "./generated/dashboard-data.js";
import { COMMAND_TABS, buildCommandText } from "./lib/commands.js";
import { escapeHtml } from "./lib/format.js";
import { resolveBuildMode, resolveSync } from "./lib/mode.js";
import {
  buildActivity,
  buildAngles,
  buildAssets,
  buildHighPerfList,
  buildMetrics,
  buildReceipts,
  buildShell,
  buildSteps,
  buildTasks,
  buildTopicList,
} from "./lib/render.js";
import { defaultSchedule, loadStoredSchedule, saveStoredSchedule } from "./lib/schedule.js";

const STORAGE_KEY = "ip-content-web-dashboard-v2";
const buildModeMeta = resolveBuildMode(dashboardData.meta || {});
const syncMeta = resolveSync(dashboardData.meta?.sync || {});

const state = {
  query: "",
  lineFilter: "all",
  selectedId: resolveInitialTopicId(),
  commandTab: COMMAND_TABS[0],
};

bootstrap();

function bootstrap() {
  const app = document.getElementById("app");
  app.innerHTML = buildShell({ stageCount: dashboardData.topics?.[0]?.steps?.length || 7 });

  hydrateStaticMeta();
  hydrateScheduleForm(loadStoredSchedule(STORAGE_KEY, dashboardData));
  bindAll();
  renderAll();
}

function resolveInitialTopicId() {
  const paired = dashboardData.meta?.defaultPairing?.aiTopic;
  if (paired && dashboardData.topics.some((topic) => topic.id === paired)) {
    return paired;
  }
  return dashboardData.topics[0]?.id || "";
}

function hydrateStaticMeta() {
  document.getElementById("brandName").textContent = dashboardData.meta?.projectName || "IP Factory";
  document.getElementById("brandSubtitle").textContent = dashboardData.meta?.projectSubtitle || "双线 IP 内容中台网页端";
}

function hydrateScheduleForm(values) {
  document.getElementById("aiTopic").value = values.aiTopic;
  document.getElementById("brandTopic").value = values.brandTopic;
  document.getElementById("weekId").value = values.weekId;
  document.getElementById("dateMain").value = values.dateMain;
  document.getElementById("dateArticle").value = values.dateArticle;
  document.getElementById("dateBrandPost").value = values.dateBrandPost;
}

function readScheduleValues() {
  const fallback = defaultSchedule(dashboardData);
  return {
    aiTopic: document.getElementById("aiTopic")?.value.trim() || fallback.aiTopic,
    brandTopic: document.getElementById("brandTopic")?.value.trim() || fallback.brandTopic,
    weekId: document.getElementById("weekId")?.value.trim() || fallback.weekId,
    dateMain: document.getElementById("dateMain")?.value || fallback.dateMain,
    dateArticle: document.getElementById("dateArticle")?.value || fallback.dateArticle,
    dateBrandPost: document.getElementById("dateBrandPost")?.value || fallback.dateBrandPost,
  };
}

function persistSchedule() {
  saveStoredSchedule(STORAGE_KEY, readScheduleValues());
}

function filterTopic(topic) {
  const q = state.query.trim().toLowerCase();
  const filter = state.lineFilter;
  const matchesFilter =
    filter === "all" ||
    (filter === "ai" && topic.lineLabel === "AI 实战") ||
    (filter === "brand" && topic.lineLabel === "品牌案例") ||
    (filter === "ops" && topic.lineLabel === "经营 / 成长");

  if (!matchesFilter) return false;
  if (!q) return true;

  return [
    topic.id,
    topic.title,
    topic.subtitle,
    topic.account,
    topic.line,
    topic.platformText,
    topic.goal,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function filteredTopics() {
  return dashboardData.topics.filter(filterTopic);
}

function findTopic(topicId) {
  return dashboardData.topics.find((topic) => topic.id === topicId) || dashboardData.topics[0] || null;
}

function currentTopic() {
  const list = filteredTopics();
  return list.find((topic) => topic.id === state.selectedId) || findTopic(state.selectedId);
}

function renderCounters(topics) {
  document.getElementById("countTopics").textContent = String(dashboardData.meta?.counts?.topics || dashboardData.topics.length);
  document.getElementById("countTasks").textContent = String(dashboardData.meta?.counts?.tasks || 0);
  document.getElementById("countHighPerf").textContent = String(dashboardData.meta?.counts?.highPerf || 0);
  document.getElementById("countSync").textContent = syncMeta.isOnline ? "Live" : "Offline";
  document.getElementById("countFiltered").textContent = `${topics.length} / ${dashboardData.topics.length}`;
  document.getElementById("lineAll").textContent = String(dashboardData.topics.length);
  document.getElementById("lineAi").textContent = String(
    dashboardData.topics.filter((topic) => topic.lineLabel === "AI 实战").length,
  );
  document.getElementById("lineBrand").textContent = String(
    dashboardData.topics.filter((topic) => topic.lineLabel === "品牌案例").length,
  );
  document.getElementById("lineOps").textContent = String(
    dashboardData.topics.filter((topic) => topic.lineLabel === "经营 / 成长").length,
  );
}

function renderModePanel() {
  const badge = document.getElementById("buildModeBadge");
  badge.textContent = buildModeMeta.label;
  badge.classList.toggle("mode-badge--fallback", buildModeMeta.isFallbackMode);
  badge.classList.toggle("mode-badge--full", !buildModeMeta.isFallbackMode);

  document.getElementById("buildModeDescription").textContent = buildModeMeta.description;
  document.getElementById("buildModeValue").textContent = buildModeMeta.buildMode;
  document.getElementById("sourceContext").textContent = buildModeMeta.sourceContext;
  document.getElementById("generatedAt").textContent = buildModeMeta.generatedAt || "未知";
}

function renderSidebar() {
  const topics = filteredTopics();
  renderCounters(topics);
  document.getElementById("topicList").innerHTML = topics.length
    ? buildTopicList(topics, state.selectedId)
    : `<div class="empty-card">当前筛选条件下没有匹配的选题。</div>`;
}

function renderTopicPanel(topic) {
  if (!topic) return;

  document.getElementById("breadcrumb").textContent = `Pipeline > ${topic.id} > ${topic.account} > ${topic.platformText}`;
  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("topicSubtitle").textContent = topic.subtitle;
  document.getElementById("topicTags").innerHTML = `
    <span class="meta-pill">${escapeHtml(topic.account)}</span>
    <span class="meta-pill">${escapeHtml(topic.lineLabel)}</span>
    <span class="meta-pill">${escapeHtml(topic.platformText)}</span>
    <span class="meta-pill emphasis">${escapeHtml(topic.goal)}</span>
  `;
  document.getElementById("metricGrid").innerHTML = buildMetrics(topic);
  document.getElementById("stageTrack").innerHTML = buildSteps(topic);
  document.getElementById("angleGrid").innerHTML = buildAngles(topic);
  document.getElementById("topicSummary").textContent = topic.summary || "";
  document.getElementById("assetGrid").innerHTML = buildAssets(topic);
  document.getElementById("taskGrid").innerHTML = buildTasks(topic);
  document.getElementById("receiptGrid").innerHTML = buildReceipts(topic);
  document.getElementById("feedList").innerHTML = buildActivity(topic);
}

function renderCommandDock() {
  const values = readScheduleValues();
  persistSchedule();
  const topic = currentTopic();
  document.getElementById("pairingText").textContent = `AI ${values.aiTopic} / 品牌 ${values.brandTopic}`;
  document.getElementById("commandOutput").textContent = buildCommandText({
    tab: state.commandTab,
    topic,
    values,
    modeMeta: buildModeMeta,
  });
  document.querySelectorAll("[data-command-tab]").forEach((node) => {
    node.classList.toggle("active", node.dataset.commandTab === state.commandTab);
  });
}

function renderSyncPanel() {
  const link = document.getElementById("syncLink");
  document.getElementById("syncStatus").textContent = syncMeta.statusLabel;
  document.getElementById("syncBase").textContent = syncMeta.baseName || "未配置";
  document.getElementById("syncToken").textContent = syncMeta.tokenMasked || "未配置";
  document.getElementById("syncMirror").textContent = syncMeta.mirroredAt || "未拉镜像";
  link.href = syncMeta.url || "#";
  link.textContent = syncMeta.linkText;
  link.classList.toggle("disabled", !syncMeta.url);
}

function renderReview() {
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

function renderAll() {
  const topic = currentTopic();
  renderModePanel();
  renderSidebar();
  renderTopicPanel(topic);
  renderCommandDock();
  renderSyncPanel();
  renderReview();
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.focus();
  area.select();
  document.execCommand("copy");
  area.remove();
}

function showToast(text) {
  const node = document.getElementById("toast");
  node.textContent = text;
  node.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => node.classList.remove("visible"), 1500);
}

function bindSearch() {
  const inputs = [document.getElementById("sidebarSearch"), document.getElementById("globalSearch")];
  inputs.forEach((input) => {
    input.addEventListener("input", (event) => {
      state.query = event.target.value;
      inputs.forEach((node) => {
        if (node !== event.target) node.value = state.query;
      });
      renderAll();
    });
  });
}

function bindLineFilters() {
  document.querySelectorAll("[data-line-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.lineFilter = button.dataset.lineFilter || "all";
      document.querySelectorAll("[data-line-filter]").forEach((node) => {
        node.classList.toggle("active", node.dataset.lineFilter === state.lineFilter);
      });
      renderAll();
    });
  });
}

function bindTopicList() {
  document.getElementById("topicList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic-id]");
    if (!button) return;
    state.selectedId = button.dataset.topicId || state.selectedId;
    renderAll();
  });
}

function bindCommands() {
  ["aiTopic", "brandTopic", "weekId", "dateMain", "dateArticle", "dateBrandPost"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", renderCommandDock);
    input.addEventListener("change", renderCommandDock);
  });

  document.querySelectorAll("[data-command-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.commandTab = button.dataset.commandTab || COMMAND_TABS[0];
      renderCommandDock();
    });
  });

  document.getElementById("setAiTopic").addEventListener("click", () => {
    const topic = currentTopic();
    if (!topic) return;
    document.getElementById("aiTopic").value = topic.id;
    state.commandTab = "week";
    renderCommandDock();
    showToast(`已把 ${topic.id} 设为 AI 母题`);
  });

  document.getElementById("setBrandTopic").addEventListener("click", () => {
    const topic = currentTopic();
    if (!topic) return;
    document.getElementById("brandTopic").value = topic.id;
    state.commandTab = "week";
    renderCommandDock();
    showToast(`已把 ${topic.id} 设为品牌案例`);
  });

  document.getElementById("copyTopicPrompt").addEventListener("click", async () => {
    const text = buildCommandText({
      tab: "prompt",
      topic: currentTopic(),
      values: readScheduleValues(),
      modeMeta: buildModeMeta,
    });
    await copyText(text);
    showToast("提示词已复制");
  });

  document.getElementById("copyStartup").addEventListener("click", async () => {
    await copyText("npm run build:web\nnpm run vercel-build");
    showToast("启动命令已复制");
  });

  document.getElementById("copyCommand").addEventListener("click", async () => {
    await copyText(document.getElementById("commandOutput").textContent || "");
    showToast("命令面板已复制");
  });

  document.getElementById("resetSchedule").addEventListener("click", () => {
    hydrateScheduleForm(defaultSchedule(dashboardData));
    renderCommandDock();
    showToast("已恢复默认日期");
  });
}

function bindAll() {
  bindSearch();
  bindLineFilters();
  bindTopicList();
  bindCommands();
}
