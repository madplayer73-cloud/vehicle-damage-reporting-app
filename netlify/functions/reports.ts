import type { Config, Context } from "@netlify/functions";
import { allowedPhotoTypes, type ReportInput } from "./_shared/types";
import { createReport, getReport, listReports } from "./_shared/storage";
import { error, json } from "./_shared/response";

export default async (req: Request, context: Context) => {
  try {
    if (req.method === "GET" && context.params.id) {
      const report = await getReport(context.params.id);
      return report ? json(report) : error("Report not found.", 404);
    }

    if (req.method === "GET") {
      return json(await listReports());
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

      return json(await createReport(input, photos), 201);
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
    brand: String(form.get("brand") || "").trim(),
    model: String(form.get("model") || "").trim(),
    location: String(form.get("location") || "").trim(),
    reportedBy: String(form.get("reportedBy") || "").trim(),
    damageArea: String(form.get("damageArea") || "").trim(),
    damageDescription: String(form.get("damageDescription") || "").trim(),
  };
}

function validateInput(input: ReportInput): string | undefined {
  if (input.vin.length !== 17) {
    return "VIN must have exactly 17 characters.";
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
