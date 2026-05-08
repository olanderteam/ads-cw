import { useState, useCallback, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { AdDetailsModal } from "@/components/dashboard/AdDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Image as ImageIcon, ExternalLink } from "lucide-react";
import { useAds } from "@/hooks/use-ads";
import { formatDateParam } from "@/lib/utils";
import type { Ad } from "@/data/mockAds";

const Changes = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

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

    const { data: ads = [], isLoading } = useAds({
        status: statusFilter === 'all' ? undefined : statusFilter as 'active' | 'inactive',
        dateFrom,
        dateTo,
    });

    const filteredAds = ads.filter((ad) => {
        const matchesSearch =
            search === "" ||
            ad.headline?.toLowerCase().includes(search.toLowerCase()) ||
            ad.body?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || ad.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                        <h1 className="text-lg font-semibold text-foreground">Biblioteca de Criativos</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Galeria visual de todos os criativos rastreados
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredAds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
                            <ImageIcon className="h-10 w-10 opacity-20" />
                            <p className="text-sm">Nenhum criativo encontrado para o período selecionado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAds.map((ad) => (
                                <Card
                                    key={ad.id}
                                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-border"
                                    onClick={() => setSelectedAd(ad)}
                                >
                                    <div className="relative">
                                        <AspectRatio ratio={1 / 1} className="bg-muted">
                                            {ad.thumbnail ? (
                                                <img
                                                    src={ad.thumbnail}
                                                    alt={ad.headline}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                    <ImageIcon className="h-10 w-10 opacity-20" />
                                                </div>
                                            )}
                                        </AspectRatio>
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={ad.status === 'active' ? 'default' : 'secondary'} className="shadow-sm">
                                                {ad.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-4 space-y-3">
                                        <div className="space-y-1.5">
                                            <h3 className="font-semibold text-sm leading-tight line-clamp-2" title={ad.headline}>
                                                {ad.headline}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-3">
                                                {ad.body}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                {ad.platform}
                                            </span>
                                            <div className="flex gap-2">
                                                {ad.destinationUrl && (
                                                    <a
                                                        href={ad.destinationUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:text-primary/80"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <AdDetailsModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
        </div>
    );
};

export default Changes;
