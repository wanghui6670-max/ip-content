export function parseCsv(text = "") {
  const rows = [];
  let current = "";
  let row = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => String(cell).trim() !== ""));
}

export function csvToObjects(text = "") {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const headers = rows[0].map((header) => String(header || "").trim());
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });
}

export function csvHeaders(text = "") {
  const rows = parseCsv(text);
  return rows[0]?.map((header) => String(header || "").trim()) || [];
}

export function validateRequiredHeaders(headers = [], required = []) {
  const headerSet = new Set(headers);
  const missing = required.filter((header) => !headerSet.has(header));
  return {
    ok: missing.length === 0,
    missing,
  };
}

export function validateCsvText(text = "", requiredHeaders = []) {
  return validateRequiredHeaders(csvHeaders(text), requiredHeaders);
}
