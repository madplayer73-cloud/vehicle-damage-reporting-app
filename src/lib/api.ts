import type { Report } from "./types";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function listReports(): Promise<Report[]> {
  const response = await fetch("/api/reports");
  return parseResponse<Report[]>(response);
}

export async function getReport(reportId: string): Promise<Report> {
  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`);
  return parseResponse<Report>(response);
}

export async function createReport(formData: FormData): Promise<Report> {
  const response = await fetch("/api/reports", {
    method: "POST",
    body: formData,
  });
  return parseResponse<Report>(response);
}

export async function sendReport(reportId: string): Promise<Report> {
  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/send`, {
    method: "POST",
  });
  return parseResponse<Report>(response);
}
