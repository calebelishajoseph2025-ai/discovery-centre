export function Horizon() {
  return (
    <svg
      viewBox="0 0 1440 280"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full text-hairline"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 220 C120 200 180 240 260 210 C340 180 380 150 460 160 C540 170 560 120 640 110 C720 100 760 140 840 130 C920 120 980 80 1080 90 C1180 100 1240 150 1320 140 C1380 132 1410 150 1440 146 L1440 280 L0 280 Z"
        fill="color-mix(in srgb, var(--surface-1) 88%, transparent)"
      />
      <path
        d="M210 210 v-58 h18 v-22 h12 v22 h18 v58"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M980 168 a46 46 0 0 1 92 0 v32 h-92z"
        stroke="var(--lantern)"
        strokeWidth="1.4"
        fill="color-mix(in srgb, var(--lantern) 12%, transparent)"
      />
      <circle cx="1026" cy="150" r="4" fill="var(--lantern)" />
      <path d="M0 246 H1440" stroke="var(--lantern)" strokeOpacity="0.35" />
    </svg>
  );
}

export function TicketStub({
  name,
  hours,
  address,
  price,
}: {
  name: string;
  hours: string;
  address: string;
  price: string;
}) {
  return (
    <aside className="relative w-[min(18rem,100%)] rotate-3 rounded-md border border-hairline bg-surface-1 p-5 shadow-[0_30px_80px_color-mix(in_srgb,var(--bg)_70%,transparent)]">
      <div className="absolute -left-2 top-10 h-4 w-4 rounded-full bg-bg" />
      <div className="absolute -right-2 top-10 h-4 w-4 rounded-full bg-bg" />
      <p className="small-caps">Admit one</p>
      <p className="mt-2 font-display text-2xl leading-tight">{name}</p>
      <div className="brass-rule my-4" />
      <p className="tabular text-sm text-lantern">{hours}</p>
      <p className="mt-2 text-sm text-text-muted">{address}</p>
      <p className="mt-4 font-mono text-xs tracking-[0.2em] text-text-muted">{price}</p>
    </aside>
  );
}

export function RiverdaleMap() {
  return (
    <svg viewBox="0 0 420 240" className="h-auto w-full" role="img">
      <rect width="420" height="240" fill="var(--surface-2)" />
      <path d="M0 150 C80 130 140 170 220 150 C300 130 360 160 420 140" stroke="var(--verdigris)" fill="none" />
      <path d="M40 40 H380 V200 H40 Z" stroke="var(--hairline)" fill="none" />
      <path d="M80 80 H180 V150 H80 Z" stroke="var(--lantern)" fill="color-mix(in srgb, var(--lantern) 10%, transparent)" />
      <circle cx="130" cy="115" r="6" fill="var(--lantern)" />
      <text x="90" y="175" fill="var(--text)" fontSize="12" fontFamily="var(--font-mono)">
        18 Garden Road
      </text>
      <path d="M220 90 h90 v40" stroke="var(--text-muted)" fill="none" />
      <text x="230" y="80" fill="var(--text-muted)" fontSize="11">
        Garden Road
      </text>
    </svg>
  );
}
