import { buildTopicList } from "./render.js";
import { renderCounters } from "./panels.js";
import { filteredTopics } from "./topics.js";

export function hydrateStaticMeta(dashboardData) {
  document.getElementById("brandName").textContent = dashboardData.meta?.projectName || "IP Factory";
  document.getElementById("brandSubtitle").textContent = dashboardData.meta?.projectSubtitle || "双线 IP 内容中台网页端";
}

export function renderSidebar({ dashboardData, state, syncMeta }) {
  const topics = filteredTopics(dashboardData, state);
  renderCounters({ dashboardData, topics, syncMeta });
  document.getElementById("topicList").innerHTML = topics.length
    ? buildTopicList(topics, state.selectedId)
    : `<div class="empty-card">当前筛选条件下没有匹配的选题。</div>`;
}
