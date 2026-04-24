import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_cors';

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

  // Get environment variables
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';

  // Check required configuration
  if (!accessToken || !adAccountId) {
    return response.status(500).json({
      status: 'error',
      message: 'META_ACCESS_TOKEN and META_AD_ACCOUNT_ID must be configured.',
      configured: {
        accessToken: !!accessToken,
        adAccountId: !!adAccountId,
        appId: !!appId,
        appSecret: !!appSecret,
      },
    });
  }

  // META_APP_SECRET is required for secure token validation
  if (!appSecret || !appId) {
    return response.status(500).json({
      status: 'error',
      message: 'META_APP_ID and META_APP_SECRET are required for token validation.',
      configured: {
        accessToken: !!accessToken,
        adAccountId: !!adAccountId,
        appId: !!appId,
        appSecret: !!appSecret,
      },
    });
  }

  try {
    // Validate token using app_access_token (APP_ID|APP_SECRET) — NOT self-validation
    const appAccessToken = `${appId}|${appSecret}`;
    const debugTokenUrl = `https://graph.facebook.com/${apiVersion}/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;
    const tokenResponse = await fetch(debugTokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.data?.is_valid) {
      return response.status(401).json({
        status: 'error',
        message: 'Token inválido ou expirado.',
        token: {
          valid: false,
          error: tokenData.error || tokenData.data,
        },
      });
    }

    const tokenInfo = tokenData.data;

    // Check ad account access — token sent via Authorization header
    const accountUrl = `https://graph.facebook.com/${apiVersion}/${adAccountId}?fields=id,name,account_status,currency,timezone_name`;
    const accountResponse = await fetch(accountUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accountData = await accountResponse.json();

    if (!accountResponse.ok) {
      return response.status(403).json({
        status: 'error',
        message: 'Sem acesso à conta de anúncios.',
        token: {
          valid: true,
          type: tokenInfo.type,
          scopes: tokenInfo.scopes,
        },
        account: {
          accessible: false,
          error: accountData.error,
        },
      });
    }

    // Calculate token expiration
    let expiresIn: string;
    let expirationWarning: string | null = null;

    if (tokenInfo.expires_at && tokenInfo.expires_at > 0) {
      const expiresAt = new Date(tokenInfo.expires_at * 1000);
      const now = new Date();
      const daysUntilExpiration = Math.floor(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expiresIn = `${daysUntilExpiration} dias`;
      if (daysUntilExpiration < 7) {
        expirationWarning = `Token expira em menos de 7 dias! Considere renovar.`;
      }
    } else {
      expiresIn = 'Nunca (System User Token)';
    }

    return response.status(200).json({
      status: 'ok',
      message: 'Integração Meta API funcionando corretamente.',
      token: {
        valid: true,
        type: tokenInfo.type,
        expiresIn,
        expirationWarning,
        scopes: tokenInfo.scopes,
        appId: tokenInfo.app_id,
      },
      account: {
        id: accountData.id,
        name: accountData.name,
        status: accountData.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
        currency: accountData.currency,
        timezone: accountData.timezone_name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return response.status(500).json({
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Erro ao verificar status da integração.',
    });
  }
}
