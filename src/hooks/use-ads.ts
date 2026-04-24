import { useQuery } from "@tanstack/react-query";
import { fetchAds, type FetchAdsParams } from "@/lib/meta-api-client";
import { logger } from "@/lib/logger";

export interface UseAdsOptions {
    status?: 'all' | 'active' | 'inactive';
    dateFrom?: string;
    dateTo?: string;
}

export const useAds = (options: UseAdsOptions = {}) => {
    logger.debug('useAds called with options:', options);

    return useQuery({
        queryKey: ["ads", options],
        queryFn: async () => {
            try {
                const params: FetchAdsParams = {
                    status: options.status || 'all',
                    dateFrom: options.dateFrom,
                    dateTo: options.dateTo
                };

                logger.debug('Fetching ads with params:', params);

                const ads = await fetchAds(params);

                if (ads.length === 0) {
                    logger.debug("No ads returned from Meta API");
                    return [];
                }

                logger.debug(`Fetched ${ads.length} ads from Meta API`);
                return ads;
            } catch (error) {
                logger.error("Failed to fetch ads from Meta API:", error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 15,    // 15 minutes cache
        // retry and refetchOnWindowFocus are configured globally in QueryClient (App.tsx)
    });
};
