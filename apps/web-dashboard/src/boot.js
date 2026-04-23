import "./styles.css";
import "./mode.css";
import { dashboardData } from "./generated/dashboard-data.js";
import { COMMAND_TABS } from "./lib/commands.js";
import { hydrateScheduleForm, renderCommandDock } from "./lib/command-dock.js";
import { bindAllInteractions } from "./lib/interactions.js";
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
  bindAllInteractions({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta, renderAll });
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
