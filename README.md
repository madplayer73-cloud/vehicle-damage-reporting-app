# Vehicle Damage Reporting App

MVP web app for structured vehicle damage reporting in automotive logistics. The app guides a reporter through VIN entry, damaged area selection, photo upload, review, local storage and Telegram sending.

## Stack

- Vite + React + TypeScript
- Netlify Functions for API routes
- Local JSON file storage for MVP
- Telegram Bot API for report delivery

## Install Dependencies

```bash
npm install
```

## Run Locally

Use Netlify Dev so frontend and serverless API routes run together:

```bash
npm run netlify:dev
```

The app will be available at the local URL printed by Netlify CLI.

## Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Set:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
REPORT_STORAGE_DRIVER=local
REPORT_STORAGE_DIR=./local-data
```

Secrets must stay in `.env` or Netlify environment variables. Do not commit real tokens.

## Create a Telegram Bot

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`.
3. Follow the prompts and choose a bot name and username.
4. Copy the bot token from BotFather.
5. Put the token into `.env` as `TELEGRAM_BOT_TOKEN`.

## Get TELEGRAM_CHAT_ID

For a direct chat:

1. Send any message to your new bot.
2. Open this URL in a browser, replacing the token:

```text
https://api.telegram.org/botYOUR_TOKEN/getUpdates
```

3. Find `message.chat.id` in the JSON response.
4. Add that value to `.env` as `TELEGRAM_CHAT_ID`.

For a group:

1. Add the bot to the group.
2. Send a message in the group.
3. Open the same `getUpdates` URL.
4. Use the group `chat.id`, which usually starts with `-`.

## Test Sending a Report

1. Start the app with `npm run netlify:dev`.
2. Open `/new-report`.
3. Enter a 17-character VIN.
4. Select a damaged area.
5. Add a description.
6. Upload at least one JPG, JPEG or PNG.
7. Save the report.
8. Click `Send to Telegram`.

The app sends a text summary first, then each photo as an attachment.

## Local Storage

For local development, reports are saved in:

```text
local-data/reports.json
```

Photos are saved in:

```text
local-data/photos/
```

These files are ignored by Git.

On Netlify production, leave `REPORT_STORAGE_DRIVER` unset or set it to `blobs`. The app then uses Netlify Blobs for durable report and photo storage.

## API Routes

- `GET /api/reports` lists all reports
- `POST /api/reports` creates a report from multipart form data
- `GET /api/reports/:id` returns report detail
- `POST /api/reports/:id/send` sends a saved report to Telegram
- `GET /api/photos/:filename` serves locally stored photos

## Known Limitations

- Local JSON storage is for MVP and local testing only.
- Production deploys should use Netlify Blobs, which is the default on Netlify.
- No user login or role permissions yet.
- No VIN OCR, barcode scanning, PDF export or Excel export yet.
- Telegram sending depends on bot permissions and correct chat ID.

## Next Development Steps

1. Replace local JSON storage with a cloud database and durable file storage.
2. Add user login and roles: admin, viewer and reporter.
3. Add damage workflow states: new, checked, approved, rejected and closed.
4. Add VIN OCR and QR/barcode scanning.
5. Add car silhouette damage selection.
6. Add PDF report generation and Excel export.
7. Add customer portal and report sharing.
