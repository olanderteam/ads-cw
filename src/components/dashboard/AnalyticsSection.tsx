import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { Ad } from "@/data/mockAds";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(220 70% 60%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
  "hsl(280 60% 55%)",
  "hsl(0 70% 55%)",
  "hsl(190 70% 50%)",
  "hsl(50 80% 50%)",
];

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
};

interface AnalyticsSectionProps {
  ads: Ad[];
}

export function AnalyticsSection({ ads }: AnalyticsSectionProps) {
  const currency = ads[0]?.currency || "BRL";

  const byCampaign = useMemo(() => {
    const map: Record<string, { name: string; spend: number; leads: number; clicks: number; impressions: number }> = {};
    for (const ad of ads) {
      const key = ad.campaignName || "Sem campanha";
      if (!map[key]) map[key] = { name: key, spend: 0, leads: 0, clicks: 0, impressions: 0 };
      map[key].spend += ad.spend;
      map[key].leads += ad.leads;
      map[key].clicks += ad.clicks;
      map[key].impressions += ad.impressions;
    }
    return Object.values(map)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8)
      .map((c) => ({
        ...c,
        name: c.name.length > 22 ? c.name.slice(0, 22) + "…" : c.name,
        spend: parseFloat(c.spend.toFixed(2)),
        cpl: c.leads > 0 ? parseFloat((c.spend / c.leads).toFixed(2)) : 0,
      }));
  }, [ads]);

  const byPlatform = useMemo(() => {
    const map: Record<string, { platform: string; spend: number; leads: number; impressions: number }> = {};
    for (const ad of ads) {
      const platforms = (ad.platform || "Meta Ads").split(", ");
      for (const p of platforms) {
        if (!map[p]) map[p] = { platform: p, spend: 0, leads: 0, impressions: 0 };
        map[p].spend += ad.spend / platforms.length;
        map[p].leads += ad.leads;
        map[p].impressions += ad.impressions;
      }
    }
    return Object.values(map)
      .sort((a, b) => b.spend - a.spend)
      .map((p) => ({ ...p, spend: parseFloat(p.spend.toFixed(2)) }));
  }, [ads]);

  const topByLeads = useMemo(
    () =>
      [...ads]
        .filter((a) => a.leads > 0)
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 8)
        .map((a) => ({
          name: (a.headline || a.adId).length > 28 ? (a.headline || a.adId).slice(0, 28) + "…" : (a.headline || a.adId),
          leads: a.leads,
          cpl: a.costPerLead,
        })),
    [ads]
  );

  const funnel = useMemo(() => {
    const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
    const totalReach = ads.reduce((s, a) => s + a.reach, 0);
    const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
    const totalLeads = ads.reduce((s, a) => s + a.leads, 0);
    const base = totalImpressions || 1;
    return [
      { stage: "Impressões", value: totalImpressions, pct: "100%" },
      { stage: "Alcance", value: totalReach, pct: totalImpressions > 0 ? `${((totalReach / base) * 100).toFixed(1)}%` : "—" },
      { stage: "Cliques", value: totalClicks, pct: totalImpressions > 0 ? `${((totalClicks / base) * 100).toFixed(2)}%` : "—" },
      { stage: "Leads", value: totalLeads, pct: totalClicks > 0 ? `${((totalLeads / totalClicks) * 100).toFixed(1)}% dos cliques` : "—" },
    ];
  }, [ads]);

  const spendPie = useMemo(
    () => byCampaign.filter((c) => c.spend > 0).map((c, i) => ({ name: c.name, value: c.spend, color: COLORS[i % COLORS.length] })),
    [byCampaign]
  );

  if (ads.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center min-h-[200px] gap-3">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum dado disponível para o período selecionado.</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gasto + Leads por Campanha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Gasto por Campanha</h3>
          <p className="text-xs text-muted-foreground mb-4">Investimento total no período</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCampaign} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v, currency)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v, currency), "Gasto"]} />
                <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Leads por Campanha</h3>
          <p className="text-xs text-muted-foreground mb-4">Total de leads gerados no período</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCampaign} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, "Leads"]} />
                <Bar dataKey="leads" fill="hsl(160 60% 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Plataforma + Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Desempenho por Plataforma</h3>
          <p className="text-xs text-muted-foreground mb-4">Gasto e leads por plataforma</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlatform} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="spend" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v, currency)} />
                <YAxis yAxisId="leads" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: string) => [name === "spend" ? formatCurrency(v, currency) : v, name === "spend" ? "Gasto" : "Leads"]} />
                <Bar yAxisId="spend" dataKey="spend" name="spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="leads" dataKey="leads" name="leads" fill="hsl(160 60% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Funil de Conversão</h3>
          <p className="text-xs text-muted-foreground mb-4">Impressões → Leads</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v.toLocaleString("pt-BR"), ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {funnel.map((f) => (
              <div key={f.stage} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{f.stage}</span>
                <span className="font-medium text-foreground">{f.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top anúncios por leads */}
      {topByLeads.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Top Anúncios por Leads</h3>
          <p className="text-xs text-muted-foreground mb-4">Anúncios com maior geração de leads no período</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByLeads} layout="vertical" margin={{ left: 0, right: 48, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={160} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, "Leads"]} />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CPL por campanha + Distribuição de gasto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Custo por Lead por Campanha</h3>
          <p className="text-xs text-muted-foreground mb-4">Eficiência de conversão por campanha</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCampaign.filter((c) => c.cpl > 0)} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v, currency)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v, currency), "CPL"]} />
                <Bar dataKey="cpl" fill="hsl(30 80% 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Distribuição de Gasto</h3>
          <p className="text-xs text-muted-foreground mb-4">Por campanha</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendPie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">
                  {spendPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v, currency), "Gasto"]} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
