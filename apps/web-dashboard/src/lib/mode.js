export function resolveBuildMode(meta = {}) {
  const buildMode = meta.buildMode || "generated_fallback";
  const isFallbackMode = buildMode !== "full_sources";

  return {
    buildMode,
    isFallbackMode,
    label: meta.buildModeLabel || (isFallbackMode ? "Fallback Snapshot" : "Full Source"),
    description:
      meta.buildModeDescription ||
      (isFallbackMode
        ? "当前页面数据来自已生成快照与镜像回退构建，适合迁移期持续部署。"
        : "当前页面数据由完整源数据与镜像重新导出生成。"),
    sourceContext: meta.sourceContext || "repo_workspace",
    generatedAt: meta.generatedAt || "",
  };
}

export function resolveSync(sync = {}) {
  const status = sync.status || "offline";
  return {
    ...sync,
    status,
    isOnline: status === "online",
    statusLabel: status === "online" ? "在线" : "离线",
    linkText: sync.url ? "打开飞书主库" : "飞书主库链接已脱敏",
  };
}
