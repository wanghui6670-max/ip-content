import { renderExecutionPanel } from "./execution.js";
import { escapeHtml } from "./format.js";
import {
  buildActivity,
  buildAngles,
  buildAssets,
  buildMetrics,
  buildSteps,
} from "./render.js";

export function renderTopicPanel(topic, state = {}) {
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
  renderExecutionPanel(topic, state);
  document.getElementById("feedList").innerHTML = buildActivity(topic);
}
