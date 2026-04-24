export function createMirrorManifest(input = {}) {
  return {
    appToken: input.appToken || input.app_token || "",
    baseName: input.baseName || input.base_name || "IP内容中台",
    mirroredAt: input.mirroredAt || input.mirrored_at || "",
    sourceDir: input.sourceDir || input.source_dir || "",
    tables: normalizeTables(input.tables || []),
  };
}

export function normalizeTables(tables = []) {
  return tables.map((table) => ({
    name: table.name || table.tableName || table.table_name || "",
    fileName: table.fileName || table.file_name || table.csv || "",
    rowCount: Number(table.rowCount ?? table.row_count ?? 0),
  }));
}

export function maskAppToken(token = "") {
  if (!token) return "";
  if (token.length <= 8) return token;
  return `${token.slice(0, 4)}***${token.slice(-4)}`;
}

export function publicManifest(input = {}) {
  const manifest = createMirrorManifest(input);
  return {
    baseName: manifest.baseName,
    mirroredAt: manifest.mirroredAt,
    sourceDir: manifest.sourceDir,
    appTokenMasked: maskAppToken(manifest.appToken),
    tables: manifest.tables,
  };
}
