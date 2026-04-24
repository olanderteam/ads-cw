import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { AdsTable } from "@/components/dashboard/AdsTable";
import { AdDetailsModal } from "@/components/dashboard/AdDetailsModal";
import { MobileNav } from "@/components/dashboard/MobileNav";
import type { Ad } from "@/data/mockAds";
import { useAds } from "@/hooks/use-ads";

const ActiveAds = () => {
    const [search, setSearch] = useState("");
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

    // Default to last 30 days
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
        const today = new Date();
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        return { from: last30Days, to: today };
    });

    const [debouncedDateRange, setDebouncedDateRange] = useState(dateRange);

    const handleDateRangeChange = useCallback((range: { from: Date; to: Date } | undefined) => {
        if (range) {
            setDateRange(range);
            const timer = setTimeout(() => setDebouncedDateRange(range), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const dateFrom = `${debouncedDateRange.from.getFullYear()}-${String(debouncedDateRange.from.getMonth() + 1).padStart(2, '0')}-${String(debouncedDateRange.from.getDate()).padStart(2, '0')}`;
    const dateTo = `${debouncedDateRange.to.getFullYear()}-${String(debouncedDateRange.to.getMonth() + 1).padStart(2, '0')}-${String(debouncedDateRange.to.getDate()).padStart(2, '0')}`;

    const { data: ads = [], isLoading, dataUpdatedAt } = useAds({ status: 'active', dateFrom, dateTo });
    const lastSyncedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

    const filteredAds = ads.filter((ad) => {
        return (
            search === "" ||
            ad.headline?.toLowerCase().includes(search.toLowerCase()) ||
            ad.adId?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <MobileNav />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter="active"
                    onStatusFilterChange={() => {}}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    lastSyncedAt={lastSyncedAt}
                />

                <main className="flex-1 p-6 space-y-6">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Active Ads</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Currently running campaigns
                        </p>
                    </div>

                    <div className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center min-h-[200px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <AdsTable ads={filteredAds} onViewDetails={setSelectedAd} />
                    </div>
                </main>
            </div>

            <AdDetailsModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
        </div>
    );
};

export default ActiveAds;
