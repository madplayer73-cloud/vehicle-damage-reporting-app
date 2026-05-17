import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getReport } from "../lib/api";
import type { Report } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

type ReportDetailPageProps = {
  reportId: string;
  onBack: () => void;
};

export function ReportDetailPage({ reportId, onBack }: ReportDetailPageProps) {
  const [report, setReport] = useState<Report>();
  const [error, setError] = useState("");

  useEffect(() => {
    getReport(reportId)
      .then(setReport)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load report."));
  }, [reportId]);

  if (!report) {
    return (
      <section>
        <button className="link-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to reports
        </button>
        {error ? <div className="error-box">{error}</div> : <div className="empty-state">Loading report...</div>}
      </section>
    );
  }

  return (
    <section>
      <button className="link-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to reports
      </button>

      <PageHeader
        eyebrow={report.reportId}
        title={`${report.vinLast8 || "Vehicle"} damage report`}
        description={`${report.damageArea} reported on ${new Date(report.timestamp).toLocaleString()}.`}
      />

      <div className="detail-layout">
        <div className="panel">
          <div className="detail-head">
            <h2>Report data</h2>
            <StatusBadge status={report.telegramStatus} />
          </div>
          <div className="review-grid">
            <DetailRow label="VIN" value={report.vin || "-"} />
            <DetailRow label="VIS / VIN last 8" value={report.vinLast8 || "-"} />
            <DetailRow label="Brand" value={report.brand || "-"} />
            <DetailRow label="Model" value={report.model || "-"} />
            <DetailRow label="Location" value={report.location || "-"} />
            <DetailRow label="Reported by" value={report.reportedBy || "-"} />
            <DetailRow label="Damage area" value={report.damageArea} />
            <DetailRow label="Description" value={report.damageDescription} />
            <DetailRow label="Photos" value={`${report.photos.length} archived in Telegram`} />
          </div>
          {report.telegramError && <div className="error-box">{report.telegramError}</div>}
        </div>

        <div className="panel">
          <h2>Telegram photo archive</h2>
          <p className="muted-copy">Photos are not stored in the app. Use the Telegram report thread as the photo archive.</p>
          <div className="file-list">
            {report.photos.map((photo) => (
              <div key={photo.filename}>{photo.originalName}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
