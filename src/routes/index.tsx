import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Štef" },
      { name: "description", content: "Neka vas Štef podsjeti na lijekove." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: "/reminders" });
    }
  }, []);

  return (
    <div className="min-h-dvh bg-navy-dark flex items-center">
      <div className="w-full max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <img
          src="/stef.png"
          alt="Štef sova s lijekovima"
          className="w-full max-w-md mx-auto"
        />

        <div className="animate-reveal flex flex-col gap-10 md:items-start items-center text-center md:text-left">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-snug">
            Zaboravljate uzeti lijekove?
            <br />
            Neka vas podsjeti{" "}
            <span className="text-navy-bg">Štef!</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/login"
              className="h-14 px-10 rounded-xl bg-white text-navy-dark font-bold text-base grid place-items-center hover:bg-navy-bg transition-colors"
            >
              Prijava
            </Link>
            <Link
              to="/register"
              className="h-14 px-10 rounded-xl bg-white/10 text-white font-bold text-base grid place-items-center hover:bg-white/20 transition-colors ring-1 ring-white/20"
            >
              Registracija
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
