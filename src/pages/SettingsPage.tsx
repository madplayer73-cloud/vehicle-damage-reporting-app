import { Moon, Sun } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export function SettingsPage() {
  return (
    <section>
      <PageHeader
        eyebrow="App settings"
        title="Settings"
        description="Prepare display and language preferences for the next development phase."
      />

      <div className="settings-grid">
        <div className="panel">
          <h2>Language</h2>
          <div className="segmented-control" aria-label="Language selection">
            <button className="active">EN</button>
            <button disabled>SK</button>
            <button disabled>HU</button>
          </div>
          <p className="muted-copy">English is active. Slovak and Hungarian translations are planned for V_1.</p>
        </div>

        <div className="panel">
          <h2>Theme</h2>
          <div className="segmented-control" aria-label="Theme selection">
            <button className="active">
              <Sun size={17} />
              Light
            </button>
            <button disabled>
              <Moon size={17} />
              Dark
            </button>
          </div>
          <p className="muted-copy">Light mode is active. Dark mode is prepared as a future setting.</p>
        </div>

        <div className="panel">
          <h2>Version</h2>
          <div className="version-card">
            <strong>Beta V_0</strong>
            <span>Vehicle Damage Reporting App MVP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
