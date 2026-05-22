import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/add-reminder")({
  head: () => ({
    meta: [
      { title: "Unos lijeka — MedikApp" },
      { name: "description", content: "Dodajte novi podsjetnik za lijek." },
    ],
  }),
  component: AddReminderPage,
});

function AddReminderPage() {
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
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <Label htmlFor="med" className="text-base font-bold text-navy-dark">
            Lijek
          </Label>
          <Input
            id="med"
            placeholder="Pretraži i odaberi lijek"
            className="h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start" className="text-base font-bold text-navy-dark">
            Početno vrijeme
          </Label>
          <Input
            id="start"
            type="datetime-local"
            className="h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0"
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
            defaultValue={24}
            className="h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0"
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
            defaultValue={1}
            className="h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-16 rounded-xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white shadow-lg shadow-navy-mid/20"
        >
          <Save className="size-5 mr-2" aria-hidden="true" />
          Spremi podsjetnik
        </Button>
      </form>
    </div>
  );
}
