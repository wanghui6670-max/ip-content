import test from "node:test";
import assert from "node:assert/strict";

import { createMirrorManifest, maskAppToken, publicManifest } from "../src/manifest.js";

test("createMirrorManifest normalizes snake_case fields", () => {
  const manifest = createMirrorManifest({
    app_token: "app_1234567890",
    base_name: "IP内容中台",
    mirrored_at: "2026-04-24T10:00:00",
    source_dir: "cache/latest",
    tables: [{ table_name: "内容任务", file_name: "内容任务.csv", row_count: 12 }],
  });

  assert.equal(manifest.appToken, "app_1234567890");
  assert.equal(manifest.baseName, "IP内容中台");
  assert.equal(manifest.tables[0].fileName, "内容任务.csv");
  assert.equal(manifest.tables[0].rowCount, 12);
});

test("maskAppToken masks long tokens", () => {
  assert.equal(maskAppToken("app_1234567890"), "app_***7890");
  assert.equal(maskAppToken("short"), "short");
});

test("publicManifest removes raw app token", () => {
  const manifest = publicManifest({ appToken: "app_1234567890" });

  assert.equal(manifest.appToken, undefined);
  assert.equal(manifest.appTokenMasked, "app_***7890");
});
