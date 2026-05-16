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

  await sendPhotoAlbums(token, chatId, report);
}

async function sendPhotoAlbums(token: string, chatId: string, report: Report): Promise<void> {
  const chunkSize = 10;

  for (let start = 0; start < report.photos.length; start += chunkSize) {
    const photoChunk = report.photos.slice(start, start + chunkSize);
    const form = new FormData();
    const media: Array<{ type: "photo"; media: string }> = [];

    form.append("chat_id", chatId);

    for (const [index, photo] of photoChunk.entries()) {
      const storedPhoto = await readPhoto(photo.filename);

      if (!storedPhoto) {
        throw new Error(`Photo ${photo.filename} was not found.`);
      }

      const fieldName = `photo_${start + index}`;
      form.append(fieldName, new Blob([storedPhoto.body], { type: storedPhoto.mimeType }), photo.originalName);
      media.push({ type: "photo", media: `attach://${fieldName}` });
    }

    form.append("media", JSON.stringify(media));

    await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
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
