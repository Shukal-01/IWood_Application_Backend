import axios from "axios";

export async function fetchInstagram(username) {
  const appId = process.env.IG_APP_ID;
  const apiUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

  try {
    const { data } = await axios.get(apiUrl, {
      headers: {
        "x-ig-app-id": appId,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const count = data.data.user.edge_followed_by.count;
    if (!count) throw new Error("Invalid response from Instagram API");
    return { count };
  } catch (apiErr) {
    console.warn(`Instagram API failed for ${username}, fallback to scraping`);
  }

  try {
    const profileUrl = `https://www.instagram.com/${username}/`;
    const { data: html } = await axios.get(profileUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(html);
    const desc = $('meta[property="og:description"]').attr("content") || "";
    const match = desc.match(/([\d,.]+)\s+Followers/);
    if (match) {
      let raw = match[1].replace(/,/g, "");
      let count = parseFloat(raw);
      if (/m$/i.test(raw)) count *= 1_000_000;
      if (/k$/i.test(raw)) count *= 1_000;
      return { count: Math.round(count) };
    }
    throw new Error("Followers count not found in meta tag");
  } catch (scrapeErr) {
    throw new Error(`Instagram scrape failed: ${scrapeErr.message}`);
  }
}

export async function fetchFacebook(pageId) {
  const token = process.env.FB_USER_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=followers_count&access_token=${token}`;
  const { data } = await axios.get(url);
  if (!data?.followers_count) {
    throw new Error("No followers count returned");
  }
  return { count: data.followers_count };
}

export async function fetchX(username) {
  // Ensure the token is loaded
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    throw new Error("TWITTER_BEARER_TOKEN is not defined in your environment");
  }

  // Encode the username to avoid injection or invalid chars
  const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(
    username
  )}?user.fields=public_metrics`;

  try {
    // Perform the request
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check that the payload is what we expect
    const user = response.data?.data;
    if (!user || !user.public_metrics) {
      throw new Error(
        "Unexpected response format: missing `data.public_metrics`"
      );
    }

    // Extract follower count
    const count = user.public_metrics.followers_count;
    return { count };
  } catch (err) {
    // If Twitter returned an error payload, include it
    if (err.response) {
      const status = err.response.status;
      const body = JSON.stringify(err.response.data);
      throw new Error(`X API Error (${status}): ${body}`);
    }
    // Otherwise, it's a network/axios error
    throw new Error(`X API Error: ${err.message}`);
  }
}

export async function fetchYouTube(handle) {
  const apiKey = process.env.YT_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${handle}&key=${apiKey}`;
  try {
    const { data } = await axios.get(url);
    if (!data.items || data.items.length === 0) {
      throw new Error("YouTube channel not found");
    }
    const count = data.items[0].statistics.subscriberCount;
    return { count };
  } catch (error) {
    throw new Error(`YouTube API Error: ${error.message}`);
  }
}
