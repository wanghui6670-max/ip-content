import { escapeHtml, statusClass, taskStatusType } from "./format.js";

export function normalizeTask(row = {}, topic = {}) {
  return {
    title: row["内容标题"] || topic.title || "未命名任务",
    status: row["当前状态"] || "待处理",
    platform: row["目标平台"] || "未指定平台",
    owner: row["负责人"] || "待分配",
    plannedAt: row["计划发布时间"] || "待排期",
  };
}

export function normalizeReceipt(row = {}) {
  return {
    title: row["内容标题"] || "未命名内容",
    platform: row["平台"] || "未指定平台",
    result: row["结论"] || "待结论",
    data24h: row["24h数据"] || "待回填",
    data72h: row["72h数据"] || "待回填",
    data7d: row["7d数据"] || "待回填",
  };
}

export function collectExecutionItems(topic = {}) {
  return {
    tasks: (topic.tasks || []).map((row) => normalizeTask(row, topic)),
    receipts: (topic.receipts || []).map(normalizeReceipt),
  };
}

export function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function buildExecutionFilters(topic = {}) {
  const { tasks, receipts } = collectExecutionItems(topic);
  return {
    statuses: uniqueValues(tasks.map((task) => task.status)),
    platforms: uniqueValues([
      ...tasks.map((task) => task.platform),
      ...receipts.map((receipt) => receipt.platform),
    ]),
  };
}

export function normalizeExecutionState(state = {}) {
  return {
    taskStatusFilter: state.taskStatusFilter || "all",
    taskPlatformFilter: state.taskPlatformFilter || "all",
  };
}

export function filterTasks(tasks = [], state = {}) {
  const filters = normalizeExecutionState(state);
  return tasks.filter((task) => {
    const statusOk = filters.taskStatusFilter === "all" || task.status === filters.taskStatusFilter;
    const platformOk = filters.taskPlatformFilter === "all" || task.platform === filters.taskPlatformFilter;
    return statusOk && platformOk;
  });
}

export function filterReceipts(receipts = [], state = {}) {
  const filters = normalizeExecutionState(state);
  return receipts.filter((receipt) => {
    return filters.taskPlatformFilter === "all" || receipt.platform === filters.taskPlatformFilter;
  });
}

function buildFilterButton({ kind, value, label, active }) {
  return `
    <button class="execution-filter-chip ${active ? "active" : ""}" data-execution-filter="${kind}" data-execution-value="${escapeHtml(value)}" type="button">
      ${escapeHtml(label)}
    </button>
  `;
}

export function buildExecutionFilterBar(topic = {}, state = {}) {
  const filters = buildExecutionFilters(topic);
  const executionState = normalizeExecutionState(state);

  const statusButtons = [
    buildFilterButton({ kind: "status", value: "all", label: "全部状态", active: executionState.taskStatusFilter === "all" }),
    ...filters.statuses.map((status) =>
      buildFilterButton({ kind: "status", value: status, label: status, active: executionState.taskStatusFilter === status }),
    ),
  ].join("");

  const platformButtons = [
    buildFilterButton({ kind: "platform", value: "all", label: "全部平台", active: executionState.taskPlatformFilter === "all" }),
    ...filters.platforms.map((platform) =>
      buildFilterButton({ kind: "platform", value: platform, label: platform, active: executionState.taskPlatformFilter === platform }),
    ),
  ].join("");

  return `
    <div class="execution-filter-bar" id="executionFilterBar">
      <div>
        <span>任务状态</span>
        <div class="execution-filter-row">${statusButtons}</div>
      </div>
      <div>
        <span>平台</span>
        <div class="execution-filter-row">${platformButtons}</div>
      </div>
    </div>
  `;
}

export function buildExecutionSummary(topic = {}, state = {}) {
  const { tasks, receipts } = collectExecutionItems(topic);
  const filteredTasks = filterTasks(tasks, state);
  const filteredReceipts = filterReceipts(receipts, state);
  return {
    taskCount: filteredTasks.length,
    receiptCount: filteredReceipts.length,
    totalTaskCount: tasks.length,
    totalReceiptCount: receipts.length,
  };
}

export function buildExecutionTasks(topic = {}, state = {}) {
  const { tasks } = collectExecutionItems(topic);
  const filteredTasks = filterTasks(tasks, state);

  if (!filteredTasks.length) {
    return `<div class="empty-card">当前过滤条件下没有匹配的内容任务。</div>`;
  }

  return filteredTasks
    .map(
      (task) => `
        <article class="task-card execution-card">
          <div class="task-card__top">
            <strong>${escapeHtml(task.title)}</strong>
            <span class="status-chip ${statusClass(taskStatusType(task.status))}">${escapeHtml(task.status)}</span>
          </div>
          <p>${escapeHtml(task.platform)}</p>
          <div class="task-card__meta">
            <span>负责人：${escapeHtml(task.owner)}</span>
            <span>计划：${escapeHtml(task.plannedAt)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

export function buildExecutionReceipts(topic = {}, state = {}) {
  const { receipts } = collectExecutionItems(topic);
  const filteredReceipts = filterReceipts(receipts, state);

  if (!filteredReceipts.length) {
    return `<div class="empty-card">当前过滤条件下没有匹配的发布回执。</div>`;
  }

  return filteredReceipts
    .map(
      (receipt) => `
        <article class="receipt-card execution-card">
          <div class="task-card__top">
            <strong>${escapeHtml(receipt.platform)}</strong>
            <span class="counter-pill">${escapeHtml(receipt.result)}</span>
          </div>
          <p>${escapeHtml(receipt.title)}</p>
          <div class="task-card__meta">
            <span>24h：${escapeHtml(receipt.data24h)}</span>
            <span>72h：${escapeHtml(receipt.data72h)}</span>
            <span>7d：${escapeHtml(receipt.data7d)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

export function ensureExecutionFilterBar() {
  if (document.getElementById("executionFilterBar")) return;
  const taskGrid = document.getElementById("taskGrid");
  const panel = taskGrid?.closest(".panel");
  const columns = panel?.querySelector(".task-columns");
  if (!panel || !columns) return;

  const wrapper = document.createElement("div");
  wrapper.id = "executionFilterHost";
  panel.insertBefore(wrapper, columns);
}

export function renderExecutionPanel(topic = {}, state = {}) {
  ensureExecutionFilterBar();
  const host = document.getElementById("executionFilterHost");
  if (host) host.innerHTML = buildExecutionFilterBar(topic, state);

  const summary = buildExecutionSummary(topic, state);
  const taskGrid = document.getElementById("taskGrid");
  const receiptGrid = document.getElementById("receiptGrid");

  if (taskGrid) taskGrid.innerHTML = buildExecutionTasks(topic, state);
  if (receiptGrid) receiptGrid.innerHTML = buildExecutionReceipts(topic, state);

  return summary;
}
