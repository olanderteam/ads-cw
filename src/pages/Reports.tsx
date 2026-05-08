import { useState, useCallback, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { useAds } from "@/hooks/use-ads";
import { formatDateParam } from "@/lib/utils";

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
        status: statusFilter === 'all' ? undefined : statusFilter as 'active' | 'inactive',
        dateFrom,
        dateTo,
    });

    const lastSyncedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

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
