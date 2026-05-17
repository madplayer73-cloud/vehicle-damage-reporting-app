import { useMemo, useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, ScanLine, Trash2, Upload } from "lucide-react";
import { createReport, getUserName } from "../lib/api";
import { type ReportDraft, type TelegramStatus } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { VinScanner } from "../components/VinScanner";
import { usePreferences, type TranslationKey } from "../lib/preferences";
import { REPORT_LOCATIONS, VEHICLE_BRANDS, VEHICLE_MODELS_BY_BRAND } from "../data/vehicleData";
import { areaByTelegramLabel, DAMAGE_AREAS } from "../data/damageAreas";
import {
  getCustomBrands,
  getCustomLocations,
  getCustomModelsByBrand,
  mergeOptions,
  saveCustomBrand,
  saveCustomLocation,
  saveCustomModel,
} from "../lib/customVehicleOptions";

type NewReportPageProps = {
  onCreated?: (reportId: string) => void;
};

const recommendedPhotoCount = 10;
const steps = ["Vehicle", "Area", "Description", "Measure", "Photos", "Review", "Send"];

const initialDraft: ReportDraft = {
  vin: "",
  vinLast8Input: "",
  brand: "",
  model: "",
  location: "",
  reportedBy: "",
  damageArea: "",
  damageDescription: "",
  damageMeasurementType: "",
  damageLengthMm: "",
  damageWidthMm: "",
  damageAreaMm2: "",
  damageMeasurementNote: "",
};

