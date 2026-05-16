import type { Config, Context } from "@netlify/functions";
import { readPhoto } from "./_shared/storage";

export default async (_req: Request, context: Context) => {
  const filename = context.params.filename;
  if (!filename) {
    return new Response("Photo filename is required.", { status: 400 });
  }

  const photo = await readPhoto(filename);
  if (!photo) {
    return new Response("Photo not found.", { status: 404 });
  }

  return new Response(photo.body, {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "private, max-age=300",
    },
  });
};

export const config: Config = {
  path: "/api/photos/:filename",
};
