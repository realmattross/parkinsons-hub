// Charity feeds fetcher
// MJ Fox Foundation, Cure Parkinson's, Parkinson's UK

import RssParser from 'rss-parser';
import * as cheerio from 'cheerio';

const parser = new RssParser({
    timeout: 10000,
    headers: {
        'User-Agent': 'ParkinsonsKnowledgeHub/1.0'
    }
});

const CHARITY_FEEDS = [
    {
        name: 'Michael J. Fox Foundation',
        url: 'https://www.michaeljfox.org/mjff-feed',
        type: 'rss'
    },
    {
        name: 'Cure Parkinson\'s',
        url: 'https://www.cureparkinsons.org.uk/latest',
        type: 'scrape'
    },
    {
        name: 'Parkinson\'s UK',
        url: 'https://www.parkinsons.org.uk/news',
        type: 'scrape'
    }
];

export async function fetchCharityFeeds() {
    const allArticles = [];

    for (const source of CHARITY_FEEDS) {
        try {
            let articles;
            if (source.type === 'rss') {
                articles = await fetchRSS(source);
            } else {
                articles = await fetchByScraping(source);
            }
            allArticles.push(...articles);
        } catch (err) {
            console.error(`  ⚠️  ${source.name} fetch failed:`, err.message);
        }
    }

    return allArticles;
}

async function fetchRSS(source) {
    const feed = await parser.parseURL(source.url);
    const articles = [];

    const items = (feed.items || []).slice(0, 15);

    for (const item of items) {
        // Only include items from the last 30 days
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const daysAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysAgo > 30) continue;

        articles.push({
            title: item.title || 'Untitled',
            summary: cleanHtml(item.contentSnippet || item.content || '').substring(0, 500),
            content: cleanHtml(item.content || item.contentSnippet || ''),
            source: source.name,
            sourceUrl: item.link || '',
            datePublished: pubDate.toISOString(),
            tags: ['charity-funded'],
            category: null
        });
    }

    return articles;
}

async function fetchByScraping(source) {
    const res = await fetch(source.url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];

    if (source.name === 'Cure Parkinson\'s') {
        // Parse Cure Parkinson's latest page
        $('article, .post, .news-item, .card, [class*="news"], [class*="article"], [class*="post"]').each((i, el) => {
            if (i >= 15) return false;
            const $el = $(el);
            const title = $el.find('h2, h3, h4, .title, [class*="title"]').first().text().trim();
            const link = $el.find('a').first().attr('href') || '';
            const summary = $el.find('p, .excerpt, .summary, [class*="excerpt"], [class*="summary"]').first().text().trim();
            const date = $el.find('time, .date, [class*="date"]').first().text().trim() ||
                $el.find('time').attr('datetime') || '';

            if (title && title.length > 5) {
                articles.push({
                    title,
                    summary: summary.substring(0, 500),
                    content: summary,
                    source: source.name,
                    sourceUrl: link.startsWith('http') ? link : `https://www.cureparkinsons.org.uk${link}`,
                    datePublished: parseDate(date),
                    tags: ['charity-funded', 'cure-parkinsons'],
                    category: null
                });
            }
        });
    }

    if (source.name === 'Parkinson\'s UK') {
        // Parse Parkinson's UK news page
        $('article, .post, .news-item, .card, [class*="news"], [class*="article"], [class*="teaser"]').each((i, el) => {
            if (i >= 15) return false;
            const $el = $(el);
            const title = $el.find('h2, h3, h4, .title, [class*="title"], [class*="heading"]').first().text().trim();
            const link = $el.find('a').first().attr('href') || '';
            const summary = $el.find('p, .excerpt, .summary, [class*="excerpt"], [class*="summary"], [class*="body"]').first().text().trim();
            const date = $el.find('time, .date, [class*="date"]').first().text().trim() ||
                $el.find('time').attr('datetime') || '';

            if (title && title.length > 5) {
                articles.push({
                    title,
                    summary: summary.substring(0, 500),
                    content: summary,
                    source: source.name,
                    sourceUrl: link.startsWith('http') ? link : `https://www.parkinsons.org.uk${link}`,
                    datePublished: parseDate(date),
                    tags: ['charity-funded', 'parkinsons-uk'],
                    category: null
                });
            }
        });
    }

    return articles;
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

function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return new Date().toISOString();
    return parsed.toISOString();
}
