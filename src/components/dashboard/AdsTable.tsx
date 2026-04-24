import { Eye, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Ad } from "@/data/mockAds";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 50;

interface AdsTableProps {
  ads: Ad[];
  onViewDetails: (ad: Ad) => void;
}

export function AdsTable({ ads, onViewDetails }: AdsTableProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the ads list changes (filter applied)
  useEffect(() => {
    setPage(1);
  }, [ads]);

  const totalPages = Math.max(1, Math.ceil(ads.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageAds = ads.slice(start, start + PAGE_SIZE);
  const end = Math.min(start + PAGE_SIZE, ads.length);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Ads Library</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{ads.length} ads found</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs w-10">Creative</TableHead>
              <TableHead className="text-xs">Headline</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Impressions</TableHead>
              <TableHead className="text-xs text-right">Reach</TableHead>
              <TableHead className="text-xs text-right">Clicks</TableHead>
              <TableHead className="text-xs text-right">CTR</TableHead>
              <TableHead className="text-xs text-right">Spend</TableHead>
              <TableHead className="text-xs text-right">Leads</TableHead>
              <TableHead className="text-xs text-right">Cost/Lead</TableHead>
              <TableHead className="text-xs w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageAds.map((ad) => (
              <TableRow key={ad.id} className="cursor-pointer" onClick={() => onViewDetails(ad)}>
                <TableCell>
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {ad.thumbnail ? (
                      <img
                        src={ad.thumbnail}
                        alt="Ad Creative"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('bg-muted');
                        }}
                      />
                    ) : (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-foreground truncate max-w-xs">
                    {ad.headline}
                  </p>
                  <p className="text-xs text-muted-foreground">{ad.adId}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ad.status === "active" ? "default" : "secondary"}
                    className={
                      ad.status === "active"
                        ? "bg-success/10 text-success hover:bg-success/15 border-0 text-xs"
                        : "text-xs"
                    }
                  >
                    {ad.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.impressions.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.reach.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.clicks.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.ctr.toFixed(2)}%
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {formatCurrency(ad.spend, ad.currency)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.leads.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.costPerLead > 0 ? formatCurrency(ad.costPerLead, ad.currency) : '-'}
                </TableCell>
                <TableCell>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(ad);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-10 text-sm text-muted-foreground">
                  No ads found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {ads.length > 0 && (
        <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Exibindo {ads.length === 0 ? 0 : start + 1}–{end} de {ads.length} anúncios
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
