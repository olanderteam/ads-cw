import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Applies CORS headers based on the ALLOWED_ORIGINS environment variable.
 *
 * Returns `true` if the request origin is allowed (or if it's a same-origin request).
 * Returns `false` and sends a 403 response if the origin is not allowed.
 */
export function applyCors(request: VercelRequest, response: VercelResponse): boolean {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const origin = request.headers['origin'] as string | undefined;

  // Same-origin requests (no Origin header) are always allowed
  if (!origin) {
    return true;
  }

  // Extract the host from the request to allow same-domain requests
  const requestHost = request.headers['host'] as string | undefined;
  if (requestHost && origin.includes(requestHost)) {
    // Allow requests from the same domain (e.g., Vercel deployment)
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return true;
  }

  // If no allowed origins are configured, reject all cross-origin requests
  if (allowedOrigins.length === 0) {
    response.status(403).json({
      error: 'CORS_DENIED',
      message: 'Cross-origin requests are not allowed. Configure ALLOWED_ORIGINS.',
    });
    return false;
  }

  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return true;
  }

  response.status(403).json({
    error: 'CORS_DENIED',
    message: 'Origin not allowed.',
  });
  return false;
}
