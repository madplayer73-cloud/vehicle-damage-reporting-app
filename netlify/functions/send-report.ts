import type { Config, Context } from "@netlify/functions";
import { error } from "./_shared/response";
import { hasValidAccessCode } from "./_shared/auth";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return error("Method not allowed.", 405);
  }

  if (!hasValidAccessCode(req)) {
    return error("Invalid access code.", 401);
  }

  return error("Photo resend is unavailable because photos are archived in Telegram only.", 410);
};

export const config: Config = {
  path: "/api/reports/:id/send",
};
