import { useEffect, useId, useRef, useState } from "react";
import type { Html5Qrcode as Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";
import { detectVehicleIdentifier, type IdentifierResult } from "../lib/vinParsing";

type VinScannerProps = {
  onDetected: (result: ScanResult) => void;
  onClose: () => void;
};

export type ScanResult = IdentifierResult;

export function VinScanner({ onDetected, onClose }: VinScannerProps) {
  const scannerId = useId().replaceAll(":", "");
  const lastScanRef = useRef({ text: "", at: 0 });
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
            const now = Date.now();
            if (lastScanRef.current.text === decodedText && now - lastScanRef.current.at < 1800) {
              return;
            }
            lastScanRef.current = { text: decodedText, at: now };

            notifyScan();
            const result = detectVehicleIdentifier(decodedText);
            const normalized = result.value || decodedText;

            setScannedText(normalized || decodedText);

            if (result.kind !== "unknown") {
              onDetected(result);
            } else {
              onDetected(result);
              setError(
                `Code was scanned (${normalized.length} characters), but it is not VIN or VIS. For a correct damage report, scan or enter VIN or VIS manually.`,
              );
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

function notifyScan(): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(120);
  }

  const AudioContextClass = window.AudioContext || getWebkitAudioContext();
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.12);
}

function getWebkitAudioContext(): typeof AudioContext | undefined {
  return (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}
