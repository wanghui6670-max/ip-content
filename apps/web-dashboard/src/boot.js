import "./styles.css";
import "./mode.css";
import { dashboardData } from "./generated/dashboard-data.js";
import { COMMAND_TABS, buildCommandText } from "./lib/commands.js";
import {
  hydrateScheduleForm,
  normalizeCommandTab,
  readScheduleValues,
  renderCommandDock,
  resetScheduleForm,
} from "./lib/command-dock.js";
import { copyText, showToast } from "./lib/feedback.js";
import { resolveBuildMode, resolveSync } from "./lib/mode.js";
import { buildShell, buildTopicList } from "./lib/render.js";
import {
  renderCounters,
  renderModePanel,
  renderReview,
  renderSyncPanel,
} from "./lib/panels.js";
import { loadStoredSchedule } from "./lib/schedule.js";
import { renderTopicPanel } from "./lib/topic-panel.js";
import {
  currentTopic,
  filteredTopics,
  resolveInitialTopicId,
} from "./lib/topics.js";

const STORAGE_KEY = "ip-content-web-dashboard-v2";
const buildModeMeta = resolveBuildMode(dashboardData.meta || {});
const syncMeta = resolveSync(dashboardData.meta?.sync || {});

const state = {
  query: "",
  lineFilter: "all",
  selectedId: resolveInitialTopicId(dashboardData),
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

function hydrateStaticMeta() {
  document.getElementById("brandName").textContent = dashboardData.meta?.projectName || "IP Factory";
  document.getElementById("brandSubtitle").textContent = dashboardData.meta?.projectSubtitle || "双线 IP 内容中台网页端";
}

function renderSidebar() {
  const topics = filteredTopics(dashboardData, state);
  renderCounters({ dashboardData, topics, syncMeta });
  document.getElementById("topicList").innerHTML = topics.length
    ? buildTopicList(topics, state.selectedId)
    : `<div class="empty-card">当前筛选条件下没有匹配的选题。</div>`;
}

function renderAll() {
  const topic = currentTopic(dashboardData, state);
  renderModePanel(buildModeMeta);
  renderSidebar();
  renderTopicPanel(topic);
  renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta });
  renderSyncPanel(syncMeta);
  renderReview(dashboardData);
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
    input.addEventListener("input", () => renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta }));
    input.addEventListener("change", () => renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta }));
  });

  document.querySelectorAll("[data-command-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.commandTab = normalizeCommandTab(button.dataset.commandTab);
      renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta });
    });
  });

  document.getElementById("setAiTopic").addEventListener("click", () => {
    const topic = currentTopic(dashboardData, state);
    if (!topic) return;
    document.getElementById("aiTopic").value = topic.id;
    state.commandTab = "week";
    renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta });
    showToast(`已把 ${topic.id} 设为 AI 母题`);
  });

  document.getElementById("setBrandTopic").addEventListener("click", () => {
    const topic = currentTopic(dashboardData, state);
    if (!topic) return;
    document.getElementById("brandTopic").value = topic.id;
    state.commandTab = "week";
    renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta });
    showToast(`已把 ${topic.id} 设为品牌案例`);
  });

  document.getElementById("copyTopicPrompt").addEventListener("click", async () => {
    const text = buildCommandText({
      tab: "prompt",
      topic: currentTopic(dashboardData, state),
      values: readScheduleValues(dashboardData),
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
    resetScheduleForm(dashboardData);
    renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta });
    showToast("已恢复默认日期");
  });
}

function bindAll() {
  bindSearch();
  bindLineFilters();
  bindTopicList();
  bindCommands();
}
