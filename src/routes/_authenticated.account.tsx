import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getUserInfo, updateUserInfo, createMedicationRequest } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Korisnički račun — Štef" },
      { name: "description", content: "Vaši osobni podaci i zahtjevi za lijek." },
    ],
  }),
  component: AccountPage,
});

const inputClass =
  "h-14 px-5 text-base rounded-xl bg-navy-bg border-2 border-transparent focus-visible:border-navy-mid focus-visible:bg-card focus-visible:ring-0";

function ProfileTab() {
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserInfo()
      .then((u) => {
        setIme(u?.ime || "");
        setPrezime(u?.prezime || "");
        setEmail(u?.email || "");
      })
      .catch((err: any) => toast.error(err?.message || "Greška pri učitavanju profila."))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ime, prezime, email };
      if (password) payload.lozinka = password;
      await updateUserInfo(payload);
      toast.success("Profil uspješno spremljen.");
      setPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Greška pri spremanju.");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return <div className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5 h-64 animate-pulse" />;
  }

  return (
    <form
      className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5 space-y-6"
      onSubmit={handleSave}
    >
      <h2 className="font-display text-2xl font-bold">Vaši podaci</h2>

      <div className="space-y-2">
        <Label htmlFor="ime" className="text-base font-bold">Ime</Label>
        <Input id="ime" className={inputClass} value={ime} onChange={(e) => setIme(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prezime" className="text-base font-bold">Prezime</Label>
        <Input id="prezime" className={inputClass} value={prezime} onChange={(e) => setPrezime(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-bold">E-mail</Label>
        <Input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw" className="text-base font-bold">Nova lozinka</Label>
        <Input
          id="pw"
          type="password"
          placeholder="Ostavite prazno ako ne mijenjate"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="h-14 px-8 rounded-xl text-base font-bold bg-navy-mid hover:bg-navy-dark text-white"
      >
        {saving ? "Spremanje..." : "Spremi"}
      </Button>
    </form>
  );
}

function MedicationRequestTab() {
  const [naziv, setNaziv] = useState("");
  const [djelatna, setDjelatna] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naziv.trim()) { toast.error("Unesite naziv lijeka."); return; }
    setSubmitting(true);
    try {
      await createMedicationRequest({ naziv: naziv.trim(), DjelatnaTvar: djelatna.trim(), nestasica: false, accepted: false });
      toast.success("Zahtjev uspješno poslan.");
      setNaziv("");
      setDjelatna("");
    } catch (err: any) {
      toast.error(err?.message || "Greška pri slanju zahtjeva.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="bg-card rounded-3xl p-8 shadow-xl ring-1 ring-foreground/5 space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="font-display text-2xl font-bold">Zahtjev za lijek</h2>
      <p className="text-navy-light">
        Pošaljite zahtjev liječniku ako vam ponestaje lijeka.
      </p>

      <div className="space-y-2">
        <Label htmlFor="naziv" className="text-base font-bold">Naziv lijeka *</Label>
        <Input
          id="naziv"
          className={inputClass}
          value={naziv}
          onChange={(e) => setNaziv(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="djelatna" className="text-base font-bold">Djelatna tvar</Label>
        <Input
          id="djelatna"
          className={inputClass}
          value={djelatna}
          onChange={(e) => setDjelatna(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-14 px-8 rounded-xl text-base font-bold bg-success hover:bg-success/90 text-success-foreground"
      >
        {submitting ? "Slanje..." : "Pošalji zahtjev"}
      </Button>
    </form>
  );
}

function AccountPage() {
  return (
    <div className="max-w-3xl mx-auto animate-reveal">
      <header className="mb-10">
        <p className="text-navy-light font-bold uppercase tracking-widest text-sm mb-2">
          Profil
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-dark">
          Korisnički račun
        </h1>
      </header>

      <Tabs defaultValue="podaci" className="w-full">
        <TabsList className="grid grid-cols-2 w-full h-auto p-1.5 rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5 mb-6">
          <TabsTrigger
            value="podaci"
            className="h-12 text-base font-bold rounded-xl data-[state=active]:bg-navy-mid data-[state=active]:text-white"
          >
            Vaši podaci
          </TabsTrigger>
          <TabsTrigger
            value="zahtjev"
            className="h-12 text-base font-bold rounded-xl data-[state=active]:bg-navy-mid data-[state=active]:text-white"
          >
            Zahtjev za lijek
          </TabsTrigger>
        </TabsList>

        <TabsContent value="podaci">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="zahtjev">
          <MedicationRequestTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
