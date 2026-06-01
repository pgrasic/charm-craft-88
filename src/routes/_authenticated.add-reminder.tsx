import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllMeds, createKorisnikLijek, getUserIdFromToken } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/add-reminder")({
  head: () => ({
    meta: [
      { title: "Unos lijeka — Štef" },
      { name: "description", content: "Dodajte novi podsjetnik za lijek." },
    ],
  }),
  component: AddReminderPage,
});

const inputClass =
  "h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

function AddReminderPage() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState<Array<{ id: number; naziv: string }>>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [intervalHours, setIntervalHours] = useState(24);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllMeds()
      .then((data) => setMeds(data || []))
      .catch(() => toast.error("Greška pri učitavanju lijekova."))
      .finally(() => setLoadingMeds(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(
    () => meds.filter((m) => m.naziv.toLowerCase().includes(search.toLowerCase())),
    [meds, search]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId) { toast.error("Odaberite lijek iz popisa."); return; }
    if (!startTime) { toast.error("Odaberite početno vrijeme."); return; }
    if (intervalHours < 1) { toast.error("Razmak mora biti najmanje 1 sat."); return; }
    if (quantity < 1) { toast.error("Količina mora biti najmanje 1."); return; }

    const korisnikId = getUserIdFromToken();
    if (!korisnikId) { toast.error("Niste prijavljeni."); return; }

    setSubmitting(true);
    try {
      await createKorisnikLijek({
        korisnik_id: Number(korisnikId),
        lijek_id: selectedMedId,
        pocetno_vrijeme: new Date(startTime),
        razmak_sati: intervalHours,
        kolicina: quantity,
      });
      toast.success("Podsjetnik uspješno dodan.");
      navigate({ to: "/reminders" });
    } catch (err: any) {
      toast.error(err?.message || "Greška pri dodavanju podsjetnika.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-reveal">
      <header className="mb-10">
        <p className="text-navy-light font-bold uppercase tracking-widest text-sm mb-2">
          Novi podsjetnik
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-dark">
          Unos lijeka
        </h1>
      </header>

      <form
        className="bg-card rounded-3xl p-8 md:p-10 shadow-xl ring-1 ring-foreground/5 space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2" ref={dropdownRef}>
          <Label htmlFor="med" className="text-base font-bold text-navy-dark">
            Lijek
          </Label>
          <div className="relative">
            <Input
              id="med"
              placeholder={loadingMeds ? "Učitavanje lijekova..." : "Pretraži i odaberi lijek"}
              className={inputClass}
              value={search}
              disabled={loadingMeds}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedMedId(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            {showDropdown && search && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-navy-bg rounded-xl shadow-lg overflow-hidden">
                {filtered.length === 0 ? (
                  <div className="px-5 py-3 text-navy-light font-semibold">Nema rezultata</div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto">
                    {filtered.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          className="w-full text-left px-5 py-3 font-semibold hover:bg-navy-bg transition-colors"
                          onClick={() => {
                            setSelectedMedId(m.id);
                            setSearch(m.naziv);
                            setShowDropdown(false);
                          }}
                        >
                          {m.naziv}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {selectedMedId && (
            <p className="text-sm text-navy-light font-semibold">
              Odabrano: <span className="text-navy-dark">{search}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start" className="text-base font-bold text-navy-dark">
            Početno vrijeme
          </Label>
          <Input
            id="start"
            type="datetime-local"
            className={inputClass}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval" className="text-base font-bold text-navy-dark">
            Razmak (sati)
          </Label>
          <Input
            id="interval"
            type="number"
            min={1}
            className={inputClass}
            value={intervalHours}
            onChange={(e) => setIntervalHours(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qty" className="text-base font-bold text-navy-dark">
            Količina
          </Label>
          <Input
            id="qty"
            type="number"
            min={1}
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-16 rounded-xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white shadow-lg shadow-navy-mid/20"
        >
          <Save className="size-5 mr-2" aria-hidden="true" />
          {submitting ? "Spremanje..." : "Spremi podsjetnik"}
        </Button>
      </form>
    </div>
  );
}
