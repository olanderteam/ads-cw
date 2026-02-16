import { Eye, Image } from "lucide-react";
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

interface AdsTableProps {
  ads: Ad[];
  onViewDetails: (ad: Ad) => void;
}

export function AdsTable({ ads, onViewDetails }: AdsTableProps) {
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
              <TableHead className="text-xs">Start Date</TableHead>
              <TableHead className="text-xs">Last Seen</TableHead>
              <TableHead className="text-xs">Platform</TableHead>
              <TableHead className="text-xs w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
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
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(ad.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(ad.lastSeen).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{ad.platform}</TableCell>
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
                <TableCell colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
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
