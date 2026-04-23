import test from "node:test";
import assert from "node:assert/strict";

import { buildSourceRequirements, resolveBuildModeMeta } from "../src/dashboard-payload.js";

test("resolveBuildModeMeta returns fallback labels by default", () => {
  const meta = resolveBuildModeMeta();

  assert.equal(meta.buildMode, "generated_fallback");
  assert.equal(meta.isFallbackMode, true);
  assert.equal(meta.buildModeLabel, "Fallback Snapshot");
  assert.match(meta.buildModeDescription, /回退构建/);
});

test("resolveBuildModeMeta returns full-source labels when requested", () => {
  const meta = resolveBuildModeMeta("full_sources", "repo_workspace");

  assert.equal(meta.buildMode, "full_sources");
  assert.equal(meta.isFallbackMode, false);
  assert.equal(meta.buildModeLabel, "Full Source");
  assert.match(meta.buildModeDescription, /完整源数据/);
});

test("buildSourceRequirements exposes both full and fallback inputs", () => {
  const requirements = buildSourceRequirements();

  assert.ok(requirements.fullSource.some((item) => item.includes("种子资产卡-20条.md")));
  assert.ok(requirements.fallback.some((item) => item.includes("dashboard-data.json")));
});
