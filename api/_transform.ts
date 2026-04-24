/**
 * Canonical transformation function for Meta Graph API ad responses.
 * This is the single source of truth — do NOT duplicate this logic in the frontend.
 */

export interface Ad {
  id: string;
  adId: string;
  headline: string;
  body: string;
  ctaText: string;
  destinationUrl: string;
  thumbnail: string;
  status: 'active' | 'inactive';
  platform: string;
  startDate: string;
  lastSeen: string;
  pageName: string;
  tags: string[];
  notes: string;
  // Performance metrics — always present, default to 0 / 'BRL'
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  spend: number;
  leads: number;
  costPerLead: number;
  currency: string;
}

/** Map Meta API platform identifiers to display names */
const PLATFORM_MAP: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  messenger: 'Messenger',
  audience_network: 'Audience Network',
};

/**
 * Extracts the inner URL from an externally-wrapped URL (e.g. Facebook CDN wrappers).
 * Returns the original URL if no inner URL is found.
 */
function extractHighResUrl(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const innerUrl = urlObj.searchParams.get('url');
    if (innerUrl) return decodeURIComponent(innerUrl);
  } catch {
    // Ignore parse errors — return original
  }
  return url;
}

/**
 * Returns the first matching action value from an actions array.
 * Checks action types in priority order to avoid array-order mismatches.
 */
function getActionValue(actions: any[], types: string[]): number {
  for (const type of types) {
    const act = actions.find((a: any) => a.action_type === type);
    if (act && act.value) return parseInt(act.value, 10);
  }
  return 0;
}

const LEAD_ACTION_TYPES = [
  'lead',
  'leadgen_grouped',
  'onsite_conversion.lead_grouped',
  'offsite_conversion.fb_pixel_lead',
];

/**
 * Transforms a raw Meta Graph API ad object into our canonical Ad interface.
 * All metric fields are guaranteed to be non-null numbers (defaulting to 0).
 */
export function transformMetaAdToAd(metaAd: any): Ad {
  const creative = metaAd.creative || {};
  const insights = metaAd.insights?.data?.[0] || {};

  // --- Headline ---
  let headline =
    creative.title ||
    creative.object_story_spec?.link_data?.name ||
    creative.object_story_spec?.video_data?.title ||
    creative.asset_feed_spec?.titles?.[0]?.text ||
    creative.name ||
    metaAd.name ||
    'Sem título';

  // Replace Meta template macros (e.g. {{product.name}}) with the ad name
  if (headline.includes('{{') && headline.includes('}}') && metaAd.name) {
    headline = metaAd.name;
  }

  // --- Body ---
  const body =
    creative.body ||
    creative.object_story_spec?.link_data?.message ||
    creative.message ||
    '';

  // --- Thumbnail ---
  let thumbnail = '';
  if (creative.image_url) {
    thumbnail = extractHighResUrl(creative.image_url);
  } else if (creative.object_story_spec?.link_data?.picture) {
    thumbnail = extractHighResUrl(creative.object_story_spec.link_data.picture);
  } else if (creative.object_story_spec?.video_data?.image_url) {
    thumbnail = extractHighResUrl(creative.object_story_spec.video_data.image_url);
  } else if (creative.thumbnail_url) {
    thumbnail = extractHighResUrl(creative.thumbnail_url);
  } else if (creative.video_thumbnail_url) {
    thumbnail = extractHighResUrl(creative.video_thumbnail_url);
  }

  // --- CTA ---
  const ctaText =
    creative.call_to_action_type ||
    creative.object_story_spec?.link_data?.call_to_action?.type ||
    'LEARN_MORE';

  // --- Destination URL ---
  const destinationUrl =
    creative.link_url ||
    creative.object_url ||
    creative.object_story_spec?.link_data?.link ||
    '';

  // --- Metrics ---
  const impressions = parseInt(insights.impressions || '0', 10);
  const clicks = parseInt(insights.clicks || '0', 10);
  const reach = parseInt(insights.reach || '0', 10);
  const spend = parseFloat(insights.spend || '0');
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  const actions = insights.actions || [];
  const leads = getActionValue(actions, LEAD_ACTION_TYPES);
  const costPerLead = leads > 0 ? spend / leads : 0;

  // --- Status ---
  const effectiveStatus = metaAd.effective_status?.toLowerCase() || 'unknown';
  const status: 'active' | 'inactive' = effectiveStatus === 'active' ? 'active' : 'inactive';

  // --- Platform ---
  const publisherPlatforms: string[] = metaAd.targeting?.publisher_platforms || [];
  let platform = 'Meta Ads';
  if (publisherPlatforms.length > 0) {
    const mapped = publisherPlatforms
      .map((p) => PLATFORM_MAP[p.toLowerCase()] || p)
      .filter(Boolean);
    if (mapped.length > 0) platform = mapped.join(', ');
  }

  return {
    id: metaAd.id,
    adId: `AD-${metaAd.id.slice(-6)}`,
    headline,
    body,
    ctaText,
    destinationUrl,
    thumbnail,
    status,
    platform,
    startDate: metaAd.created_time || new Date().toISOString(),
    lastSeen: metaAd.updated_time || new Date().toISOString(),
    pageName: 'Meta Ads',
    tags: [],
    notes: '',
    impressions,
    clicks,
    reach,
    ctr: parseFloat(ctr.toFixed(2)),
    spend: parseFloat(spend.toFixed(2)),
    leads,
    costPerLead: parseFloat(costPerLead.toFixed(2)),
    currency: insights.account_currency || 'BRL',
  };
}
