import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listReports } from "../lib/api";
import type { Report } from "../lib/types";
import { DAMAGE_AREAS } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

type ReportsPageProps = {
  onOpen: (reportId: string) => void;
};

export function ReportsPage({ onOpen }: ReportsPageProps) {
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
        eyebrow="Admin"
        title="Report list"
        description="Search reports by VIN, last 8 characters, brand or damaged area."
      />

      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search VIN or last 8" />
        </label>
        <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Filter brand" />
        <select value={area} onChange={(event) => setArea(event.target.value)}>
          <option value="">All damage areas</option>
          {DAMAGE_AREAS.map((damageArea) => (
            <option key={damageArea} value={damageArea}>
              {damageArea}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-card">
        <div className="table-header">
          <span>Report ID</span>
          <span>VIS / last 8</span>
          <span>Vehicle</span>
          <span>Area</span>
          <span>Status</span>
        </div>

        {filteredReports.length === 0 && <div className="empty-state">No reports found.</div>}

        {filteredReports.map((report) => (
          <button key={report.reportId} className="table-row" onClick={() => onOpen(report.reportId)}>
            <strong>{report.reportId}</strong>
            <span>{report.vinLast8}</span>
            <span>{[report.brand, report.model].filter(Boolean).join(" ") || "-"}</span>
            <span>{report.damageArea}</span>
            <StatusBadge status={report.telegramStatus} />
          </button>
        ))}
      </div>
    </section>
  );
}
