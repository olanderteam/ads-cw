import { useMemo } from "react";
import type { Ad } from "@/data/mockAds";
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

interface AnalyticsSectionProps {
  ads: Ad[];
}

export function AnalyticsSection({ ads }: AnalyticsSectionProps) {
  const adsByStatusData = useMemo(() => {
    const activeCount = ads.filter((ad) => ad.status === "active").length;
    const inactiveCount = ads.filter((ad) => ad.status === "inactive").length;
    
    return [
      { status: "Active", count: activeCount },
      { status: "Inactive", count: inactiveCount },
    ];
  }, [ads]);

  const adActivityData = useMemo(() => {
    // Sort ads by start date
    const sortedAds = [...ads]
      .filter((a) => a.startDate)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    const countsByDate: Record<string, number> = {};
    sortedAds.forEach((ad) => {
      const dateObj = new Date(ad.startDate);
      // Format as "Jan 1"
      const dateStr = `${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getDate()}`;
      countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    });

    const result = [];
    let cumulative = 0;
    for (const [date, count] of Object.entries(countsByDate)) {
      cumulative += count;
      result.push({ date, count: cumulative });
    }
    
    if (result.length === 0) {
      return [{ date: "No data", count: 0 }];
    }
    
    return result;
  }, [ads]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Line Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Ads Detected Over Time</h3>
        <p className="text-xs text-muted-foreground mb-4">Cumulative ads tracked</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={adActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
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

      {/* Bar Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Ads by Status</h3>
        <p className="text-xs text-muted-foreground mb-4">Current distribution</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adsByStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
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
