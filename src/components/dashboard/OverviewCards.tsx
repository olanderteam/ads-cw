import { Users, DollarSign, MousePointerClick, TrendingUp, Eye } from "lucide-react";
import type { Ad } from "@/data/mockAds";
import { formatCurrency } from "@/lib/utils";

interface OverviewCardsProps {
  ads: Ad[];
}

export function OverviewCards({ ads }: OverviewCardsProps) {
  // Calculate total metrics from all ads
  const totalLeads = ads.reduce((sum, ad) => sum + (ad.leads || 0), 0);
  const totalSpend = ads.reduce((sum, ad) => sum + (ad.spend || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalReach = ads.reduce((sum, ad) => sum + (ad.reach || 0), 0);

  // Calculate averages
  const avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Get currency from first ad (assuming all ads use same currency)
  const currency = ads[0]?.currency || 'BRL';

  const cards = [
    {
      label: "Total de Leads",
      value: totalLeads.toLocaleString(),
      icon: Users,
      trend: `De ${ads.length} anúncios`,
      color: "text-success",
    },
    {
      label: "Custo por Lead",
      value: formatCurrency(avgCostPerLead, currency),
      icon: DollarSign,
      trend: `Gasto total: ${formatCurrency(totalSpend, currency)}`,
      color: "text-warning",
    },
    {
      label: "Total de Cliques",
      value: totalClicks.toLocaleString(),
      icon: MousePointerClick,
      trend: `De ${ads.length} anúncios`,
      color: "text-primary",
    },
    {
      label: "Total de Impressões",
      value: totalImpressions.toLocaleString(),
      icon: TrendingUp,
      trend: `CTR médio: ${avgCTR.toFixed(2)}%`,
      color: "text-info",
    },
    {
      label: "Alcance Total",
      value: totalReach.toLocaleString(),
      icon: Eye,
      trend: `De ${ads.length} anúncios`,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card rounded-xl border border-border p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </span>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </div>
          <p className="text-2xl font-semibold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.trend}</p>
        </div>
      ))}
    </div>
  );
}
