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
          <header className="h-14 flex items-center px-4 md:hidden border-b border-border bg-card">
            <SidebarTrigger aria-label="Otvori navigaciju" />
            <span className="ml-3 font-display font-bold text-lg">MedikApp</span>
          </header>
          <main className="flex-1 p-6 md:p-10 lg:p-12">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
