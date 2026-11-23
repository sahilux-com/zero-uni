"use client";

import { useEffect, useRef, useState } from "react";

export type Size = {
  sku: string;
  men: string;
  women: string;
  status: "in_stock" | "low_stock" | "sold_out";
};

type Range = "m" | "w";

// Square WebP product shots, 750 px for 2x phones and 1125 px for 3x phones.
const PHOTOS = [
  { id: "pegasus-43-1", alt: "outer side view" },
  { id: "pegasus-43-2", alt: "inner side view" },
  { id: "pegasus-43-3", alt: "front angled view" },
  { id: "pegasus-43-4", alt: "back angled view" },
];

const TECH = [
  {
    title: "Cushioning",
    short: "responsive foam with Air Zoom units",
    body: "A full-length foam midsole returns energy with every step, and Air Zoom units in the forefoot and heel add a springy feel for daily miles.",
  },
  {
    title: "Upper",
    short: "breathable engineered mesh",
    body: "Engineered mesh lets heat escape while a midfoot band holds your foot steady. Fits true to size for most runners.",
  },
  {
    title: "Outsole",
    short: "waffle-pattern rubber for road grip",
    body: "The waffle-pattern rubber outsole grips wet and dry roads, with extra rubber in high-wear zones to last through training blocks.",
  },
];

