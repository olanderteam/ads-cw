import { useState, useCallback, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { useAds } from "@/hooks/use-ads";
import { formatDateParam, formatCurrency } from "@/lib/utils";
import { Activity, Target, Zap } from "lucide-react";

const Reports = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
        const today = new Date();
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        return { from: last30Days, to: today };
    });

    const [debouncedDateRange, setDebouncedDateRange] = useState(dateRange);

    const handleDateRangeChange = useCallback((range: { from: Date; to: Date } | undefined) => {
        if (range) setDateRange(range);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedDateRange(dateRange), 500);
        return () => clearTimeout(timer);
    }, [dateRange]);

    const dateFrom = formatDateParam(debouncedDateRange.from);
    const dateTo = formatDateParam(debouncedDateRange.to);

    const { data: ads = [], isLoading, dataUpdatedAt } = useAds({
        status: statusFilter === "all" ? undefined : (statusFilter as "active" | "inactive"),
        dateFrom,
        dateTo,
    });

    const lastSyncedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

    const currency = ads[0]?.currency || "BRL";

    const derivedMetrics = useMemo(() => {
        const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
        const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
        const totalLeads = ads.reduce((s, a) => s + a.leads, 0);
        const totalSpend = ads.reduce((s, a) => s + a.spend, 0);

        const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
        const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;
        const avgReach = ads.length > 0 ? ads.reduce((s, a) => s + a.reach, 0) / ads.length : 0;

        return [
            {
                label: "CPM",
                value: formatCurrency(cpm, currency),
                sub: "Custo por mil impressões",
                icon: Activity,
                color: "text-blue-500",
            },
            {
                label: "Taxa de Conversão",
                value: `${conversionRate.toFixed(2)}%`,
                sub: "Leads / Cliques",
                icon: Target,
                color: "text-green-500",
            },
            {
                label: "Alcance Médio",
                value: Math.round(avgReach).toLocaleString("pt-BR"),
                sub: "Por anúncio",
                icon: Zap,
                color: "text-purple-500",
            },
        ];
    }, [ads, currency]);

    return (
        <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <MobileNav />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    lastSyncedAt={lastSyncedAt}
                    isLoading={isLoading}
                />

                <main className="flex-1 p-6 space-y-6">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Relatórios</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Análise de performance e insights
                        </p>
                    </div>

                    <OverviewCards ads={ads} />

                    {/* Métricas derivadas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {derivedMetrics.map((m) => (
                            <div key={m.label} className="bg-card rounded-xl border border-border p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {m.label}
                                    </span>
                                    <m.icon className={`h-4 w-4 ${m.color}`} />
                                </div>
                                <p className="text-2xl font-semibold text-foreground">{m.value}</p>
                                <p className="text-xs text-muted-foreground">{m.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center min-h-[200px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <AnalyticsSection ads={ads} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;
