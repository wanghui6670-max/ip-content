export function resolveInitialTopicId(dashboardData) {
  const paired = dashboardData.meta?.defaultPairing?.aiTopic;
  if (paired && dashboardData.topics.some((topic) => topic.id === paired)) {
    return paired;
  }
  return dashboardData.topics[0]?.id || "";
}

export function filterTopic(topic, state) {
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

export function filteredTopics(dashboardData, state) {
  return dashboardData.topics.filter((topic) => filterTopic(topic, state));
}

export function findTopic(dashboardData, topicId) {
  return dashboardData.topics.find((topic) => topic.id === topicId) || dashboardData.topics[0] || null;
}

export function currentTopic(dashboardData, state) {
  const list = filteredTopics(dashboardData, state);
  return list.find((topic) => topic.id === state.selectedId) || findTopic(dashboardData, state.selectedId);
}

export function lineCounts(dashboardData) {
  return {
    all: dashboardData.topics.length,
    ai: dashboardData.topics.filter((topic) => topic.lineLabel === "AI 实战").length,
    brand: dashboardData.topics.filter((topic) => topic.lineLabel === "品牌案例").length,
    ops: dashboardData.topics.filter((topic) => topic.lineLabel === "经营 / 成长").length,
  };
}
