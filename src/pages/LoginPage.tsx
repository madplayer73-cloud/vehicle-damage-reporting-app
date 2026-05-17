import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { saveAccessCode, saveUserName, verifyAccessCode } from "../lib/api";
import { usePreferences } from "../lib/preferences";

type LoginPageProps = {
  onAuthenticated: () => void;
};

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const { t } = usePreferences();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const auth = await verifyAccessCode(accessCode.trim());
      saveAccessCode(accessCode.trim());
      saveUserName(auth.user.name);
      onAuthenticated();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Access denied.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-shell">
      <form className="login-panel" onSubmit={submit}>
        <div className="brand-mark">DR</div>
        <div className="version-badge light">Beta V_0</div>
        <LockKeyhole size={34} />
        <div>
          <h1>{t("login.title")}</h1>
          <p>{t("login.description")}</p>
        </div>
        <label className="field">
          {t("login.accessCode")}
          <input
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder={t("login.placeholder")}
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button disabled={isSubmitting || !accessCode.trim()}>{t("login.submit")}</button>
      </form>
    </main>
  );
}
