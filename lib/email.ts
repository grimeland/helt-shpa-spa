import { OrderLine } from "./menu";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://helt-shpa-spa.vercel.app";

type OrderEmail = {
  lines: OrderLine[];
  navn: string;
  tidspunkt: string;
  /** Hva spaet får igjen, som tags */
  betaling: string[];
  melding: string;
  /** Lenke til bekreftelsessiden – gir «Bekreft bestilling»-knapp i e-posten */
  confirmUrl?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOrderEmail({ lines, navn, tidspunkt, betaling, melding, confirmUrl }: OrderEmail) {

  const rows = lines
    .map(
      (l) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 2px dotted #d9beb6; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; color: #8e4a44;">
            ${l.antall} × ${escapeHtml(l.item.name)}${l.item.asterisk ? " *" : ""}
          </td>
          <td align="right" style="padding: 10px 0; border-bottom: 2px dotted #d9beb6;"></td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin: 0; padding: 0; background-color: #f3efe8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3efe8; padding: 40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px;">

        <tr><td align="center" style="padding-bottom: 28px;">
          <img src="${SITE_URL}/hss-logo-email.png" width="220" height="87" alt="Helt Shpa Spa" style="display: block; margin: 0 auto;">
        </td></tr>

        <tr><td style="background-color: #fbf9f4; border-radius: 16px; padding: 36px 36px 30px;">
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #8e4a44;">
            Ny bestilling
          </div>
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #ab7b74; padding-top: 6px; padding-bottom: 22px;">
            fra ${escapeHtml(navn)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>

          <div style="padding-top: 22px;">
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #ab7b74;">Betaling</div>
            <div style="padding-top: 8px;">
              ${
                betaling.length > 0
                  ? betaling
                      .map(
                        (t) =>
                          `<span style="display: inline-block; background-color: #f0ddd4; color: #8e4a44; border-radius: 999px; padding: 6px 14px; margin: 0 6px 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px;">${escapeHtml(t)}</span>`
                      )
                      .join("")
                  : `<span style="font-family: Georgia, 'Times New Roman', serif; font-size: 15px; color: #8e4a44;">På huset</span>`
              }
            </div>
          </div>

          ${
            tidspunkt
              ? `<div style="padding-top: 26px;">
                   <div style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #ab7b74;">Ønsket tidspunkt</div>
                   <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 17px; color: #8e4a44; padding-top: 4px;">${escapeHtml(tidspunkt)}</div>
                 </div>`
              : ""
          }

          ${
            melding
              ? `<div style="padding-top: 20px;">
                   <div style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #ab7b74;">Hilsen til spaet</div>
                   <div style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 17px; color: #8e4a44; padding-top: 4px;">«${escapeHtml(melding)}»</div>
                 </div>`
              : ""
          }

          ${
            confirmUrl
              ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 30px auto 4px;">
                   <tr><td style="border-radius: 999px; background-color: #e2622b;">
                     <a href="${confirmUrl}" style="display: inline-block; padding: 14px 36px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #fbf9f4; text-decoration: none; border-radius: 999px;">Bekreft bestilling</a>
                   </td></tr>
                 </table>`
              : ""
          }

          <div style="text-align: center; padding-top: 22px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #ab7b74;">
            Ønsker du å sende din egen bestilling?
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 10px auto 0;">
            <tr><td style="border-radius: 999px; background-color: #e2622b;">
              <a href="${SITE_URL}" style="display: inline-block; padding: 10px 26px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #fbf9f4; text-decoration: none; border-radius: 999px;">Besøk Helt Shpa Spa</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td align="center" style="padding-top: 24px;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #ab7b74; line-height: 1.7;">
            Betaling skjer ved oppmøte · Ingen refusjon på kos
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return html;
}

export function buildConfirmedEmail({ lines, navn, tidspunkt, betaling }: Omit<OrderEmail, "melding" | "confirmUrl">) {
  const rows = lines
    .map(
      (l) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 2px dotted #d9beb6; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; color: #8e4a44;">
            ${l.antall} × ${escapeHtml(l.item.name)}${l.item.asterisk ? " *" : ""}
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin: 0; padding: 0; background-color: #f3efe8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3efe8; padding: 40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px;">

        <tr><td align="center" style="padding-bottom: 28px;">
          <img src="${SITE_URL}/hss-logo-email.png" width="220" height="87" alt="Helt Shpa Spa" style="display: block; margin: 0 auto;">
        </td></tr>

        <tr><td style="background-color: #fbf9f4; border-radius: 16px; padding: 36px 36px 30px;">
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #8e4a44;">
            Bestillingen er bekreftet ✨
          </div>
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #ab7b74; padding-top: 6px; padding-bottom: 22px;">
            Hei ${escapeHtml(navn)} – Helt Shpa Spa gleder seg til å ta imot deg${tidspunkt ? `: ${escapeHtml(tidspunkt)}` : ""}.
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>

          ${
            betaling.length > 0
              ? `<div style="padding-top: 22px;">
                   <div style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #ab7b74;">Husk betalingen</div>
                   <div style="padding-top: 8px;">
                     ${betaling
                       .map(
                         (t) =>
                           `<span style="display: inline-block; background-color: #f0ddd4; color: #8e4a44; border-radius: 999px; padding: 6px 14px; margin: 0 6px 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px;">${escapeHtml(t)}</span>`
                       )
                       .join("")}
                   </div>
                 </div>`
              : ""
          }
        </td></tr>

        <tr><td align="center" style="padding-top: 24px;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #ab7b74; line-height: 1.7;">
            Helt Shpa Spa · Ingen refusjon på kos
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
