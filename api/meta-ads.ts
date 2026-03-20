import { createClient } from 'redis';
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
  const redisUrl = process.env.REDIS_URL;

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

  let redisClient: any = null;

  try {
    // ---------------------------------------------------------------------------
    // 1. CHECAR O CACHE ANTES DE CHAMAR A API DA META (Redis Client)
    // ---------------------------------------------------------------------------
    const cacheKey = `ads_${status || 'all'}_${dateFrom || 'none'}_${dateTo || 'none'}`;
    let cachedData = null;

    if (redisUrl) {
      try {
        redisClient = createClient({ url: redisUrl });
        redisClient.on('error', (err: any) => console.error('Redis Client Error:', err));
        
        await redisClient.connect();
        
        // Tenta buscar o dado em cache
        const rawCache = await redisClient.get(cacheKey);
        
        if (rawCache) {
          cachedData = JSON.parse(rawCache);
          console.log(`[CACHE HIT] Retornando dados do Redis para a chave: ${cacheKey}`);
          
          await redisClient.disconnect();
          response.setHeader('X-Cache', 'HIT');
          return response.status(200).json(cachedData);
        }
        
        console.log(`[CACHE MISS] Dados não encontrados no Redis para a chave: ${cacheKey}. Buscando na Meta...`);
      } catch (cacheError) {
        console.error('Erro ao acessar o Redis Cache:', cacheError);
        // Fallback natural caso haja falha temporária no banco de dados
      }
    } else {
      console.log('Nenhuma REDIS_URL encontrada. O Cache será ignorado.');
    }

    // ---------------------------------------------------------------------------
    // 2. BUSCAR NA API DA META (Se nao tiver no cache)
    // ---------------------------------------------------------------------------
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
      'configured_status',
      'targeting{publisher_platforms}',
      'creative{id,name,title,body,image_url,image_hash,video_id,thumbnail_url,object_url,link_url,call_to_action_type,object_story_spec,asset_feed_spec}',
      `insights${dateFrom && dateTo ? `.time_range({'since':'${dateFrom}','until':'${dateTo}'})` : '.date_preset(last_30d)'}{impressions,clicks,inline_link_clicks,reach,spend,ctr,actions,cost_per_action_type,account_currency}`
    ].join(',');

    const params = new URLSearchParams({
      access_token: accessToken,
      fields: fields,
      limit: '50' // Reduced from 300 to 50 to avoid Meta API timeout and "reduce data" errors
    });

    // Add status filter
    // CRITICAL FIX: To avoid hitting the Ad Account's CPU Time limit (502/429),
    // we NEVER fetch all statuses. If the user doesn't pass a specific status,
    // we fetch only ACTIVE and PAUSED ads (ignoring DELETED/ARCHIVED entirely).
    if (status && status !== 'all') {
      const effectiveStatus = status === 'active' ? 'ACTIVE' : 'PAUSED';
      params.append('filtering', JSON.stringify([{
        field: 'effective_status',
        operator: 'IN',
        value: [effectiveStatus]
      }]));
    } else {
      // Default behavior when status is 'all' or missing
      params.append('filtering', JSON.stringify([{
        field: 'effective_status',
        operator: 'IN',
        value: ['ACTIVE', 'PAUSED']
      }]));
    }

    const url = `${baseUrl}?${params.toString()}`;
    
    // Log final constructed URL for debugging
    console.log('Meta API Request URL:', url);

    // Fetch all pages of ads
    let allAds: any[] = [];
    let nextUrl: string | null = url;
    let fetchCount = 0;
    const MAX_FETCHES = 5; // Fetch max 5 pages (250 ads) to safely fit under Vercel's timeout
    
    while (nextUrl && fetchCount < MAX_FETCHES) { 
      fetchCount++;
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
      
      // Extract headline with better fallbacks
      let headline = creative.title 
        || creative.object_story_spec?.link_data?.name
        || creative.object_story_spec?.video_data?.title
        || creative.asset_feed_spec?.titles?.[0]?.text
        || (creative.object_story_spec?.template_data?.name)
        || creative.name 
        || metaAd.name 
        || 'Sem título';

      // If the headline is just a dynamic placeholder (e.g. {{product.name}}), try to use the ad name instead 
      // if it provides better context, though for DPA the template might be the only title.
      if (headline.includes('{{') && headline.includes('}}') && metaAd.name) {
        headline = metaAd.name !== headline ? metaAd.name : headline;
      }

      // Extract body with better fallbacks  
      const body = creative.body 
        || creative.object_story_spec?.link_data?.message
        || creative.object_story_spec?.video_data?.message
        || creative.asset_feed_spec?.bodies?.[0]?.text
        || creative.message
        || '';
      
      // Extract thumbnail with better fallbacks and high quality
      let thumbnail = '';
      
      // Priority 1: Use image_hash to construct high-res URL
      if (creative.image_hash) {
        // Use Graph API to get the actual high-quality image URL
        thumbnail = `https://graph.facebook.com/v21.0/${creative.image_hash}/picture?type=large&access_token=${accessToken}`;
      }
      // Priority 2: Use direct image URLs from creative
      else if (creative.image_url) {
        thumbnail = creative.image_url;
      } else if (creative.thumbnail_url) {
        thumbnail = creative.thumbnail_url;
      } else if (creative.video_thumbnail_url) {
        thumbnail = creative.video_thumbnail_url;
      } 
      // Priority 3: Extract from object_story_spec
      else if (creative.object_story_spec?.link_data?.picture) {
        thumbnail = creative.object_story_spec.link_data.picture;
      } else if (creative.object_story_spec?.link_data?.image_hash) {
        thumbnail = `https://graph.facebook.com/v21.0/${creative.object_story_spec.link_data.image_hash}/picture?type=large&access_token=${accessToken}`;
      }

      // Extract CTA with fallback
      const ctaText = creative.call_to_action_type 
        || creative.object_story_spec?.link_data?.call_to_action?.type
        || 'LEARN_MORE';

      // Extract destination URL with fallback
      const destinationUrl = creative.link_url 
        || creative.object_url
        || creative.object_story_spec?.link_data?.link
        || '';

      // Extract metrics
      const impressions = parseInt(insights.impressions || '0');
      const allClicks = parseInt(insights.clicks || '0');
      const inlineLinkClicks = parseInt(insights.inline_link_clicks || '0');
      const clicks = inlineLinkClicks > 0 ? inlineLinkClicks : allClicks;
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

      // Extract platform information
      const targeting = metaAd.targeting || {};
      const publisherPlatforms = targeting.publisher_platforms || [];

      // Map Meta API platform values to display values
      const platformMap: Record<string, string> = {
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'messenger': 'Messenger',
        'audience_network': 'Audience Network'
      };

      // Convert platforms array to display string
      let platform = 'Meta Ads'; // fallback
      if (publisherPlatforms.length > 0) {
        const mappedPlatforms = publisherPlatforms
          .map((p: string) => platformMap[p.toLowerCase()] || p)
          .filter((p: string) => p);
        
        if (mappedPlatforms.length > 0) {
          platform = mappedPlatforms.join(', ');
        }
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
    
    // ---------------------------------------------------------------------------
    // 3. SALVAR RESULTADO FINAL NO CACHE (Expirando em 30 min) E RETORNAR
    // ---------------------------------------------------------------------------
    const finalResponseData = {
      ads: transformedAds,
      total: transformedAds.length,
      paging: null // All ads fetched
    };
    
    try {
      if (redisClient) {
        // Salva no Redis (ex: 1800 segundos = 30 minutos) e desconecta
        await redisClient.setEx(cacheKey, 1800, JSON.stringify(finalResponseData));
        console.log(`[CACHE SET] Dados salvos no Redis para a chave: ${cacheKey}`);
        await redisClient.disconnect();
      }
    } catch (cacheError) {
      console.error('Erro ao salvar no Redis Cache:', cacheError);
      // Garante a desconexão mesmo em caso de erro ao salvar
      if (redisClient) {
        try {
          await redisClient.disconnect();
        } catch (e) {
          console.error('Erro ao desconectar do Redis:', e);
        }
      }
    }
    
    response.setHeader('X-Cache', 'MISS');
    return response.status(200).json(finalResponseData);

  } catch (error) {
    // Em caso de erro catastrófico, tenta fechar a conexão solta
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } catch (e) {}
    }
    
    console.error('Proxy error:', error);
    return response.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
}
