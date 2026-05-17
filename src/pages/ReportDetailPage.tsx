import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getReport } from "../lib/api";
import type { Report } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { usePreferences } from "../lib/preferences";
import { areaByTelegramLabel } from "../data/damageAreas";

type ReportDetailPageProps = {
  reportId: string;
  onBack: () => void;
};

export function ReportDetailPage({ reportId, onBack }: ReportDetailPageProps) {
  const { language, t } = usePreferences();
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
          {t("detail.back")}
        </button>
        {error ? <div className="error-box">{error}</div> : <div className="empty-state">Loading report...</div>}
      </section>
    );
  }

  return (
    <section>
      <button className="link-button" onClick={onBack}>
        <ArrowLeft size={18} />
        {t("detail.back")}
      </button>

      <PageHeader
        eyebrow={report.reportId}
        title={`${report.vinLast8 || "Vehicle"} damage report`}
        description={`${report.damageArea} reported on ${new Date(report.timestamp).toLocaleString()}.`}
      />

      <div className="detail-layout">
        <div className="panel">
          <div className="detail-head">
            <h2>{t("detail.reportData")}</h2>
            <StatusBadge status={report.telegramStatus} />
          </div>
          <div className="review-grid">
            <DetailRow label={t("new.reviewVin")} value={report.vin || "-"} />
            <DetailRow label={t("new.reviewVis")} value={report.vinLast8 || "-"} />
            <DetailRow label={t("new.brand")} value={report.brand || "-"} />
            <DetailRow label={t("new.model")} value={report.model || "-"} />
            <DetailRow label={t("new.location")} value={report.location || "-"} />
            <DetailRow label={t("new.reportedBy")} value={report.reportedBy || "-"} />
            <DetailRow label={t("new.area")} value={areaByTelegramLabel(report.damageArea)?.label[language] || report.damageArea} />
            <DetailRow label={t("new.damageDescription")} value={report.damageDescription} />
            <DetailRow label={t("new.photos")} value={`${report.photos.length} archived in Telegram`} />
          </div>
          {report.telegramError && <div className="error-box">{report.telegramError}</div>}
        </div>

        <div className="panel">
          <h2>{t("detail.telegramArchive")}</h2>
          <p className="muted-copy">{t("detail.telegramArchiveHint")}</p>
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
