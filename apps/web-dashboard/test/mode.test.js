import test from "node:test";
import assert from "node:assert/strict";

import { resolveBuildMode, resolveSync } from "../src/lib/mode.js";

test("resolveBuildMode returns fallback defaults", () => {
  const meta = resolveBuildMode({});
  assert.equal(meta.buildMode, "generated_fallback");
  assert.equal(meta.isFallbackMode, true);
  assert.equal(meta.label, "Fallback Snapshot");
});

test("resolveSync returns status labels", () => {
  const offline = resolveSync({ status: "offline", url: "" });
  const online = resolveSync({ status: "online", url: "https://example.com" });

  assert.equal(offline.isOnline, false);
  assert.equal(offline.statusLabel, "离线");
  assert.equal(online.isOnline, true);
  assert.equal(online.statusLabel, "在线");
});
