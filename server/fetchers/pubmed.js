// PubMed E-utilities fetcher
// Searches for recent Parkinson's disease publications

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function fetchPubMed() {
    // Search for recent PD articles (last 7 days)
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=parkinson%27s+disease&reldate=7&datetype=edat&retmax=20&retmode=json&sort=date`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];

    if (ids.length === 0) return [];

    // Fetch summaries for the found articles
    const summaryUrl = `${BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    const articles = [];

    for (const id of ids) {
        const item = summaryData.result?.[id];
        if (!item) continue;

        const authors = item.authors?.map(a => a.name).join(', ') || 'Unknown';
        const doi = item.elocationid?.replace('doi: ', '') || '';

        articles.push({
            title: item.title || 'Untitled',
            summary: item.title || '',
            content: `Published in ${item.fulljournalname || item.source || 'Unknown Journal'}.\n\nAuthors: ${authors}\n\nPubMed ID: ${id}`,
            source: 'PubMed',
            sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
            doi: doi,
            datePublished: item.pubdate || new Date().toISOString(),
            tags: extractPubMedTags(item),
            category: null // will be auto-categorized
        });

        // Rate limit: max 3 requests/second to NCBI
        await sleep(350);
    }

    // Now fetch abstracts in batch
    if (ids.length > 0) {
        try {
            const abstractUrl = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&rettype=abstract&retmode=xml`;
            const abstractRes = await fetch(abstractUrl);
            const abstractXml = await abstractRes.text();

            // Parse abstracts from XML (simple extraction)
            for (const article of articles) {
                const pmid = article.sourceUrl.match(/\/(\d+)\//)?.[1];
                if (pmid) {
                    const abstractMatch = abstractXml.match(
                        new RegExp(`<PMID[^>]*>${pmid}</PMID>[\\s\\S]*?<AbstractText[^>]*>([\\s\\S]*?)</AbstractText>`, 'i')
                    );
                    if (abstractMatch) {
                        article.summary = abstractMatch[1].replace(/<[^>]+>/g, '').substring(0, 500);
                        article.content = abstractMatch[1].replace(/<[^>]+>/g, '') + '\n\n' + article.content;
                    }
                }
            }
        } catch {
            // Abstracts are a bonus — don't fail if XML parsing doesn't work
        }
    }

    return articles;
}

function extractPubMedTags(item) {
    const tags = ['research'];
    const title = (item.title || '').toLowerCase();

    if (title.includes('dopamine') || title.includes('dopaminergic')) tags.push('dopamine');
    if (title.includes('levodopa') || title.includes('l-dopa')) tags.push('levodopa');
    if (title.includes('exercise') || title.includes('physical activity')) tags.push('exercise');
    if (title.includes('sleep')) tags.push('sleep');
    if (title.includes('nutrition') || title.includes('diet')) tags.push('nutrition');
    if (title.includes('trial') || title.includes('clinical')) tags.push('clinical trial');
    if (title.includes('gene') || title.includes('genetic')) tags.push('genetics');
    if (title.includes('alpha-synuclein') || title.includes('α-synuclein')) tags.push('alpha-synuclein');
    if (title.includes('neuroprotect')) tags.push('neuroprotection');
    if (title.includes('biomarker')) tags.push('biomarker');
    if (title.includes('deep brain') || title.includes('DBS')) tags.push('DBS');

    return tags;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
