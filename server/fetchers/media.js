// Media Fetcher — PD Podcasts & YouTube Channels
// Uses YouTube's public RSS feeds (no API key needed) + podcast RSS feeds

import RssParser from 'rss-parser';

const parser = new RssParser({
    timeout: 12000,
    headers: { 'User-Agent': 'ParkinsonsKnowledgeHub/1.0' },
    customFields: {
        item: [
            ['media:group', 'mediaGroup'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['yt:videoId', 'ytVideoId'],
            ['yt:channelId', 'ytChannelId'],
            ['itunes:duration', 'duration'],
            ['itunes:summary', 'itunesSummary'],
            ['itunes:image', 'itunesImage'],
            ['enclosure', 'enclosure']
        ]
    }
});

// YouTube channels — using public Atom RSS feeds (no API key required)
const YOUTUBE_CHANNELS = [
    {
        name: 'Davis Phinney Foundation',
        channelId: 'UCNY5bmQqCk-kcqU7d15U4-Q',
        description: 'Empowering people with PD to live well through exercise, community, and research'
    },
    {
        name: 'Michael J. Fox Foundation',
        channelId: 'UCEwLnD6-KgBHGcfZCRy7_qQ',
        description: 'Research updates, patient stories, and advocacy from the world\'s largest PD charity'
    },
    {
        name: 'Parkinson\'s Foundation',
        channelId: 'UCHafg5MbPub1-bkSEVMBxMQ',
        description: 'Expert-led content on living with PD — symptoms, treatments, and wellness'
    },
    {
        name: 'Parkinson\'s UK',
        channelId: 'UCZYwe6WjTqFbE-sAylkGdoA',
        description: 'UK-focused PD information, research news, and community stories'
    },
    {
        name: 'Power for Parkinson\'s',
        channelId: 'UCsHzMaHNpFHkH6TOXT9XSOQ',
        description: 'The top global Parkinson\'s fitness channel — free exercise classes for people with PD'
    }
];

// Podcast RSS feeds — verified working feeds
const PODCAST_FEEDS = [
    {
        name: 'Movers and Shakers',
        url: 'https://feeds.acast.com/public/shows/641216df1cc77a0010101f8c',
        description: 'Rory Cellan-Jones, Jeremy Paxman and friends discuss life with Parkinson\'s — funny, honest, and essential listening',
        type: 'podcast'
    },
    {
        name: 'The Parkinson\'s Podcast (Davis Phinney Foundation)',
        url: 'https://feed.podbean.com/davisphinneyfoundation/feed.xml',
        description: 'Expert interviews and community stories on living well with PD',
        type: 'podcast'
    },
    {
        name: 'Substantial Matters (Parkinson\'s Foundation)',
        url: 'http://parkinson.libsyn.com/rss',
        description: 'Monthly expert interviews on PD treatments, research, and daily life',
        type: 'podcast'
    },
    {
        name: 'MJFF Parkinson\'s Podcast',
        url: 'https://feeds.captivate.fm/parkinsons-podcast/',
        description: 'Scientists, doctors and people with PD on research and life with the disease',
        type: 'podcast'
    },
    {
        name: 'MDS Parkinson\'s Podcast',
        url: 'https://www.movementdisorders.org/Podcast-RSS-Feed.htm',
        description: 'International Movement Disorder Society — cutting-edge research for clinicians and patients',
        type: 'podcast'
    }
];

export async function fetchMediaFeeds() {
    const allMedia = [];
    const errors = [];

    // Fetch YouTube channels
    for (const channel of YOUTUBE_CHANNELS) {
        try {
            const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
            const feed = await parser.parseURL(feedUrl);
            const items = (feed.items || []).slice(0, 8);

            for (const item of items) {
                const videoId = item.ytVideoId || extractYouTubeId(item.link || '');
                const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
                const daysAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysAgo > 180) continue; // Last 6 months only

                const thumbnail = item.mediaGroup?.['media:thumbnail']?.[0]?.['$']?.url
                    || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

                allMedia.push({
                    type: 'video',
                    title: item.title || 'Untitled',
                    summary: item.contentSnippet || item.content || channel.description,
                    source: channel.name,
                    sourceUrl: item.link || `https://www.youtube.com/watch?v=${videoId}`,
                    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
                    videoId,
                    thumbnail,
                    datePublished: pubDate.toISOString(),
                    channelDescription: channel.description
                });
            }
            console.log(`    📺 ${channel.name}: ${items.length} videos`);
        } catch (err) {
            console.error(`    ⚠️  YouTube ${channel.name} failed:`, err.message);
            errors.push(channel.name);
        }
    }

    // Fetch podcast feeds
    for (const podcast of PODCAST_FEEDS) {
        try {
            const feed = await parser.parseURL(podcast.url);
            const items = (feed.items || []).slice(0, 6);

            for (const item of items) {
                const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
                const daysAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysAgo > 180) continue;

                const audioUrl = item.enclosure?.url || null;
                const thumbnail = item.itunesImage?.['$']?.href
                    || feed.image?.url
                    || null;

                allMedia.push({
                    type: 'podcast',
                    title: item.title || 'Untitled',
                    summary: item.itunesSummary || item.contentSnippet || podcast.description,
                    source: podcast.name,
                    sourceUrl: item.link || '',
                    audioUrl,
                    thumbnail,
                    duration: item.duration || null,
                    datePublished: pubDate.toISOString(),
                    podcastDescription: podcast.description
                });
            }
            console.log(`    🎙️  ${podcast.name}: ${items.length} episodes`);
        } catch (err) {
            console.error(`    ⚠️  Podcast ${podcast.name} failed:`, err.message);
            errors.push(podcast.name);
        }
    }

    // Sort by date, newest first
    allMedia.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

    return { media: allMedia, errors };
}

function extractYouTubeId(url) {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
    return match ? match[1] : null;
}

export const MEDIA_SOURCES = {
    youtube: YOUTUBE_CHANNELS,
    podcasts: PODCAST_FEEDS
};
