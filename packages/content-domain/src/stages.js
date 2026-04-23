export const STAGE_NAMES = ["选题", "排期", "生产", "审核", "发布", "数据", "复盘"];

export const TOPIC_STAGE_MAP = {
  待挑选: 0,
  待排期: 1,
  进行中: 2,
  已发布: 5,
  已复盘: 6,
  淘汰: -1,
};

export const TASK_STAGE_MAP = {
  待分配: 1,
  待生产: 2,
  待审核: 3,
  待修改: 3,
  待发布: 4,
  已发布: 5,
  已复盘: 6,
};

export const TOPIC_STATUS_TYPE = {
  进行中: "active",
  待排期: "review",
  待挑选: "queued",
  已发布: "done",
  已复盘: "done",
  淘汰: "queued",
};

export function statusTypeFromTopicStatus(topicStatus) {
  return TOPIC_STATUS_TYPE[topicStatus] || "queued";
}

export function stageIndexForTopic(topicStatus, taskRows = []) {
  let stageIndex = TOPIC_STAGE_MAP[topicStatus] ?? 0;

  for (const row of taskRows) {
    const taskStatus = row?.当前状态 || row?.status || "";
    const taskStage = TASK_STAGE_MAP[taskStatus];
    if (typeof taskStage === "number") {
      stageIndex = Math.max(stageIndex, taskStage);
    }
  }

  if (stageIndex < 0) return 0;
  return stageIndex;
}

export function buildStageSteps(topicStatus, taskRows = [], stageNames = STAGE_NAMES) {
  const stageIndex = stageIndexForTopic(topicStatus, taskRows);

  if (topicStatus === "已复盘" || stageIndex >= stageNames.length - 1) {
    return stageNames.map((name, index) => ({
      id: String(index + 1).padStart(2, "0"),
      name,
      state: "done",
      sub: "完成",
    }));
  }

  return stageNames.map((name, index) => {
    if (index < stageIndex) {
      return {
        id: String(index + 1).padStart(2, "0"),
        name,
        state: "done",
        sub: "完成",
      };
    }

    if (index === stageIndex) {
      return {
        id: String(index + 1).padStart(2, "0"),
        name,
        state: "active",
        sub: "当前",
      };
    }

    return {
      id: String(index + 1).padStart(2, "0"),
      name,
      state: "pending",
      sub: "待执行",
    };
  });
}
