import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  getStats,
  getMedicationRequests,
  approveRequest,
  rejectRequest,
  getAdherence,
  getMissedHeatmap,
  type AdherenceDay,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Štef" },
      { name: "description", content: "Admin nadzorna ploča." },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const user = getCurrentUser();
      if (!user?.is_admin) throw redirect({ to: "/reminders" });
    }
  },
  component: AdminPage,
});

// ─── types ───────────────────────────────────────────────────────────────────

type Stats = {
  total_users: number;
  total_meds: number;
  sent_reminders: number;
  confirmed_reminders: number;
  lijek_relative: Record<string, number>;
};

type MedRequest = {
  id: number;
  naziv: string;
  DjelatnaTvar: string;
};

// ─── colours (mirrors styles.css) ────────────────────────────────────────────

const NAVY_DARK  = "#0f1b3d";
const NAVY_MID   = "#1e3a5f";
const NAVY_LIGHT = "#3b6fa0";
const NAVY_BG    = "#e8edf3";

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-md ring-1 ring-foreground/5 flex flex-col gap-2">
      <p className="text-navy-light text-xs font-bold uppercase tracking-widest">{label}</p>
      <p className="font-display text-4xl font-bold text-navy-dark">{value}</p>
    </div>
  );
}

// ─── BarChart (distribution) ─────────────────────────────────────────────────

const BAR_MAX = 160;

