import type { Config, Context } from "@netlify/functions";
import { getReport, updateReport } from "./_shared/storage";
import { error, json } from "./_shared/response";
import { sendReportToTelegram } from "./_shared/telegram";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return error("Method not allowed.", 405);
  }

  const reportId = context.params.id;
  if (!reportId) {
    return error("Report ID is required.", 400);
  }

  const report = await getReport(reportId);
  if (!report) {
    return error("Report not found.", 404);
  }

  try {
    await sendReportToTelegram(report);
    return json(await updateReport({ ...report, telegramStatus: "sent", telegramError: undefined }));
  } catch (sendError) {
    return json(
      await updateReport({
        ...report,
        telegramStatus: "failed",
        telegramError: sendError instanceof Error ? sendError.message : "Telegram send failed.",
      }),
      502,
    );
  }
};

export const config: Config = {
  path: "/api/reports/:id/send",
};
