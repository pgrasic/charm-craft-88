import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Registracija — Štef" },
      { name: "description", content: "Otvorite svoj Štef račun." },
    ],
  }),
  component: RegisterPage,
});

const inputClass =
  "h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

function RegisterPage() {
  const navigate = useNavigate();
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ime || !email || !password) {
      toast.error("Molimo ispunite sva obavezna polja.");
      return;
    }
    setLoading(true);
    try {
      await register({ ime, prezime, email, lozinka: password });
      navigate({ to: "/reminders" });
    } catch (err: any) {
      toast.error(err?.message || "Registracija nije uspjela.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background grid place-items-center px-4 py-12">
      <div className="w-full max-w-xl animate-reveal">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src="/stef-logo.png" alt="" aria-hidden="true" className="size-24 rounded-2xl" />
          <span className="font-display text-3xl font-extrabold text-navy-dark">
            Štef
          </span>
        </div>

        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl ring-1 ring-foreground/5">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-8">
            Registracija
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ime" className="text-base font-bold">Ime *</Label>
                <Input
                  id="ime"
                  className={inputClass}
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prezime" className="text-base font-bold">Prezime</Label>
                <Input
                  id="prezime"
                  className={inputClass}
                  value={prezime}
                  onChange={(e) => setPrezime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold">E-mail *</Label>
              <Input
                id="email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw" className="text-base font-bold">Lozinka *</Label>
              <Input
                id="pw"
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white shadow-lg shadow-navy-mid/20"
            >
              {loading ? "Registracija..." : "Registriraj se"}
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