export default function ProductPage({
  name,
  colorway,
  price,
  sizes,
}: {
  name: string;
  colorway: string;
  price: number;
  sizes: Size[];
}) {
  const [range, setRange] = useState<Range>("m");
  const [selected, setSelected] = useState<Size | null>(null);
  const [bag, setBag] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [photo, setPhoto] = useState(1);
  const sizesRef = useRef<HTMLElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(t);
  }, [justAdded]);

  const label = (s: Size) => (range === "m" ? s.men : s.women);
  const longLabel = (s: Size) =>
    range === "m" ? `Men's ${s.men}` : `Women's ${s.women}`;

  const note = selected
    ? selected.status === "low_stock"
      ? "Only a few left"
      : ""
    : nudge
      ? "Please select a size"
      : "";

  const buyLabel = justAdded
    ? "Added to Bag ✓"
    : selected
      ? `Add to Bag · ${range === "m" ? "M" : "W"} ${label(selected)}`
      : "Select a size";

  function onBuy() {
    if (!selected) {
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setNudge(true);
      return;
    }
    setBag((n) => n + 1);
    setJustAdded(true);
  }

  return (
    <>
      {/* Bottom padding leaves room for the Add to Bag bar. */}
      <div className="mx-auto max-w-[480px] pb-[calc(64px+env(safe-area-inset-bottom))]">
        {/* 1. Header: 56px */}
        <header className="flex h-14 items-center justify-between border-b border-hairline px-4">
          <span className="text-xl font-bold italic tracking-wider">NIKE</span>
          <button
            type="button"
            aria-label={`Bag, ${bag} ${bag === 1 ? "item" : "items"}`}
            className="relative -mr-3 grid size-12 place-items-center"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 8h14l-1 13H6L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {bag > 0 && (
              <span className="absolute right-1.5 top-2 h-4 min-w-4 rounded-full bg-ink text-center text-[10px] font-bold leading-4 text-white">
                {bag}
              </span>
            )}
          </button>
        </header>

        {/* 2. Photo gallery: a fixed square, so a late photo cannot push anything down */}
        <section
          aria-label="Photos, swipe for more"
          className="relative aspect-square w-full bg-[#e0dbd8]"
        >
          <div
            ref={slidesRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              setPhoto(Math.round(el.scrollLeft / el.clientWidth) + 1);
            }}
            className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto"
          >
            {PHOTOS.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                data-testid={i === 0 ? "main-photo" : undefined}
                src={`/images/${p.id}-1125.webp`}
                srcSet={`/images/${p.id}-750.webp 750w, /images/${p.id}-1125.webp 1125w`}
                sizes="(max-width: 480px) 100vw, 480px"
                width={375}
                height={375}
                alt={`${name} in ${colorway}, ${p.alt}`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="size-full flex-none snap-start object-cover"
              />
            ))}
          </div>
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 text-xs leading-6 text-white"
          >
            {photo} / {PHOTOS.length}
          </span>
        </section>

        {/* 3. Name and price: 88px */}
        <section className="h-[88px] overflow-hidden px-4 py-2">
          <h1 className="text-[22px] font-bold leading-7">{name}</h1>
          <p className="truncate text-sm leading-5 text-muted">
            {colorway} · Launches 10 Dec
          </p>
          <p data-testid="price" className="font-medium leading-6">
            ${price}
          </p>
        </section>

        {/* 4. Size block: 40 + 8 + 328 + 20 = 396px */}
        <section ref={sizesRef} aria-label="Select size" className="px-4">
          <div
            role="group"
            aria-label="Size range"
            className="grid h-10 grid-cols-2 rounded-full bg-soft p-[3px]"
          >
            {(["m", "w"] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => setRange(r)}
                className={`rounded-full text-sm font-medium ${
                  range === r
                    ? "bg-white text-ink shadow-[0_0_0_1px_var(--color-line)]"
                    : "text-muted"
                }`}
              >
                {r === "m" ? "Men's" : "Women's"}
              </button>
            ))}
          </div>

          {/* 6 rows of 48px with 8px gaps. Height is fixed for all 26 sizes. */}
          <div
            role="group"
            aria-label="US sizes"
            data-testid="size-grid"
            className="mt-2 grid h-[328px] auto-rows-[48px] grid-cols-5 gap-2"
          >
            {sizes.map((s) => {
              const sold = s.status === "sold_out";
              const low = s.status === "low_stock";
              const isSelected = selected?.sku === s.sku;
              return (
                <button
                  key={s.sku}
                  type="button"
                  data-testid={sold ? "size-button-sold-out" : "size-button"}
                  disabled={sold}
                  aria-pressed={isSelected}
                  aria-label={`US ${longLabel(s)}${
                    sold ? ", sold out" : low ? ", low stock" : ""
                  }`}
                  onClick={() => {
                    setSelected(s);
                    setNudge(false);
                  }}
                  className={[
                    // Same box in every state, never under 44 x 44px.
                    "relative h-12 min-h-11 min-w-11 touch-manipulation rounded-md font-medium",
                    sold
                      ? "bg-soft text-[#9e9ea0] line-through"
                      : isSelected
                        ? "bg-white shadow-[inset_0_0_0_2px_var(--color-ink)]"
                        : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]",
                    low
                      ? "after:absolute after:right-1.5 after:top-1.5 after:size-1.5 after:rounded-full after:bg-low after:content-['']"
                      : "",
                  ].join(" ")}
                >
                  {label(s)}
                </button>
              );
            })}
          </div>

          {/* Low stock line: its 20px is always reserved */}
          <p
            role="status"
            aria-live="polite"
            className="h-5 overflow-hidden whitespace-nowrap text-[13px] leading-5 text-low"
          >
            {note}
          </p>
        </section>

        {/* 6. Tech highlights: 120px, full copy opens on tap */}
        <section className="mt-6 px-4">
          <div className="h-[120px] overflow-hidden">
            <h2 className="text-lg font-bold leading-6">Tech highlights</h2>
            <ul className="mt-2">
              {TECH.map((t) => (
                <li key={t.title} className="h-7 truncate text-sm leading-7">
                  <b>{t.title}</b> · {t.short}
                </li>
              ))}
            </ul>
          </div>
          {TECH.map((t) => (
            <details
              key={t.title}
              className="group border-t border-hairline last:border-b"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-medium">
                {t.title}
                <span aria-hidden="true" className="text-[22px] font-normal">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="pb-4 text-sm leading-[22px] text-[#39393b]">
                {t.body}
              </p>
            </details>
          ))}
        </section>

        {/* 7. Reviews summary: 96px, full reviews below */}
        <section className="mt-6 px-4">
          <div className="h-24 overflow-hidden">
            <h2 className="text-lg font-bold leading-6">Reviews</h2>
            <p className="mt-2 text-[28px] font-bold leading-9">
              4.6{" "}
              <span className="text-sm font-normal text-muted">
                out of 5 · 1,284 reviews
              </span>
            </p>
            <p className="text-sm leading-5 text-muted">
              Most runners say it fits true to size.
            </p>
          </div>
          <article className="border-t border-hairline py-4 text-sm leading-[22px]">
            <b className="block">Best daily trainer I&apos;ve owned</b>
            <small className="text-xs text-muted">★★★★★ · Size M 10.5</small>
            <p>Soft enough for easy runs and still quick when I pick it up.</p>
          </article>
          <article className="border-t border-hairline py-4 text-sm leading-[22px]">
            <b className="block">True to size</b>
            <small className="text-xs text-muted">★★★★☆ · Size W 8</small>
            <p>Went with my usual size and the fit was right out of the box.</p>
          </article>
        </section>

        <p className="mx-4 mb-4 mt-6 text-xs leading-[18px] text-muted">
          Photos, tech copy and reviews are placeholders until final content is
          supplied.
        </p>
      </div>

      {/* 5. Add to Bag bar: 64px, stuck to the bottom of the screen */}
      <div className="fixed inset-x-0 bottom-0 z-10 h-[calc(64px+env(safe-area-inset-bottom))] border-t border-hairline bg-white px-4 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={onBuy}
          className="mx-auto block h-12 w-full max-w-[448px] overflow-hidden whitespace-nowrap rounded-full bg-ink font-medium text-white"
        >
          {buyLabel}
        </button>
      </div>
    </>
  );
}
