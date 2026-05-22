import { createFileRoute } from "@tanstack/react-router";
import { ReminderCard, type Reminder } from "@/components/reminder-card";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Moji podsjetnici — MedikApp" },
      { name: "description", content: "Pregled vaših dnevnih lijekova i rasporeda uzimanja." },
    ],
  }),
  component: RemindersPage,
});

const today = new Date().toLocaleDateString("hr-HR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const reminders: Reminder[] = [
  {
    id: "1",
    name: "Lisinopril",
    dose: "1 tableta (10mg)",
    interval: "Svakih 24h",
    time: "14:00",
    startDate: "17.09.2025.",
  },
  {
    id: "2",
    name: "Brufen Effect Rapid 684 mg",
    dose: "1 filmom obložena tableta",
    interval: "Svakih 8h",
    time: "18:00",
    startDate: "20.09.2025.",
  },
  {
    id: "3",
    name: "Vitamin D3",
    dose: "2 kapi",
    interval: "Jednom dnevno",
    time: "08:00",
    startDate: "01.09.2025.",
    taken: true,
  },
];

function RemindersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-4 animate-reveal">
        <div>
          <p className="text-navy-light font-bold uppercase tracking-widest text-sm mb-2">
            Danas • {today}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-dark">
            Moji podsjetnici
          </h1>
        </div>
        <div className="bg-card px-6 py-4 rounded-2xl ring-1 ring-foreground/5 shadow-sm">
          <span className="text-navy-light font-semibold">Sljedeća doza:</span>
          <strong className="ml-3 text-2xl font-display tabular-nums">14:00</strong>
        </div>
      </header>

      <section className="space-y-6">
        {reminders.map((r, i) => (
          <div
            key={r.id}
            className="animate-reveal"
            style={{ animationDelay: `${100 + i * 100}ms` }}
          >
            <ReminderCard
              reminder={r}
              variant={r.taken || i > 0 ? "secondary" : "priority"}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
