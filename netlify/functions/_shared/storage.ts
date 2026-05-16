import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
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
const photoPrefix = "photos/";

function storageRoot(): string {
  const configured = Netlify.env.get("REPORT_STORAGE_DIR");
  return resolve(configured || "./local-data");
}

function reportsFile(): string {
  return join(storageRoot(), "reports.json");
}

function photosDir(): string {
  return join(storageRoot(), "photos");
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

function photoStore() {
  return getStore({ name: "vehicle-damage-photos", consistency: "strong" });
}

async function ensureStorage(): Promise<void> {
  await mkdir(photosDir(), { recursive: true });
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

export async function createReport(input: ReportInput, photos: File[]): Promise<Report> {
  const store = await readStore();
  const timestamp = new Date().toISOString();
  const reportId = nextReportId(store.reports, timestamp);
  const savedPhotos = await savePhotos(reportId, photos);

  const report: Report = {
    reportId,
    vin: input.vin.toUpperCase(),
    vinLast8: input.vin.slice(-8).toUpperCase(),
    brand: input.brand,
    model: input.model,
    location: input.location,
    reportedBy: input.reportedBy,
    damageArea: input.damageArea,
    damageDescription: input.damageDescription,
    timestamp,
    photos: savedPhotos,
    telegramStatus: "pending",
  };

  store.reports.push(report);
  await writeStore(store);
  return report;
}

export async function readPhoto(filename: string): Promise<{ body: Buffer; mimeType: string } | undefined> {
  const safeName = basename(filename);

  if (storageDriver() === "blobs") {
    const key = `${photoPrefix}${safeName}`;
    const stored = await photoStore().getWithMetadata(key, { type: "arrayBuffer" });

    if (!stored) {
      return undefined;
    }

    const metadata = stored.metadata as { contentType?: string } | null;
    return {
      body: Buffer.from(stored.data),
      mimeType: metadata?.contentType || contentTypeFromName(safeName),
    };
  }

  const filePath = join(photosDir(), safeName);

  if (!existsSync(filePath)) {
    return undefined;
  }

  return {
    body: await readFile(filePath),
    mimeType: contentTypeFromName(safeName),
  };
}

async function savePhotos(reportId: string, photos: File[]): Promise<ReportPhoto[]> {
  const saved: ReportPhoto[] = [];

  for (const photo of photos) {
    const extension = extensionFor(photo);
    const filename = `${reportId}-${randomUUID()}${extension}`;
    const bytes = Buffer.from(await photo.arrayBuffer());

    if (storageDriver() === "blobs") {
      await photoStore().set(`${photoPrefix}${filename}`, bytes, {
        metadata: { contentType: photo.type, originalName: photo.name },
      });
    } else {
      await writeFile(join(photosDir(), filename), bytes);
    }

    saved.push({
      filename,
      originalName: photo.name,
      mimeType: photo.type,
      size: photo.size,
      url: `/api/photos/${encodeURIComponent(filename)}`,
    });
  }

  return saved;
}

function contentTypeFromName(filename: string): string {
  const ext = extname(filename).toLowerCase();
  return ext === ".png" ? "image/png" : "image/jpeg";
}

function extensionFor(file: File): string {
  if (file.type === "image/png") {
    return ".png";
  }

  return ".jpg";
}

function nextReportId(reports: Report[], timestamp: string): string {
  const datePart = timestamp.slice(0, 10).replaceAll("-", "");
  const todaysReports = reports.filter((report) => report.reportId.startsWith(`DR-${datePart}-`));
  const nextNumber = todaysReports.length + 1;
  return `DR-${datePart}-${String(nextNumber).padStart(4, "0")}`;
}
