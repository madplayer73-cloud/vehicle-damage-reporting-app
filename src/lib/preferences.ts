import { createContext, useContext } from "react";

export type Language = "en" | "sk" | "hu";
export type Theme = "light" | "dark";

export type Preferences = {
  language: Language;
  theme: Theme;
};

export type PreferencesContextValue = Preferences & {
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: TranslationKey) => string;
};

const languageKey = "vehicle-damage-language";
const themeKey = "vehicle-damage-theme";

export const supportedLanguages: Array<{ code: Language; label: string }> = [
  { code: "en", label: "EN" },
  { code: "sk", label: "SK" },
  { code: "hu", label: "HU" },
];

export function loadPreferences(): Preferences {
  return {
    language: readLanguage(),
    theme: readTheme(),
  };
}

export function saveLanguage(language: Language): void {
  window.localStorage.setItem(languageKey, language);
}

export function saveTheme(theme: Theme): void {
  window.localStorage.setItem(themeKey, theme);
}

export const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error("PreferencesContext is missing.");
  }

  return value;
}

function readLanguage(): Language {
  const stored = window.localStorage.getItem(languageKey);
  return stored === "sk" || stored === "hu" || stored === "en" ? stored : "en";
}

function readTheme(): Theme {
  return window.localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
}

export type TranslationKey =
  | "app.subtitle"
  | "nav.newReport"
  | "nav.reports"
  | "nav.settings"
  | "nav.logout"
  | "new.eyebrow"
  | "new.title"
  | "new.description"
  | "new.fullVin"
  | "new.vis"
  | "new.brand"
  | "new.customInputHint"
  | "new.model"
  | "new.location"
  | "new.reportedBy"
  | "new.identifierConfirmed"
  | "new.area"
  | "new.damageDescription"
  | "new.uploadTitle"
  | "new.uploadHint"
  | "new.reviewVin"
  | "new.reviewVis"
  | "new.brandModel"
  | "new.photos"
  | "new.reportSaved"
  | "new.savedSent"
  | "new.savedFailed"
  | "new.back"
  | "new.continue"
  | "new.saveSend"
  | "new.openReport"
  | "new.scanWarning"
  | "new.validateVin"
  | "new.validateIdentifier"
  | "new.validateArea"
  | "new.validateDescription"
  | "new.validatePhotos"
  | "reports.eyebrow"
  | "reports.title"
  | "reports.description"
  | "reports.search"
  | "reports.filterBrand"
  | "reports.allAreas"
  | "reports.noReports"
  | "reports.reportId"
  | "reports.vis"
  | "reports.vehicle"
  | "reports.area"
  | "reports.status"
  | "detail.back"
  | "detail.reportData"
  | "detail.telegramArchive"
  | "detail.telegramArchiveHint"
  | "settings.eyebrow"
  | "settings.title"
  | "settings.description"
  | "settings.language"
  | "settings.languageHint"
  | "settings.theme"
  | "settings.light"
  | "settings.dark"
  | "settings.themeHint"
  | "settings.version"
  | "login.title"
  | "login.description"
  | "login.accessCode"
  | "login.placeholder"
  | "login.submit";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    "app.subtitle": "Reporting App",
    "nav.newReport": "New report",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    "new.eyebrow": "Guided workflow",
    "new.title": "New damage report",
    "new.description": "Create one structured vehicle damage report and send it to Telegram with photos attached.",
    "new.fullVin": "Full VIN",
    "new.vis": "VIS / VIN last 8",
    "new.brand": "Brand",
    "new.customInputHint": "Start typing to search, or enter a new value manually.",
    "new.model": "Model",
    "new.location": "Location",
    "new.reportedBy": "Reported by",
    "new.identifierConfirmed": "Vehicle identifier confirmed. Last 8 characters:",
    "new.area": "Area",
    "new.damageDescription": "Damage description",
    "new.uploadTitle": "Upload or take photos",
    "new.uploadHint": "JPG, JPEG and PNG are supported.",
    "new.reviewVin": "VIN",
    "new.reviewVis": "VIS / VIN last 8",
    "new.brandModel": "Brand/model",
    "new.photos": "Photos",
    "new.reportSaved": "Report is saved",
    "new.savedSent": "Photos are archived in Telegram and metadata is saved in the app.",
    "new.savedFailed": "Telegram sending needs attention; metadata is saved in the app.",
    "new.back": "Back",
    "new.continue": "Continue",
    "new.saveSend": "Save & send",
    "new.openReport": "Open report",
    "new.scanWarning": "Scanned code does not look like VIN or VIS. For a correct damage report, scan VIN/VIS or enter it manually.",
    "new.validateVin": "VIN must have exactly 17 characters.",
    "new.validateIdentifier": "Enter a full 17-character VIN or an 8-character VIS / VIN last 8.",
    "new.validateArea": "Select a damaged area.",
    "new.validateDescription": "Add a damage description.",
    "new.validatePhotos": "Add at least one photo.",
    "reports.eyebrow": "Admin",
    "reports.title": "Report list",
    "reports.description": "Search reports by VIN, last 8 characters, brand or damaged area.",
    "reports.search": "Search VIN or last 8",
    "reports.filterBrand": "Filter brand",
    "reports.allAreas": "All damage areas",
    "reports.noReports": "No reports found.",
    "reports.reportId": "Report ID",
    "reports.vis": "VIS / last 8",
    "reports.vehicle": "Vehicle",
    "reports.area": "Area",
    "reports.status": "Status",
    "detail.back": "Back to reports",
    "detail.reportData": "Report data",
    "detail.telegramArchive": "Telegram photo archive",
    "detail.telegramArchiveHint": "Photos are not stored in the app. Use the Telegram report thread as the photo archive.",
    "settings.eyebrow": "App settings",
    "settings.title": "Settings",
    "settings.description": "Manage display and language preferences.",
    "settings.language": "Language",
    "settings.languageHint": "Choose the active app language.",
    "settings.theme": "Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.themeHint": "Choose light or dark display mode.",
    "settings.version": "Version",
    "login.title": "Vehicle Damage Reporting App",
    "login.description": "Enter the access code provided by your logistics administrator.",
    "login.accessCode": "Access code",
    "login.placeholder": "Enter access code",
    "login.submit": "Enter app",
  },
  sk: {
    "app.subtitle": "Reportovacia aplikacia",
    "nav.newReport": "Novy report",
    "nav.reports": "Reporty",
    "nav.settings": "Nastavenia",
    "nav.logout": "Odhlasit",
    "new.eyebrow": "Riadeny proces",
    "new.title": "Novy skodovy report",
    "new.description": "Vytvor strukturovany report poskodenia vozidla a odosli ho do Telegramu s fotkami.",
    "new.fullVin": "Cely VIN",
    "new.vis": "VIS / poslednych 8 z VIN",
    "new.brand": "Znacka",
    "new.customInputHint": "Zacni pisat pre vyhladavanie, alebo zadaj novu hodnotu rucne.",
    "new.model": "Model",
    "new.location": "Lokalita",
    "new.reportedBy": "Nahlasil",
    "new.identifierConfirmed": "Identifikator vozidla potvrdeny. Poslednych 8 znakov:",
    "new.area": "Miesto poskodenia",
    "new.damageDescription": "Popis poskodenia",
    "new.uploadTitle": "Nahraj alebo odfot fotky",
    "new.uploadHint": "Podporovane su JPG, JPEG a PNG.",
    "new.reviewVin": "VIN",
    "new.reviewVis": "VIS / poslednych 8 z VIN",
    "new.brandModel": "Znacka/model",
    "new.photos": "Fotky",
    "new.reportSaved": "Report je ulozeny",
    "new.savedSent": "Fotky su archivovane v Telegrame a metadata su ulozene v aplikacii.",
    "new.savedFailed": "Odoslanie do Telegramu vyzaduje kontrolu; metadata su ulozene v aplikacii.",
    "new.back": "Spat",
    "new.continue": "Pokracovat",
    "new.saveSend": "Ulozit a odoslat",
    "new.openReport": "Otvorit report",
    "new.scanWarning": "Naskenovany kod nevyzera ako VIN alebo VIS. Pre korektny damage report naskenuj VIN/VIS alebo ho napis rucne.",
    "new.validateVin": "VIN musi mat presne 17 znakov.",
    "new.validateIdentifier": "Zadaj cely 17-znakovy VIN alebo 8-znakovy VIS / poslednych 8 z VIN.",
    "new.validateArea": "Vyber miesto poskodenia.",
    "new.validateDescription": "Dopln popis poskodenia.",
    "new.validatePhotos": "Pridaj aspon jednu fotku.",
    "reports.eyebrow": "Admin",
    "reports.title": "Zoznam reportov",
    "reports.description": "Vyhladavanie podla VIN, poslednych 8 znakov, znacky alebo miesta poskodenia.",
    "reports.search": "Hladat VIN alebo poslednych 8",
    "reports.filterBrand": "Filtrovat znacku",
    "reports.allAreas": "Vsetky miesta poskodenia",
    "reports.noReports": "Nenasli sa ziadne reporty.",
    "reports.reportId": "Report ID",
    "reports.vis": "VIS / poslednych 8",
    "reports.vehicle": "Vozidlo",
    "reports.area": "Miesto",
    "reports.status": "Status",
    "detail.back": "Spat na reporty",
    "detail.reportData": "Data reportu",
    "detail.telegramArchive": "Telegram archiv fotiek",
    "detail.telegramArchiveHint": "Fotky nie su ulozene v aplikacii. Ako archiv fotiek pouzi Telegram vlakno reportu.",
    "settings.eyebrow": "Nastavenia aplikacie",
    "settings.title": "Nastavenia",
    "settings.description": "Sprava jazyka a zobrazenia.",
    "settings.language": "Jazyk",
    "settings.languageHint": "Vyber aktivny jazyk aplikacie.",
    "settings.theme": "Tema",
    "settings.light": "Svetla",
    "settings.dark": "Tmava",
    "settings.themeHint": "Vyber svetly alebo tmavy rezim.",
    "settings.version": "Verzia",
    "login.title": "Vehicle Damage Reporting App",
    "login.description": "Zadaj pristupovy kod od logistickeho administratora.",
    "login.accessCode": "Pristupovy kod",
    "login.placeholder": "Zadaj pristupovy kod",
    "login.submit": "Vstupit",
  },
  hu: {
    "app.subtitle": "Karbejelento app",
    "nav.newReport": "Uj riport",
    "nav.reports": "Riportok",
    "nav.settings": "Beallitasok",
    "nav.logout": "Kilepes",
    "new.eyebrow": "Vezetett folyamat",
    "new.title": "Uj karjelentes",
    "new.description": "Hozz letre strukturalt jarmu karjelentest es kuldd el Telegramra fotokkal.",
    "new.fullVin": "Teljes VIN",
    "new.vis": "VIS / VIN utolso 8",
    "new.brand": "Marka",
    "new.customInputHint": "Kezdj el gepelni a kereseshez, vagy adj meg uj erteket kezzel.",
    "new.model": "Modell",
    "new.location": "Helyszin",
    "new.reportedBy": "Jelentette",
    "new.identifierConfirmed": "Jarmu azonosito megerositve. Utolso 8 karakter:",
    "new.area": "Sérült resz",
    "new.damageDescription": "Kar leirasa",
    "new.uploadTitle": "Fotok feltoltese vagy keszitese",
    "new.uploadHint": "JPG, JPEG es PNG tamogatott.",
    "new.reviewVin": "VIN",
    "new.reviewVis": "VIS / VIN utolso 8",
    "new.brandModel": "Marka/modell",
    "new.photos": "Fotok",
    "new.reportSaved": "Riport elmentve",
    "new.savedSent": "A fotok Telegramban vannak archivalva, a metaadatok az appban elmentve.",
    "new.savedFailed": "A Telegram kuldest ellenorizni kell; a metaadatok elmentve.",
    "new.back": "Vissza",
    "new.continue": "Tovabb",
    "new.saveSend": "Mentes es kuldes",
    "new.openReport": "Riport megnyitasa",
    "new.scanWarning": "A beolvasott kod nem VIN vagy VIS. Helyes karjelenteshez olvasd be a VIN/VIS kodot, vagy ird be kezzel.",
    "new.validateVin": "A VIN pontosan 17 karakter legyen.",
    "new.validateIdentifier": "Adj meg teljes 17 karakteres VIN-t vagy 8 karakteres VIS / VIN utolso 8-at.",
    "new.validateArea": "Valassz serult reszt.",
    "new.validateDescription": "Add meg a kar leirasat.",
    "new.validatePhotos": "Adj hozza legalabb egy fotot.",
    "reports.eyebrow": "Admin",
    "reports.title": "Riport lista",
    "reports.description": "Kereses VIN, utolso 8 karakter, marka vagy serult resz alapjan.",
    "reports.search": "VIN vagy utolso 8 keresese",
    "reports.filterBrand": "Marka szurese",
    "reports.allAreas": "Osszes serult resz",
    "reports.noReports": "Nincs talalat.",
    "reports.reportId": "Riport ID",
    "reports.vis": "VIS / utolso 8",
    "reports.vehicle": "Jarmu",
    "reports.area": "Resz",
    "reports.status": "Statusz",
    "detail.back": "Vissza a riportokhoz",
    "detail.reportData": "Riport adatok",
    "detail.telegramArchive": "Telegram foto archivum",
    "detail.telegramArchiveHint": "A fotok nincsenek az appban tarolva. A Telegram riport szal a foto archivum.",
    "settings.eyebrow": "App beallitasok",
    "settings.title": "Beallitasok",
    "settings.description": "Nyelv es megjelenes kezelese.",
    "settings.language": "Nyelv",
    "settings.languageHint": "Valaszd ki az aktiv nyelvet.",
    "settings.theme": "Tema",
    "settings.light": "Vilagos",
    "settings.dark": "Sotet",
    "settings.themeHint": "Valassz vilagos vagy sotet modot.",
    "settings.version": "Verzio",
    "login.title": "Vehicle Damage Reporting App",
    "login.description": "Add meg a logisztikai administrator altal adott hozzaferesi kodot.",
    "login.accessCode": "Hozzaferesi kod",
    "login.placeholder": "Kod megadasa",
    "login.submit": "Belepes",
  },
};
