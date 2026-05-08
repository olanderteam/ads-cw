import { useQuery } from "@tanstack/react-query";
import { fetchAds, type FetchAdsParams } from "@/lib/meta-api-client";
import { logger } from "@/lib/logger";
import type { Ad } from "@/data/mockAds";

export interface UseAdsOptions {
    status?: 'all' | 'active' | 'inactive';
    dateFrom?: string;
    dateTo?: string;
}

export interface UseAdsResult {
    data: Ad[];
    truncated: boolean;
    isLoading: boolean;
    dataUpdatedAt: number;
}

export const useAds = (options: UseAdsOptions = {}) => {
    logger.debug('useAds called with options:', options);

    const query = useQuery({
        queryKey: ["ads", options],
        queryFn: async () => {
            const params: FetchAdsParams = {
                status: options.status || 'all',
                dateFrom: options.dateFrom,
                dateTo: options.dateTo
            };

            logger.debug('Fetching ads with params:', params);

            const result = await fetchAds(params);

            if (result.ads.length === 0) {
                logger.debug("No ads returned from Meta API");
            } else {
                logger.debug(`Fetched ${result.ads.length} ads from Meta API`);
            }

            return result;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 15,    // 15 minutes cache
    });

    return {
        ...query,
        data: query.data?.ads ?? [],
        truncated: query.data?.truncated ?? false,
    };
};
