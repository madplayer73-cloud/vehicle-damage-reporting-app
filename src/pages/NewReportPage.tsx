import { useMemo, useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, ImagePlus, ScanLine, Upload } from "lucide-react";
import { createReport, getUserName } from "../lib/api";
import { DAMAGE_AREAS, type ReportDraft, type TelegramStatus } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { VinScanner } from "../components/VinScanner";
import { VinOcrReader } from "../components/VinOcrReader";
import { usePreferences, type TranslationKey } from "../lib/preferences";
import { REPORT_LOCATIONS, VEHICLE_BRANDS, VEHICLE_MODELS_BY_BRAND } from "../data/vehicleData";
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

const steps = ["Vehicle", "Area", "Description", "Photos", "Review", "Send"];

const initialDraft: ReportDraft = {
  vin: "",
  vinLast8Input: "",
  brand: "",
  model: "",
  location: "",
  reportedBy: "",
  damageArea: "",
  damageDescription: "",
};

export function NewReportPage({ onCreated }: NewReportPageProps) {
  const { t } = usePreferences();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(() => ({ ...initialDraft, reportedBy: getUserName() }));
  const [photos, setPhotos] = useState<File[]>([]);
  const [createdId, setCreatedId] = useState<string>();
  const [createdStatus, setCreatedStatus] = useState<TelegramStatus>("pending");
  const [error, setError] = useState("");
  const [scanWarning, setScanWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
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

  const update = (field: keyof ReportDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
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
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitReport = async () => {
    const validation = validateStep(4, draft, photos, t);
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
      setStep(5);
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
              {label}
            </li>
          ))}
        </ol>

        <div className="panel">
          {step === 0 && (
            <div className="form-grid">
              <label className="field wide">
                {t("new.fullVin")}
                <div className="input-action">
                  <input
                    value={draft.vin}
                    maxLength={17}
                    onChange={(event) => update("vin", event.target.value.toUpperCase())}
                    placeholder="VF3XXXXXXXXXXXXXX"
                  />
                  <button type="button" className="icon-button" title="Scan VIN barcode or QR" onClick={() => setIsScannerOpen(true)}>
                    <ScanLine size={20} />
                  </button>
                  <button type="button" className="icon-button" title="Read VIN from photo" onClick={() => setIsOcrOpen(true)}>
                    <ImagePlus size={20} />
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
                  key={area}
                  className={draft.damageArea === area ? "selected" : ""}
                  onClick={() => update("damageArea", area)}
                >
                  {area}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <label className="field">
              {t("new.damageDescription")}
              <textarea
                value={draft.damageDescription}
                onChange={(event) => update("damageDescription", event.target.value)}
                rows={8}
                placeholder="Scratch on lower right side of bumper"
              />
            </label>
          )}

          {step === 3 && (
            <div>
              <label className="upload-box">
                <Upload size={26} />
                <strong>{t("new.uploadTitle")}</strong>
                <span>{t("new.uploadHint")}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={(event) => setPhotos(Array.from(event.target.files || []))}
                />
              </label>
              <div className="photo-grid">
                {photoPreviews.map((photo) => (
                  <figure key={photo.url}>
                    <img src={photo.url} alt={photo.name} />
                    <figcaption>{photo.name}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="review-grid">
              <ReviewRow label={t("new.reviewVin")} value={draft.vin || "-"} />
              <ReviewRow label={t("new.reviewVis")} value={vinLast8} />
              <ReviewRow label={t("new.brandModel")} value={`${draft.brand || "-"} ${draft.model || ""}`} />
              <ReviewRow label={t("new.location")} value={draft.location || "-"} />
              <ReviewRow label={t("new.reportedBy")} value={draft.reportedBy || "-"} />
              <ReviewRow label={t("new.area")} value={draft.damageArea} />
              <ReviewRow label={t("new.damageDescription")} value={draft.damageDescription} />
              <ReviewRow label={t("new.photos")} value={`${photos.length} attached`} />
            </div>
          )}

          {step === 5 && (
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
            {step < 4 && (
              <button onClick={next}>
                {t("new.continue")}
                <ChevronRight size={18} />
              </button>
            )}
            {step === 4 && (
              <button onClick={submitReport} disabled={isSubmitting}>
                {t("new.saveSend")}
                <Check size={18} />
              </button>
            )}
            {step === 5 && (
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
      {isOcrOpen && (
        <VinOcrReader
          onClose={() => setIsOcrOpen(false)}
          onDetected={(result) => {
            if (result.kind === "vin") {
              update("vin", result.value);
              update("vinLast8Input", result.value.slice(-8));
              setScanWarning("");
              setIsOcrOpen(false);
              return;
            }

            if (result.kind === "vis") {
              update("vinLast8Input", result.value);
              setScanWarning("");
              setIsOcrOpen(false);
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

  if ((step === 3 || step === 4) && photos.length === 0) {
    return t("new.validatePhotos");
  }

  return "";
}