function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  if (entries.length === 0)
    return <p className="text-navy-light text-sm">Nema podataka.</p>;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {/* Y-axis labels */}
        <div
          className="flex flex-col justify-between text-right pr-2 shrink-0"
          style={{ height: `${BAR_MAX + 26}px`, paddingTop: "26px" }}
        >
          {[100, 75, 50, 25, 0].map((v) => (
            <span key={v} className="text-xs font-semibold leading-none" style={{ color: NAVY_MID }}>
              {v}%
            </span>
          ))}
        </div>

        {/* Bars + grid area */}
        <div className="relative" style={{ height: `${BAR_MAX + 26}px` }}>
          {/* Horizontal grid lines at 25 / 50 / 75 % */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute inset-x-0 pointer-events-none"
              style={{
                bottom: `${(pct / 100) * BAR_MAX}px`,
                borderTop: `1px dashed ${NAVY_LIGHT}55`,
              }}
            />
          ))}

          {/* Flex row of bars, with left + bottom axis borders */}
          <div
            className="flex items-end h-full gap-2 pl-2"
            style={{
              borderLeft: `2px solid ${NAVY_MID}80`,
              borderBottom: `2px solid ${NAVY_MID}80`,
            }}
          >
            {entries.map(([userId, rel]) => {
              const pct = Math.max(0, Math.min(100, rel * 100));
              const barH = Math.max(3, (pct / 100) * BAR_MAX);
              return (
                <div
                  key={userId}
                  className="flex flex-col items-center gap-1 shrink-0"
                  style={{ width: "44px" }}
                >
                  <span
                    className="text-[11px] font-semibold leading-none"
                    style={{ color: NAVY_MID }}
                  >
                    {pct.toFixed(1)}%
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-navy-mid to-navy-light transition-all duration-500"
                    style={{ height: `${barH}px` }}
                    title={`${userId}: ${pct.toFixed(1)}%`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-4 mt-1" style={{ paddingLeft: "calc(var(--y-label-w, 48px) + 1rem)" }}>
        {entries.map(([userId]) => (
          <div key={userId} className="shrink-0 text-center" style={{ width: "44px" }}>
            <span className="text-[11px] font-semibold leading-tight block break-all" style={{ color: NAVY_MID }}>
              {userId}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs font-semibold mt-1" style={{ color: NAVY_LIGHT }}>
        Korisnik
      </p>
    </div>
  );
}

// ─── AdherenceChart (SVG line chart) ─────────────────────────────────────────

const CW = 760, CH = 220;
const PAD = { t: 20, r: 20, b: 44, l: 56 };
const PW = CW - PAD.l - PAD.r;
const PH = CH - PAD.t - PAD.b;

function xP(i: number, n: number) {
  return n <= 1 ? PAD.l + PW / 2 : PAD.l + (i / (n - 1)) * PW;
}
function yP(rate: number) {
  return PAD.t + (1 - rate) * PH;
}

function fillDateRange(data: AdherenceDay[]): AdherenceDay[] {
  if (data.length === 0) return [];
  const map = new Map(data.map((d) => [d.date, d]));
  const start = new Date(data[0].date);
  const end = new Date(data[data.length - 1].date);
  const result: AdherenceDay[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const iso = cur.toISOString().split("T")[0];
    result.push(map.get(iso) ?? { date: iso, rate: null, confirmed: 0, total: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function computeRolling(data: AdherenceDay[], window = 7): (number | null)[] {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    const valid = slice.filter((d) => d.rate !== null).map((d) => d.rate as number);
    if (valid.length < Math.ceil(window / 2)) return null;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  });
}

function makePath(pts: Array<{ x: number; y: number | null }>): string {
  let d = "";
  let pen = false;
  for (const p of pts) {
    if (p.y === null) { pen = false; continue; }
    d += pen
      ? `L${p.x.toFixed(1)},${p.y.toFixed(1)}`
      : `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

function AdherenceChart({ data }: { data: AdherenceDay[] }) {
  const filled = useMemo(() => fillDateRange(data), [data]);
  const rolling = useMemo(() => computeRolling(filled), [filled]);

  if (filled.length < 2)
    return <p className="text-navy-light text-sm text-center py-8">Nema dovoljno podataka za prikaz grafa.</p>;

  const n = filled.length;

  const rawPts = filled.map((d, i) => ({ x: xP(i, n), y: d.rate !== null ? yP(d.rate) : null }));
  const avgPts = rolling.map((r, i) => ({ x: xP(i, n), y: r !== null ? yP(r) : null }));

  const rawPath = makePath(rawPts);
  const avgPath = makePath(avgPts);

  // X-axis date labels: pick ~6-8 evenly spaced labels
  const labelStep = Math.max(1, Math.ceil(n / 7));
  const xLabels = filled
    .map((d, i) => ({ i, label: d.date.slice(5).replace("-", "/") }))
    .filter(({ i }) => i % labelStep === 0 || i === n - 1);

  const xAxisY = PAD.t + PH;

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      width="100%"
      height="auto"
      aria-label="Adherencija kroz vrijeme"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="avgArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NAVY_MID} stopOpacity="0.12" />
          <stop offset="100%" stopColor={NAVY_MID} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {Y_TICKS.map((r) => (
        <line
          key={r}
          x1={PAD.l} x2={PAD.l + PW}
          y1={yP(r)} y2={yP(r)}
          stroke={r === 0 || r === 1 ? `${NAVY_MID}60` : `${NAVY_BG}`}
          strokeWidth={r === 0 || r === 1 ? 1.5 : 1.5}
          strokeDasharray={r === 0 || r === 1 ? undefined : "5 3"}
        />
      ))}

      {/* Y-axis */}
      <line
        x1={PAD.l} x2={PAD.l}
        y1={PAD.t} y2={xAxisY}
        stroke={NAVY_MID} strokeWidth={2}
      />

      {/* X-axis */}
      <line
        x1={PAD.l} x2={PAD.l + PW}
        y1={xAxisY} y2={xAxisY}
        stroke={NAVY_MID} strokeWidth={2}
      />

      {/* Y-axis labels + tick marks */}
      {Y_TICKS.map((r) => (
        <g key={r}>
          <line x1={PAD.l - 5} x2={PAD.l} y1={yP(r)} y2={yP(r)} stroke={NAVY_MID} strokeWidth={1.5} />
          <text
            x={PAD.l - 9}
            y={yP(r)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={600}
            fill={NAVY_MID}
          >
            {(r * 100).toFixed(0)}%
          </text>
        </g>
      ))}

      {/* X-axis labels + tick marks */}
      {xLabels.map(({ i, label }) => (
        <g key={i}>
          <line
            x1={xP(i, n)} x2={xP(i, n)}
            y1={xAxisY} y2={xAxisY + 5}
            stroke={NAVY_MID} strokeWidth={1.5}
          />
          <text
            x={xP(i, n)}
            y={xAxisY + 16}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={NAVY_LIGHT}
          >
            {label}
          </text>
        </g>
      ))}

      {/* Shaded area under rolling average */}
      {avgPath && (
        <path
          d={`${avgPath}L${xP(n - 1, n).toFixed(1)},${xAxisY}L${PAD.l.toFixed(1)},${xAxisY}Z`}
          fill="url(#avgArea)"
        />
      )}

      {/* Raw daily rate — thin, lighter */}
      {rawPath && (
        <path d={rawPath} stroke={NAVY_LIGHT} strokeWidth={1.5} fill="none" opacity={0.6} />
      )}

      {/* 7-day rolling average — thick, dark */}
      {avgPath && (
        <path d={avgPath} stroke={NAVY_DARK} strokeWidth={2.5} fill="none" />
      )}

      {/* Data dots for raw rate */}
      {rawPts.map((p, i) =>
        p.y !== null ? (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={2}
            fill={NAVY_LIGHT}
            opacity={0.5}
          />
        ) : null
      )}

      {/* Legend */}
      <g transform={`translate(${PAD.l + 8}, ${PAD.t + 8})`}>
        <rect width={148} height={40} rx={6} fill="white" fillOpacity={0.85} />
        <line x1={8} x2={24} y1={13} y2={13} stroke={NAVY_LIGHT} strokeWidth={1.5} opacity={0.6} />
        <text x={28} y={17} fontSize={10} fontWeight={600} fill={NAVY_LIGHT}>Dnevna stopa</text>
        <line x1={8} x2={24} y1={29} y2={29} stroke={NAVY_DARK} strokeWidth={2.5} />
        <text x={28} y={33} fontSize={10} fontWeight={600} fill={NAVY_DARK}>7-dnevni prosjek</text>
      </g>
    </svg>
  );
}

// ─── MissedHeatmap ───────────────────────────────────────────────────────────

const DAY_NAMES = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
const BLOCK_LABELS = ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h"];
const BLOCKS = 8;

function buildHeatmapGrid(raw: Record<string, number>): number[][] {
  const grid = Array.from({ length: 7 }, () => Array(BLOCKS).fill(0));
  for (const [key, count] of Object.entries(raw)) {
    const [dowStr, hourStr] = key.split("_");
    const dow = parseInt(dowStr, 10);
    const block = Math.floor(parseInt(hourStr, 10) / 3);
    if (dow >= 0 && dow < 7 && block >= 0 && block < BLOCKS) {
      grid[dow][block] += count;
    }
  }
  return grid;
}

function MissedHeatmap({ data }: { data: Record<string, number> }) {
  const grid = useMemo(() => buildHeatmapGrid(data), [data]);
  const maxCount = useMemo(() => Math.max(1, ...grid.flat()), [grid]);
  const hasAny = Object.values(data).some((v) => v > 0);

  if (!hasAny)
    return (
      <p className="text-navy-light text-sm text-center py-8">
        Nema preskočenih doza za prikaz.
      </p>
    );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Column headers */}
        <div className="flex mb-1" style={{ paddingLeft: "44px" }}>
          {BLOCK_LABELS.map((label) => (
            <div key={label} className="flex-1 text-center min-w-[36px]">
              <span className="text-[11px] font-semibold" style={{ color: NAVY_MID }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {grid.map((row, dow) => (
          <div key={dow} className="flex items-center gap-1 mb-1">
            {/* Row label */}
            <div className="shrink-0 text-right pr-2" style={{ width: "40px" }}>
              <span className="text-[11px] font-semibold" style={{ color: NAVY_MID }}>
                {DAY_NAMES[dow]}
              </span>
            </div>
            {/* Cells */}
            {row.map((count, block) => {
              const opacity =
                count === 0 ? 0 : 0.12 + (count / maxCount) * 0.76;
              const textColor = opacity > 0.45 ? "white" : NAVY_MID;
              return (
                <div
                  key={block}
                  className="flex-1 min-w-[36px] aspect-square rounded-md flex items-center justify-center"
                  style={{
                    backgroundColor:
                      count === 0
                        ? NAVY_BG
                        : `rgba(30, 58, 95, ${opacity.toFixed(2)})`,
                    transition: "background-color 0.3s",
                  }}
                  title={`${DAY_NAMES[dow]}, ${BLOCK_LABELS[block]}–${BLOCK_LABELS[block + 1] ?? "24h"}: ${count} preskočenih`}
                >
                  {count > 0 && (
                    <span
                      className="text-[11px] font-bold leading-none"
                      style={{ color: textColor }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 justify-end">
          <span className="text-[11px] font-semibold" style={{ color: NAVY_LIGHT }}>
            Manje
          </span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
            <div
              key={t}
              className="size-4 rounded"
              style={{
                backgroundColor:
                  t === 0 ? NAVY_BG : `rgba(30, 58, 95, ${(0.12 + t * 0.76).toFixed(2)})`,
              }}
            />
          ))}
          <span className="text-[11px] font-semibold" style={{ color: NAVY_LIGHT }}>
            Više
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [adherence, setAdherence] = useState<AdherenceDay[]>([]);
  const [adherenceLoading, setAdherenceLoading] = useState(true);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [requests, setRequests] = useState<MedRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e: any) => toast.error(e?.message || "Greška pri učitavanju statistike."))
      .finally(() => setStatsLoading(false));

    getAdherence()
      .then(setAdherence)
      .catch((e: any) => toast.error(e?.message || "Greška pri učitavanju adherencije."))
      .finally(() => setAdherenceLoading(false));

    getMissedHeatmap()
      .then(setHeatmap)
      .catch((e: any) => toast.error(e?.message || "Greška pri učitavanju heatmape."))
      .finally(() => setHeatmapLoading(false));

    getMedicationRequests()
      .then((d) => setRequests(d || []))
      .catch((e: any) => toast.error(e?.message || "Greška pri učitavanju zahtjeva."))
      .finally(() => setRequestsLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await approveRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Zahtjev odobren.");
    } catch (e: any) {
      toast.error(e?.message || "Greška pri odobravanju.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await rejectRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.info("Zahtjev odbijen.");
    } catch (e: any) {
      toast.error(e?.message || "Greška pri odbijanju.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-reveal space-y-10">
      <header>
        <p className="text-navy-light font-bold uppercase tracking-widest text-sm mb-2">Admin</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-dark">
          Nadzorna ploča
        </h1>
      </header>

      {/* ── Stats cards ───────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-bold text-navy-dark mb-4">Statistike</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-28 animate-pulse ring-1 ring-foreground/5" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Korisnici" value={stats.total_users} />
            <StatCard label="Lijekovi" value={stats.total_meds} />
            <StatCard label="Poslani podsjetnici" value={stats.sent_reminders} />
            <StatCard label="Potvrđeni podsjetnici" value={stats.confirmed_reminders} />
          </div>
        ) : null}
      </section>

      {/* ── Distribution bar chart ────────────────────────────────────── */}
      {stats && (
        <div className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5">
          <h3 className="font-display text-xl font-bold text-navy-dark mb-6">
            Distribucija lijekova po korisniku
          </h3>
          <BarChart data={stats.lijek_relative || {}} />
        </div>
      )}

      {/* ── Adherence line chart ──────────────────────────────────────── */}
      <div className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5">
        <h3 className="font-display text-xl font-bold text-navy-dark mb-1">
          Adherencija kroz vrijeme
        </h3>
        <p className="text-navy-light text-sm mb-6">
          Postotak uzetih doza po danu · tamna linija = 7-dnevni klizni prosjek
        </p>
        {adherenceLoading ? (
          <div className="h-[220px] rounded-2xl bg-navy-bg animate-pulse" />
        ) : (
          <AdherenceChart data={adherence} />
        )}
      </div>

      {/* ── Missed heatmap ────────────────────────────────────────────── */}
      <div className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5">
        <h3 className="font-display text-xl font-bold text-navy-dark mb-1">
          Propuštene doze — dan × doba dana
        </h3>
        <p className="text-navy-light text-sm mb-6">
          Broj preskočenih podsjetnika po danu u tjednu i vremenskom bloku
        </p>
        {heatmapLoading ? (
          <div className="h-48 rounded-2xl bg-navy-bg animate-pulse" />
        ) : (
          <MissedHeatmap data={heatmap} />
        )}
      </div>

      {/* ── Medication requests ───────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-bold text-navy-dark mb-4">
          Zahtjevi za lijekovima
        </h2>
        <div className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5">
          {requestsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-navy-bg animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-navy-light text-center py-8">Trenutno nema zahtjeva.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${NAVY_MID}40` }}>
                    <th className="text-left py-3 px-4 font-bold text-navy-dark">Naziv</th>
                    <th className="text-left py-3 px-4 font-bold text-navy-dark">Djelatna tvar</th>
                    <th className="text-right py-3 px-4 font-bold text-navy-dark">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-navy-bg/50 transition-colors"
                      style={{ borderBottom: `1px solid ${NAVY_BG}` }}
                    >
                      <td className="py-4 px-4 font-semibold">{r.naziv}</td>
                      <td className="py-4 px-4 text-navy-light">{r.DjelatnaTvar || "—"}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            disabled={processingId === r.id}
                            onClick={() => handleApprove(r.id)}
                            className="rounded-xl bg-success hover:bg-success/90 text-success-foreground font-bold px-4"
                          >
                            {processingId === r.id ? "..." : "Odobri"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processingId === r.id}
                            onClick={() => handleReject(r.id)}
                            className="rounded-xl font-bold px-4"
                          >
                            {processingId === r.id ? "..." : "Odbij"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
