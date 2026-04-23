export function pad(value) {
  return String(value).padStart(2, "0");
}

export function isoWeek(date) {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${pad(weekNo)}`;
}

export function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function statusClass(statusType) {
  const map = {
    active: "is-active",
    review: "is-review",
    done: "is-done",
    queued: "is-queued",
  };
  return map[statusType] || "is-queued";
}

export function stageClass(stateValue) {
  return {
    done: "done",
    active: "active",
    pending: "pending",
  }[stateValue] || "pending";
}

export function taskStatusType(taskStatus = "") {
  if (["已发布", "已复盘"].includes(taskStatus)) return "done";
  if (["待审核", "待修改"].includes(taskStatus)) return "review";
  return "active";
}
