// News RSS feeds fetcher
// APDA, Parkinson's Foundation, Medical News Today, Stanford PD Blog

import RssParser from 'rss-parser';

const parser = new RssParser({
    timeout: 10000,
    headers: {
        'User-Agent': 'ParkinsonsKnowledgeHub/1.0'
    }
});

const NEWS_FEEDS = [
    {
        name: 'APDA',
        url: 'https://www.apdaparkinson.org/blog/feed/',
        fullName: 'American Parkinson Disease Association'
    },
    {
        name: 'Parkinson\'s Foundation',
        url: 'https://www.parkinson.org/blog/feed',
        fullName: 'Parkinson\'s Foundation'
    },
    {
        name: 'Medical News Today',
        url: 'https://www.medicalnewstoday.com/rss/parkinsons-disease',
        fullName: 'Medical News Today'
    },
    {
        name: 'Neurology Now',
        url: 'https://www.sciencedaily.com/rss/health_medicine/parkinson\'s_disease.xml',
        fullName: 'ScienceDaily - Parkinson\'s'
    }
];

export async function fetchNewsFeeds() {
    const allArticles = [];

    for (const source of NEWS_FEEDS) {
        try {
            const feed = await parser.parseURL(source.url);
            const items = (feed.items || []).slice(0, 10);

            for (const item of items) {
                // Only include items from the last 30 days
                const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
                const daysAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysAgo > 30) continue;

                allArticles.push({
                    title: item.title || 'Untitled',
                    summary: cleanHtml(item.contentSnippet || item.content || '').substring(0, 500),
                    content: cleanHtml(item.content || item.contentSnippet || ''),
                    source: source.fullName || source.name,
                    sourceUrl: item.link || '',
                    datePublished: pubDate.toISOString(),
                    tags: extractNewsTags(item.title || '', item.contentSnippet || ''),
                    category: null
                });
            }

            console.log(`    📰 ${source.name}: ${items.length} items processed`);
        } catch (err) {
            console.error(`    ⚠️  ${source.name} feed failed:`, err.message);
        }
    }

    return allArticles;
}

function cleanHtml(html) {
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractNewsTags(title, content) {
    const tags = ['news'];
    const text = `${title} ${content}`.toLowerCase();

    if (text.includes('exercise') || text.includes('fitness') || text.includes('activity')) tags.push('exercise');
    if (text.includes('diet') || text.includes('nutrition') || text.includes('food')) tags.push('nutrition');
    if (text.includes('sleep') || text.includes('insomnia')) tags.push('sleep');
    if (text.includes('trial') || text.includes('drug') || text.includes('medication')) tags.push('drug trial');
    if (text.includes('breakthrough') || text.includes('discovery') || text.includes('cure')) tags.push('breakthrough');
    if (text.includes('therapy') || text.includes('treatment')) tags.push('therapy');
    if (text.includes('mental health') || text.includes('depression') || text.includes('anxiety')) tags.push('mental health');
    if (text.includes('technology') || text.includes('app') || text.includes('device') || text.includes('AI')) tags.push('technology');
    if (text.includes('dopamine')) tags.push('dopamine');
    if (text.includes('boxing') || text.includes('yoga') || text.includes('tai chi')) tags.push('exercise');

    return [...new Set(tags)];
}
