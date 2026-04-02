import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

// Try loading various env files
['.env', '.env.local', '.env.development.local'].forEach(file => {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file });
  }
});

const accessToken = process.env.META_ACCESS_TOKEN;
const adAccountId = process.env.META_AD_ACCOUNT_ID;
const apiVersion = process.env.META_API_VERSION || 'v21.0';

if (!accessToken || !adAccountId) {
  console.error("Missing META_ACCESS_TOKEN or META_AD_ACCOUNT_ID");
  process.exit(1);
}

const baseUrl = `https://graph.facebook.com/${apiVersion}/${adAccountId}/ads`;
const fields = [
  'id',
  'name',
  'creative{id,name,title,body,image_url,video_id,thumbnail_url,object_url,link_url,call_to_action_type,object_story_spec,asset_feed_spec,url_tags}'
].join(',');

const params = new URLSearchParams({
  access_token: accessToken,
  fields: fields,
  limit: '5'
});

const url = `${baseUrl}?${params.toString()}`;

(async () => {
  try {
    console.log("Fetching...");
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error("Meta API error:", data.error);
      return;
    }
    
    for (const ad of data.data) {
      console.log(`\n\n=== AD ${ad.id} ===`);
      const creative = ad.creative || {};
      
      let destinationUrl = creative.link_url 
        || creative.object_url
        || creative.object_story_spec?.link_data?.link
        || creative.object_story_spec?.video_data?.call_to_action?.value?.link
        || creative.asset_feed_spec?.link_urls?.[0]?.website_url
        || '';
        
      console.log("Current Extracted URL:", destinationUrl || "EMPTY");
      if (!destinationUrl) {
        console.log("CREATIVE OBJECT:", JSON.stringify(creative, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
