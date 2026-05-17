export type TelegramStatus = "sent" | "failed" | "pending";

export type ReportPhoto = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

export type Report = {
  reportId: string;
  vin: string;
  vinLast8: string;
  vinLast8Input?: string;
  brand: string;
  model: string;
  location: string;
  reportedBy: string;
  damageArea: string;
  damageDescription: string;
  damageMeasurementType?: string;
  damageLengthMm?: string;
  damageWidthMm?: string;
  damageAreaMm2?: string;
  damageMeasurementNote?: string;
  timestamp: string;
  photos: ReportPhoto[];
  telegramStatus: TelegramStatus;
  telegramError?: string;
};

export type ReportInput = {
  vin: string;
  vinLast8Input: string;
  brand: string;
  model: string;
  location: string;
  reportedBy: string;
  damageArea: string;
  damageDescription: string;
  damageMeasurementType: string;
  damageLengthMm: string;
  damageWidthMm: string;
  damageAreaMm2: string;
  damageMeasurementNote: string;
};

export const allowedPhotoTypes = new Set(["image/jpeg", "image/jpg", "image/png"]);
