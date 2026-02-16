import {
  LayoutDashboard,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Settings,
  Image,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Anúncios Ativos", url: "/active", icon: PlayCircle },
  { title: "Anúncios Inativos", url: "/inactive", icon: PauseCircle },
  { title: "Criativos", url: "/changes", icon: Image },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">CW</span>
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">Cardápio Web</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-sidebar-foreground/50">Data source: Apify</p>
      </div>
    </aside>
  );
}
