export function createTopicEntity(input = {}) {
  return {
    id: input.id || input.编号 || "",
    title: input.title || input.标题 || "",
    account: input.account || input.账号 || "",
    line: input.line || input.内容线 || "",
    status: input.status || input.状态 || "",
    audience: input.audience || input.目标用户 || "",
    goal: input.goal || input.转化动作 || "",
    coreView: input.coreView || input.核心观点 || "",
    platforms: input.platforms || [],
    sourceAssetIds: input.sourceAssetIds || [],
  };
}

export function createTaskEntity(input = {}) {
  return {
    topicId: input.topicId || input.所属选题 || "",
    title: input.title || input.内容标题 || "",
    owner: input.owner || input.负责人 || "",
    status: input.status || input.当前状态 || "",
    platform: input.platform || input.目标平台 || "",
    plannedAt: input.plannedAt || input.计划发布时间 || "",
  };
}

export function createReceiptEntity(input = {}) {
  return {
    title: input.title || input.内容标题 || "",
    platform: input.platform || input.平台 || "",
    result: input.result || input.结论 || "",
    data24h: input.data24h || input["24h数据"] || "",
    data72h: input.data72h || input["72h数据"] || "",
    data7d: input.data7d || input["7d数据"] || "",
  };
}

export function createReviewEntity(input = {}) {
  return {
    week: input.week || input.周次 || "",
    summary: input.summary || input.复盘结论 || "",
    nextAction: input.nextAction || input.下周动作 || "",
  };
}
