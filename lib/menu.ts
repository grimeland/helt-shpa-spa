export type MenuItem = {
  id: string;
  name: string;
  asterisk?: boolean;
};

export const MENU: MenuItem[] = [
  { id: "hodebunn", name: "Hodebunnsmassasje" },
  { id: "nakke", name: "Nakkemassasje" },
  { id: "rygg", name: "Ryggmassasje" },
  { id: "fotbad", name: "Fotbad" },
  { id: "maske", name: "Ansiktsmaske" },
  { id: "harklipp", name: "Hårklipp" },
];

export const FOOTNOTES: string[] = [];

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
