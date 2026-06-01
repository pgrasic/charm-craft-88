import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Prijava — Štef" },
      { name: "description", content: "Prijavite se u Štef." },
    ],
  }),
  component: LoginPage,
});

const inputClass =
  "h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Unesite e-mail i lozinku.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/reminders" });
    } catch (err: any) {
      toast.error(err?.message || "Prijava nije uspjela.");
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
            Prijava
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ime.prezime@email.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw" className="text-base font-bold">Lozinka</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${inputClass} pr-24`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-3 rounded-lg text-navy-mid font-bold text-sm uppercase hover:bg-navy-bg transition-colors"
                >
                  {showPw ? "Sakrij" : "Prikaži"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-xl text-lg font-bold bg-navy-mid hover:bg-navy-dark text-white shadow-lg shadow-navy-mid/20"
            >
              {loading ? "Prijava..." : "Prijava"}
            </Button>

            <p className="text-center font-semibold text-navy-light pt-2">
              Novi ste ovdje?{" "}
              <Link
                to="/register"
                className="text-navy-mid underline underline-offset-4 font-bold"
              >
                Registriraj se
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
