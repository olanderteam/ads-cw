import { useState } from "react";
import { X, ExternalLink, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Ad } from "@/data/mockAds";
import { formatCurrency } from "@/lib/utils";

interface AdDetailsModalProps {
  ad: Ad | null;
  onClose: () => void;
}

const tagColors: Record<string, string> = {
  Promo: "bg-warning/10 text-warning",
  "Always-on": "bg-primary/10 text-primary",
  Institucional: "bg-muted text-muted-foreground",
  Sazonal: "bg-destructive/10 text-destructive",
  Lançamento: "bg-success/10 text-success",
  Aquisição: "bg-primary/10 text-primary",
  "Social Proof": "bg-muted text-muted-foreground",
};

export function AdDetailsModal({ ad, onClose }: AdDetailsModalProps) {
  const [notes, setNotes] = useState(ad?.notes || "");

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Ad Details</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Creative Preview */}
          <div className="h-64 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative group">
            {ad.thumbnail ? (
              <img
                src={ad.thumbnail}
                alt={ad.headline}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Headline & Body */}
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">{ad.headline}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{ad.body}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">CTA</span>
              <p className="font-medium text-foreground">{ad.ctaText}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Status</span>
              <p>
                <Badge
                  variant={ad.status === "active" ? "default" : "secondary"}
                  className={
                    ad.status === "active"
                      ? "bg-success/10 text-success border-0 text-xs"
                      : "text-xs"
                  }
                >
                  {ad.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ad ID</span>
              <p className="font-medium text-foreground text-xs">{ad.adId}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Platform</span>
              <p className="font-medium text-foreground">{ad.platform}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Start Date</span>
              <p className="font-medium text-foreground">
                {new Date(ad.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Last Seen</span>
              <p className="font-medium text-foreground">
                {new Date(ad.lastSeen).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          {(ad.impressions || ad.clicks || ad.spend || ad.leads) && (
            <div className="border-t border-border pt-4">
              <h5 className="text-sm font-semibold text-foreground mb-3">Performance Metrics</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {ad.impressions !== undefined && (
                  <div>
                    <span className="text-xs text-muted-foreground">Impressions</span>
                    <p className="font-medium text-foreground">{ad.impressions.toLocaleString()}</p>
                  </div>
                )}
                {ad.clicks !== undefined && (
                  <div>
                    <span className="text-xs text-muted-foreground">Clicks</span>
                    <p className="font-medium text-foreground">{ad.clicks.toLocaleString()}</p>
                  </div>
                )}
                {ad.ctr !== undefined && (
                  <div>
                    <span className="text-xs text-muted-foreground">CTR</span>
                    <p className="font-medium text-foreground">{ad.ctr.toFixed(2)}%</p>
                  </div>
                )}
                {ad.spend !== undefined && (
                  <div>
                    <span className="text-xs text-muted-foreground">Spend</span>
                    <p className="font-medium text-foreground">
                      {formatCurrency(ad.spend, ad.currency)}
                    </p>
                  </div>
                )}
                {ad.leads !== undefined && (
                  <div>
                    <span className="text-xs text-muted-foreground">Leads</span>
                    <p className="font-medium text-foreground">{ad.leads.toLocaleString()}</p>
                  </div>
                )}
                {ad.costPerLead !== undefined && ad.costPerLead > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Cost per Lead</span>
                    <p className="font-medium text-foreground">
                      {formatCurrency(ad.costPerLead, ad.currency)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Destination URL */}
          <div>
            <span className="text-xs text-muted-foreground">Destination URL</span>
            <a
              href={ad.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline mt-0.5"
            >
              {ad.destinationUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Tags */}
          {ad.tags && ad.tags.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {ad.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${tagColors[tag] || "bg-muted text-muted-foreground"
                      }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <span className="text-xs text-muted-foreground mb-2 block">Internal Notes</span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this ad…"
              className="text-sm min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