export function NewReportPage({ onCreated }: NewReportPageProps) {
  const { language, t } = usePreferences();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(() => ({ ...initialDraft, reportedBy: getUserName() }));
  const [photos, setPhotos] = useState<File[]>([]);
  const [createdId, setCreatedId] = useState<string>();
  const [createdStatus, setCreatedStatus] = useState<TelegramStatus>("pending");
  const [error, setError] = useState("");
  const [photoNotice, setPhotoNotice] = useState("");
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [scanWarning, setScanWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [customBrands, setCustomBrands] = useState<string[]>(() => getCustomBrands());
  const [customLocations, setCustomLocations] = useState<string[]>(() => getCustomLocations());
  const [customModelsByBrand, setCustomModelsByBrand] = useState<Record<string, string[]>>(() => getCustomModelsByBrand());

  const vinLast8 = draft.vin.length === 17 ? draft.vin.slice(-8).toUpperCase() : draft.vinLast8Input || "";
  const photoPreviews = useMemo(
    () => photos.map((photo) => ({ name: photo.name, url: URL.createObjectURL(photo) })),
    [photos],
  );
  const brandOptions = useMemo(() => mergeOptions(VEHICLE_BRANDS, customBrands), [customBrands]);
  const modelOptions = useMemo(
    () => mergeOptions(VEHICLE_MODELS_BY_BRAND[draft.brand] || [], customModelsByBrand[draft.brand] || []),
    [customModelsByBrand, draft.brand],
  );
  const locationOptions = useMemo(() => mergeOptions(REPORT_LOCATIONS, customLocations), [customLocations]);
  const selectedArea = areaByTelegramLabel(draft.damageArea);
  const descriptionSuggestions = selectedArea?.suggestions[language] || [];
  const computedAreaMm2 =
    Number(draft.damageLengthMm) > 0 && Number(draft.damageWidthMm) > 0
      ? String(Number(draft.damageLengthMm) * Number(draft.damageWidthMm))
      : "";
  const measurementSummary = measurementSummaryFor(draft);

  const update = (field: keyof ReportDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addPhotos = async (files: FileList | null) => {
    const incoming = Array.from(files || []);
    if (incoming.length === 0) {
      return;
    }

    setIsPreparingPhotos(true);
    setError("");

    try {
      const preparedPhotos = await Promise.all(incoming.map(preparePhotoForUpload));

      setPhotos((current) => {
        const nextPhotos = [...current, ...preparedPhotos];
        if (nextPhotos.length > recommendedPhotoCount) {
          setPhotoNotice(t("new.photoRecommendation"));
        } else {
          setPhotoNotice("");
        }
        return nextPhotos;
      });
    } finally {
      setIsPreparingPhotos(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((current) => {
      const nextPhotos = current.filter((_, index) => index !== indexToRemove);
      setPhotoNotice(nextPhotos.length > recommendedPhotoCount ? t("new.photoRecommendation") : "");
      return nextPhotos;
    });
    setError("");
  };

  const rememberVehicleOptions = () => {
    if (draft.brand.trim()) {
      saveCustomBrand(draft.brand);
      setCustomBrands(getCustomBrands());
    }

    if (draft.brand.trim() && draft.model.trim()) {
      saveCustomModel(draft.brand, draft.model);
      setCustomModelsByBrand(getCustomModelsByBrand());
    }

    if (draft.location.trim()) {
      saveCustomLocation(draft.location);
      setCustomLocations(getCustomLocations());
    }
  };

  const resetReport = () => {
    setStep(0);
    setDraft({ ...initialDraft, reportedBy: getUserName() });
    setPhotos([]);
    setCreatedId(undefined);
    setCreatedStatus("pending");
    setError("");
    setPhotoNotice("");
    setScanWarning("");
  };

  const next = () => {
    const validation = validateStep(step, draft, photos, t);
    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    if (step === 0) {
      rememberVehicleOptions();
    }
    if (step === 3 && computedAreaMm2 && !draft.damageAreaMm2) {
      update("damageAreaMm2", computedAreaMm2);
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitReport = async () => {
    const validation = validateStep(5, draft, photos, t);
    if (validation) {
      setError(validation);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      rememberVehicleOptions();
      Object.entries(draft).forEach(([key, value]) => form.append(key, value));
      photos.forEach((photo) => form.append("photos", photo));
      const report = await createReport(form);
      setCreatedId(report.reportId);
      setCreatedStatus(report.telegramStatus);
      if (report.telegramStatus === "failed") {
        setError(report.telegramError || "Report saved, but Telegram sending failed.");
      }
      setStep(6);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow={t("new.eyebrow")}
        title={t("new.title")}
        description={t("new.description")}
      />

      <div className="wizard-layout">
        <ol className="stepper">
          {steps.map((label, index) => (
            <li key={label} className={index === step ? "current" : index < step ? "done" : ""}>
              <span>{index < step ? <Check size={15} /> : index + 1}</span>
              {t(stepTranslationKey(label))}
            </li>
          ))}
        </ol>

        <div className="panel">
          {step === 0 && (
            <div className="form-grid">
              <label className="field wide">
                {t("new.fullVin")}
                <div className="input-action single-action">
                  <input
                    value={draft.vin}
                    maxLength={17}
                    onChange={(event) => update("vin", event.target.value.toUpperCase())}
                    placeholder="VF3XXXXXXXXXXXXXX"
                  />
                  <button type="button" className="icon-button" title="Scan VIN barcode or QR" onClick={() => setIsScannerOpen(true)}>
                    <ScanLine size={20} />
                  </button>
                </div>
                <small>{draft.vin.length}/17 characters</small>
              </label>
              <label className="field wide">
                {t("new.vis")}
                <input
                  value={draft.vinLast8Input || ""}
                  maxLength={8}
                  onChange={(event) => update("vinLast8Input", event.target.value.toUpperCase())}
                  placeholder="Last 8 characters"
                />
                <small>{(draft.vinLast8Input || "").length}/8 characters</small>
              </label>
              {scanWarning && <div className="warning-box">{scanWarning}</div>}
              <label className="field">
                {t("new.brand")}
                <input
                  value={draft.brand}
                  onChange={(event) => update("brand", event.target.value)}
                  onBlur={rememberVehicleOptions}
                  placeholder="Peugeot"
                  list="vehicle-brand-options"
                />
                <small>{t("new.customInputHint")}</small>
              </label>
              <label className="field">
                {t("new.model")}
                <input
                  value={draft.model}
                  onChange={(event) => update("model", event.target.value)}
                  onBlur={rememberVehicleOptions}
                  placeholder="308 SW"
                  list="vehicle-model-options"
                />
                <small>{t("new.customInputHint")}</small>
              </label>
              <label className="field">
                {t("new.location")}
                <input
                  value={draft.location}
                  onChange={(event) => update("location", event.target.value)}
                  onBlur={rememberVehicleOptions}
                  placeholder="CEVA Hub Trnava"
                  list="report-location-options"
                />
                <small>{t("new.customInputHint")}</small>
              </label>
              <label className="field">
                {t("new.reportedBy")}
                <input value={draft.reportedBy} onChange={(event) => update("reportedBy", event.target.value)} placeholder="Attila" />
              </label>
              {vinLast8.length === 8 && <div className="confirmation">{t("new.identifierConfirmed")} {vinLast8}</div>}
              <datalist id="vehicle-brand-options">
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <datalist id="vehicle-model-options">
                {modelOptions.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
              <datalist id="report-location-options">
                {locationOptions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>
          )}

          {step === 1 && (
            <div className="area-grid">
              {DAMAGE_AREAS.map((area) => (
                <button
                  key={area.id}
                  className={draft.damageArea === area.telegramLabel ? "selected" : ""}
                  onClick={() => update("damageArea", area.telegramLabel)}
                >
                  {area.label[language]}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="description-layout">
              <label className="field">
                {t("new.damageDescription")}
                <textarea
                  value={draft.damageDescription}
                  onChange={(event) => update("damageDescription", event.target.value)}
                  rows={8}
                  placeholder={descriptionSuggestions[0] || "Scratch on lower right side of bumper"}
                />
              </label>
              {descriptionSuggestions.length > 0 && (
                <div className="suggestion-grid">
                  {descriptionSuggestions.map((suggestion) => (
                    <button key={suggestion} className="secondary suggestion-button" onClick={() => update("damageDescription", suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="measure-layout">
              <div className="measurement-options">
                {[
                  { value: "Scratch length", label: t("new.measureScratch") },
                  { value: "Paint damage area", label: t("new.measurePaint") },
                  { value: "Dent size", label: t("new.measureDent") },
                  { value: "Other measurement", label: t("new.measureOther") },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={draft.damageMeasurementType === option.value ? "selected" : "secondary"}
                    onClick={() => update("damageMeasurementType", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="form-grid">
                <label className="field">
                  {t("new.damageLength")}
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={draft.damageLengthMm || ""}
                    onChange={(event) => update("damageLengthMm", event.target.value)}
                    placeholder="25"
                  />
                </label>
                <label className="field">
                  {t("new.damageWidth")}
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={draft.damageWidthMm || ""}
                    onChange={(event) => update("damageWidthMm", event.target.value)}
                    placeholder="5"
                  />
                </label>
                <label className="field">
                  {t("new.damageAreaMm2")}
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={draft.damageAreaMm2 || computedAreaMm2}
                    onChange={(event) => update("damageAreaMm2", event.target.value)}
                    placeholder={computedAreaMm2 || "125"}
                  />
                  <small>{computedAreaMm2 ? `${t("new.damageAreaComputed")} ${computedAreaMm2} mm2` : t("new.measureHint")}</small>
                </label>
                <label className="field">
                  {t("new.measureNote")}
                  <input
                    value={draft.damageMeasurementNote || ""}
                    onChange={(event) => update("damageMeasurementNote", event.target.value)}
                    placeholder={t("new.measureNotePlaceholder")}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="photo-actions">
                <label className="upload-box compact">
                  <Camera size={26} />
                  <strong>{t("new.takePhoto")}</strong>
                  <span>{t("new.cameraHint")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    capture="environment"
                    onChange={async (event) => {
                      await addPhotos(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
                <label className="upload-box compact">
                  <Upload size={26} />
                  <strong>{t("new.uploadPhotos")}</strong>
                  <span>{t("new.uploadHint")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={async (event) => {
                      await addPhotos(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="photo-count">
                {photos.length} {t("new.photosSelected")} {photos.length > recommendedPhotoCount ? t("new.photoRecommendedCount") : ""}
              </div>
              {isPreparingPhotos && <div className="warning-box">{t("new.preparingPhotos")}</div>}
              {photoNotice && <div className="warning-box">{photoNotice}</div>}
              <div className="photo-grid">
                {photoPreviews.map((photo, index) => (
                  <figure key={photo.url}>
                    <img src={photo.url} alt={photo.name} />
                    <figcaption>
                      <span>{photo.name}</span>
                      <button type="button" className="icon-button remove-photo" title={t("new.removePhoto")} onClick={() => removePhoto(index)}>
                        <Trash2 size={16} />
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="review-grid">
              <ReviewRow label={t("new.reviewVin")} value={draft.vin || "-"} />
              <ReviewRow label={t("new.reviewVis")} value={vinLast8} />
              <ReviewRow label={t("new.brandModel")} value={`${draft.brand || "-"} ${draft.model || ""}`} />
              <ReviewRow label={t("new.location")} value={draft.location || "-"} />
              <ReviewRow label={t("new.reportedBy")} value={draft.reportedBy || "-"} />
              <ReviewRow label={t("new.area")} value={selectedArea?.label[language] || draft.damageArea} />
              <ReviewRow label={t("new.damageDescription")} value={draft.damageDescription} />
              <ReviewRow label={t("new.measurement")} value={measurementSummary || "-"} />
              <ReviewRow label={t("new.photos")} value={`${photos.length} ${t("new.photosSelected")}`} />
            </div>
          )}

          {step === 6 && (
            <div className="send-panel">
              <Camera size={40} />
              <h2>{t("new.reportSaved")}</h2>
              <p>
                Report ID: {createdId}.{" "}
                {createdStatus === "sent"
                  ? t("new.savedSent")
                  : t("new.savedFailed")}
              </p>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}

          <div className="actions">
            <button className="secondary" onClick={back} disabled={step === 0 || isSubmitting}>
              <ChevronLeft size={18} />
              {t("new.back")}
            </button>
            {step < 5 && (
              <button onClick={next} disabled={isPreparingPhotos}>
                {t("new.continue")}
                <ChevronRight size={18} />
              </button>
            )}
            {step === 5 && (
              <button onClick={submitReport} disabled={isSubmitting}>
                {t("new.saveSend")}
                <Check size={18} />
              </button>
            )}
            {step === 6 && (
              <button onClick={resetReport} disabled={!createdId}>
                {t("nav.newReport")}
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      {isScannerOpen && (
        <VinScanner
          onClose={() => setIsScannerOpen(false)}
          onDetected={(result) => {
            if (result.kind === "vin") {
              update("vin", result.value);
              update("vinLast8Input", result.value.slice(-8));
              setScanWarning("");
              setIsScannerOpen(false);
              return;
            }

            if (result.kind === "vis") {
              update("vinLast8Input", result.value);
              setScanWarning("");
              setIsScannerOpen(false);
              return;
            }

            setScanWarning(t("new.scanWarning"));
          }}
        />
      )}
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function stepTranslationKey(stepLabel: string): TranslationKey {
  const keys: Record<string, TranslationKey> = {
    Vehicle: "step.vehicle",
    Area: "step.area",
    Description: "step.description",
    Measure: "step.measure",
    Photos: "step.photos",
    Review: "step.review",
    Send: "step.send",
  };

  return keys[stepLabel];
}

function measurementSummaryFor(draft: ReportDraft): string {
  const parts = [
    draft.damageMeasurementType,
    draft.damageLengthMm ? `${draft.damageLengthMm} mm length` : "",
    draft.damageWidthMm ? `${draft.damageWidthMm} mm width` : "",
    draft.damageAreaMm2 ? `${draft.damageAreaMm2} mm2` : "",
    draft.damageMeasurementNote,
  ].filter(Boolean);

  return parts.join(" / ");
}

async function preparePhotoForUpload(photo: File): Promise<File> {
  if (!photo.type.startsWith("image/")) {
    return photo;
  }

  const imageUrl = URL.createObjectURL(photo);

  try {
    const image = await loadImage(imageUrl);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));

    if (scale === 1 && photo.size <= 1_200_000 && photo.type === "image/jpeg") {
      return photo;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      return photo;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.78);
    const filename = photo.name.replace(/\.[^.]+$/, "") || "photo";

    return new File([blob], `${filename}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return photo;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Could not compress photo."));
    }, type, quality);
  });
}

function validateStep(step: number, draft: ReportDraft, photos: File[], t: (key: TranslationKey) => string): string {
  if (step === 0 && draft.vin && draft.vin.length !== 17) {
    return t("new.validateVin");
  }

  if (step === 0 && !draft.vin && (draft.vinLast8Input || "").length !== 8) {
    return t("new.validateIdentifier");
  }

  if (step === 1 && !draft.damageArea) {
    return t("new.validateArea");
  }

  if (step === 2 && !draft.damageDescription.trim()) {
    return t("new.validateDescription");
  }

  if ((step === 4 || step === 5) && photos.length === 0) {
    return t("new.validatePhotos");
  }

  return "";
}
