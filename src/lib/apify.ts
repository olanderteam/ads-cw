import type { Ad } from '@/data/mockAds';

const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
// Specific Actor ID from the user's run: "bo5X18oGenWEV9vVo" (Facebook Ads Scraper)
const ACTOR_ID = 'bo5X18oGenWEV9vVo';

// Interface matching the actual output from the user's dataset
interface ApifyAdRaw {
    ad_archive_id: string;
    ad_delivery_stop_time?: string;
    is_active?: boolean;
    collation_count: number;
    collation_id: string;
    page_id: string;
    snapshot: {
        page_name: string;
        page_profile_uri: string;
        cta_text: string;
        cards: Array<{
            title?: string;
            body?: string;
            cta_text?: string;
            original_image_url?: string;
            resized_image_url?: string;
            link_url?: string;
            video_preview_image_url?: string;
            caption?: string;
        }>;
        // Sometimes these fields are at the root of snapshot if single card
        title?: string;
        body?: { markup: string }; // or simply string depending on variation, staying flexible
        images?: Array<{ original_image_url: string }>;
        videos?: Array<{ video_preview_image_url: string }>;
        link_url?: string;
    };
    [key: string]: any;
}

export const fetchAds = async (): Promise<Ad[]> => {
    // Priority: LocalStorage > Environment Variable
    const token = localStorage.getItem("apify_token") || APIFY_API_TOKEN;

    if (!token) {
        console.warn("Apify Token missing");
        return [];
    }

    try {
        // 1. Start the actor run with user's specific configuration
        const runResponse = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "activeStatus": "all",
                "advertisers": ["112150263646404"], // Cardápio Web Page ID
                "category": "all",
                "country": "BR",
                "mediaType": "all",
                "pageId": "112150263646404",
                "query": "cardápio web",
                "sortBy": "mostRecent",
                "maxItems": 20 // Reverted to 20 to prevent Actor crash
            }),
        });

        if (!runResponse.ok) {
            throw new Error(`Failed to start Apify actor: ${runResponse.statusText}`);
        }

        const runData = await runResponse.json();
        const defaultDatasetId = runData.data.defaultDatasetId;
        const runId = runData.data.id;

        // 2. Poll for completion
        await waitForRunToFinish(runId, token);

        // 3. Fetch results from the dataset
        const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${token}`);

        if (!datasetResponse.ok) {
            throw new Error(`Failed to fetch dataset items: ${datasetResponse.statusText}`);
        }

        const items: ApifyAdRaw[] = await datasetResponse.json();
        if (items.length > 0) {
            console.log("Apify Raw Item [0]:", items[0]);
            console.log("Item 0 is_active:", items[0].is_active);
            console.log("Item 0 stop_time:", items[0].ad_delivery_stop_time);
        }

        // 4. Map to application interface
        const adaptedAds: Ad[] = items.map((raw) => {
            const snapshot = (raw.snapshot || {}) as any;
            const card = snapshot.cards && snapshot.cards.length > 0 ? snapshot.cards[0] : {};

            // Mapping logic based on observed data
            const title = card.title || snapshot.title || "No Headline";
            const body = card.body || (snapshot.body as any)?.markup || "No body text";
            const cta = card.cta_text || snapshot.cta_text || "Learn More";
            const image = card.original_image_url ||
                (snapshot.images && snapshot.images[0]?.original_image_url) ||
                "";
            const link = card.link_url || snapshot.link_url || "";

            return {
                id: raw.ad_archive_id || Math.random().toString(36).substr(2, 9),
                adId: raw.ad_archive_id ? `AD-${raw.ad_archive_id.slice(-4)}` : `AD-UNKNOWN`,
                headline: title,
                body: body,
                ctaText: cta,
                destinationUrl: link,
                thumbnail: image,
                status: (raw.is_active === false || (raw.ad_delivery_stop_time && new Date(raw.ad_delivery_stop_time) < new Date())) ? "inactive" : "active",
                platform: "Facebook", // Defaulting to Facebook as per dataset source, could infer from other fields if needed
                startDate: new Date().toISOString(), // Actual start date not always in simple fields, using current time as fallback
                lastSeen: new Date().toISOString(),
                pageName: snapshot.page_name || "Cardápio Web",
                tags: [],
                notes: "",
            };
        });

        return adaptedAds;

    } catch (error) {
        console.error("Apify service error:", error);
        throw error;
    }
};

const waitForRunToFinish = async (runId: string, token: string) => {
    let status = "RUNNING";
    while (status === "RUNNING" || status === "READY") {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
        const data = await response.json();
        status = data.data.status;
        if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
            throw new Error(`Apify run failed with status: ${status}`);
        }
    }
};
