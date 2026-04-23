export const COMMAND_TABS = ["week", "ops", "deploy", "prompt"];

export function buildWeekCommands(values) {
  return `ip sync status
ip sync pull

ip week plan --ai ${values.aiTopic} --brand ${values.brandTopic} --week ${values.weekId} --create-tasks \\
  --date-main ${values.dateMain} \\
  --date-article ${values.dateArticle} \\
  --date-brand-video ${values.dateMain} \\
  --date-brand-post ${values.dateBrandPost}

ip dispatch init --week ${values.weekId} --ai-topic ${values.aiTopic} --brand-topic ${values.brandTopic} \\
  --date-main ${values.dateMain} \\
  --date-article ${values.dateArticle} \\
  --date-brand-video ${values.dateMain} \\
  --date-brand-post ${values.dateBrandPost}

ip data init --week ${values.weekId} --ai-topic ${values.aiTopic} --brand-topic ${values.brandTopic} \\
  --date-main ${values.dateMain} \\
  --date-article ${values.dateArticle} \\
  --date-brand-video ${values.dateMain} \\
  --date-brand-post ${values.dateBrandPost}

ip draft create --topic ${values.aiTopic} --kind ai_video --date ${values.dateMain}
ip draft create --topic ${values.aiTopic} --kind ai_article --date ${values.dateArticle}
ip draft create --topic ${values.brandTopic} --kind brand_post --date ${values.dateBrandPost}
ip review init --week ${values.weekId} --ai-topic ${values.aiTopic} --brand-topic ${values.brandTopic}`;
}

export function buildOpsCommands(topic, values) {
  return `ip sync status
ip sync pull

ip show topics ${topic.id}
ip list assets --line ${topic.line}

ip task create --topic ${topic.id} --kind custom --owner "王辉 + 协作者"
ip draft create --topic ${topic.id} --kind custom --date ${values.dateMain}

# 发布后补数
ip data fill --week ${values.weekId} --topic ${topic.id} --kind ai_video --link 'https://example.com/post/1' --exposure24 3200 --engagement24 186 --conversion24 14`;
}

export function buildDeployCommands() {
  return `# 仓库根目录
npm run build:web
npm run vercel-build

# 仅网页端
cd apps/web-dashboard
npm run build:all
npm run preview

# Vercel
vercel --prod`;
}

export function buildPrompt({ topic, values, modeMeta }) {
  return [
    "请先以以下仓库文档作为上下文：",
    "- README.md",
    "- apps/web-dashboard/README.md",
    "- docs/开发路线图.md",
    "",
    `当前 build mode: ${modeMeta.label}`,
    `当前周标识: ${values.weekId}`,
    `当前 AI 母题: ${values.aiTopic}`,
    `当前品牌案例: ${values.brandTopic}`,
    topic ? `当前焦点选题: ${topic.id} ${topic.title}` : "",
    "",
    "先理解当前数据来源模式，再继续推进本周内容计划。",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCommandText({ tab, topic, values, modeMeta }) {
  if (tab === "ops") return buildOpsCommands(topic, values);
  if (tab === "deploy") return buildDeployCommands();
  if (tab === "prompt") return buildPrompt({ topic, values, modeMeta });
  return buildWeekCommands(values);
}
