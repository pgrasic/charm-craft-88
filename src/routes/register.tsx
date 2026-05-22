import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Registracija — MedikApp" },
      { name: "description", content: "Otvorite svoj MedikApp račun." },
    ],
  }),
  component: RegisterPage,
});

const inputClass =
  "h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

function RegisterPage() {
  return (
    <div className="min-h-dvh bg-background grid place-items-center px-4 py-12">
      <div className="w-full max-w-xl animate-reveal">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="size-12 rounded-xl bg-navy-mid grid place-items-center text-white">
            <Pill className="size-6" aria-hidden="true" />
          </div>
          <span className="font-display text-3xl font-extrabold text-navy-dark">
            MedikApp
          </span>
        </div>

        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl ring-1 ring-foreground/5">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-8">
            Registracija
          </h1>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ime" className="text-base font-bold">Ime</Label>
                <Input id="ime" className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prezime" className="text-base font-bold">Prezime</Label>
                <Input id="prezime" className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold">E-mail</Label>
              <Input id="email" type="email" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw" className="text-base font-bold">Lozinka</Label>
              <Input id="pw" type="password" className={inputClass} />
            </div>

            <Button
              type="submit"
              className="w-full h-16 rounded-xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white shadow-lg shadow-navy-mid/20"
              asChild
            >
              <Link to="/reminders">Registriraj se</Link>
            </Button>

            <p className="text-center font-semibold text-navy-light pt-2">
              Već imate račun?{" "}
              <Link
                to="/login"
                className="text-navy-mid underline underline-offset-4 font-bold"
              >
                Prijavite se
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
