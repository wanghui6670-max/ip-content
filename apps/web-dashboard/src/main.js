import "./styles.css";
import { dashboardData } from "./generated/dashboard-data.js";

const STORAGE_KEY = "ip-content-web-dashboard-v1";
const COMMAND_TABS = ["week", "ops", "deploy", "prompt"];

const state = {
  query: "",
  lineFilter: "all",
  selectedId:
    (dashboardData.meta?.defaultPairing?.aiTopic &&
      dashboardData.topics.some((topic) => topic.id === dashboardData.meta.defaultPairing.aiTopic) &&
      dashboardData.meta.defaultPairing.aiTopic) ||
    dashboardData.topics[0]?.id ||
    "",
  commandTab: "week"
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function isoWeek(date) {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${pad(weekNo)}`;
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultSchedule() {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);

  const main = new Date(monday);
  main.setDate(monday.getDate() + 2);

  const article = new Date(monday);
  article.setDate(monday.getDate() + 4);

  const brandPost = new Date(monday);
  brandPost.setDate(monday.getDate() + 3);

  return {
    aiTopic: dashboardData.meta?.defaultPairing?.aiTopic || "T01",
    brandTopic: dashboardData.meta?.defaultPairing?.brandTopic || "T07",
    weekId: isoWeek(today),
    dateMain: formatDate(main),
    dateArticle: formatDate(article),
    dateBrandPost: formatDate(brandPost)
  };
}

function loadStoredState() {
  const fallback = defaultSchedule();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function saveStoredState() {
  const payload = {
    aiTopic: document.getElementById("aiTopic")?.value.trim() || "",
    brandTopic: document.getElementById("brandTopic")?.value.trim() || "",
    weekId: document.getElementById("weekId")?.value.trim() || "",
    dateMain: document.getElementById("dateMain")?.value || "",
    dateArticle: document.getElementById("dateArticle")?.value || "",
    dateBrandPost: document.getElementById("dateBrandPost")?.value || ""
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statusClass(statusType) {
  const map = {
    active: "is-active",
    review: "is-review",
    done: "is-done",
    queued: "is-queued"
  };
  return map[statusType] || "is-queued";
}

function stageClass(stateValue) {
  return {
    done: "done",
    active: "active",
    pending: "pending"
  }[stateValue] || "pending";
}

function lineFilterLabel(value) {
  if (value === "ai") return "AI 实战";
  if (value === "brand") return "品牌案例";
  if (value === "ops") return "经营 / 成长";
  return "全部";
}

function filterTopic(topic) {
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
    topic.goal
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function filteredTopics() {
  return dashboardData.topics.filter(filterTopic);
}

function findTopic(topicId) {
  return dashboardData.topics.find((topic) => topic.id === topicId) || dashboardData.topics[0];
}

function currentTopic() {
  const list = filteredTopics();
  const selected = list.find((topic) => topic.id === state.selectedId);
  return selected || findTopic(state.selectedId);
}

function scheduleValues() {
  return {
    aiTopic: document.getElementById("aiTopic")?.value.trim() || dashboardData.meta.defaultPairing.aiTopic,
    brandTopic: document.getElementById("brandTopic")?.value.trim() || dashboardData.meta.defaultPairing.brandTopic,
    weekId: document.getElementById("weekId")?.value.trim() || defaultSchedule().weekId,
    dateMain: document.getElementById("dateMain")?.value || defaultSchedule().dateMain,
    dateArticle: document.getElementById("dateArticle")?.value || defaultSchedule().dateArticle,
    dateBrandPost: document.getElementById("dateBrandPost")?.value || defaultSchedule().dateBrandPost
  };
}

function buildWeekCommands(values) {
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

function buildOpsCommands(topic) {
  return `ip sync status
ip sync pull

ip show topics ${topic.id}
ip list assets --line ${topic.line}

ip task create --topic ${topic.id} --kind custom --owner "王辉 + 协作者"
ip draft create --topic ${topic.id} --kind custom --date ${defaultSchedule().dateMain}

# 发布后
ip data fill --week ${scheduleValues().weekId} --topic ${topic.id} --kind ai_video --link 'https://example.com/post/1' --exposure24 3200 --engagement24 186 --conversion24 14`;
}

function buildDeployCommands() {
  return `cd /Users/wanghui/knowledge-base/web-dashboard
npm install
npm run build:all
npm run preview

# Vercel
vercel --prod

# Netlify / 静态托管
上传 ./dist 目录`;
}

function buildPrompt() {
  return "请以 /Users/wanghui/knowledge-base/00-首页/IP内容中台首页.md、/Users/wanghui/knowledge-base/00-首页/CLI使用说明.md、/Users/wanghui/knowledge-base/web-dashboard/README.md 为上下文，先运行 `ip sync status` 和 `ip sync pull`，然后继续推进本周内容计划。";
}

function commandText() {
  const topic = currentTopic();
  if (state.commandTab === "ops") return buildOpsCommands(topic);
  if (state.commandTab === "deploy") return buildDeployCommands();
  if (state.commandTab === "prompt") return buildPrompt();
  return buildWeekCommands(scheduleValues());
}

function buildTopicList(topics) {
  return topics
    .map(
      (topic) => `
        <button class="topic-card ${topic.id === state.selectedId ? "active" : ""}" data-topic-id="${escapeHtml(topic.id)}" type="button">
          <div class="topic-card__head">
            <span class="topic-card__id">${escapeHtml(topic.id)}</span>
            <span class="status-chip ${statusClass(topic.statusType)}">${escapeHtml(topic.status)}</span>
          </div>
          <h3>${escapeHtml(topic.title)}</h3>
          <p>${escapeHtml(topic.subtitle)}</p>
          <div class="topic-card__meta">
            <span>${escapeHtml(topic.account)} · ${escapeHtml(topic.lineLabel)}</span>
            <span>${escapeHtml(topic.platformText)}</span>
          </div>
        </button>
      `
    )
    .join("");
}

function buildMetrics(topic) {
  return topic.metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <div class="metric-card__head">
            <span>${escapeHtml(metric.label)}</span>
            <span>${escapeHtml(metric.delta)}</span>
          </div>
          <strong>${escapeHtml(metric.value)}</strong>
        </article>
      `
    )
    .join("");
}

