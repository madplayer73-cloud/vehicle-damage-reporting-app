import { useEffect, useId, useState } from "react";
import type { Html5Qrcode as Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

type VinScannerProps = {
  onDetected: (vin: string) => void;
  onClose: () => void;
};

export function VinScanner({ onDetected, onClose }: VinScannerProps) {
  const scannerId = useId().replaceAll(":", "");
  const [error, setError] = useState("");

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
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
      });

      scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 180 } },
        (decodedText: string) => {
          const vin = extractVin(decodedText);
          if (vin) {
            onDetected(vin);
          } else {
            setError("Code was scanned, but no 17-character VIN was found.");
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
        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
}

function extractVin(decodedText: string): string {
  const normalized = decodedText.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = normalized.match(/[A-HJ-NPR-Z0-9]{17}/);
  return match ? match[0] : "";
}
