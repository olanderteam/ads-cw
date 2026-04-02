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
