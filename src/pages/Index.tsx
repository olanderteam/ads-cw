import { useState, useMemo } from "react";
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

  // Use global hook
  const { data: ads = [], isLoading } = useAds();

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

          <AnalyticsSection />
        </main>
      </div>

      <AdDetailsModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
};

export default Index;
