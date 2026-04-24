import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_cors';
import { checkRateLimit, getClientIp } from './_rate-limit';
import { transformMetaAdToAd } from './_transform';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Apply CORS — returns false and sends 403 if origin is not allowed
  if (!applyCors(request, response)) return;

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Validate HTTP method
  if (request.method !== 'GET') {
    return response.status(405).json({
      error: 'INVALID_METHOD',
      message: 'Only GET requests are allowed.',
    });
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    response.setHeader('Retry-After', String(rateLimit.retryAfter));
    return response.status(429).json({
      error: 'RATE_LIMIT',
      message: `Too many requests. Retry after ${rateLimit.retryAfter} seconds.`,
    });
  }
  response.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));

  // Get environment variables
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';

  if (!accessToken || !adAccountId) {
    return response.status(500).json({
      error: 'CONFIGURATION_ERROR',
      message: 'META_ACCESS_TOKEN and META_AD_ACCOUNT_ID must be configured.',
    });
  }

  // Extract query parameters
  const { status, dateFrom, dateTo } = request.query;

  // Validate date format (YYYY-MM-DD) if provided
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateFrom && typeof dateFrom === 'string' && !dateFormatRegex.test(dateFrom)) {
    return response.status(400).json({
      error: 'INVALID_DATE_FORMAT',
      message: 'dateFrom must be in YYYY-MM-DD format.',
    });
  }
  if (dateTo && typeof dateTo === 'string' && !dateFormatRegex.test(dateTo)) {
    return response.status(400).json({
      error: 'INVALID_DATE_FORMAT',
      message: 'dateTo must be in YYYY-MM-DD format.',
    });
  }

  try {
    // Build Meta Graph API URL
    // NOTE: access_token is sent via Authorization header, NOT as a query parameter,
    // to prevent token exposure in server logs.
    const baseUrl = `https://graph.facebook.com/${apiVersion}/${adAccountId}/ads`;

    // Fields to request
    // NOTE: time_range is applied in the insights field to filter metrics by date range.
    // DO NOT use time_range as a query parameter — that filters ads by creation date, NOT insights metrics.
    const fields = [
      'id',
      'name',
      'status',
      'effective_status',
      'created_time',
      'updated_time',
      'configured_status',
      'targeting{publisher_platforms}',
      'creative{id,name,title,body,image_url,video_id,thumbnail_url,object_url,link_url,call_to_action_type,object_story_spec}',
      `insights${
        dateFrom && dateTo
          ? `.time_range({'since':'${dateFrom}','until':'${dateTo}'})`
          : '.date_preset(last_30d)'
      }{impressions,clicks,reach,spend,ctr,actions,cost_per_action_type,account_currency}`,
    ].join(',');

    const params = new URLSearchParams({
      fields,
      limit: '100',
    });

    // Add status filter if provided
    if (status && status !== 'all') {
      const effectiveStatus = status === 'active' ? 'ACTIVE' : 'PAUSED';
      params.append(
        'filtering',
        JSON.stringify([{ field: 'effective_status', operator: 'IN', value: [effectiveStatus] }])
      );
    }

    const url = `${baseUrl}?${params.toString()}`;

    // Log sanitized URL (no token)
    console.log('Meta API Request URL:', url);

    // Fetch all pages of ads
    let allAds: any[] = [];
    let nextUrl: string | null = url;
    let fetchCount = 0;
    const MAX_FETCHES = 5; // Safety limit of 500 ads
    const startTime = Date.now();
    const MAX_EXECUTION_TIME = 8500; // 8.5 seconds

    while (nextUrl && fetchCount < MAX_FETCHES) {
      const elapsed = Date.now() - startTime;
      const timeRemaining = MAX_EXECUTION_TIME - elapsed;

      if (timeRemaining <= 0) {
        console.warn(`[TIMEOUT] Fetched ${allAds.length} ads. Stopping to prevent 504.`);
        break;
      }

      fetchCount++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeRemaining);

      try {
        // access_token is sent via Authorization header — never in the URL
        const metaResponse: Response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!metaResponse.ok) {
          const errorData = await metaResponse.json().catch(() => ({}));
          console.error('Meta API error:', errorData);

          if (metaResponse.status === 401) {
            return response.status(401).json({
              error: 'INVALID_TOKEN',
              message: 'Token de acesso inválido ou expirado.',
              details: errorData,
            });
          }
          if (metaResponse.status === 403) {
            return response.status(403).json({
              error: 'PERMISSION_DENIED',
              message: 'Sem permissão para acessar esta conta de anúncios.',
              details: errorData,
            });
          }
          if (metaResponse.status === 429) {
            return response.status(429).json({
              error: 'RATE_LIMIT',
              message: 'Limite de requisições excedido.',
              details: errorData,
            });
          }
          return response.status(502).json({
            error: 'META_API_ERROR',
            message: errorData.error?.message || 'Erro ao buscar dados da Meta API',
            details: errorData,
          });
        }

        const data: any = await metaResponse.json();
        allAds = allAds.concat(data.data || []);
        nextUrl = data.paging?.next || null;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn(
            `[TIMEOUT] Meta API fetch aborted to prevent 504. Returning ${allAds.length} fetched ads.`
          );
          break;
        } else {
          throw err;
        }
      }
    }

    // Transform using the canonical function from _transform.ts
    const transformedAds = allAds.map(transformMetaAdToAd);

    return response.status(200).json({
      ads: transformedAds,
      total: transformedAds.length,
      paging: null,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}
