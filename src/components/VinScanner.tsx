import { useEffect, useId, useState } from "react";
import type { Html5Qrcode as Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

type VinScannerProps = {
  onDetected: (result: ScanResult) => void;
  onClose: () => void;
};

export type ScanResult = {
  kind: "vin" | "vis" | "unknown";
  value: string;
  rawValue: string;
};

export function VinScanner({ onDetected, onClose }: VinScannerProps) {
  const scannerId = useId().replaceAll(":", "");
  const [error, setError] = useState("");
  const [scannedText, setScannedText] = useState("");

  useEffect(() => {
    let scanner: Html5QrcodeScanner | undefined;
    let isMounted = true;

    void import("html5-qrcode").then(({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
      if (!isMounted) {
        return;
      }

      scanner = new Html5Qrcode(scannerId, {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.AZTEC,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
      });

      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.floor(viewfinderWidth * 0.88),
              height: Math.floor(Math.min(viewfinderHeight * 0.42, 240)),
            }),
          },
          (decodedText: string) => {
            const normalized = normalizeCode(decodedText);
            const vin = extractVin(normalized);
            const vis = extractVis(normalized);

            setScannedText(normalized || decodedText);

            if (vin) {
              onDetected({ kind: "vin", value: vin, rawValue: decodedText });
            } else if (vis) {
              onDetected({ kind: "vis", value: vis, rawValue: decodedText });
            } else {
              setError(`Code was scanned (${normalized.length} characters), but it is not a 17-character VIN.`);
            }
          },
          () => undefined,
        )
        .catch(() => setError("Camera access failed. Check browser permissions and use HTTPS."));
    });

    return () => {
      isMounted = false;
      if (scanner) {
        const activeScanner = scanner;
        scanner
          .stop()
          .catch(() => undefined)
          .finally(() => activeScanner.clear());
      }
    };
  }, [onDetected, scannerId]);

  return (
    <div className="modal-backdrop">
      <div className="scanner-panel">
        <div className="scanner-header">
          <div>
            <h2>Scan VIN</h2>
            <p>Point the camera at a QR code, Data Matrix or barcode containing the VIN.</p>
          </div>
          <button className="icon-button" type="button" title="Close scanner" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div id={scannerId} className="scanner-view" />
        {scannedText && (
          <div className="scanner-result">
            <span>Scanned value</span>
            <strong>{scannedText}</strong>
          </div>
        )}
        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
}

function normalizeCode(decodedText: string): string {
  return decodedText.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
