import { useMemo, useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, ScanLine, Send, Upload } from "lucide-react";
import { createReport, getUserName, sendReport } from "../lib/api";
import { DAMAGE_AREAS, type ReportDraft } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { VinScanner } from "../components/VinScanner";

type NewReportPageProps = {
  onCreated: (reportId: string) => void;
};

const steps = ["Vehicle", "Area", "Description", "Photos", "Review", "Send"];

const initialDraft: ReportDraft = {
  vin: "",
  brand: "",
  model: "",
  location: "",
  reportedBy: "",
  damageArea: "",
  damageDescription: "",
};

export function NewReportPage({ onCreated }: NewReportPageProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(() => ({ ...initialDraft, reportedBy: getUserName() }));
  const [photos, setPhotos] = useState<File[]>([]);
  const [createdId, setCreatedId] = useState<string>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const vinLast8 = draft.vin.slice(-8).toUpperCase();
  const photoPreviews = useMemo(
    () => photos.map((photo) => ({ name: photo.name, url: URL.createObjectURL(photo) })),
    [photos],
  );

  const update = (field: keyof ReportDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const next = () => {
    const validation = validateStep(step, draft, photos);
    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitReport = async () => {
    const validation = validateStep(4, draft, photos);
    if (validation) {
      setError(validation);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      Object.entries(draft).forEach(([key, value]) => form.append(key, value));
      photos.forEach((photo) => form.append("photos", photo));
      const report = await createReport(form);
      setCreatedId(report.reportId);
      setStep(5);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendCreatedReport = async () => {
    if (!createdId) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await sendReport(createdId);
      onCreated(createdId);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Report saved, but Telegram sending failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Guided workflow"
        title="New damage report"
        description="Create one structured vehicle damage report and send it to Telegram with photos attached."
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
                Full VIN
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
                </div>
                <small>{draft.vin.length}/17 characters</small>
              </label>
              <label className="field">
                Brand
                <input value={draft.brand} onChange={(event) => update("brand", event.target.value)} placeholder="Peugeot" />
              </label>
              <label className="field">
                Model
                <input value={draft.model} onChange={(event) => update("model", event.target.value)} placeholder="308 SW" />
              </label>
              <label className="field">
                Location
                <input
                  value={draft.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="CEVA Hub Trnava"
                />
              </label>
              <label className="field">
                Reported by
                <input value={draft.reportedBy} onChange={(event) => update("reportedBy", event.target.value)} placeholder="Attila" />
              </label>
              {draft.vin.length === 17 && <div className="confirmation">VIN confirmed. Last 8 characters: {vinLast8}</div>}
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
              Damage description
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
                <strong>Upload or take photos</strong>
                <span>JPG, JPEG and PNG are supported.</span>
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
              <ReviewRow label="VIN" value={draft.vin} />
              <ReviewRow label="VIN last 8" value={vinLast8} />
              <ReviewRow label="Brand/model" value={`${draft.brand || "-"} ${draft.model || ""}`} />
              <ReviewRow label="Location" value={draft.location || "-"} />
              <ReviewRow label="Reported by" value={draft.reportedBy || "-"} />
              <ReviewRow label="Damage area" value={draft.damageArea} />
              <ReviewRow label="Description" value={draft.damageDescription} />
              <ReviewRow label="Photos" value={`${photos.length} attached`} />
            </div>
          )}

          {step === 5 && (
            <div className="send-panel">
              <Camera size={40} />
              <h2>Report is saved</h2>
              <p>Report ID: {createdId}. Send the structured text and attached photos to Telegram.</p>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}

          <div className="actions">
            <button className="secondary" onClick={back} disabled={step === 0 || isSubmitting}>
              <ChevronLeft size={18} />
              Back
            </button>
            {step < 4 && (
              <button onClick={next}>
                Continue
                <ChevronRight size={18} />
              </button>
            )}
            {step === 4 && (
              <button onClick={submitReport} disabled={isSubmitting}>
                Save report
                <Check size={18} />
              </button>
            )}
            {step === 5 && (
              <button onClick={sendCreatedReport} disabled={isSubmitting}>
                Send to Telegram
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      {isScannerOpen && (
        <VinScanner
          onClose={() => setIsScannerOpen(false)}
          onDetected={(vin) => {
            update("vin", vin);
            setIsScannerOpen(false);
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

function validateStep(step: number, draft: ReportDraft, photos: File[]): string {
  if (step === 0 && draft.vin.length !== 17) {
    return "VIN must have exactly 17 characters.";
  }

  if (step === 1 && !draft.damageArea) {
    return "Select a damaged area.";
  }

  if (step === 2 && !draft.damageDescription.trim()) {
    return "Add a damage description.";
  }

  if ((step === 3 || step === 4) && photos.length === 0) {
    return "Add at least one photo.";
  }

  return "";
}
