import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Validate HTTP method
  if (request.method !== 'GET') {
    return response.status(405).json({
      error: 'INVALID_METHOD',
      message: 'Only GET requests are allowed.'
    });
  }

  // Get environment variables
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';

  if (!accessToken || !adAccountId) {
    return response.status(500).json({
      error: 'CONFIGURATION_ERROR',
      message: 'META_ACCESS_TOKEN and META_AD_ACCOUNT_ID must be configured.'
    });
  }

  // Extract query parameters
  const { status, dateFrom, dateTo } = request.query;

  // Validate date format (YYYY-MM-DD) if provided
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateFrom && typeof dateFrom === 'string' && !dateFormatRegex.test(dateFrom)) {
    return response.status(400).json({
      error: 'INVALID_DATE_FORMAT',
      message: 'dateFrom must be in YYYY-MM-DD format.'
    });
  }
  if (dateTo && typeof dateTo === 'string' && !dateFormatRegex.test(dateTo)) {
    return response.status(400).json({
      error: 'INVALID_DATE_FORMAT',
      message: 'dateTo must be in YYYY-MM-DD format.'
    });
  }

  try {
    // Build Meta Graph API URL
    const baseUrl = `https://graph.facebook.com/${apiVersion}/${adAccountId}/ads`;
    
    // Fields to request
    // NOTE: time_range is applied in the insights field to filter metrics by date range.
    // DO NOT use time_range as a query parameter - that filters ads by creation date, NOT insights metrics.
    const fields = [
      'id',
      'name',
      'status',
      'effective_status',
      'created_time',
      'updated_time',
      'creative{id,name,title,body,image_url,video_id,thumbnail_url,object_url,link_url,call_to_action_type}',
      `insights${dateFrom && dateTo ? `.time_range({'since':'${dateFrom}','until':'${dateTo}'})` : '.date_preset(last_30d)'}{impressions,clicks,reach,spend,ctr,actions,cost_per_action_type,account_currency}`
    ].join(',');

    const params = new URLSearchParams({
      access_token: accessToken,
      fields: fields,
      limit: '100'
    });

    // Add status filter if provided
    if (status && status !== 'all') {
      const effectiveStatus = status === 'active' ? 'ACTIVE' : 'PAUSED';
      params.append('filtering', JSON.stringify([{
        field: 'effective_status',
        operator: 'IN',
        value: [effectiveStatus]
      }]));
    }

    const url = `${baseUrl}?${params.toString()}`;
    
    // Log final constructed URL for debugging
    console.log('Meta API Request URL:', url);

    // Fetch all pages of ads
    let allAds: any[] = [];
    let nextUrl: string | null = url;
    
    while (nextUrl && allAds.length < 500) { // Safety limit of 500 ads
      // Make request to Meta Graph API
      const metaResponse: Response = await fetch(nextUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!metaResponse.ok) {
        const errorData = await metaResponse.json().catch(() => ({}));
        
        console.error('Meta API error:', errorData);

        // Handle specific Meta API errors
        if (metaResponse.status === 401) {
          return response.status(401).json({
            error: 'INVALID_TOKEN',
            message: 'Token de acesso inválido ou expirado.',
            details: errorData
          });
        }

        if (metaResponse.status === 403) {
          return response.status(403).json({
            error: 'PERMISSION_DENIED',
            message: 'Sem permissão para acessar esta conta de anúncios.',
            details: errorData
          });
        }

        if (metaResponse.status === 429) {
          return response.status(429).json({
            error: 'RATE_LIMIT',
            message: 'Limite de requisições excedido.',
            details: errorData
          });
        }

        return response.status(502).json({
          error: 'META_API_ERROR',
          message: errorData.error?.message || 'Erro ao buscar dados da Meta API',
          details: errorData
        });
      }

      const data: any = await metaResponse.json();
      
      // Add ads from this page
      allAds = allAds.concat(data.data || []);
      
      // Check if there's a next page
      nextUrl = data.paging?.next || null;
    }
    
    // Transform Meta API ads to our Ad interface
    const transformedAds = allAds.map((metaAd: any) => {
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

      // Extract leads - check multiple action types
      const actions = insights.actions || [];
      const leadAction = actions.find((a: any) => 
        a.action_type === 'lead' || 
        a.action_type === 'onsite_conversion.lead_grouped' ||
        a.action_type === 'leadgen_grouped' ||
        a.action_type === 'offsite_conversion.fb_pixel_lead'
      );
      const leads = leadAction ? parseInt(leadAction.value) : 0;
      
      // Get cost per lead from Meta's calculation if available
      const costPerActionTypes = insights.cost_per_action_type || [];
      const costPerLeadAction = costPerActionTypes.find((a: any) => 
        a.action_type === 'lead' || 
        a.action_type === 'onsite_conversion.lead_grouped' ||
        a.action_type === 'leadgen_grouped' ||
        a.action_type === 'offsite_conversion.fb_pixel_lead'
      );
      const costPerLead = costPerLeadAction 
        ? parseFloat(costPerLeadAction.value) 
        : (leads > 0 ? spend / leads : 0);

      // Determine status
      const effectiveStatus = metaAd.effective_status?.toLowerCase() || 'unknown';
      let status: 'active' | 'inactive' = 'inactive';
      if (effectiveStatus === 'active') {
        status = 'active';
      }

      return {
        id: metaAd.id,
        adId: `AD-${metaAd.id.slice(-6)}`,
        headline: creative.title || creative.name || metaAd.name || 'Sem título',
        body: creative.body || creative.message || '',
        ctaText: creative.call_to_action_type || 'LEARN_MORE',
        destinationUrl: creative.link_url || creative.object_url || '',
        thumbnail,
        status,
        platform: 'Facebook',
        startDate: metaAd.created_time || new Date().toISOString(),
        lastSeen: metaAd.updated_time || new Date().toISOString(),
        pageName: 'Meta Ads',
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
    });
    
    return response.status(200).json({
      ads: transformedAds,
      total: transformedAds.length,
      paging: null // All ads fetched
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
}
