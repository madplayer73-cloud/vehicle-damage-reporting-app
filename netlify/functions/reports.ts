import type { Config, Context } from "@netlify/functions";
import { allowedPhotoTypes, type Report, type ReportInput } from "./_shared/types";
import { error, json } from "./_shared/response";
import { hasValidAccessCode } from "./_shared/auth";
import { sendReportToTelegram, toReportPhotos, type TelegramPhotoUpload } from "./_shared/telegram";

export default async (req: Request, context: Context) => {
  try {
    if (!hasValidAccessCode(req)) {
      return error("Invalid access code.", 401);
    }

    if (req.method === "GET" && context.params.id) {
      return error("Reports are not stored in this Telegram-only archive mode.", 410);
    }

    if (req.method === "GET") {
      return json([]);
    }

    if (req.method === "POST") {
      const form = await req.formData();
      const input = parseInput(form);
      const validationError = validateInput(input);

      if (validationError) {
        return error(validationError, 422);
      }

      const photos = form.getAll("photos").filter((value): value is File => value instanceof File);
      const photoError = validatePhotos(photos);

      if (photoError) {
        return error(photoError, 422);
      }

      const telegramPhotos = await toTelegramUploads(photos);
      const pendingReport = buildReport(input, telegramPhotos, "pending");

      try {
        await sendReportToTelegram(pendingReport, telegramPhotos);
        return json({ ...pendingReport, telegramStatus: "sent", telegramError: undefined }, 201);
      } catch (sendError) {
        return json(
          {
            ...pendingReport,
            telegramStatus: "failed",
            telegramError: sendError instanceof Error ? sendError.message : "Telegram send failed.",
          },
          201,
        );
      }
    }

    return error("Method not allowed.", 405);
  } catch (requestError) {
    return error(requestError instanceof Error ? requestError.message : "Unexpected server error.", 500);
  }
};

export const config: Config = {
  path: ["/api/reports", "/api/reports/:id"],
};

function parseInput(form: FormData): ReportInput {
  return {
    vin: String(form.get("vin") || "").trim(),
    vinLast8Input: String(form.get("vinLast8Input") || "").trim(),
    brand: String(form.get("brand") || "").trim(),
    model: String(form.get("model") || "").trim(),
    location: String(form.get("location") || "").trim(),
    reportedBy: String(form.get("reportedBy") || "").trim(),
    damageArea: String(form.get("damageArea") || "").trim(),
    damageDescription: String(form.get("damageDescription") || "").trim(),
    damageMeasurementType: String(form.get("damageMeasurementType") || "").trim(),
    damageLengthMm: String(form.get("damageLengthMm") || "").trim(),
    damageWidthMm: String(form.get("damageWidthMm") || "").trim(),
    damageAreaMm2: String(form.get("damageAreaMm2") || "").trim(),
    damageMeasurementNote: String(form.get("damageMeasurementNote") || "").trim(),
  };
}

function buildReport(input: ReportInput, photos: TelegramPhotoUpload[], telegramStatus: Report["telegramStatus"]): Report {
  const timestamp = new Date().toISOString();

  return {
    reportId: reportIdFor(timestamp),
    vin: input.vin.toUpperCase(),
    vinLast8: vinLast8For(input),
    vinLast8Input: input.vinLast8Input.toUpperCase(),
    brand: input.brand,
    model: input.model,
    location: input.location,
    reportedBy: input.reportedBy,
    damageArea: input.damageArea,
    damageDescription: input.damageDescription,
    damageMeasurementType: input.damageMeasurementType,
    damageLengthMm: input.damageLengthMm,
    damageWidthMm: input.damageWidthMm,
    damageAreaMm2: input.damageAreaMm2,
    damageMeasurementNote: input.damageMeasurementNote,
    timestamp,
    photos: toReportPhotos(photos),
    telegramStatus,
  };
}

function reportIdFor(timestamp: string): string {
  const datePart = timestamp.slice(0, 10).replaceAll("-", "");
  const timePart = timestamp.slice(11, 19).replaceAll(":", "");
  return `DR-${datePart}-${timePart}`;
}

function vinLast8For(input: ReportInput): string {
  if (input.vin.length === 17) {
    return input.vin.slice(-8).toUpperCase();
  }

  return input.vinLast8Input.toUpperCase();
}

async function toTelegramUploads(photos: File[]): Promise<TelegramPhotoUpload[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      originalName: photo.name,
      mimeType: photo.type,
      size: photo.size,
      body: Buffer.from(await photo.arrayBuffer()),
    })),
  );
}

function validateInput(input: ReportInput): string | undefined {
  if (input.vin && input.vin.length !== 17) {
    return "VIN must have exactly 17 characters.";
  }

  if (!input.vin && input.vinLast8Input.length !== 8) {
    return "Enter a full 17-character VIN or an 8-character VIS / VIN last 8.";
  }

  if (!input.damageArea) {
    return "Damage area is required.";
  }

  if (!input.damageDescription) {
    return "Damage description is required.";
  }

  return undefined;
}

function validatePhotos(photos: File[]): string | undefined {
  if (photos.length === 0) {
    return "At least one JPG or PNG photo is required.";
  }

  const unsupported = photos.find((photo) => !allowedPhotoTypes.has(photo.type));
  if (unsupported) {
    return `${unsupported.name} is not a supported image type. Use JPG, JPEG or PNG.`;
  }

  return undefined;
}
