import type { Config } from "@netlify/functions";
import { getAuthorizedUser, isAccessCodeRequired } from "./_shared/auth";
import { error, json } from "./_shared/response";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return error("Method not allowed.", 405);
  }

  if (!isAccessCodeRequired()) {
    return json({ ok: true, accessRequired: false, user: { name: "" } });
  }

  const user = getAuthorizedUser(req);
  if (!user) {
    return error("Invalid access code.", 401);
  }

  return json({ ok: true, accessRequired: true, user });
};

export const config: Config = {
  path: "/api/auth",
};
