import { readPhoto } from "./storage";
import type { Report } from "./types";

declare const Netlify: {
  env: {
    get(key: string): string | undefined;
  };
};

export async function sendReportToTelegram(report: Report): Promise<void> {
  const token = Netlify.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Netlify.env.get("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.");
  }

  await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    text: formatReport(report),
  });

  for (const photo of report.photos) {
    const storedPhoto = await readPhoto(photo.filename);

    if (!storedPhoto) {
      throw new Error(`Photo ${photo.filename} was not found.`);
    }

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("caption", `${report.reportId} - ${photo.originalName}`);
    form.append("photo", new Blob([storedPhoto.body], { type: storedPhoto.mimeType }), photo.originalName);

    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: form,
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(await response.text());
      }
    });
  }
}

function formatReport(report: Report): string {
  const dateTime = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(report.timestamp));

  return [
    "Vehicle Damage Report",
    "",
    `Report ID: ${report.reportId}`,
    `VIN: ${report.vin}`,
    `VIN last 8: ${report.vinLast8}`,
    `Brand: ${report.brand || "-"}`,
    `Model: ${report.model || "-"}`,
    `Location: ${report.location || "-"}`,
    `Reported by: ${report.reportedBy || "-"}`,
    `Damage area: ${report.damageArea}`,
    `Description: ${report.damageDescription}`,
    `Date/time: ${dateTime}`,
    "",
    "Photos attached below.",
  ].join("\n");
}

async function callTelegram(token: string, method: string, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}
