import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { AdsTable } from "@/components/dashboard/AdsTable";
import { AdDetailsModal } from "@/components/dashboard/AdDetailsModal";
import { MobileNav } from "@/components/dashboard/MobileNav";
import type { Ad } from "@/data/mockAds";
import { useAds } from "@/hooks/use-ads";

const InactiveAds = () => {
    const [search, setSearch] = useState("");
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

    const { data: ads = [], isLoading } = useAds();

    const filteredAds = ads.filter((ad) => {
        const isStatusMatch = ad.status === "inactive";
        const isSearchMatch =
            search === "" ||
            ad.headline?.toLowerCase().includes(search.toLowerCase()) ||
            ad.adId?.toLowerCase().includes(search.toLowerCase());
        return isStatusMatch && isSearchMatch;
    });

    return (
        <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <MobileNav />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter="inactive"
                    onStatusFilterChange={() => { }}
                />

                <main className="flex-1 p-6 space-y-6">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Inactive Ads</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Paused or completed campaigns
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

export default InactiveAds;
