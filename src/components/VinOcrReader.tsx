import { ChangeEvent, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { detectVehicleIdentifier, type IdentifierResult } from "../lib/vinParsing";

type VinOcrReaderProps = {
  onDetected: (result: IdentifierResult) => void;
  onClose: () => void;
};

export function VinOcrReader({ onDetected, onClose }: VinOcrReaderProps) {
  const [imageFile, setImageFile] = useState<File>();
  const [progress, setProgress] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);

  const readImage = async (file: File) => {
    setImageFile(file);
    setError("");
    setOcrText("");
    setIsReading(true);
    setProgress("Loading OCR...");

    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng", {
        logger: (message) => {
          if (message.status) {
            const percent = typeof message.progress === "number" ? ` ${Math.round(message.progress * 100)}%` : "";
            setProgress(`${message.status}${percent}`);
          }
        },
      });
      const text = result.data.text;
      const identifier = detectVehicleIdentifier(text);
      setOcrText(text.trim());

      if (identifier.kind === "unknown") {
        setError("OCR did not find a clear VIN or VIS. Check the photo, reduce glare, or enter it manually.");
        return;
      }

      onDetected(identifier);
    } catch {
      setError("OCR failed on this image. Try a sharper photo or enter VIN/VIS manually.");
    } finally {
      setIsReading(false);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void readImage(file);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="scanner-panel">
        <div className="scanner-header">
          <div>
            <h2>Read VIN from photo</h2>
            <p>Take or upload a clear photo of the VIN behind glass. Confirm the result before sending.</p>
          </div>
          <button className="icon-button" type="button" title="Close OCR reader" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <label className="upload-box compact">
          <ImagePlus size={26} />
          <strong>Take or choose VIN photo</strong>
          <span>Use a sharp photo with minimal glare.</span>
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
        </label>

        {previewUrl && (
          <figure className="ocr-preview">
            <img src={previewUrl} alt="VIN OCR preview" />
          </figure>
        )}

        {isReading && <div className="scanner-result"><span>OCR status</span><strong>{progress}</strong></div>}
        {ocrText && (
          <div className="scanner-result">
            <span>OCR text</span>
            <strong>{ocrText}</strong>
          </div>
        )}
        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
}
