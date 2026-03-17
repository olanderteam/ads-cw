import { useState, useMemo, useCallback, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { AdsTable } from "@/components/dashboard/AdsTable";
import { AdDetailsModal } from "@/components/dashboard/AdDetailsModal";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { MobileNav } from "@/components/dashboard/MobileNav";
import type { Ad } from "@/data/mockAds";
import { useAds } from "@/hooks/use-ads";

const Index = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  
  // Default to last 30 days
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>(() => {
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);
    return { from: last30Days, to: today };
  });

  // Debounced params for API calls
  const [apiDateParams, setApiDateParams] = useState({ 
    dateFrom: dateRange?.from ? `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth() + 1).padStart(2, '0')}-${String(dateRange.from.getDate()).padStart(2, '0')}` : undefined,
    dateTo: dateRange?.to ? `${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth() + 1).padStart(2, '0')}-${String(dateRange.to.getDate()).padStart(2, '0')}` : undefined
  });

  // Debounce API calls correctly using useEffect
  useEffect(() => {
    if (!dateRange?.from) return;

    // We only trigger API search when the range is complete (both from and to are set)
    // or if only from is set, we might not want to fetch until 'to' is also selected (but we'll allow it after a delay).
    const timer = setTimeout(() => {
      setApiDateParams({
        dateFrom: dateRange?.from ? `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth() + 1).padStart(2, '0')}-${String(dateRange.from.getDate()).padStart(2, '0')}` : undefined,
        dateTo: dateRange?.to ? `${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth() + 1).padStart(2, '0')}-${String(dateRange.to.getDate()).padStart(2, '0')}` : undefined
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [dateRange]);

  const handleDateRangeChange = useCallback((range: { from: Date; to?: Date } | undefined) => {
    setDateRange(range);
  }, []);

  // Use global hook with debounced date params
  const { dateFrom, dateTo } = apiDateParams;
  
  // Debug: Log date range being used
  console.log('Date Range Filter:', { dateFrom, dateTo, dateRange });
  
  const { data: ads = [], isLoading } = useAds({
    status: statusFilter === 'all' ? undefined : statusFilter as 'active' | 'inactive',
    dateFrom,
    dateTo
  });

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchesSearch =
        search === "" ||
        ad.headline?.toLowerCase().includes(search.toLowerCase()) ||
        ad.adId?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || ad.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, ads]);

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
        />

        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">CHECK-IN ADS</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitor Meta ads for Cardápio Web
            </p>
          </div>

          <OverviewCards ads={ads} />

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <AdsTable ads={filteredAds} onViewDetails={setSelectedAd} />
          </div>

          <AnalyticsSection ads={ads} />
        </main>
      </div>

      <AdDetailsModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
};

export default Index;
