import { useQuery } from "@tanstack/react-query";
import { fetchAds, transformMetaAdToAd, type FetchAdsParams } from "@/lib/meta-api-client";

export interface UseAdsOptions {
    status?: 'all' | 'active' | 'inactive';
    dateFrom?: string;
    dateTo?: string;
}

export const useAds = (options: UseAdsOptions = {}) => {
    return useQuery({
        queryKey: ["ads", options],
        queryFn: async () => {
            try {
                const params: FetchAdsParams = {
                    status: options.status || 'all',
                    dateFrom: options.dateFrom,
                    dateTo: options.dateTo
                };

                const ads = await fetchAds(params);
                
                if (ads.length === 0) {
                    console.log("No ads returned from Meta API");
                    return [];
                }
                
                return ads;
            } catch (error) {
                console.error("Failed to fetch ads from Meta API:", error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
};
