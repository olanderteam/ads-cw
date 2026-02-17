import { useQuery } from "@tanstack/react-query";
import { fetchAds } from "@/lib/scraper-creators";
import { mockAds } from "@/data/mockAds";

export const useAds = () => {
    return useQuery({
        queryKey: ["ads"],
        queryFn: async () => {
            try {
                const ads = await fetchAds();
                if (ads.length === 0) {
                    console.log("No ads returned from Apify, falling back to mock data if dev/empty");
                    // Optionally return mockAds here if you want a guaranteed fallback
                    // return mockAds; 
                    return [];
                }
                return ads;
            } catch (error) {
                console.error("Failed to fetch ads, using fallback:", error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
};
