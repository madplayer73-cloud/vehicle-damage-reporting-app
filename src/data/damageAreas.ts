import type { Language } from "../lib/preferences";

export type DamageAreaId =
  | "frontBumper"
  | "rearBumper"
  | "leftFrontDoor"
  | "leftRearDoor"
  | "rightFrontDoor"
  | "rightRearDoor"
  | "hood"
  | "roof"
  | "trunk"
  | "leftFrontFender"
  | "rightFrontFender"
  | "leftRearQuarter"
  | "rightRearQuarter"
  | "windshield"
  | "wheelsTyres"
  | "interior"
  | "other";

export type DamageArea = {
  id: DamageAreaId;
  telegramLabel: string;
  label: Record<Language, string>;
  suggestions: Record<Language, string[]>;
};

export const DAMAGE_AREAS: DamageArea[] = [
  {
    id: "frontBumper",
    telegramLabel: "Front bumper",
    label: { en: "Front bumper", sk: "Predny naraznik", hu: "Elso lokharito" },
    suggestions: {
      en: ["Scratch on front bumper", "Dent on front bumper", "Crack on front bumper", "Paint damage on front bumper"],
      sk: ["Skrabanec na prednom narazniku", "Preliacina na prednom narazniku", "Prasklina na prednom narazniku", "Poskodeny lak na prednom narazniku"],
      hu: ["Karcolas az elso lokhariton", "Horpadás az elso lokhariton", "Repedes az elso lokhariton", "Fenyezes serules az elso lokhariton"],
    },
  },
  {
    id: "rearBumper",
    telegramLabel: "Rear bumper",
    label: { en: "Rear bumper", sk: "Zadny naraznik", hu: "Hatso lokharito" },
    suggestions: {
      en: ["Scratch on rear bumper", "Dent on rear bumper", "Crack on rear bumper", "Paint damage on rear bumper"],
      sk: ["Skrabanec na zadnom narazniku", "Preliacina na zadnom narazniku", "Prasklina na zadnom narazniku", "Poskodeny lak na zadnom narazniku"],
      hu: ["Karcolas a hatso lokhariton", "Horpadas a hatso lokhariton", "Repedes a hatso lokhariton", "Fenyezes serules a hatso lokhariton"],
    },
  },
  {
    id: "leftFrontDoor",
    telegramLabel: "Left front door",
    label: { en: "Left front door", sk: "Lave predne dvere", hu: "Bal elso ajto" },
    suggestions: {
      en: ["Scratch on left front door", "Dent on left front door", "Paint damage on door edge", "Damage near door handle"],
      sk: ["Skrabanec na lavych prednych dverach", "Preliacina na lavych prednych dverach", "Poskodeny lak na hrane dveri", "Poskodenie pri klucke dveri"],
      hu: ["Karcolas a bal elso ajton", "Horpadas a bal elso ajton", "Fenyezes serules az ajto elen", "Serules az ajtokilincsnel"],
    },
  },
  {
    id: "leftRearDoor",
    telegramLabel: "Left rear door",
    label: { en: "Left rear door", sk: "Lave zadne dvere", hu: "Bal hatso ajto" },
    suggestions: {
      en: ["Scratch on left rear door", "Dent on left rear door", "Paint damage on door edge", "Damage near lower door section"],
      sk: ["Skrabanec na lavych zadnych dverach", "Preliacina na lavych zadnych dverach", "Poskodeny lak na hrane dveri", "Poskodenie v spodnej casti dveri"],
      hu: ["Karcolas a bal hatso ajton", "Horpadas a bal hatso ajton", "Fenyezes serules az ajto elen", "Serules az ajto also reszen"],
    },
  },
  {
    id: "rightFrontDoor",
    telegramLabel: "Right front door",
    label: { en: "Right front door", sk: "Prave predne dvere", hu: "Jobb elso ajto" },
    suggestions: {
      en: ["Scratch on right front door", "Dent on right front door", "Paint damage on door edge", "Damage near door handle"],
      sk: ["Skrabanec na pravych prednych dverach", "Preliacina na pravych prednych dverach", "Poskodeny lak na hrane dveri", "Poskodenie pri klucke dveri"],
      hu: ["Karcolas a jobb elso ajton", "Horpadas a jobb elso ajton", "Fenyezes serules az ajto elen", "Serules az ajtokilincsnel"],
    },
  },
  {
    id: "rightRearDoor",
    telegramLabel: "Right rear door",
    label: { en: "Right rear door", sk: "Prave zadne dvere", hu: "Jobb hatso ajto" },
    suggestions: {
      en: ["Scratch on right rear door", "Dent on right rear door", "Paint damage on door edge", "Damage near lower door section"],
      sk: ["Skrabanec na pravych zadnych dverach", "Preliacina na pravych zadnych dverach", "Poskodeny lak na hrane dveri", "Poskodenie v spodnej casti dveri"],
      hu: ["Karcolas a jobb hatso ajton", "Horpadas a jobb hatso ajton", "Fenyezes serules az ajto elen", "Serules az ajto also reszen"],
    },
  },
  {
    id: "hood",
    telegramLabel: "Hood",
    label: { en: "Hood", sk: "Kapota", hu: "Motorhazteto" },
    suggestions: {
      en: ["Scratch on hood", "Dent on hood", "Stone chip on hood", "Paint damage on hood"],
      sk: ["Skrabanec na kapote", "Preliacina na kapote", "Oderok od kamienka na kapote", "Poskodeny lak na kapote"],
      hu: ["Karcolas a motorhazteton", "Horpadas a motorhazteton", "Kofelverodes a motorhazteton", "Fenyezes serules a motorhazteton"],
    },
  },
  {
    id: "roof",
    telegramLabel: "Roof",
    label: { en: "Roof", sk: "Strecha", hu: "Teto" },
    suggestions: {
      en: ["Scratch on roof", "Dent on roof", "Paint damage on roof", "Damage near roof edge"],
      sk: ["Skrabanec na streche", "Preliacina na streche", "Poskodeny lak na streche", "Poskodenie pri hrane strechy"],
      hu: ["Karcolas a teton", "Horpadas a teton", "Fenyezes serules a teton", "Serules a teto szelenel"],
    },
  },
  {
    id: "trunk",
    telegramLabel: "Trunk",
    label: { en: "Trunk", sk: "Kufor", hu: "Csomagterajto" },
    suggestions: {
      en: ["Scratch on trunk lid", "Dent on trunk lid", "Paint damage on trunk edge", "Damage near trunk handle"],
      sk: ["Skrabanec na veku kufra", "Preliacina na veku kufra", "Poskodeny lak na hrane kufra", "Poskodenie pri klucke kufra"],
      hu: ["Karcolas a csomagterajton", "Horpadas a csomagterajton", "Fenyezes serules a csomagterajto elen", "Serules a csomagterajto fogantyujanal"],
    },
  },
  {
    id: "leftFrontFender",
    telegramLabel: "Left front fender",
    label: { en: "Left front fender", sk: "Lavy predny blatnik", hu: "Bal elso sarvedo" },
    suggestions: {
      en: ["Scratch on left front fender", "Dent on left front fender", "Paint damage near wheel arch", "Damage on fender edge"],
      sk: ["Skrabanec na lavom prednom blatniku", "Preliacina na lavom prednom blatniku", "Poskodeny lak pri leme kolesa", "Poskodenie na hrane blatnika"],
      hu: ["Karcolas a bal elso sarvedon", "Horpadas a bal elso sarvedon", "Fenyezes serules a kerekivnel", "Serules a sarvedo elen"],
    },
  },
  {
    id: "rightFrontFender",
    telegramLabel: "Right front fender",
    label: { en: "Right front fender", sk: "Pravy predny blatnik", hu: "Jobb elso sarvedo" },
    suggestions: {
      en: ["Scratch on right front fender", "Dent on right front fender", "Paint damage near wheel arch", "Damage on fender edge"],
      sk: ["Skrabanec na pravom prednom blatniku", "Preliacina na pravom prednom blatniku", "Poskodeny lak pri leme kolesa", "Poskodenie na hrane blatnika"],
      hu: ["Karcolas a jobb elso sarvedon", "Horpadas a jobb elso sarvedon", "Fenyezes serules a kerekivnel", "Serules a sarvedo elen"],
    },
  },
  {
    id: "leftRearQuarter",
    telegramLabel: "Left rear quarter",
    label: { en: "Left rear quarter", sk: "Lavy zadny bok", hu: "Bal hatso oldalelem" },
    suggestions: {
      en: ["Scratch on left rear quarter", "Dent on left rear quarter", "Paint damage near rear wheel arch", "Damage on rear side panel"],
      sk: ["Skrabanec na lavom zadnom boku", "Preliacina na lavom zadnom boku", "Poskodeny lak pri zadnom leme kolesa", "Poskodenie na zadnom bocnom paneli"],
      hu: ["Karcolas a bal hatso oldalelemen", "Horpadas a bal hatso oldalelemen", "Fenyezes serules a hatso kerekivnel", "Serules a hatso oldalpanelemen"],
    },
  },
  {
    id: "rightRearQuarter",
    telegramLabel: "Right rear quarter",
    label: { en: "Right rear quarter", sk: "Pravy zadny bok", hu: "Jobb hatso oldalelem" },
    suggestions: {
      en: ["Scratch on right rear quarter", "Dent on right rear quarter", "Paint damage near rear wheel arch", "Damage on rear side panel"],
      sk: ["Skrabanec na pravom zadnom boku", "Preliacina na pravom zadnom boku", "Poskodeny lak pri zadnom leme kolesa", "Poskodenie na zadnom bocnom paneli"],
      hu: ["Karcolas a jobb hatso oldalelemen", "Horpadas a jobb hatso oldalelemen", "Fenyezes serules a hatso kerekivnel", "Serules a hatso oldalpanelemen"],
    },
  },
  {
    id: "windshield",
    telegramLabel: "Windshield",
    label: { en: "Windshield", sk: "Celne sklo", hu: "Szelvedo" },
    suggestions: {
      en: ["Stone chip on windshield", "Crack on windshield", "Scratch on windshield", "Damage near windshield edge"],
      sk: ["Oderok od kamienka na celnom skle", "Prasklina na celnom skle", "Skrabanec na celnom skle", "Poskodenie pri hrane celneho skla"],
      hu: ["Kofelverodes a szelvedon", "Repedes a szelvedon", "Karcolas a szelvedon", "Serules a szelvedo szelenel"],
    },
  },
  {
    id: "wheelsTyres",
    telegramLabel: "Wheels / tyres",
    label: { en: "Wheels / tyres", sk: "Kolesa / pneumatiky", hu: "Kerekek / gumik" },
    suggestions: {
      en: ["Scratch on wheel rim", "Damaged tyre sidewall", "Missing wheel cap", "Damage on wheel arch area"],
      sk: ["Skrabanec na disku kolesa", "Poskodena bocnica pneumatiky", "Chybajuca krytka kolesa", "Poskodenie v okoli kolesa"],
      hu: ["Karcolas a felnin", "Serult gumi oldalfal", "Hianyzo kerek kupak", "Serules a kerek kornyeken"],
    },
  },
  {
    id: "interior",
    telegramLabel: "Interior",
    label: { en: "Interior", sk: "Interier", hu: "Beltér" },
    suggestions: {
      en: ["Scratch in interior trim", "Stain on seat", "Damaged dashboard trim", "Missing interior part"],
      sk: ["Skrabanec na interierovom oblozeni", "Skvrna na sedadle", "Poskodene oblozenie palubnej dosky", "Chybajuca cast interieru"],
      hu: ["Karcolas a belso burkolaton", "Folt az ulesen", "Serult muszerfal burkolat", "Hianyzo belso alkatresz"],
    },
  },
  {
    id: "other",
    telegramLabel: "Other",
    label: { en: "Other", sk: "Ine", hu: "Egyeb" },
    suggestions: {
      en: ["Other visible damage", "Part is scratched", "Part is dented", "Paint damage visible"],
      sk: ["Ine viditelne poskodenie", "Diel je poskrabany", "Diel je preliaceny", "Viditelne poskodenie laku"],
      hu: ["Egyeb lathato serules", "Az alkatresz karcos", "Az alkatresz horpadt", "Lathato fenyezes serules"],
    },
  },
];

export function areaByTelegramLabel(telegramLabel: string): DamageArea | undefined {
  return DAMAGE_AREAS.find((area) => area.telegramLabel === telegramLabel);
}
