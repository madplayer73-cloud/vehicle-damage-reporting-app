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

export const DAMAGE_AREAS = [
  "Front bumper",
  "Rear bumper",
  "Left front door",
  "Left rear door",
  "Right front door",
  "Right rear door",
  "Hood",
  "Roof",
  "Trunk",
  "Left front fender",
  "Right front fender",
  "Left rear quarter",
  "Right rear quarter",
  "Windshield",
  "Wheels / tyres",
  "Interior",
  "Other",
];
