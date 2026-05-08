import {
  LayoutDashboard,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Image,
  Settings2,
} from "lucide-react";

export const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Anúncios Ativos", url: "/active", icon: PlayCircle },
  { title: "Anúncios Inativos", url: "/inactive", icon: PauseCircle },
  { title: "Criativos", url: "/changes", icon: Image },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings2 },
];
