import { Pill, Check, Clock, Pencil, Trash2, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type Reminder = {
  id: number;
  name: string;
  startDate: string;
  intervalHours: number;
  quantity: number;
};

export type EditValues = {
  pocetno_vrijeme: string;
  razmak_sati: number;
  kolicina: number;
};

type Props = {
  reminder: Reminder;
  variant?: "priority" | "secondary";
  onConfirm?: () => void;
  onSnooze?: () => void;
  onSkip?: () => void;
  onDelete?: () => void;
  onSave?: (values: EditValues) => void;
};

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}.`;
}

function nextDoseTime(startIso: string, intervalHours: number): string {
  const start = new Date(startIso);
  const now = Date.now();
  const intervalMs = intervalHours * 3600 * 1000;
  const elapsed = now - start.getTime();

  const next = elapsed < 0
    ? start
    : new Date(start.getTime() + (Math.floor(elapsed / intervalMs) + 1) * intervalMs);

  const timeStr = next.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" });

  const today = new Date();
  const isToday =
    next.getDate() === today.getDate() &&
    next.getMonth() === today.getMonth() &&
    next.getFullYear() === today.getFullYear();
  if (isToday) return timeStr;

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow =
    next.getDate() === tomorrow.getDate() &&
    next.getMonth() === tomorrow.getMonth() &&
    next.getFullYear() === tomorrow.getFullYear();
  if (isTomorrow) return `sutra ${timeStr}`;

  const dd = String(next.getDate()).padStart(2, "0");
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}. ${timeStr}`;
}

const inputClass =
  "h-12 px-4 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

export function ReminderCard({ reminder, variant = "priority", onConfirm, onSnooze, onSkip, onDelete, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState(toLocalDatetimeValue(reminder.startDate));
  const [intervalHours, setIntervalHours] = useState(reminder.intervalHours);
  const [quantity, setQuantity] = useState(reminder.quantity);

  const handleSave = () => {
    onSave?.({
      pocetno_vrijeme: startTime.length === 16 ? startTime + ":00" : startTime,
      razmak_sati: intervalHours,
      kolicina: quantity,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setStartTime(toLocalDatetimeValue(reminder.startDate));
    setIntervalHours(reminder.intervalHours);
    setQuantity(reminder.quantity);
    setEditing(false);
  };

  const nextDose = nextDoseTime(reminder.startDate, reminder.intervalHours);

  if (variant === "secondary") {
    return (
      <article className="bg-card rounded-3xl p-6 shadow-sm ring-1 ring-foreground/5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="flex gap-5 items-center">
            <div className="size-16 rounded-2xl bg-navy-bg flex items-center justify-center shrink-0">
              <Pill className="size-7 text-navy-light" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold mb-1">{reminder.name}</h3>
              <p className="text-navy-light font-semibold">
                Svakih {reminder.intervalHours}h • {reminder.quantity} kom • Početak: {formatDate(reminder.startDate)}
              </p>
            </div>
          </div>
          {!editing && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="h-12 px-5 rounded-xl font-bold border-2 border-navy-bg"
              >
                <Pencil className="size-4 mr-2" aria-hidden="true" />
                Uredi
              </Button>
              <Button
                variant="secondary"
                onClick={onDelete}
                className="h-12 px-5 rounded-xl font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4 mr-2" aria-hidden="true" />
                Obriši
              </Button>
            </div>
          )}
        </div>

        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-navy-bg">
            <div className="space-y-1">
              <Label className="text-sm font-bold">Početno vrijeme</Label>
              <Input type="datetime-local" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-bold">Razmak (sati)</Label>
              <Input type="number" min={1} className={inputClass} value={intervalHours} onChange={(e) => setIntervalHours(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-bold">Količina</Label>
              <Input type="number" min={1} className={inputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <Button onClick={handleSave} className="h-11 px-6 rounded-xl font-bold bg-navy-mid hover:bg-navy-dark text-white">Spremi</Button>
              <Button variant="outline" onClick={handleCancel} className="h-11 px-6 rounded-xl font-bold">
                <X className="size-4 mr-1" />Odustani
              </Button>
            </div>
          </div>
        )}
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
              Svakih {reminder.intervalHours}h • {reminder.quantity} kom
            </p>
            <p className="text-navy-light text-base mt-1">
              Početak: <span className="font-semibold">{formatDate(reminder.startDate)}</span>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-navy-light uppercase tracking-widest">
            Sljedeća doza
          </div>
          <div className="text-4xl font-display font-bold tabular-nums">
            {nextDose}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-navy-bg pt-4">
          <div className="space-y-1">
            <Label className="text-sm font-bold">Početno vrijeme</Label>
            <Input type="datetime-local" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-bold">Razmak (sati)</Label>
            <Input type="number" min={1} className={inputClass} value={intervalHours} onChange={(e) => setIntervalHours(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-bold">Količina</Label>
            <Input type="number" min={1} className={inputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-3 flex gap-3">
            <Button onClick={handleSave} className="h-14 rounded-xl font-bold bg-navy-mid hover:bg-navy-dark text-white px-8">Spremi</Button>
            <Button variant="outline" onClick={handleCancel} className="h-14 rounded-xl font-bold px-8">
              <X className="size-4 mr-1" />Odustani
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={onConfirm} className="h-16 rounded-2xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white">
              <Check className="size-5 mr-2" aria-hidden="true" />
              Označi kao uzeto
            </Button>
            <Button
              variant="secondary"
              onClick={onSnooze}
              className="h-16 rounded-2xl text-lg font-bold bg-navy-bg text-navy-dark hover:bg-navy-bg/70"
            >
              <Clock className="size-5 mr-2" aria-hidden="true" />
              Odgodi (15 min)
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 border-t border-navy-bg items-center">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-navy-light font-bold hover:text-navy-dark text-base transition-colors"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Uredi
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 text-navy-light font-bold hover:text-destructive text-base transition-colors"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Obriši
            </button>
            <button
              onClick={onSkip}
              className="ml-auto inline-flex items-center gap-2 px-4 h-11 rounded-xl border-2 border-destructive text-destructive font-bold text-base hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <BellOff className="size-4" aria-hidden="true" />
              Nemoj me podsjećati danas
            </button>
          </div>
        </>
      )}
    </article>
  );
}
