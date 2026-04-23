export function resolveBuildModeMeta(mode = "generated_fallback", sourceContext = "repo_workspace") {
  const isFallbackMode = mode !== "full_sources";

  return {
    buildMode: mode,
    sourceContext,
    isFallbackMode,
    buildModeLabel: isFallbackMode ? "Fallback Snapshot" : "Full Source",
    buildModeDescription: isFallbackMode
      ? "当前页面数据来自已生成快照与镜像回退构建，适合迁移期持续部署。"
      : "当前页面数据由完整源数据与镜像重新导出生成。",
  };
}

export function buildSourceRequirements() {
  return {
    fullSource: [
      "data/content-sources/种子资产卡-20条.md",
      "data/content-sources/选题池-种子.md",
      "data/content-sources/历史高表现内容-候选池.md",
      "data/feishu-mirror/*.csv",
    ],
    fallback: [
      "apps/web-dashboard/src/generated/dashboard-data.json",
      "data/feishu-mirror/周复盘.csv",
    ],
  };
}
