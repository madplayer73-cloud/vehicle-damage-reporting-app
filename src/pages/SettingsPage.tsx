import { Moon, Sun } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { supportedLanguages, usePreferences, type Theme } from "../lib/preferences";

export function SettingsPage() {
  const { language, setLanguage, setTheme, t, theme } = usePreferences();
  const themes: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: t("settings.light"), icon: Sun },
    { value: "dark", label: t("settings.dark"), icon: Moon },
  ];

  return (
    <section>
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="settings-grid">
        <div className="panel">
          <h2>{t("settings.language")}</h2>
          <div className="segmented-control" aria-label="Language selection">
            {supportedLanguages.map((option) => (
              <button
                key={option.code}
                className={language === option.code ? "active" : ""}
                onClick={() => setLanguage(option.code)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="muted-copy">{t("settings.languageHint")}</p>
        </div>

        <div className="panel">
          <h2>{t("settings.theme")}</h2>
          <div className="segmented-control" aria-label="Theme selection">
            {themes.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  className={theme === option.value ? "active" : ""}
                  onClick={() => setTheme(option.value)}
                >
                  <Icon size={17} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="muted-copy">{t("settings.themeHint")}</p>
        </div>

        <div className="panel">
          <h2>{t("settings.version")}</h2>
          <div className="version-card">
            <strong>Beta V_0</strong>
            <span>Vehicle Damage Reporting App MVP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
