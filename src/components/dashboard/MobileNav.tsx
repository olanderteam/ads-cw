import { useState } from "react";
import { Menu, X, LayoutDashboard, PlayCircle, PauseCircle, RefreshCw, BarChart3, Image } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Anúncios Ativos", url: "/active", icon: PlayCircle },
  { title: "Anúncios Inativos", url: "/inactive", icon: PauseCircle },
  { title: "Criativos", url: "/changes", icon: Image },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">CW</span>
                </div>
                <span className="text-sm font-semibold text-sidebar-foreground">Cardápio Web</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
