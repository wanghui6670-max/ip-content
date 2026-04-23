import { COMMAND_TABS, buildCommandText } from "./commands.js";
import { defaultSchedule, saveStoredSchedule } from "./schedule.js";
import { currentTopic } from "./topics.js";

export function hydrateScheduleForm(values) {
  document.getElementById("aiTopic").value = values.aiTopic;
  document.getElementById("brandTopic").value = values.brandTopic;
  document.getElementById("weekId").value = values.weekId;
  document.getElementById("dateMain").value = values.dateMain;
  document.getElementById("dateArticle").value = values.dateArticle;
  document.getElementById("dateBrandPost").value = values.dateBrandPost;
}

export function readScheduleValues(dashboardData) {
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

export function renderCommandDock({ dashboardData, state, storageKey, buildModeMeta }) {
  const values = readScheduleValues(dashboardData);
  saveStoredSchedule(storageKey, values);
  const topic = currentTopic(dashboardData, state);
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

export function resetScheduleForm(dashboardData) {
  hydrateScheduleForm(defaultSchedule(dashboardData));
}

export function normalizeCommandTab(value) {
  return COMMAND_TABS.includes(value) ? value : COMMAND_TABS[0];
}
