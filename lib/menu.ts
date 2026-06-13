export type MenuItem = {
  id: string;
  name: string;
  duration?: string;
  asterisk?: boolean;
};

export const MENU: MenuItem[] = [
  { id: "hodebunn", name: "Hodebunnsmassasje", duration: "15 min" },
  { id: "nakke", name: "Nakkemassasje", duration: "15 min" },
  { id: "fotbad", name: "Fotbad" },
  { id: "maske-leire", name: "Ansiktsmaske (leire)", duration: "10–15 min" },
  { id: "maske-maske", name: "Ansiktsmaske (maske)", duration: "20 min+" },
  { id: "harklipp", name: "Hårklipp" },
  { id: "rygg", name: "Ryggmassasje", duration: "20 min" },
];

export const FOOTNOTES = [
  "Fotbad kan kombineres med alle tjenestene samtidig.",
  "Ansiktsmaske kan kombineres med alle tjenester bortsett fra ryggmassasje.",
];

export const MAX_ANTALL = 9;

/** Standard betaling som ligger inne for alle bestillinger */
export const DEFAULT_BETALING = ["Sjokolade 🍫"];

export type OrderLine = {
  item: MenuItem;
  antall: number;
};

export function antallTotalt(lines: OrderLine[]) {
  return lines.reduce((sum, l) => sum + l.antall, 0);
}
