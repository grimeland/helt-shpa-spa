"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  MENU,
  FOOTNOTES,
  MAX_ANTALL,
  DEFAULT_BETALING,
  MenuItem,
  OrderLine,
  antallTotalt,
} from "@/lib/menu";

function Bakgrunn() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Image
        src="/bak_bilde.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}

function Sun({ className }: { className?: string }) {
  // Håndtegnet sol, som på originalmenyen
  const rays = [
    "M50 6 L50 16", "M72 12 L67 21", "M88 28 L80 34", "M94 50 L84 50",
    "M88 72 L80 66", "M72 88 L67 79", "M50 94 L50 84", "M28 88 L33 79",
    "M12 72 L20 66", "M6 50 L16 50", "M12 28 L20 34", "M28 12 L33 21",
  ];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
        {rays.map((d, i) => (
          <path key={i} d={d} transform={`rotate(${(i % 3) * 2 - 2} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="17" strokeWidth="3" />
      </g>
    </svg>
  );
}

function Stepper({
  item,
  antall,
  onChange,
}: {
  item: MenuItem;
  antall: number;
  onChange: (antall: number) => void;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-paper-deep p-1 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, antall - 1))}
        disabled={antall === 0}
        aria-label={`Færre ${item.name}`}
        className="h-8 w-8 rounded-full bg-cream text-ink flex items-center justify-center transition-opacity disabled:opacity-35 hover:bg-white focus-visible:outline-2 focus-visible:outline-cocoa"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          <path d="M2 6 H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <span
        className={`w-7 text-center tabular-nums ${antall > 0 ? "text-ink font-semibold" : "text-ink-soft"}`}
        aria-live="polite"
      >
        {antall}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_ANTALL, antall + 1))}
        disabled={antall === MAX_ANTALL}
        aria-label={`Flere ${item.name}`}
        className="h-8 w-8 rounded-full bg-cream text-ink flex items-center justify-center transition-opacity disabled:opacity-35 hover:bg-white focus-visible:outline-2 focus-visible:outline-cocoa"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          <path d="M6 2 V10 M2 6 H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

export default function Home() {
  const [antall, setAntall] = useState<Record<string, number>>({});
  const [egne, setEgne] = useState<MenuItem[]>([]);
  const [nyttItem, setNyttItem] = useState<string | null>(null);
  const [navn, setNavn] = useState("");
  const [tidspunkt, setTidspunkt] = useState("");
  const [betalingTags, setBetalingTags] = useState<string[]>(DEFAULT_BETALING);
  const [nyTag, setNyTag] = useState<string | null>(null);
  const [melding, setMelding] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const alleItems = useMemo(() => [...MENU, ...egne], [egne]);

  const linjer: OrderLine[] = useMemo(
    () =>
      alleItems
        .filter((i) => (antall[i.id] ?? 0) > 0)
        .map((i) => ({ item: i, antall: antall[i.id] })),
    [alleItems, antall]
  );

  const kombinasjonsHint =
    (antall["rygg"] ?? 0) > 0 &&
    ((antall["maske-leire"] ?? 0) > 0 || (antall["maske-maske"] ?? 0) > 0);

  function settAntall(id: string, n: number) {
    setAntall((prev) => ({ ...prev, [id]: n }));
  }

  function fjernTag(tag: string) {
    setBetalingTags((prev) => prev.filter((t) => t !== tag));
  }

  function lagreNyttItem() {
    const t = nyttItem?.trim();
    if (t && !alleItems.some((i) => i.name.toLowerCase() === t.toLowerCase())) {
      const id = `egen-${t.toLowerCase().replace(/[^a-zæøå0-9]+/gi, "-")}`;
      setEgne((prev) => [...prev, { id, name: t }]);
      setAntall((prev) => ({ ...prev, [id]: 1 }));
    }
    setNyttItem(null);
  }

  function fjernItem(id: string) {
    setEgne((prev) => prev.filter((i) => i.id !== id));
    setAntall((prev) => ({ ...prev, [id]: 0 }));
  }

  function lagreNyTag() {
    const t = nyTag?.trim();
    if (t && !betalingTags.includes(t)) {
      setBetalingTags((prev) => [...prev, t]);
    }
    setNyTag(null);
  }

  async function bestill(e: React.FormEvent) {
    e.preventDefault();
    if (linjer.length === 0 || status === "sending") return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const mottaker = submitter?.value === "eline" ? "eline" : "erlend";
    setStatus("sending");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: linjer
            .filter((l) => !l.item.id.startsWith("egen-"))
            .map((l) => ({ id: l.item.id, antall: l.antall })),
          egne: linjer
            .filter((l) => l.item.id.startsWith("egen-"))
            .map((l) => ({ name: l.item.name, antall: l.antall })),
          navn,
          tidspunkt,
          betaling: betalingTags,
          melding,
          mottaker,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <main className="flex-1 flex items-center justify-center px-6 min-h-screen">
        <Bakgrunn />
        <div className="max-w-md text-center animate-fade-up bg-paper rounded-3xl px-8 py-12 sm:px-12">
          <Sun className="h-20 w-20 mx-auto text-cocoa animate-breathe" />
          <h1 className="font-heading font-semibold text-4xl mt-8">Bestillingen er sendt</h1>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Helt Shpa Spa har mottatt bestillingen din og tar kontakt for å
            bekrefte time.{" "}
            {betalingTags.length > 0
              ? `Husk å ha betalingen klar: ${betalingTags.join(", ")}.`
              : "Denne gangen er det på huset."}
          </p>
          <p className="mt-8 font-display italic text-xl text-cocoa">
            Vi gleder oss til å ta imot deg.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-3 sm:px-6 py-4 sm:py-10">
      <Bakgrunn />
      {/* Hero – logoen ligger utenfor papirarket, rett på bildet */}
      <section className="px-6 pt-16 pb-24 text-center">
        <h1 className="animate-fade-up">
          <Image
            src="/HSS_LOGO.svg"
            alt="Helt Shpa Spa"
            width={781}
            height={310}
            priority
            className="mx-auto w-full max-w-md brightness-0 invert"
          />
        </h1>
      </section>

      <div className="max-w-2xl mx-auto bg-paper rounded-3xl overflow-hidden pt-8">

      {/* Meny */}
      <section id="meny" className="px-6 pb-24 scroll-mt-12">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading font-semibold text-3xl text-center">Hva vi tilbyr</h2>
          <p className="text-center text-ink-soft mt-2 mb-10">
            Velg antall av det du vil bestille
          </p>

          <ul className="space-y-1">
            {alleItems.map((item, idx) => {
              const n = antall[item.id] ?? 0;
              const egenItem = item.id.startsWith("egen-");
              return (
                <li key={item.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                      n > 0 ? "bg-glow" : ""
                    }`}
                  >
                    <span className="text-base sm:text-lg font-display min-w-0">
                      {item.name}
                      {item.asterisk && <span className="text-cocoa"> *</span>}
                    </span>
                    <span className="flex-1 border-b-2 border-dotted border-ink-soft/40 min-w-6" />
                    <Stepper item={item} antall={n} onChange={(v) => settAntall(item.id, v)} />
                    {egenItem && (
                      <button
                        type="button"
                        onClick={() => fjernItem(item.id)}
                        aria-label={`Fjern ${item.name}`}
                        className="text-cocoa hover:text-cocoa-deep focus-visible:outline-2 focus-visible:outline-cocoa rounded-full shrink-0"
                      >
                        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                          <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            <li className="pt-3 px-4">
              {nyttItem === null ? (
                <button
                  type="button"
                  onClick={() => setNyttItem("")}
                  className="flex items-center gap-2 rounded-full bg-paper-deep px-5 py-2.5 text-sm hover:bg-glow transition-colors focus-visible:outline-2 focus-visible:outline-cocoa"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                    <path d="M6 2 V10 M2 6 H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Legg til eget ønske
                </button>
              ) : (
                <input
                  autoFocus
                  type="text"
                  value={nyttItem}
                  onChange={(e) => setNyttItem(e.target.value)}
                  onBlur={lagreNyttItem}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      lagreNyttItem();
                    }
                    if (e.key === "Escape") setNyttItem(null);
                  }}
                  placeholder="Skriv ditt ønske …"
                  className="w-56 rounded-full bg-cream px-4 py-2.5 text-sm placeholder:text-ink-soft/60 focus:outline-2 focus:outline-cocoa"
                />
              )}
            </li>
          </ul>

          <div className="mt-10 space-y-1.5 text-sm text-ink-soft">
            {FOOTNOTES.map((f) => (
              <p key={f}>{f}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Bestilling */}
      <section id="bestilling" className="px-6 pb-32 scroll-mt-12">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading font-semibold text-3xl text-center">Bestilling</h2>

          {linjer.length === 0 ? (
            <p className="text-center text-ink-soft mt-4">
              Velg noe fra menyen først, så dukker bestillingen opp her.
            </p>
          ) : (
            <form onSubmit={bestill} className="mt-8 space-y-6">
              <div className="bg-cream rounded-2xl px-6 py-5">
                <ul className="space-y-2">
                  {linjer.map((l) => (
                    <li key={l.item.id} className="flex items-baseline gap-3">
                      <span className="font-display">
                        {l.antall} × {l.item.name}
                      </span>
                      <span className="flex-1 border-b-2 border-dotted border-ink-soft/40 translate-y-[-4px]" />
                    </li>
                  ))}
                </ul>
              </div>

              {kombinasjonsHint && (
                <p className="text-sm text-cocoa bg-glow rounded-xl px-4 py-3">
                  Psst: Ansiktsmaske kan ikke kombineres med ryggmassasje – men
                  spaet løser det sikkert etter tur.
                </p>
              )}

              <label className="block">
                <span className="block mb-2">Navn</span>
                <input
                  type="text"
                  required
                  value={navn}
                  onChange={(e) => setNavn(e.target.value)}
                  placeholder="Hvem skal kose seg?"
                  className="w-full rounded-xl bg-cream px-4 py-3 placeholder:text-ink-soft/60 focus:outline-2 focus:outline-cocoa"
                />
              </label>

              <label className="block">
                <span className="block mb-2">Når passer det?</span>
                <input
                  type="text"
                  value={tidspunkt}
                  onChange={(e) => setTidspunkt(e.target.value)}
                  placeholder="F.eks. søndag kveld, eller «når som helst»"
                  className="w-full rounded-xl bg-cream px-4 py-3 placeholder:text-ink-soft/60 focus:outline-2 focus:outline-cocoa"
                />
              </label>

              <div>
                <span className="block mb-2">Betaling – hva får spaet igjen?</span>
                <div className="flex flex-wrap items-center gap-2">
                  {betalingTags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-full bg-glow px-4 py-2 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => fjernTag(tag)}
                        aria-label={`Fjern ${tag}`}
                        className="text-cocoa hover:text-cocoa-deep focus-visible:outline-2 focus-visible:outline-cocoa rounded-full"
                      >
                        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                          <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {nyTag === null ? (
                    <button
                      type="button"
                      onClick={() => setNyTag("")}
                      aria-label="Legg til betaling"
                      className="h-9 w-9 rounded-full bg-paper-deep text-ink flex items-center justify-center hover:bg-glow transition-colors focus-visible:outline-2 focus-visible:outline-cocoa"
                    >
                      <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M6 2 V10 M2 6 H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  ) : (
                    <input
                      autoFocus
                      type="text"
                      value={nyTag}
                      onChange={(e) => setNyTag(e.target.value)}
                      onBlur={lagreNyTag}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          lagreNyTag();
                        }
                        if (e.key === "Escape") setNyTag(null);
                      }}
                      placeholder="F.eks. en klem"
                      className="w-40 rounded-full bg-cream px-4 py-2 text-sm placeholder:text-ink-soft/60 focus:outline-2 focus:outline-cocoa"
                    />
                  )}
                </div>
              </div>

              <label className="block">
                <span className="block mb-2">Hilsen til spaet</span>
                <textarea
                  value={melding}
                  onChange={(e) => setMelding(e.target.value)}
                  rows={3}
                  placeholder="Noe spaet bør vite?"
                  className="w-full rounded-xl bg-cream px-4 py-3 placeholder:text-ink-soft/60 focus:outline-2 focus:outline-cocoa resize-none"
                />
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  name="mottaker"
                  value="eline"
                  disabled={status === "sending"}
                  className="flex-1 rounded-full bg-cta text-cream px-6 py-4 text-lg font-heading font-semibold hover:bg-cta-deep transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta-deep"
                >
                  Send bestilling til Eline
                </button>
                <button
                  type="submit"
                  name="mottaker"
                  value="erlend"
                  disabled={status === "sending"}
                  className="flex-1 rounded-full bg-cta text-cream px-6 py-4 text-lg font-heading font-semibold hover:bg-cta-deep transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta-deep"
                >
                  Send bestilling til Erlend
                </button>
              </div>
              {status === "sending" && (
                <p className="text-center text-sm text-ink-soft">Sender bestillingen …</p>
              )}

              {status === "error" && (
                <p className="text-center text-sm text-cocoa">
                  Noe gikk galt med sendingen. Prøv igjen – spaet venter.
                </p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* Flytende oppsummering */}
      {linjer.length > 0 && (
        <a
          href="#bestilling"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-cocoa-deep text-cream pl-6 pr-5 py-3 shadow-lg shadow-cocoa-deep/20 animate-fade-up hover:bg-cocoa transition-colors"
        >
          <span className="text-sm">
            {antallTotalt(linjer)}{" "}
            {antallTotalt(linjer) === 1 ? "behandling" : "behandlinger"}
          </span>
          <span aria-hidden="true">↓</span>
        </a>
      )}

      <footer className="px-6 pb-12 text-center text-sm text-ink-soft">
        Helt Shpa Spa · Ingen refusjon på kos
      </footer>
      </div>
    </main>
  );
}
