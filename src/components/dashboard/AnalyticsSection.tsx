import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { Ad } from "@/data/mockAds";
import { format, startOfWeek, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalyticsSectionProps {
  ads: Ad[];
}

export function AnalyticsSection({ ads }: AnalyticsSectionProps) {
  // Distribution by status
  const adsByStatus = useMemo(() => [
    { status: "Active", count: ads.filter((a) => a.status === "active").length },
    { status: "Inactive", count: ads.filter((a) => a.status === "inactive").length },
  ], [ads]);

  // Weekly time series based on startDate
  const adActivity = useMemo(() => {
    if (ads.length === 0) return [];

    // Find the earliest and latest startDate
    const dates = ads.map((a) => new Date(a.startDate).getTime()).filter((d) => !isNaN(d));
    if (dates.length === 0) return [];

    const minDate = startOfWeek(new Date(Math.min(...dates)), { weekStartsOn: 1 });
    const maxDate = startOfWeek(new Date(Math.max(...dates)), { weekStartsOn: 1 });

    // Build weekly buckets
    const buckets: Record<string, number> = {};
    let current = minDate;
    while (current <= maxDate) {
      const key = format(current, "dd/MM", { locale: ptBR });
      buckets[key] = 0;
      current = addWeeks(current, 1);
    }

    // Count ads per week
    for (const ad of ads) {
      const d = new Date(ad.startDate);
      if (isNaN(d.getTime())) continue;
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const key = format(weekStart, "dd/MM", { locale: ptBR });
      if (key in buckets) {
        buckets[key]++;
      }
    }

    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }, [ads]);

  if (ads.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center min-h-[200px] gap-3">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Nenhum dado disponível para o período selecionado.
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Line Chart — Ads over time */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Ads por Semana</h3>
        <p className="text-xs text-muted-foreground mb-4">Anúncios criados por semana</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={adActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(220, 13%, 90%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(220, 70%, 50%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(220, 70%, 50%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart — Ads by status */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Ads por Status</h3>
        <p className="text-xs text-muted-foreground mb-4">Distribuição atual</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(220, 13%, 90%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              />
              <Bar dataKey="count" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
