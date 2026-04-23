import test from "node:test";
import assert from "node:assert/strict";

import {
  DASHBOARD_VIEWS,
  bindViewNavigation,
  buildViewNavigationHtml,
  hydrateViewStructure,
  resolveViewTargetId,
  tagViewSections,
} from "../src/lib/views.js";

test("DASHBOARD_VIEWS defines the six primary workspace views", () => {
  assert.deepEqual(
    DASHBOARD_VIEWS.map((view) => view.id),
    ["overview", "topics", "tasks", "publish", "review", "assets"],
  );
});

test("buildViewNavigationHtml renders view cards", () => {
  const html = buildViewNavigationHtml();

  assert.match(html, /Workspace Views/);
  assert.match(html, /Overview/);
  assert.match(html, /data-view-target="overviewSection"/);
  assert.match(html, /Assets/);
});

test("resolveViewTargetId returns known target or fallback", () => {
  assert.equal(resolveViewTargetId("tasks"), "taskSection");
  assert.equal(resolveViewTargetId("missing"), "overviewSection");
});

function makeElement(id = "") {
  return {
    id,
    dataset: {},
    listeners: {},
    children: [],
    firstElementChild: null,
    classList: {
      active: false,
      toggle(name, enabled) {
        if (name === "active") this.active = enabled;
      },
    },
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    closest() {
      return this.closestNode || this;
    },
    scrollIntoView(options) {
      this.scrolledWith = options;
    },
  };
}

test("tagViewSections assigns ids and viewSection metadata", () => {
  const overview = makeElement();
  const topic = makeElement();
  const taskGrid = makeElement();
  const taskPanel = makeElement();
  taskGrid.closestNode = taskPanel;

  const doc = {
    querySelector(selector) {
      return {
        ".mode-banner": overview,
        ".hero-panel": topic,
        "#taskGrid": taskGrid,
      }[selector] || null;
    },
  };

  tagViewSections(doc);

  assert.equal(overview.id, "overviewSection");
  assert.equal(overview.dataset.viewSection, "overview");
  assert.equal(topic.id, "topicSection");
  assert.equal(taskPanel.id, "taskSection");
  assert.equal(taskPanel.dataset.viewSection, "tasks");
});

test("bindViewNavigation toggles active state and scrolls target", () => {
  const buttonA = makeElement();
  const buttonB = makeElement();
  const target = makeElement("taskSection");
  buttonA.dataset.viewTarget = "overviewSection";
  buttonB.dataset.viewTarget = "taskSection";

  const doc = {
    querySelectorAll(selector) {
      if (selector === "[data-view-target]") return [buttonA, buttonB];
      return [];
    },
    getElementById(id) {
      if (id === "taskSection") return target;
      return makeElement(id);
    },
  };

  bindViewNavigation(doc);
  buttonB.listeners.click();

  assert.equal(buttonA.classList.active, false);
  assert.equal(buttonB.classList.active, true);
  assert.deepEqual(target.scrolledWith, { behavior: "smooth", block: "start" });
});

test("hydrateViewStructure injects view panel once", () => {
  const inserted = [];
  const main = {
    firstElementChild: makeElement("first"),
    insertBefore(node) {
      inserted.push(node);
    },
  };
  const wrapperChild = makeElement("viewStructure");
  const doc = {
    getElementById() {
      return null;
    },
    querySelector(selector) {
      if (selector === ".main") return main;
      return null;
    },
    createElement() {
      return {
        set innerHTML(value) {
          this.html = value;
          this.firstElementChild = wrapperChild;
        },
        get innerHTML() {
          return this.html;
        },
        firstElementChild: wrapperChild,
      };
    },
  };

  hydrateViewStructure(doc);

  assert.equal(inserted.length, 1);
  assert.equal(inserted[0], wrapperChild);
});