function buildSteps(topic) {
  return topic.steps
    .map(
      (step) => `
        <article class="stage-card ${stageClass(step.state)}">
          <div class="stage-card__node">${escapeHtml(step.id)}</div>
          <strong>${escapeHtml(step.name)}</strong>
          <span>${escapeHtml(step.sub)}</span>
        </article>
      `
    )
    .join("");
}

function buildAngles(topic) {
  return topic.angles
    .map(
      (angle) => `
        <article class="angle-card">
          <div class="angle-card__key">${escapeHtml(angle.key)}</div>
          <h4>${escapeHtml(angle.title)}</h4>
          <p>${escapeHtml(angle.body)}</p>
        </article>
      `
    )
    .join("");
}

function buildAssets(topic) {
  if (!topic.sourceAssets.length) {
    return `<div class="empty-card">当前选题还没有挂到资产卡，先回资产库补来源。</div>`;
  }
  return topic.sourceAssets
    .map(
      (asset) => `
        <article class="asset-card">
          <div class="asset-card__top">
            <span class="asset-card__id">${escapeHtml(asset.id)}</span>
            <span class="counter-pill">${escapeHtml(asset.type)}</span>
          </div>
          <h4>${escapeHtml(asset.title)}</h4>
          <p>${escapeHtml(asset.reuse)}</p>
          <div class="asset-card__meta">
            <span>${escapeHtml(asset.line)}</span>
            <span>${escapeHtml(asset.platformText)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function buildTasks(topic) {
  if (!topic.tasks.length) {
    return `<div class="empty-card">飞书内容任务里还没有这个选题的任务行。</div>`;
  }
  return topic.tasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="task-card__top">
            <strong>${escapeHtml(task["内容标题"] || topic.title)}</strong>
            <span class="status-chip ${statusClass(task["当前状态"] === "已发布" ? "done" : task["当前状态"] === "待审核" ? "review" : "active")}">${escapeHtml(task["当前状态"] || "待处理")}</span>
          </div>
          <p>${escapeHtml(task["目标平台"] || "未指定平台")}</p>
          <div class="task-card__meta">
            <span>负责人：${escapeHtml(task["负责人"] || "待分配")}</span>
            <span>计划：${escapeHtml(task["计划发布时间"] || "待排期")}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function buildReceipts(topic) {
  if (!topic.receipts.length) {
    return `<div class="empty-card">发布回执已预留，但当前还没有这个选题的有效回执。</div>`;
  }
  return topic.receipts
    .map(
      (receipt) => `
        <article class="receipt-card">
          <div class="task-card__top">
            <strong>${escapeHtml(receipt["平台"] || "未指定平台")}</strong>
            <span class="counter-pill">${escapeHtml(receipt["结论"] || "待结论")}</span>
          </div>
          <p>24h：${escapeHtml(receipt["24h数据"] || "待回填")}</p>
          <div class="task-card__meta">
            <span>72h：${escapeHtml(receipt["72h数据"] || "待回填")}</span>
            <span>7d：${escapeHtml(receipt["7d数据"] || "待回填")}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function buildActivity(topic) {
  return topic.activity
    .map(
      (item) => `
        <article class="feed-card">
          <div class="feed-card__top">
            <div class="feed-badge">${escapeHtml(item.badge)}</div>
            <div>
              <strong>${escapeHtml(item.role)}</strong>
              <p>${escapeHtml(item.time)}</p>
            </div>
          </div>
          <div class="feed-card__body">${escapeHtml(item.text)}</div>
        </article>
      `
    )
    .join("");
}

function buildHighPerfList() {
  return dashboardData.highPerf
    .slice(0, 6)
    .map(
      (item) => `
        <article class="rank-card">
          <div class="rank-card__top">
            <span class="rank-card__id">${escapeHtml(item["编号"] || "")}</span>
            <span class="counter-pill">${escapeHtml(item["内容线"] || "")}</span>
          </div>
          <strong>${escapeHtml(item["内容标题"] || "")}</strong>
          <p>${escapeHtml(item["适合二创方向"] || "")}</p>
        </article>
      `
    )
    .join("");
}

function renderCounters(topics) {
  document.getElementById("countTopics").textContent = String(dashboardData.meta.counts.topics);
  document.getElementById("countTasks").textContent = String(dashboardData.meta.counts.tasks);
  document.getElementById("countHighPerf").textContent = String(dashboardData.meta.counts.highPerf);
  document.getElementById("countSync").textContent =
    dashboardData.meta.sync.status === "online" ? "Live" : "Offline";
  document.getElementById("countFiltered").textContent = `${topics.length} / ${dashboardData.topics.length}`;
  document.getElementById("lineAll").textContent = String(dashboardData.topics.length);
  document.getElementById("lineAi").textContent = String(
    dashboardData.topics.filter((topic) => topic.lineLabel === "AI 实战").length
  );
  document.getElementById("lineBrand").textContent = String(
    dashboardData.topics.filter((topic) => topic.lineLabel === "品牌案例").length
  );
  document.getElementById("lineOps").textContent = String(
    dashboardData.topics.filter((topic) => topic.lineLabel === "经营 / 成长").length
  );
}

function renderTopicPanel(topic) {
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
  document.getElementById("topicSummary").textContent = topic.summary;
  document.getElementById("assetGrid").innerHTML = buildAssets(topic);
  document.getElementById("taskGrid").innerHTML = buildTasks(topic);
  document.getElementById("receiptGrid").innerHTML = buildReceipts(topic);
  document.getElementById("feedList").innerHTML = buildActivity(topic);
}

function renderCommandDock() {
  const values = scheduleValues();
  saveStoredState();
  document.getElementById("pairingText").textContent = `AI ${escapeHtml(values.aiTopic)} / 品牌 ${escapeHtml(values.brandTopic)}`;
  document.getElementById("commandOutput").textContent = commandText();
  document.querySelectorAll("[data-command-tab]").forEach((node) => {
    node.classList.toggle("active", node.dataset.commandTab === state.commandTab);
  });
}

function renderSyncPanel() {
  const sync = dashboardData.meta.sync;
  const link = document.getElementById("syncLink");
  document.getElementById("syncStatus").textContent = sync.status === "online" ? "在线" : "离线";
  document.getElementById("syncBase").textContent = sync.baseName || "未配置";
  document.getElementById("syncToken").textContent = sync.tokenMasked || "未配置";
  document.getElementById("syncMirror").textContent = sync.mirroredAt || "未拉镜像";
  link.href = sync.url || "#";
  link.textContent = sync.url ? "打开飞书主库" : "飞书主库链接已脱敏";
  link.classList.toggle("disabled", !sync.url);
}

function renderSidebar() {
  const topics = filteredTopics();
  renderCounters(topics);
  document.getElementById("topicList").innerHTML = buildTopicList(topics);
}

function renderAll() {
  const topic = currentTopic();
  renderSidebar();
  renderTopicPanel(topic);
  renderCommandDock();
  renderSyncPanel();
  document.getElementById("highPerfList").innerHTML = buildHighPerfList();
  const review = dashboardData.reviews[0];
  if (review) {
    document.getElementById("reviewWeek").textContent = review["周次"] || "当前周";
    document.getElementById("reviewSummary").textContent = review["复盘结论"] || "待补复盘结论";
    document.getElementById("reviewNext").textContent = review["下周动作"] || "待补下周动作";
  }
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.focus();
  area.select();
  document.execCommand("copy");
  area.remove();
}

function showToast(text) {
  const node = document.getElementById("toast");
  node.textContent = text;
  node.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => node.classList.remove("visible"), 1500);
}

function buildShell() {
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">IP</div>
          <div>
            <div class="brand-name">${escapeHtml(dashboardData.meta.projectName)}</div>
            <div class="brand-sub">${escapeHtml(dashboardData.meta.projectSubtitle)}</div>
          </div>
        </div>

        <nav class="nav-strip">
          <div class="nav-stat"><span>Topics</span><strong id="countTopics">0</strong></div>
          <div class="nav-stat"><span>Tasks</span><strong id="countTasks">0</strong></div>
          <div class="nav-stat"><span>High Perf</span><strong id="countHighPerf">0</strong></div>
          <div class="nav-stat"><span>Sync</span><strong id="countSync">0</strong></div>
        </nav>

        <div class="top-actions">
          <input id="globalSearch" class="search-input" placeholder="搜 topic / 平台 / 状态" />
          <button class="button primary" id="copyStartup">复制启动命令</button>
        </div>
      </header>

      <div class="workspace">
        <aside class="leftbar">
          <div class="rail-head">
            <div>
              <div class="section-kicker">Topic List</div>
              <h2>本周母题池</h2>
            </div>
            <span class="counter-pill" id="countFiltered">0 / 0</span>
          </div>

          <div class="panel rail-panel">
            <input id="sidebarSearch" class="search-input compact" placeholder="搜 id / 标题 / 转化动作" />
            <div class="filter-row">
              <button class="filter-chip active" data-line-filter="all">全部 <strong id="lineAll">0</strong></button>
              <button class="filter-chip" data-line-filter="ai">AI <strong id="lineAi">0</strong></button>
              <button class="filter-chip" data-line-filter="brand">品牌 <strong id="lineBrand">0</strong></button>
              <button class="filter-chip" data-line-filter="ops">经营 <strong id="lineOps">0</strong></button>
            </div>
          </div>

          <div id="topicList" class="topic-list"></div>
        </aside>

        <main class="main">
          <section class="panel hero-panel">
            <div class="section-kicker" id="breadcrumb">Pipeline</div>
            <div class="hero-head">
              <div>
                <h1 id="topicTitle"></h1>
                <p id="topicSubtitle" class="hero-subtitle"></p>
                <div id="topicTags" class="meta-row"></div>
              </div>
              <div class="hero-actions">
                <button class="button primary" id="setAiTopic">设为 AI 母题</button>
                <button class="button" id="setBrandTopic">设为品牌案例</button>
                <button class="button" id="copyTopicPrompt">复制新窗口提示词</button>
              </div>
            </div>
            <div id="metricGrid" class="metric-grid"></div>
          </section>

          <section class="panel stage-panel">
            <div class="section-head">
              <div>
                <div class="section-kicker">Pipeline</div>
                <h2>内容推进阶段</h2>
              </div>
              <span class="counter-pill">${STAGE_NAMES.length} stages</span>
            </div>
            <div id="stageTrack" class="stage-track"></div>
          </section>

          <div class="main-grid">
            <section class="panel">
              <div class="section-head">
                <div>
                  <div class="section-kicker">Angles</div>
                  <h2>主文案与切口</h2>
                </div>
              </div>
              <div id="angleGrid" class="angle-grid"></div>
              <div class="summary-card">
                <div class="section-kicker">Summary</div>
                <pre id="topicSummary"></pre>
              </div>
            </section>

            <section class="panel">
              <div class="section-head">
                <div>
                  <div class="section-kicker">Assets</div>
                  <h2>来源资产</h2>
                </div>
              </div>
              <div id="assetGrid" class="asset-grid"></div>
            </section>
          </div>

          <div class="main-grid">
            <section class="panel">
              <div class="section-head">
                <div>
                  <div class="section-kicker">Tasks</div>
                  <h2>飞书任务与回执</h2>
                </div>
              </div>
              <div class="task-columns">
                <div>
                  <div class="subhead">内容任务</div>
                  <div id="taskGrid" class="stack-grid"></div>
                </div>
                <div>
                  <div class="subhead">发布回执</div>
                  <div id="receiptGrid" class="stack-grid"></div>
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="section-head">
                <div>
                  <div class="section-kicker">Command Dock</div>
                  <h2>操作与部署命令</h2>
                </div>
                <span class="counter-pill" id="pairingText"></span>
              </div>
              <div class="command-form">
                <label><span>AI 母题</span><input id="aiTopic" /></label>
                <label><span>品牌案例</span><input id="brandTopic" /></label>
                <label><span>周标识</span><input id="weekId" /></label>
                <label><span>主号短视频</span><input id="dateMain" type="date" /></label>
                <label><span>主号长文</span><input id="dateArticle" type="date" /></label>
                <label><span>品牌号图文</span><input id="dateBrandPost" type="date" /></label>
              </div>
              <div class="tab-row">
                <button class="tab-chip active" data-command-tab="week">周计划</button>
                <button class="tab-chip" data-command-tab="ops">运维</button>
                <button class="tab-chip" data-command-tab="deploy">部署</button>
                <button class="tab-chip" data-command-tab="prompt">提示词</button>
              </div>
              <pre id="commandOutput" class="command-output"></pre>
              <div class="button-row">
                <button class="button primary" id="copyCommand">复制当前面板</button>
                <button class="button" id="resetSchedule">恢复默认日期</button>
              </div>
            </section>
          </div>
        </main>

        <aside class="rightbar">
          <section class="panel side-panel">
            <div class="section-head tight">
              <div>
                <div class="section-kicker">Sync</div>
                <h3>飞书主库状态</h3>
              </div>
              <span class="counter-pill" id="syncStatus">-</span>
            </div>
            <div class="info-list">
              <div><span>Base</span><strong id="syncBase">-</strong></div>
              <div><span>Token</span><strong id="syncToken">-</strong></div>
              <div><span>Mirror</span><strong id="syncMirror">-</strong></div>
            </div>
            <a id="syncLink" class="inline-link" target="_blank" rel="noreferrer">打开飞书主库</a>
          </section>

          <section class="panel side-panel">
            <div class="section-head tight">
              <div>
                <div class="section-kicker">High Perf</div>
                <h3>高表现候选</h3>
              </div>
            </div>
            <div id="highPerfList" class="stack-grid"></div>
          </section>

          <section class="panel side-panel">
            <div class="section-head tight">
              <div>
                <div class="section-kicker">Activity</div>
                <h3>当前选题动态</h3>
              </div>
            </div>
            <div id="feedList" class="stack-grid"></div>
          </section>

          <section class="panel side-panel">
            <div class="section-head tight">
              <div>
                <div class="section-kicker">Weekly Review</div>
                <h3 id="reviewWeek">当前周</h3>
              </div>
            </div>
            <div class="review-block">
              <strong>复盘结论</strong>
              <p id="reviewSummary"></p>
            </div>
            <div class="review-block">
              <strong>下周动作</strong>
              <p id="reviewNext"></p>
            </div>
          </section>
        </aside>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `;
}

function bindSearch() {
  const inputs = [document.getElementById("sidebarSearch"), document.getElementById("globalSearch")];
  inputs.forEach((input) => {
    input.addEventListener("input", (event) => {
      state.query = event.target.value;
      inputs.forEach((node) => {
        if (node !== event.target) node.value = state.query;
      });
      renderAll();
    });
  });
}

function bindLineFilters() {
  document.querySelectorAll("[data-line-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.lineFilter = button.dataset.lineFilter || "all";
      document.querySelectorAll("[data-line-filter]").forEach((node) => {
        node.classList.toggle("active", node.dataset.lineFilter === state.lineFilter);
      });
      renderAll();
    });
  });
}

function bindTopicList() {
  document.getElementById("topicList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic-id]");
    if (!button) return;
    state.selectedId = button.dataset.topicId || state.selectedId;
    renderAll();
  });
}

function bindCommands() {
  ["aiTopic", "brandTopic", "weekId", "dateMain", "dateArticle", "dateBrandPost"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", renderCommandDock);
    input.addEventListener("change", renderCommandDock);
  });

  document.querySelectorAll("[data-command-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.commandTab = button.dataset.commandTab || "week";
      renderCommandDock();
    });
  });

  document.getElementById("setAiTopic").addEventListener("click", () => {
    document.getElementById("aiTopic").value = currentTopic().id;
    state.commandTab = "week";
    renderCommandDock();
    showToast(`已把 ${currentTopic().id} 设为 AI 母题`);
  });

  document.getElementById("setBrandTopic").addEventListener("click", () => {
    document.getElementById("brandTopic").value = currentTopic().id;
    state.commandTab = "week";
    renderCommandDock();
    showToast(`已把 ${currentTopic().id} 设为品牌案例`);
  });
}

function bindCopyActions() {
  document.getElementById("copyStartup").addEventListener("click", async () => {
    try {
      await copyText("ip sync status\nip sync pull\nip dashboard");
      showToast("已复制启动命令");
    } catch {
      showToast("复制失败");
    }
  });

  document.getElementById("copyCommand").addEventListener("click", async () => {
    try {
      await copyText(document.getElementById("commandOutput").textContent.trim());
      showToast("已复制当前面板");
    } catch {
      showToast("复制失败");
    }
  });

  document.getElementById("copyTopicPrompt").addEventListener("click", async () => {
    try {
      await copyText(buildPrompt());
      showToast("已复制新窗口提示词");
    } catch {
      showToast("复制失败");
    }
  });

  document.getElementById("resetSchedule").addEventListener("click", () => {
    const base = defaultSchedule();
    document.getElementById("aiTopic").value = base.aiTopic;
    document.getElementById("brandTopic").value = base.brandTopic;
    document.getElementById("weekId").value = base.weekId;
    document.getElementById("dateMain").value = base.dateMain;
    document.getElementById("dateArticle").value = base.dateArticle;
    document.getElementById("dateBrandPost").value = base.dateBrandPost;
    renderCommandDock();
    showToast("已恢复默认日期");
  });
}

function boot() {
  document.getElementById("app").innerHTML = buildShell();

  const stored = loadStoredState();
  document.getElementById("aiTopic").value = stored.aiTopic;
  document.getElementById("brandTopic").value = stored.brandTopic;
  document.getElementById("weekId").value = stored.weekId;
  document.getElementById("dateMain").value = stored.dateMain;
  document.getElementById("dateArticle").value = stored.dateArticle;
  document.getElementById("dateBrandPost").value = stored.dateBrandPost;
  document.getElementById("globalSearch").value = state.query;
  document.getElementById("sidebarSearch").value = state.query;

  bindSearch();
  bindLineFilters();
  bindTopicList();
  bindCommands();
  bindCopyActions();
  renderAll();
}

boot();
