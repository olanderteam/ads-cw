import { Users, DollarSign, MousePointerClick, TrendingUp } from "lucide-react";
import type { Ad } from "@/data/mockAds";

interface OverviewCardsProps {
  ads: Ad[];
}

export function OverviewCards({ ads }: OverviewCardsProps) {
  // Calculate total metrics from all ads
  const totalLeads = ads.reduce((sum, ad) => sum + (ad.leads || 0), 0);
  const totalSpend = ads.reduce((sum, ad) => sum + (ad.spend || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  
  // Calculate averages
  const avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  // Get currency from first ad (assuming all ads use same currency)
  const currency = ads[0]?.currency || 'BRL';

  const cards = [
    { 
      label: "Total Leads", 
      value: totalLeads.toLocaleString(), 
      icon: Users, 
      trend: `From ${ads.length} ads`,
      color: "text-success"
    },
    { 
      label: "Cost per Lead", 
      value: `${currency} ${avgCostPerLead.toFixed(2)}`, 
      icon: DollarSign, 
      trend: `Total spend: ${currency} ${totalSpend.toFixed(2)}`,
      color: "text-warning"
    },
    { 
      label: "Total Clicks", 
      value: totalClicks.toLocaleString(), 
      icon: MousePointerClick, 
      trend: `${totalImpressions.toLocaleString()} impressions`,
      color: "text-primary"
    },
    { 
      label: "Avg CTR", 
      value: `${avgCTR.toFixed(2)}%`, 
      icon: TrendingUp, 
      trend: "Click-through rate",
      color: "text-info"
    },
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
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </div>
          <p className="text-2xl font-semibold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.trend}</p>
        </div>
      ))}
    </div>
  );
}
