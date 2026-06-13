export type MenuItem = {
  id: string;
  name: string;
  duration?: string;
  asterisk?: boolean;
};

export const MENU: MenuItem[] = [
  { id: "hodebunn", name: "Hodebunnsmassasje", duration: "15 min" },
  { id: "nakke", name: "Nakkemassasje", duration: "15 min" },
  { id: "rygg", name: "Ryggmassasje", duration: "20 min" },
  { id: "fotbad", name: "Fotbad" },
  { id: "maske", name: "Ansiktsmaske" },
  { id: "harklipp", name: "Hårklipp" },
];

export const FOOTNOTES = [
  "Fotbad kan kombineres med alle tjenestene samtidig.",
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
