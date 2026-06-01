import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { isAuthenticated } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="min-h-dvh flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex items-center gap-4 px-5 md:hidden bg-navy-dark text-white shadow-lg">
            <SidebarTrigger
              aria-label="Otvori izbornik"
              className="group relative size-14 rounded-2xl bg-gradient-to-br from-white to-navy-bg text-navy-dark ring-2 ring-white/30 ring-offset-2 ring-offset-navy-dark shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 [&_svg]:!size-7 [&_svg]:transition-transform [&_svg]:group-hover:scale-110 shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold">Dodirni za</span>
              <span className="font-display font-extrabold text-lg">Izbornik</span>
            </div>
            <img src="/stef-logo.png" alt="Štef" className="ml-auto size-12 rounded-xl" />
          </header>
          <main className="flex-1 p-6 md:p-10 lg:p-12">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
