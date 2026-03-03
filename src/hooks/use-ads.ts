import { useQuery } from "@tanstack/react-query";
import { fetchAds, transformMetaAdToAd, type FetchAdsParams } from "@/lib/meta-api-client";

export interface UseAdsOptions {
    status?: 'all' | 'active' | 'inactive';
    dateFrom?: string;
    dateTo?: string;
}

export const useAds = (options: UseAdsOptions = {}) => {
    // Debug: Log options being used
    console.log('useAds called with options:', options);
    
    return useQuery({
        queryKey: ["ads", options],
        queryFn: async () => {
            try {
                const params: FetchAdsParams = {
                    status: options.status || 'all',
                    dateFrom: options.dateFrom,
                    dateTo: options.dateTo
                };

                console.log('Fetching ads with params:', params);
                
                const ads = await fetchAds(params);
                
                if (ads.length === 0) {
                    console.log("No ads returned from Meta API");
                    return [];
                }
                
                console.log(`Fetched ${ads.length} ads from Meta API`);
                return ads;
            } catch (error) {
                console.error("Failed to fetch ads from Meta API:", error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 10, // 10 minutes (increased from 5 to reduce API calls)
        gcTime: 1000 * 60 * 15, // 15 minutes cache
        retry: 0, // Don't retry on rate limit errors
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });
};
