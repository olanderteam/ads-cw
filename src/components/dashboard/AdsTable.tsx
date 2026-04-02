import { useState, useMemo } from "react";
import { Eye, Image, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
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

interface AdsTableProps {
  ads: Ad[];
  onViewDetails: (ad: Ad) => void;
}

type SortColumn = "headline" | "status" | "impressions" | "reach" | "clicks" | "ctr" | "spend" | "leads" | "costPerLead" | null;
type SortDirection = "asc" | "desc";

export function AdsTable({ ads, onViewDetails }: AdsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc"); // Default to desc for a new column (highest metrics first)
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline-block" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline-block" />
    );
  };

  const sortedAds = useMemo(() => {
    if (!sortColumn) return ads;

    return [...ads].sort((a, b) => {
      let valueA: any = a[sortColumn];
      let valueB: any = b[sortColumn];

      // Handle null/undefined values
      if (valueA === undefined || valueA === null) valueA = typeof valueB === 'number' ? 0 : '';
      if (valueB === undefined || valueB === null) valueB = typeof valueA === 'number' ? 0 : '';

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Numeric comparison
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [ads, sortColumn, sortDirection]);

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
              <TableHead 
                className="text-xs cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("headline")}
              >
                Headline {getSortIcon("headline")}
              </TableHead>
              <TableHead 
                className="text-xs cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("status")}
              >
                Status {getSortIcon("status")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("impressions")}
              >
                Impressions {getSortIcon("impressions")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("reach")}
              >
                Reach {getSortIcon("reach")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("clicks")}
              >
                Clicks {getSortIcon("clicks")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("ctr")}
              >
                CTR {getSortIcon("ctr")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("spend")}
              >
                Spend {getSortIcon("spend")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("leads")}
              >
                Leads {getSortIcon("leads")}
              </TableHead>
              <TableHead 
                className="text-xs text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort("costPerLead")}
              >
                Cost/Lead {getSortIcon("costPerLead")}
              </TableHead>
              <TableHead className="text-xs w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAds.map((ad) => (
              <TableRow key={ad.id} className="cursor-pointer" onClick={() => onViewDetails(ad)}>
                <TableCell>
                  <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {ad.thumbnail ? (
                      <img
                        src={ad.thumbnail}
                        alt="Ad Creative"
                        loading="eager"
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
                  {ad.impressions !== undefined ? ad.impressions.toLocaleString() : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.reach !== undefined ? ad.reach.toLocaleString() : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.clicks !== undefined ? ad.clicks.toLocaleString() : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.ctr !== undefined ? `${ad.ctr.toFixed(2)}%` : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.spend !== undefined ? formatCurrency(ad.spend, ad.currency) : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.leads !== undefined ? ad.leads.toLocaleString() : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {ad.costPerLead !== undefined && ad.costPerLead > 0 
                    ? formatCurrency(ad.costPerLead, ad.currency) 
                    : '-'}
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
            {sortedAds.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-10 text-sm text-muted-foreground">
                  No ads found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
