import { Pill, Check, Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Reminder = {
  id: string;
  name: string;
  dose: string;
  interval: string;
  time: string;
  startDate: string;
  taken?: boolean;
};

type Props = {
  reminder: Reminder;
  variant?: "priority" | "secondary";
};

export function ReminderCard({ reminder, variant = "priority" }: Props) {
  if (variant === "secondary") {
    return (
      <article className="bg-card rounded-3xl p-6 shadow-sm ring-1 ring-foreground/5 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex gap-5 items-center">
          <div className="size-16 rounded-2xl bg-navy-bg flex items-center justify-center shrink-0">
            <Pill className="size-7 text-navy-light" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold mb-1">{reminder.name}</h3>
            <p className="text-navy-light font-semibold">
              {reminder.dose} • {reminder.interval} • {reminder.time}{" "}
              {reminder.taken && <span className="text-success">(Uzeto)</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="h-14 px-6 rounded-xl font-bold bg-navy-bg text-navy-light hover:bg-navy-bg/70"
          >
            Povijest
          </Button>
          <Button
            variant="outline"
            className="h-14 px-6 rounded-xl font-bold border-2 border-navy-bg"
          >
            <Pencil className="size-4 mr-2" aria-hidden="true" />
            Uredi
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-card rounded-3xl p-8 shadow-xl ring-4 ring-navy-mid/10 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
        <div className="flex gap-6 items-center">
          <div className="size-20 rounded-2xl bg-navy-bg flex items-center justify-center shrink-0">
            <Pill className="size-9 text-navy-mid" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold mb-1">{reminder.name}</h2>
            <p className="text-navy-light font-semibold text-lg">
              {reminder.dose} • {reminder.interval}
            </p>
            <p className="text-navy-light text-base mt-1">
              Početak: <span className="font-semibold">{reminder.startDate}</span>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-navy-light uppercase tracking-widest">
            Sljedeća doza
          </div>
          <div className="text-4xl font-display font-bold tabular-nums">
            {reminder.time}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button className="h-16 rounded-2xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white">
          <Check className="size-5 mr-2" aria-hidden="true" />
          Označi kao uzeto
        </Button>
        <Button
          variant="secondary"
          className="h-16 rounded-2xl text-lg font-bold bg-navy-bg text-navy-dark hover:bg-navy-bg/70"
        >
          <Clock className="size-5 mr-2" aria-hidden="true" />
          Odgodi (15 min)
        </Button>
      </div>

      <div className="flex flex-wrap gap-6 pt-4 border-t border-navy-bg items-center">
        <button className="flex items-center gap-2 text-navy-light font-bold hover:text-navy-dark text-base transition-colors">
          <Pencil className="size-4" aria-hidden="true" />
          Uredi
        </button>
        <button className="flex items-center gap-2 text-navy-light font-bold hover:text-destructive text-base transition-colors">
          <Trash2 className="size-4" aria-hidden="true" />
          Obriši
        </button>
        <button className="ml-auto text-navy-light/70 italic text-base hover:text-navy-light transition-colors">
          Nemoj me podsjećati danas
        </button>
      </div>
    </article>
  );
}
