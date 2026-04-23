export const DASHBOARD_VIEWS = [
  {
    id: "overview",
    label: "Overview",
    title: "总览",
    description: "数据来源、同步状态和本周复盘入口",
    targetId: "overviewSection",
  },
  {
    id: "topics",
    label: "Topics",
    title: "选题",
    description: "母题详情、推进阶段、文案切口",
    targetId: "topicSection",
  },
  {
    id: "tasks",
    label: "Tasks",
    title: "任务",
    description: "内容任务、负责人、排期与状态",
    targetId: "taskSection",
  },
  {
    id: "publish",
    label: "Publish",
    title: "发布",
    description: "发布回执、平台数据与补数动作",
    targetId: "publishSection",
  },
  {
    id: "review",
    label: "Review",
    title: "复盘",
    description: "周复盘结论和下周动作",
    targetId: "reviewSection",
  },
  {
    id: "assets",
    label: "Assets",
    title: "资产",
    description: "来源资产、复用方向和内容线索",
    targetId: "assetSection",
  },
];

export function buildViewNavigationHtml(views = DASHBOARD_VIEWS) {
  return `
    <section class="panel view-structure-panel" id="viewStructure">
      <div class="section-head">
        <div>
          <div class="section-kicker">Workspace Views</div>
          <h2>工作台视图</h2>
        </div>
        <span class="counter-pill">${views.length} views</span>
      </div>
      <div class="view-nav" id="viewNav">
        ${views
          .map(
            (view, index) => `
              <button class="view-card ${index === 0 ? "active" : ""}" data-view-target="${view.targetId}" data-view-id="${view.id}" type="button">
                <span>${view.label}</span>
                <strong>${view.title}</strong>
                <small>${view.description}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

export function resolveViewTargetId(viewId, views = DASHBOARD_VIEWS) {
  return views.find((view) => view.id === viewId)?.targetId || views[0]?.targetId || "overviewSection";
}

export function tagViewSections(doc = document) {
  const targets = [
    [".mode-banner", "overviewSection", "overview"],
    [".hero-panel", "topicSection", "topics"],
    ["#taskGrid", "taskSection", "tasks"],
    ["#receiptGrid", "publishSection", "publish"],
    ["#reviewWeek", "reviewSection", "review"],
    ["#assetGrid", "assetSection", "assets"],
  ];

  targets.forEach(([selector, targetId, viewId]) => {
    const node = doc.querySelector(selector);
    const section = selector.startsWith("#") ? node?.closest(".panel") : node;
    if (!section) return;
    section.id = section.id || targetId;
    section.dataset.viewSection = viewId;
  });
}

export function hydrateViewStructure(doc = document) {
  const main = doc.querySelector(".main");
  if (!main || doc.getElementById("viewStructure")) return;

  const wrapper = doc.createElement("div");
  wrapper.innerHTML = buildViewNavigationHtml();
  main.insertBefore(wrapper.firstElementChild, main.firstElementChild);
  tagViewSections(doc);
}

export function bindViewNavigation(doc = document) {
  const buttons = [...doc.querySelectorAll("[data-view-target]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((node) => node.classList.toggle("active", node === button));
      const target = doc.getElementById(button.dataset.viewTarget || "");
      target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  });
}
