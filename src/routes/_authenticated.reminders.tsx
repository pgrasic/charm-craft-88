import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReminderCard, type Reminder, type EditValues } from "@/components/reminder-card";
import {
  getUserReminders,
  getAllMeds,
  medicationTaken,
  snoozeReminder,
  dontRemindToday,
  updateKorisnikLijek,
  deleteKorisnikLijek,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Moji podsjetnici — Štef" },
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

function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [items, meds] = await Promise.all([getUserReminders(), getAllMeds()]);
      const medMap: Record<number, string> = {};
      for (const m of meds || []) medMap[m.id] = m.naziv;

      setReminders(
        (items || []).map((item: any) => ({
          id: item.lijek_id,
          name: medMap[item.lijek_id] || `Lijek #${item.lijek_id}`,
          startDate: item.pocetno_vrijeme,
          intervalHours: item.razmak_sati,
          quantity: item.kolicina,
        }))
      );
    } catch (err: any) {
      toast.error(err?.message || "Greška pri učitavanju podsjetnika.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id: number) => {
    try {
      await medicationTaken(id);
      toast.success("Označeno kao uzeto.");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Greška.");
    }
  };

  const handleSnooze = async (id: number) => {
    try {
      await snoozeReminder(id);
      toast.success("Podsjetnik odgođen za 15 minuta.");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Greška.");
    }
  };

  const handleSkip = async (id: number) => {
    try {
      await dontRemindToday(id);
      toast.success("Nećemo te podsjećati danas.");
    } catch (err: any) {
      toast.error(err?.message || "Greška.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sigurno želiš obrisati ovaj podsjetnik?")) return;
    try {
      await deleteKorisnikLijek(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Podsjetnik obrisan.");
    } catch (err: any) {
      toast.error(err?.message || "Greška pri brisanju.");
    }
  };

  const handleSave = async (id: number, values: EditValues) => {
    try {
      await updateKorisnikLijek(id, values);
      toast.success("Podsjetnik ažuriran.");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Greška pri spremanju.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-3xl p-8 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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
      </header>

      {reminders.length === 0 ? (
        <div className="bg-card rounded-3xl p-12 text-center shadow-sm ring-1 ring-foreground/5">
          <p className="text-navy-light text-lg font-semibold">Nemate spremljenih podsjetnika.</p>
          <p className="text-navy-light mt-2">Dodajte lijek putem izbornika.</p>
        </div>
      ) : (
        <section className="space-y-6">
          {reminders.map((r, i) => (
            <div
              key={r.id}
              className="animate-reveal"
              style={{ animationDelay: `${100 + i * 100}ms` }}
            >
              <ReminderCard
                reminder={r}
                variant={i === 0 ? "priority" : "secondary"}
                onConfirm={() => handleConfirm(r.id)}
                onSnooze={() => handleSnooze(r.id)}
                onSkip={() => handleSkip(r.id)}
                onDelete={() => handleDelete(r.id)}
                onSave={(values) => handleSave(r.id, values)}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
