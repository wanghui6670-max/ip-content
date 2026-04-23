import test from "node:test";
import assert from "node:assert/strict";

import { bindLineFilters, bindSearch, bindTopicList } from "../src/lib/interactions.js";

function makeNode({ dataset = {}, value = "" } = {}) {
  return {
    dataset,
    value,
    listeners: {},
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
      return null;
    },
  };
}

test("bindSearch mirrors query across inputs and rerenders", () => {
  const sidebarSearch = makeNode();
  const globalSearch = makeNode();
  let renderCount = 0;
  const state = { query: "" };

  global.document = {
    getElementById(id) {
      return { sidebarSearch, globalSearch }[id];
    },
  };

  bindSearch({ state, renderAll: () => { renderCount += 1; } });
  sidebarSearch.listeners.input({ target: { value: "AI" } });

  assert.equal(state.query, "AI");
  assert.equal(globalSearch.value, "AI");
  assert.equal(renderCount, 1);
});

test("bindLineFilters updates selected line filter", () => {
  const all = makeNode({ dataset: { lineFilter: "all" } });
  const ai = makeNode({ dataset: { lineFilter: "ai" } });
  let renderCount = 0;
  const state = { lineFilter: "all" };

  global.document = {
    querySelectorAll(selector) {
      if (selector === "[data-line-filter]") return [all, ai];
      return [];
    },
  };

  bindLineFilters({ state, renderAll: () => { renderCount += 1; } });
  ai.listeners.click();

  assert.equal(state.lineFilter, "ai");
  assert.equal(ai.classList.active, true);
  assert.equal(all.classList.active, false);
  assert.equal(renderCount, 1);
});

test("bindTopicList updates selected topic id", () => {
  const topicList = makeNode();
  const state = { selectedId: "T01" };
  let renderCount = 0;

  global.document = {
    getElementById(id) {
      if (id === "topicList") return topicList;
      return null;
    },
  };

  bindTopicList({ state, renderAll: () => { renderCount += 1; } });
  topicList.listeners.click({
    target: {
      closest() {
        return { dataset: { topicId: "T07" } };
      },
    },
  });

  assert.equal(state.selectedId, "T07");
  assert.equal(renderCount, 1);
});
