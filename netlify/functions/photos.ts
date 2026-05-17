import type { Config, Context } from "@netlify/functions";

export default async (_req: Request, _context: Context) => {
  return new Response("Photos are archived in Telegram only.", { status: 410 });
};

export const config: Config = {
  path: "/api/photos/:filename",
};
