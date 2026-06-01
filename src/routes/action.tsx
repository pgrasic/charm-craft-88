import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { emailAction } from "@/lib/api";

export const Route = createFileRoute("/action")({
  validateSearch: (search) => ({
    token: (search.token as string) ?? "",
  }),
  component: ActionPage,
});

const LABELS: Record<string, string> = {
  confirm: "Uzimanje lijeka potvrđeno!",
  snooze: "Podsjetnik odgođen za 15 minuta.",
  skip: "Nećemo vas podsjećati danas.",
};

function ActionPage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Nevažeći link.");
      return;
    }
    emailAction(token)
      .then((data) => {
        setMessage(LABELS[data.action] ?? data.message);
        setStatus("success");
      })
      .catch((err) => {
        setMessage(err?.message || "Akcija nije uspjela. Link je možda istekao.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-dvh bg-navy-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-reveal">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/stef-logo.png" alt="Štef" className="size-20 rounded-2xl" />
          <span className="font-display text-2xl font-extrabold text-white">Štef</span>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="size-12 rounded-full bg-navy-bg animate-pulse mx-auto" />
              <p className="text-navy-light font-semibold">Obrađujemo vaš zahtjev…</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-navy-dark mb-2">Uspješno!</h1>
                <p className="text-navy-light font-semibold">{message}</p>
              </div>
              <Link
                to="/reminders"
                className="h-12 px-8 rounded-xl bg-navy-mid text-white font-bold text-sm grid place-items-center hover:bg-navy-dark transition-colors w-fit mx-auto"
              >
                Moji podsjetnici
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-3xl">
                ✗
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-navy-dark mb-2">Greška</h1>
                <p className="text-navy-light font-semibold">{message}</p>
              </div>
              <Link
                to="/"
                className="inline-block h-12 px-8 rounded-xl bg-navy-mid text-white font-bold text-sm grid place-items-center hover:bg-navy-dark transition-colors"
              >
                Povratak
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
