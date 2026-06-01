import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, PlusCircle, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/api";

const items = [
  { title: "Moji podsjetnici", url: "/reminders", icon: Bell },
  { title: "Unos lijeka", url: "/add-reminder", icon: PlusCircle },
  { title: "Korisnički račun", url: "/account", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="bg-navy-dark text-white border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <img src="/stef-logo.png" alt="" aria-hidden="true" className="size-12 rounded-xl shrink-0" />
          {!collapsed && (
            <span className="font-display text-2xl font-extrabold tracking-tight">
              Štef
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-navy-dark text-white p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const active = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`h-14 px-4 rounded-xl text-base font-semibold transition-colors ${
                        active
                          ? "bg-white/10 text-white border-l-4 border-navy-light hover:bg-white/15"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-4">
                        <item.icon className="size-5 shrink-0" aria-hidden="true" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-navy-dark text-white p-4 border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-14 rounded-xl border-2 border-white/20 hover:bg-white/10 text-white font-bold justify-center cursor-pointer"
            >
              <LogOut className="size-5" aria-hidden="true" />
              {!collapsed && <span>Odjava</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
