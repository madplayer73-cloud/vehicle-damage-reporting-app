import type { Report } from "./types";

const accessCodeKey = "vehicle-damage-access-code";
const userNameKey = "vehicle-damage-user-name";

type AuthResponse = {
  ok: boolean;
  accessRequired: boolean;
  user: {
    name: string;
  };
};

export function getAccessCode(): string {
  return window.sessionStorage.getItem(accessCodeKey) || "";
}

export function saveAccessCode(accessCode: string): void {
  window.sessionStorage.setItem(accessCodeKey, accessCode);
}

export function getUserName(): string {
  return window.sessionStorage.getItem(userNameKey) || "";
}

export function saveUserName(userName: string): void {
  window.sessionStorage.setItem(userNameKey, userName);
}

export function clearAccessCode(): void {
  window.sessionStorage.removeItem(accessCodeKey);
  window.sessionStorage.removeItem(userNameKey);
}

export async function verifyAccessCode(accessCode: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: accessHeaders(accessCode),
  });
  return parseResponse<AuthResponse>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function accessHeaders(accessCode = getAccessCode()): HeadersInit {
  return accessCode ? { "x-access-code": accessCode } : {};
}

export async function listReports(): Promise<Report[]> {
  const response = await fetch("/api/reports", {
    headers: accessHeaders(),
  });
  return parseResponse<Report[]>(response);
}

export async function getReport(reportId: string): Promise<Report> {
  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    headers: accessHeaders(),
  });
  return parseResponse<Report>(response);
}

export async function createReport(formData: FormData): Promise<Report> {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: accessHeaders(),
    body: formData,
  });
  return parseResponse<Report>(response);
}

export async function sendReport(reportId: string): Promise<Report> {
  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/send`, {
    method: "POST",
    headers: accessHeaders(),
  });
  return parseResponse<Report>(response);
}
