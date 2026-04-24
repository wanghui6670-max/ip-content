export const MIRROR_TABLE_CONTRACTS = {
  "内容任务.csv": ["所属选题", "内容标题", "负责人", "当前状态", "目标平台", "计划发布时间"],
  "发布回执.csv": ["内容标题", "平台", "结论", "24h数据", "72h数据", "7d数据"],
  "周复盘.csv": ["周次", "复盘结论", "下周动作"],
};

export function requiredHeadersForFile(fileName) {
  return MIRROR_TABLE_CONTRACTS[fileName] || [];
}

export function knownMirrorFiles() {
  return Object.keys(MIRROR_TABLE_CONTRACTS);
}
