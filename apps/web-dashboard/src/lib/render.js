import { escapeHtml, stageClass, statusClass, taskStatusType } from "./format.js";

export function buildShell({ stageCount = 7 } = {}) {
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">IP</div>
          <div>
            <div class="brand-name" id="brandName">IP Factory</div>
            <div class="brand-sub" id="brandSubtitle">双线 IP 内容中台网页端</div>
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
          <section class="panel mode-banner">
            <div class="section-head tight">
              <div>
                <div class="section-kicker">Build Mode</div>
                <h3>数据来源模式</h3>
              </div>
              <span class="counter-pill mode-badge" id="buildModeBadge">-</span>
            </div>
            <p class="mode-description" id="buildModeDescription"></p>
            <div class="info-list compact">
              <div><span>Mode</span><strong id="buildModeValue">-</strong></div>
              <div><span>Source</span><strong id="sourceContext">-</strong></div>
              <div><span>Generated</span><strong id="generatedAt">-</strong></div>
            </div>
          </section>

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
              <span class="counter-pill">${stageCount} stages</span>
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
            <div class="info-list compact">
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

export function buildTopicList(topics, selectedId) {
  return topics
    .map(
      (topic) => `
        <button class="topic-card ${topic.id === selectedId ? "active" : ""}" data-topic-id="${escapeHtml(topic.id)}" type="button">
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

export function buildMetrics(topic) {
  return (topic.metrics || [])
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

export function buildSteps(topic) {
  return (topic.steps || [])
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

export function buildAngles(topic) {
  return (topic.angles || [])
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

export function buildAssets(topic) {
  if (!(topic.sourceAssets || []).length) {
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

export function buildTasks(topic) {
  if (!(topic.tasks || []).length) {
    return `<div class="empty-card">飞书内容任务里还没有这个选题的任务行。</div>`;
  }

  return topic.tasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="task-card__top">
            <strong>${escapeHtml(task["内容标题"] || topic.title)}</strong>
            <span class="status-chip ${statusClass(taskStatusType(task["当前状态"] || ""))}">${escapeHtml(task["当前状态"] || "待处理")}</span>
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

export function buildReceipts(topic) {
  if (!(topic.receipts || []).length) {
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

export function buildActivity(topic) {
  return (topic.activity || [])
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

export function buildHighPerfList(items = []) {
  return items
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
