import { buildStageSteps, statusTypeFromTopicStatus } from "./stages.js";

export function buildTopicSummary(topic = {}, sourceAssetIds = []) {
  const lines = [
    `核心观点：${topic.coreView || topic.核心观点 || ""}`,
    `来源资产：${sourceAssetIds.length ? sourceAssetIds.join(" / ") : "待补"}`,
    `转化动作：${topic.goal || topic.转化动作 || "待补"}`,
  ];

  return lines.join("\n");
}

export function buildTopicViewModel(topic = {}, taskRows = [], sourceAssetIds = []) {
  const normalized = {
    ...topic,
    statusType: statusTypeFromTopicStatus(topic.status || topic.状态 || ""),
    summary: buildTopicSummary(topic, sourceAssetIds),
    steps: buildStageSteps(topic.status || topic.状态 || "", taskRows),
  };

  return normalized;
}

export function resolveDefaultPairing(meta = {}) {
  return {
    aiTopic: meta?.defaultPairing?.aiTopic || "T01",
    brandTopic: meta?.defaultPairing?.brandTopic || "T07",
  };
}
