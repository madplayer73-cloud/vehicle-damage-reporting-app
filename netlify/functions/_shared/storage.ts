import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { getStore } from "@netlify/blobs";
import type { Report, ReportInput, ReportPhoto } from "./types";

declare const Netlify: {
  env: {
    get(key: string): string | undefined;
  };
};

type StoreData = {
  reports: Report[];
};

const reportsKey = "reports.json";

function storageRoot(): string {
  const configured = Netlify.env.get("REPORT_STORAGE_DIR");
  return resolve(configured || "./local-data");
}

function reportsFile(): string {
  return join(storageRoot(), "reports.json");
}

function storageDriver(): "local" | "blobs" {
  const configured = Netlify.env.get("REPORT_STORAGE_DRIVER");
  if (configured === "local" || configured === "blobs") {
    return configured;
  }

  return Netlify.env.get("NETLIFY") ? "blobs" : "local";
}

function reportStore() {
  return getStore({ name: "vehicle-damage-reports", consistency: "strong" });
}

async function ensureStorage(): Promise<void> {
  await mkdir(storageRoot(), { recursive: true });
  if (!existsSync(reportsFile())) {
    await writeFile(reportsFile(), JSON.stringify({ reports: [] }, null, 2), "utf8");
  }
}

export async function readStore(): Promise<StoreData> {
  if (storageDriver() === "blobs") {
    const stored = await reportStore().get(reportsKey, { type: "json" });
    return (stored as StoreData | null) || { reports: [] };
  }

  await ensureStorage();
  const raw = await readFile(reportsFile(), "utf8");
  return JSON.parse(raw) as StoreData;
}

export async function writeStore(data: StoreData): Promise<void> {
  if (storageDriver() === "blobs") {
    await reportStore().setJSON(reportsKey, data);
    return;
  }

  await ensureStorage();
  await writeFile(reportsFile(), JSON.stringify(data, null, 2), "utf8");
}

export async function listReports(): Promise<Report[]> {
  const store = await readStore();
  return store.reports.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function getReport(reportId: string): Promise<Report | undefined> {
  const store = await readStore();
  return store.reports.find((report) => report.reportId === reportId);
}

export async function updateReport(updatedReport: Report): Promise<Report> {
  const store = await readStore();
  store.reports = store.reports.map((report) =>
    report.reportId === updatedReport.reportId ? updatedReport : report,
  );
  await writeStore(store);
  return updatedReport;
}

export async function createReport(
  input: ReportInput,
  photos: ReportPhoto[],
  telegramStatus: Report["telegramStatus"],
  telegramError?: string,
): Promise<Report> {
  const store = await readStore();
  const timestamp = new Date().toISOString();
  const reportId = nextReportId(store.reports, timestamp);

  const report: Report = {
    reportId,
    vin: input.vin.toUpperCase(),
    vinLast8: vinLast8For(input),
    vinLast8Input: input.vinLast8Input.toUpperCase(),
    brand: input.brand,
    model: input.model,
    location: input.location,
    reportedBy: input.reportedBy,
    damageArea: input.damageArea,
    damageDescription: input.damageDescription,
    timestamp,
    photos,
    telegramStatus,
    telegramError,
  };

  store.reports.push(report);
  await writeStore(store);
  return report;
}

function vinLast8For(input: ReportInput): string {
  if (input.vin.length === 17) {
    return input.vin.slice(-8).toUpperCase();
  }

  return input.vinLast8Input.toUpperCase();
}

function nextReportId(reports: Report[], timestamp: string): string {
  const datePart = timestamp.slice(0, 10).replaceAll("-", "");
  const todaysReports = reports.filter((report) => report.reportId.startsWith(`DR-${datePart}-`));
  const nextNumber = todaysReports.length + 1;
  return `DR-${datePart}-${String(nextNumber).padStart(4, "0")}`;
}
