import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Korisnički račun — MedikApp" },
      { name: "description", content: "Vaši osobni podaci i zahtjevi za lijek." },
    ],
  }),
  component: AccountPage,
});

const inputClass =
  "h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

function AccountPage() {
  return (
    <div className="max-w-5xl mx-auto animate-reveal">
      <header className="mb-10">
        <p className="text-navy-light font-bold uppercase tracking-widest text-sm mb-2">
          Profil
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-dark">
          Korisnički račun
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5 space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <h2 className="font-display text-2xl font-bold">Vaši podaci</h2>

          <div className="space-y-2">
            <Label htmlFor="ime" className="text-base font-bold">Ime</Label>
            <Input id="ime" defaultValue="" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prezime" className="text-base font-bold">Prezime</Label>
            <Input id="prezime" defaultValue="" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-bold">E-mail</Label>
            <Input id="email" type="email" defaultValue="" className={inputClass} />
          </div>

          <Button
            type="submit"
            className="h-14 px-8 rounded-xl text-base font-bold bg-navy-mid hover:bg-navy-dark text-white"
          >
            Spremi
          </Button>
        </form>

        <form
          className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5 space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <h2 className="font-display text-2xl font-bold">Zahtjev za lijek</h2>
          <p className="text-navy-light">
            Pošaljite zahtjev liječniku ako vam ponestaje lijeka.
          </p>

          <div className="space-y-2">
            <Label htmlFor="naziv" className="text-base font-bold">Naziv lijeka</Label>
            <Input id="naziv" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="djelatna" className="text-base font-bold">Djelatna tvar</Label>
            <Input id="djelatna" className={inputClass} />
          </div>

          <Button
            type="submit"
            className="h-14 px-8 rounded-xl text-base font-bold bg-success hover:bg-success/90 text-success-foreground"
          >
            Pošalji zahtjev
          </Button>
        </form>
      </div>
    </div>
  );
}
