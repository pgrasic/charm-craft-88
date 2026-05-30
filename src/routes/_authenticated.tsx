import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="min-h-dvh flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex items-center px-4 md:hidden border-b-2 border-border bg-navy-dark text-white shadow-md">
            <SidebarTrigger
              aria-label="Otvori izbornik"
              className="size-14 rounded-xl bg-white text-navy-dark hover:bg-white/90 border-2 border-white [&_svg]:!size-8 shrink-0"
            />
            <span className="ml-4 font-display font-extrabold text-xl">Izbornik</span>
            <span className="ml-auto font-display font-extrabold text-2xl tracking-tight">
              MedikApp
            </span>
          </header>
          <main className="flex-1 p-6 md:p-10 lg:p-12">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
