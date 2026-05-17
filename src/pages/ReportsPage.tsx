import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listReports } from "../lib/api";
import type { Report } from "../lib/types";
import { areaByTelegramLabel, DAMAGE_AREAS } from "../data/damageAreas";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { usePreferences } from "../lib/preferences";

type ReportsPageProps = {
  onOpen: (reportId: string) => void;
};

export function ReportsPage({ onOpen }: ReportsPageProps) {
  const { language, t } = usePreferences();
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listReports()
      .then(setReports)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load reports."));
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesQuery =
        !normalizedQuery ||
        report.vin.toLowerCase().includes(normalizedQuery) ||
        report.vinLast8.toLowerCase().includes(normalizedQuery);
      const matchesBrand = !brand || report.brand.toLowerCase().includes(brand.toLowerCase());
      const matchesArea = !area || report.damageArea === area;
      return matchesQuery && matchesBrand && matchesArea;
    });
  }, [area, brand, query, reports]);

  return (
    <section>
      <PageHeader
        eyebrow={t("reports.eyebrow")}
        title={t("reports.title")}
        description={t("reports.description")}
      />

      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("reports.search")} />
        </label>
        <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder={t("reports.filterBrand")} />
        <select value={area} onChange={(event) => setArea(event.target.value)}>
          <option value="">{t("reports.allAreas")}</option>
          {DAMAGE_AREAS.map((damageArea) => (
            <option key={damageArea.id} value={damageArea.telegramLabel}>
              {damageArea.label[language]}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-card">
        <div className="table-header">
          <span>{t("reports.reportId")}</span>
          <span>{t("reports.vis")}</span>
          <span>{t("reports.vehicle")}</span>
          <span>{t("reports.area")}</span>
          <span>{t("reports.status")}</span>
        </div>

        {filteredReports.length === 0 && <div className="empty-state">{t("reports.noReports")}</div>}

        {filteredReports.map((report) => (
          <button key={report.reportId} className="table-row" onClick={() => onOpen(report.reportId)}>
            <strong>{report.reportId}</strong>
            <span>{report.vinLast8}</span>
            <span>{[report.brand, report.model].filter(Boolean).join(" ") || "-"}</span>
            <span>{areaByTelegramLabel(report.damageArea)?.label[language] || report.damageArea}</span>
            <StatusBadge status={report.telegramStatus} />
          </button>
        ))}
      </div>
    </section>
  );
}
