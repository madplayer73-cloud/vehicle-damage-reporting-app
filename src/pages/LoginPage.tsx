import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { saveAccessCode, verifyAccessCode } from "../lib/api";

type LoginPageProps = {
  onAuthenticated: () => void;
};

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await verifyAccessCode(accessCode.trim());
      saveAccessCode(accessCode.trim());
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
        <LockKeyhole size={34} />
        <div>
          <h1>Vehicle Damage Reporting App</h1>
          <p>Enter the access code provided by your logistics administrator.</p>
        </div>
        <label className="field">
          Access code
          <input
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Enter access code"
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button disabled={isSubmitting || !accessCode.trim()}>Enter app</button>
      </form>
    </main>
  );
}
