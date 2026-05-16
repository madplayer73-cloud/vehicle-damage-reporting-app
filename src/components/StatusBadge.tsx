import type { TelegramStatus } from "../lib/types";

type StatusBadgeProps = {
  status: TelegramStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}
