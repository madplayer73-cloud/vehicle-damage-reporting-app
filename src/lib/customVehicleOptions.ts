const customBrandsKey = "vehicle-damage-custom-brands";
const customModelsKey = "vehicle-damage-custom-models";
const customLocationsKey = "vehicle-damage-custom-locations";

export function mergeOptions(baseOptions: string[], customOptions: string[]): string[] {
  return Array.from(new Set([...baseOptions, ...customOptions].map((item) => item.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getCustomBrands(): string[] {
  return readStringList(customBrandsKey);
}

export function saveCustomBrand(brand: string): void {
  saveStringListItem(customBrandsKey, brand);
}

export function getCustomLocations(): string[] {
  return readStringList(customLocationsKey);
}

export function saveCustomLocation(location: string): void {
  saveStringListItem(customLocationsKey, location);
}

export function getCustomModelsByBrand(): Record<string, string[]> {
  return readRecord(customModelsKey);
}

export function saveCustomModel(brand: string, model: string): void {
  const cleanBrand = brand.trim();
  const cleanModel = model.trim();

  if (!cleanBrand || !cleanModel) {
    return;
  }

  const modelsByBrand = readRecord(customModelsKey);
  modelsByBrand[cleanBrand] = mergeOptions(modelsByBrand[cleanBrand] || [], [cleanModel]);
  window.localStorage.setItem(customModelsKey, JSON.stringify(modelsByBrand));
}

function saveStringListItem(key: string, value: string): void {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(mergeOptions(readStringList(key), [cleanValue])));
}

function readStringList(key: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readRecord(key: string): Record<string, string[]> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([brand, models]) => [
        brand,
        Array.isArray(models) ? models.filter((item): item is string => typeof item === "string") : [],
      ]),
    );
  } catch {
    return {};
  }
}
