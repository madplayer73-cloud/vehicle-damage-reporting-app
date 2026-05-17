import { useEffect, useMemo, useState } from "react";
import { ClipboardList, FilePlus2, LogOut, Settings } from "lucide-react";
import { NewReportPage } from "./pages/NewReportPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
import { clearAccessCode, getAccessCode } from "./lib/api";

type Route =
  | { name: "new-report" }
  | { name: "reports" }
  | { name: "settings" }
  | { name: "report-detail"; id: string };

export function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessCode()));

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const route = useMemo<Route>(() => {
    const detailMatch = path.match(/^\/reports\/([^/]+)$/);
    if (detailMatch) {
      return { name: "report-detail", id: decodeURIComponent(detailMatch[1]) };
    }

    if (path === "/reports") {
      return { name: "reports" };
    }

    if (path === "/settings") {
      return { name: "settings" };
    }

    return { name: "new-report" };
  }, [path]);

  const navigate = (nextPath: string) => {
    window.history.pushState(null, "", nextPath);
    setPath(nextPath);
  };

  const logout = () => {
    clearAccessCode();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">DR</div>
          <div>
            <strong>Vehicle Damage</strong>
            <span>Reporting App</span>
          </div>
        </div>
        <div className="version-badge">Beta V_0</div>

        <nav className="nav-list" aria-label="Main navigation">
          <button className={route.name === "new-report" ? "active" : ""} onClick={() => navigate("/new-report")}>
            <FilePlus2 size={18} />
            New report
          </button>
          <button className={route.name !== "new-report" ? "active" : ""} onClick={() => navigate("/reports")}>
            <ClipboardList size={18} />
            Reports
          </button>
          <button className={route.name === "settings" ? "active" : ""} onClick={() => navigate("/settings")}>
            <Settings size={18} />
            Settings
          </button>
          <button onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {route.name === "new-report" && <NewReportPage onCreated={(id) => navigate(`/reports/${id}`)} />}
        {route.name === "reports" && <ReportsPage onOpen={(id) => navigate(`/reports/${id}`)} />}
        {route.name === "settings" && <SettingsPage />}
        {route.name === "report-detail" && <ReportDetailPage reportId={route.id} onBack={() => navigate("/reports")} />}
      </main>
    </div>
  );
}
