import "./styles.css";
import "./mode.css";
import "./view.css";
import { dashboardData } from "./generated/dashboard-data.js";
import { hydrateStaticMeta, renderSidebar } from "./lib/app-shell.js";
import { COMMAND_TABS } from "./lib/commands.js";
import { hydrateScheduleForm, renderCommandDock } from "./lib/command-dock.js";
import { bindAllInteractions } from "./lib/interactions.js";
import { resolveBuildMode, resolveSync } from "./lib/mode.js";
import { buildShell } from "./lib/render.js";
import {
  renderModePanel,
  renderReview,
  renderSyncPanel,
} from "./lib/panels.js";
import { loadStoredSchedule } from "./lib/schedule.js";
import { renderTopicPanel } from "./lib/topic-panel.js";
import { currentTopic, resolveInitialTopicId } from "./lib/topics.js";
import { hydrateViewStructure } from "./lib/views.js";

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

  hydrateViewStructure();
  hydrateStaticMeta(dashboardData);
  hydrateScheduleForm(loadStoredSchedule(STORAGE_KEY, dashboardData));
  bindAllInteractions({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta, renderAll });
  renderAll();
}

function renderAll() {
  const topic = currentTopic(dashboardData, state);
  renderModePanel(buildModeMeta);
  renderSidebar({ dashboardData, state, syncMeta });
  renderTopicPanel(topic);
  renderCommandDock({ dashboardData, state, storageKey: STORAGE_KEY, buildModeMeta });
  renderSyncPanel(syncMeta);
  renderReview(dashboardData);
}
