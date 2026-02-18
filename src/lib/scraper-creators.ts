import type { Ad } from '@/data/mockAds';

const DEFAULT_API_KEY = "q9inr14QBOfOqEMVX1PSzhZiBeL2";
const PAGE_ID = "112150263646404"; // Cardápio Web

interface ScraperCreatorAdRaw {
    ad_archive_id: string;
    start_date_string: string;
    end_date_string: string;
    is_active: boolean;
    page_name: string;
    snapshot: {
        title?: string;
        body?: { text?: string; markup?: string };
        cta_text?: string;
        link_url?: string;
        images?: Array<{ original_image_url: string; resized_image_url?: string }>;
        videos?: Array<{ video_preview_image_url: string; video_sd_url?: string; video_hd_url?: string }>;
        cards?: Array<{
            title?: string;
            body?: string;
            cta_text?: string;
            original_image_url?: string;
            link_url?: string;
            video_preview_image_url?: string;
        }>;
        page_profile_picture_url?: string;
    };
    [key: string]: any;
}

export const fetchAds = async (): Promise<Ad[]> => {
    // Priority: LocalStorage > Constant
    const apiKey = localStorage.getItem("scraper_creators_key") || DEFAULT_API_KEY;

    try {
        // Construct query parameters for proxy endpoint
        const params = new URLSearchParams({
            pageId: PAGE_ID,
            country: "BR",
            active_status: "all"
        });

        // Include API key as query parameter if available
        if (apiKey) {
            params.append("apiKey", apiKey);
        }

        // Call proxy endpoint instead of direct API
        const url = `/api/ads?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ads from proxy: ${response.statusText}`);
        }

        const data = await response.json();
        const items: ScraperCreatorAdRaw[] = data.results || [];

        const adaptedAds: Ad[] = items.map((raw) => {
            const snapshot = raw.snapshot || {};
            // If it's a carousel (has cards), use the first card for display, otherwise use snapshot fields
            const card = snapshot.cards && snapshot.cards.length > 0 ? snapshot.cards[0] : {};

            const title = card.title || snapshot.title || "No Headline";
            const body = card.body || snapshot.body?.text || snapshot.body?.markup || "No body text";
            const cta = card.cta_text || snapshot.cta_text || "Learn More";

            let image = "";
            let videoPreview = "";

            if (card.original_image_url) {
                image = card.original_image_url;
            } else if (snapshot.images && snapshot.images.length > 0) {
                image = snapshot.images[0].original_image_url;
            }

            if (card.video_preview_image_url) {
                videoPreview = card.video_preview_image_url;
                // If it's a video ad, use the preview as the thumbnail if no image
                if (!image) image = videoPreview;
            } else if (snapshot.videos && snapshot.videos.length > 0) {
                // If it's a video ad, use the preview as the thumbnail if no image
                if (!image) image = snapshot.videos[0].video_preview_image_url;
            }

            const link = card.link_url || snapshot.link_url || "";

            // Determine active status
            // The API returns is_active boolean, but we also check stop time if available or end_date
            const isActive = raw.is_active || (raw.end_date_string ? new Date(raw.end_date_string) > new Date() : true);

            return {
                id: raw.ad_archive_id || Math.random().toString(36).substr(2, 9),
                adId: raw.ad_archive_id ? `AD-${raw.ad_archive_id.slice(-4)}` : `AD-UNKNOWN`,
                headline: title,
                body: body,
                ctaText: cta,
                destinationUrl: link,
                thumbnail: image,
                status: isActive ? "active" : "inactive",
                platform: "Facebook",
                startDate: raw.start_date_string || new Date().toISOString(),
                lastSeen: raw.end_date_string || new Date().toISOString(),
                pageName: raw.page_name || "Cardápio Web",
                tags: [],
                notes: "",
            };
        });

        return adaptedAds;

    } catch (error) {
        console.error("Scraper Creators service error:", error);
        throw error;
    }
};
