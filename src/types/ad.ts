export interface Ad {
  id: string;
  adId: string;
  headline: string;
  body: string;
  ctaText: string;
  destinationUrl: string;
  thumbnail: string;
  status: "active" | "inactive";
  platform: string;
  startDate: string;
  lastSeen: string;
  pageName: string;
  tags: string[];
  notes: string;
  // Campaign / adset hierarchy
  campaignId: string;
  campaignName: string;
  campaignObjective: string;
  adsetId: string;
  adsetName: string;
  // Performance metrics — always present (default 0 / 'BRL')
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  spend: number;
  leads: number;
  costPerLead: number;
  currency: string;
}
