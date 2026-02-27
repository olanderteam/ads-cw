import type { Ad } from '@/data/mockAds';

/**
 * Parameters for fetching ads from Meta Marketing API
 */
export interface FetchAdsParams {
  status?: 'all' | 'active' | 'inactive';
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Meta API Error structure
 */
export interface MetaApiError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

/**
 * Fetch ads from Meta Marketing API via proxy endpoint
 */
export const fetchAds = async (params: FetchAdsParams = {}): Promise<Ad[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    if (params.dateFrom) {
      queryParams.append('dateFrom', params.dateFrom);
    }
    
    if (params.dateTo) {
      queryParams.append('dateTo', params.dateTo);
    }

    const url = `/api/meta-ads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Token de acesso inválido ou expirado. Por favor, configure um novo token.');
      }
      
      if (response.status === 403) {
        throw new Error('Sem permissão para acessar esta conta de anúncios. Verifique as permissões do token.');
      }
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Por favor, tente novamente mais tarde.');
      }

      throw new Error(errorData.message || `Erro ao buscar anúncios: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Data is already transformed by the backend
    return data.ads || [];

  } catch (error) {
    console.error('Meta API client error:', error);
    throw error;
  }
};

/**
 * Transform Meta API ad response to our Ad interface
 */
export const transformMetaAdToAd = (metaAd: any): Ad => {
  const creative = metaAd.creative || {};
  const insights = metaAd.insights?.data?.[0] || {};
  
  // Extract thumbnail
  let thumbnail = '';
  if (creative.thumbnail_url) {
    thumbnail = creative.thumbnail_url;
  } else if (creative.image_url) {
    thumbnail = creative.image_url;
  } else if (creative.video_thumbnail_url) {
    thumbnail = creative.video_thumbnail_url;
  }

  // Extract metrics
  const impressions = parseInt(insights.impressions || '0');
  const clicks = parseInt(insights.clicks || '0');
  const reach = parseInt(insights.reach || '0');
  const spend = parseFloat(insights.spend || '0');
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  // Extract leads
  const actions = insights.actions || [];
  const leadAction = actions.find((a: any) => 
    a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped'
  );
  const leads = leadAction ? parseInt(leadAction.value) : 0;
  const costPerLead = leads > 0 ? spend / leads : 0;

  // Determine status
  const effectiveStatus = metaAd.effective_status?.toLowerCase() || 'unknown';
  let status: 'active' | 'inactive' = 'inactive';
  if (effectiveStatus === 'active') {
    status = 'active';
  }

  return {
    id: metaAd.id,
    adId: `AD-${metaAd.id.slice(-6)}`,
    headline: creative.title || creative.name || 'Sem título',
    body: creative.body || creative.message || '',
    ctaText: creative.call_to_action_type || 'LEARN_MORE',
    destinationUrl: creative.link_url || creative.object_url || '',
    thumbnail,
    status,
    platform: 'Facebook',
    startDate: metaAd.created_time || new Date().toISOString(),
    lastSeen: metaAd.updated_time || new Date().toISOString(),
    pageName: metaAd.account_name || 'Meta Ads',
    tags: [],
    notes: '',
    // Performance metrics
    impressions,
    clicks,
    reach,
    ctr: parseFloat(ctr.toFixed(2)),
    spend: parseFloat(spend.toFixed(2)),
    leads,
    costPerLead: parseFloat(costPerLead.toFixed(2)),
    currency: insights.account_currency || 'BRL'
  };
};
