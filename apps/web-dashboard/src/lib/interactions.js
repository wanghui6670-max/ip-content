import { buildCommandText } from "./commands.js";
import { hydrateScheduleForm, normalizeCommandTab, readScheduleValues, renderCommandDock, resetScheduleForm } from "./command-dock.js";
import { copyText, showToast } from "./feedback.js";
import { currentTopic } from "./topics.js";

export function bindSearch({ state, renderAll }) {
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

export function bindLineFilters({ state, renderAll }) {
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

export function bindTopicList({ state, renderAll }) {
  document.getElementById("topicList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic-id]");
    if (!button) return;
    state.selectedId = button.dataset.topicId || state.selectedId;
    renderAll();
  });
}

export function bindCommandDock({ dashboardData, state, storageKey, buildModeMeta }) {
  const renderDock = () => renderCommandDock({ dashboardData, state, storageKey, buildModeMeta });

  ["aiTopic", "brandTopic", "weekId", "dateMain", "dateArticle", "dateBrandPost"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", renderDock);
    input.addEventListener("change", renderDock);
  });

  document.querySelectorAll("[data-command-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.commandTab = normalizeCommandTab(button.dataset.commandTab);
      renderDock();
    });
  });

  document.getElementById("setAiTopic").addEventListener("click", () => {
    const topic = currentTopic(dashboardData, state);
    if (!topic) return;
    document.getElementById("aiTopic").value = topic.id;
    state.commandTab = "week";
    renderDock();
    showToast(`已把 ${topic.id} 设为 AI 母题`);
  });

  document.getElementById("setBrandTopic").addEventListener("click", () => {
    const topic = currentTopic(dashboardData, state);
    if (!topic) return;
    document.getElementById("brandTopic").value = topic.id;
    state.commandTab = "week";
    renderDock();
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
    renderDock();
    showToast("已恢复默认日期");
  });
}

export function bindAllInteractions({ dashboardData, state, storageKey, buildModeMeta, renderAll }) {
  bindSearch({ state, renderAll });
  bindLineFilters({ state, renderAll });
  bindTopicList({ state, renderAll });
  bindCommandDock({ dashboardData, state, storageKey, buildModeMeta });
}
