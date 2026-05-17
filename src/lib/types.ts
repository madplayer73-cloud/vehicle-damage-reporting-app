export type TelegramStatus = "sent" | "failed" | "pending";

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

export type ReportPhoto = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

export type ReportDraft = Omit<Report, "reportId" | "vinLast8" | "timestamp" | "photos" | "telegramStatus">;
