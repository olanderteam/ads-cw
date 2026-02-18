import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Set CORS headers for all responses
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight request
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

  // Extract and validate query parameters
  const { pageId, country, active_status, apiKey } = request.query;

  if (!pageId || !country || !active_status) {
    return response.status(400).json({
      error: 'MISSING_PARAMETERS',
      message: 'Required parameters: pageId, country, active_status'
    });
  }

  // Get API key (query param takes precedence over environment variable)
  const scraperApiKey = (apiKey as string) || process.env.SCRAPER_CREATORS_API_KEY;

  if (!scraperApiKey) {
    return response.status(401).json({
      error: 'MISSING_API_KEY',
      message: 'API key is required. Provide it via query parameter or environment variable.'
    });
  }

  try {
    // Construct URL for Scraper Creators API
    const url = `https://api.scrapecreators.com/v1/facebook/adLibrary/company/ads?pageId=${pageId}&country=${country}&active_status=${active_status}`;

    // Forward request to Scraper Creators API
    const upstreamResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': scraperApiKey,
        'Content-Type': 'application/json'
      }
    });

    // Handle upstream API errors
    if (!upstreamResponse.ok) {
      return response.status(502).json({
        error: 'UPSTREAM_ERROR',
        message: `Scraper Creators API error: ${upstreamResponse.statusText}`,
        status: upstreamResponse.status
      });
    }

    // Parse and return the response
    const data = await upstreamResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    // Handle network errors
    console.error('Proxy error:', error instanceof Error ? error.message : 'Unknown error');
    return response.status(502).json({
      error: 'NETWORK_ERROR',
      message: 'Failed to connect to Scraper Creators API'
    });
  }
}
