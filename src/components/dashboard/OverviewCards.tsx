import { TrendingUp, Activity, Sparkles, RefreshCw } from "lucide-react";
import type { Ad } from "@/data/mockAds";

interface OverviewCardsProps {
  ads: Ad[];
}

export function OverviewCards({ ads }: OverviewCardsProps) {
  const total = ads.length;
  const active = ads.filter((a) => a.status === "active").length;
  const newLast7 = ads.filter((a) => {
    const start = new Date(a.startDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return start >= weekAgo;
  }).length;
  const updatedRecently = ads.filter((a) => {
    const seen = new Date(a.lastSeen);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return seen >= threeDaysAgo;
  }).length;

  const cards = [
    { label: "Total Ads", value: total, icon: Activity, trend: "+2 this month" },
    { label: "Active Ads", value: active, icon: TrendingUp, trend: `${Math.round((active / total) * 100)}% of total` },
    { label: "New (Last 7 Days)", value: newLast7, icon: Sparkles, trend: "Recently launched" },
    { label: "Updated Recently", value: updatedRecently, icon: RefreshCw, trend: "Last 3 days" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card rounded-xl border border-border p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </span>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.trend}</p>
        </div>
      ))}
    </div>
  );
}
