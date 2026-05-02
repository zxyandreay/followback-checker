export type CsvRow = {
  username: string;
  category: string;
};

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildCsvContent(rows: CsvRow[]): string {
  const header = "username,category";
  const lines = rows.map(
    (r) => `${escapeCsvCell(r.username)},${escapeCsvCell(r.category)}`,
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, rows: CsvRow[]): void {
  const content = buildCsvContent(rows);
  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
