export type IdentifierResult = {
  kind: "vin" | "vis" | "unknown";
  value: string;
  rawValue: string;
};

export function normalizeIdentifierText(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function detectVehicleIdentifier(rawValue: string): IdentifierResult {
  const normalized = normalizeIdentifierText(rawValue);
  const vin = extractVin(normalized);

  if (vin) {
    return { kind: "vin", value: vin, rawValue };
  }

  const vis = extractVis(normalized);
  if (vis) {
    return { kind: "vis", value: vis, rawValue };
  }

  return { kind: "unknown", value: normalized, rawValue };
}

function extractVin(normalized: string): string {
  const match = normalized.match(/[A-HJ-NPR-Z0-9]{17}/);
  return match ? match[0] : "";
}

function extractVis(normalized: string): string {
  if (normalized.length === 8) {
    return normalized;
  }

  const match = normalized.match(/[A-HJ-NPR-Z0-9]{8}$/);
  return match ? match[0] : "";
}
