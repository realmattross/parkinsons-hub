import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { fetchPubMed } from './fetchers/pubmed.js';
import { fetchClinicalTrials } from './fetchers/clinicaltrials.js';
import { fetchCharityFeeds } from './fetchers/charities.js';
import { fetchNewsFeeds } from './fetchers/news.js';
import { categorizeArticle } from './fetchers/categorizer.js';
import { fetchMediaFeeds, MEDIA_SOURCES } from './fetchers/media.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const ARTICLES_FILE = join(DATA_DIR, 'articles.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Serve static frontend (production) ───────────────────────
const DIST_DIR = join(__dirname, '..', 'dist');
if (existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
}

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize articles file if it doesn't exist
if (!existsSync(ARTICLES_FILE)) {
    writeFileSync(ARTICLES_FILE, JSON.stringify([], null, 2));
}

function loadArticles() {
    try {
        const data = readFileSync(ARTICLES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveArticles(articles) {
    writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

function deduplicateArticles(existing, incoming) {
    const existingKeys = new Set();
    for (const a of existing) {
        if (a.sourceUrl) existingKeys.add(a.sourceUrl);
        if (a.doi) existingKeys.add(a.doi);
        existingKeys.add(a.title.toLowerCase().trim());
    }

    return incoming.filter(article => {
        if (article.sourceUrl && existingKeys.has(article.sourceUrl)) return false;
        if (article.doi && existingKeys.has(article.doi)) return false;
        if (existingKeys.has(article.title.toLowerCase().trim())) return false;
        return true;
    });
}

// ─── API Routes ──────────────────────────────────────────────

// Get all articles (with optional category and search filters)
app.get('/api/articles', (req, res) => {
    let articles = loadArticles();
    const { category, search, sort } = req.query;

    if (category && category !== 'all') {
        articles = articles.filter(a => a.category === category);
    }

    if (search) {
        const q = search.toLowerCase();
        articles = articles.filter(a =>
            a.title.toLowerCase().includes(q) ||
            (a.summary && a.summary.toLowerCase().includes(q)) ||
            (a.content && a.content.toLowerCase().includes(q)) ||
            (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
            (a.source && a.source.toLowerCase().includes(q))
        );
    }

    // Sort by date (newest first by default)
    articles.sort((a, b) => {
        const dateA = new Date(a.dateAdded || a.datePublished || 0);
        const dateB = new Date(b.dateAdded || b.datePublished || 0);
        return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    res.json({
        articles,
        total: articles.length,
        categories: getCategoryCounts(loadArticles())
    });
});

// Get single article
app.get('/api/articles/:id', (req, res) => {
    const articles = loadArticles();
    const article = articles.find(a => a.id === req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
});

// Create new article (manual entry)
app.post('/api/articles', (req, res) => {
    const articles = loadArticles();
    const newArticle = {
        id: uuidv4(),
        ...req.body,
        dateAdded: new Date().toISOString(),
        isAutoFetched: false
    };
    articles.unshift(newArticle);
    saveArticles(articles);
    res.status(201).json(newArticle);
});

// Update article
app.put('/api/articles/:id', (req, res) => {
    const articles = loadArticles();
    const idx = articles.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Article not found' });
    articles[idx] = { ...articles[idx], ...req.body, id: req.params.id };
    saveArticles(articles);
    res.json(articles[idx]);
});

// Delete article
app.delete('/api/articles/:id', (req, res) => {
    let articles = loadArticles();
    const before = articles.length;
    articles = articles.filter(a => a.id !== req.params.id);
    if (articles.length === before) return res.status(404).json({ error: 'Article not found' });
    saveArticles(articles);
    res.json({ success: true });
});

// Get category counts
app.get('/api/categories', (req, res) => {
    const articles = loadArticles();
    res.json(getCategoryCounts(articles));
});

// Export all data
app.get('/api/export', (req, res) => {
    const articles = loadArticles();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=parkinsons-hub-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json({ version: 1, exportDate: new Date().toISOString(), articles });
});

// Import data
app.post('/api/import', (req, res) => {
    try {
        const { articles: importedArticles } = req.body;
        if (!Array.isArray(importedArticles)) {
            return res.status(400).json({ error: 'Invalid import format' });
        }
        const existing = loadArticles();
        const newArticles = deduplicateArticles(existing, importedArticles);
        const merged = [...newArticles, ...existing];
        saveArticles(merged);
        res.json({ imported: newArticles.length, total: merged.length });
    } catch (err) {
        res.status(400).json({ error: 'Failed to parse import data' });
    }
});

// Trigger manual fetch
app.post('/api/fetch-now', async (req, res) => {
    try {
        const result = await runFetch();
        res.json(result);
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Fetch failed', message: err.message });
    }
});

// Live trials — fetch directly from ClinicalTrials.gov in real-time
app.get('/api/trials', async (req, res) => {
    try {
        const params = new URLSearchParams({
            'query.cond': "Parkinson's disease",
            'filter.overallStatus': 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION',
            'sort': 'LastUpdatePostDate:desc',
            'pageSize': '100',
            'fields': 'NCTId,BriefTitle,OfficialTitle,BriefSummary,OverallStatus,Phase,StartDate,CompletionDate,LeadSponsorName,InterventionName,InterventionType,Condition,LocationCity,LocationCountry,LocationFacility,EnrollmentCount,EnrollmentType,LastUpdatePostDate,StudyType'
        });

        const apiRes = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params}`);
        const data = await apiRes.json();

        const studies = data.studies || [];
        const trials = [];
        const phaseCount = {};
        const statusCount = {};
        const interventionTypes = {};
        const countriesSet = new Set();

        for (const study of studies) {
            const p = study.protocolSection || {};
            const id = p.identificationModule || {};
            const status = p.statusModule || {};
            const design = p.designModule || {};
            const sponsor = p.sponsorCollaboratorsModule || {};
            const arms = p.armsInterventionsModule || {};
            const desc = p.descriptionModule || {};
            const contacts = p.contactsLocationsModule || {};

            const nctId = id.nctId || '';
            const interventions = (arms.interventions || []).map(i => ({
                name: i.name,
                type: i.type
            }));

            const phases = (design.phases || []).join('/') || 'Not Specified';
            const overallStatus = status.overallStatus || 'Unknown';
            const sponsorName = sponsor.leadSponsor?.name || 'Unknown';
            const enrollment = design.enrollmentInfo?.count || null;

            // Extract locations
            const locations = (contacts.locations || []).map(loc => ({
                facility: loc.facility,
                city: loc.city,
                country: loc.country
            }));

            // Count countries
            locations.forEach(l => { if (l.country) countriesSet.add(l.country); });

            // Count phases
            phaseCount[phases] = (phaseCount[phases] || 0) + 1;

            // Count statuses
            const friendlyStatus = overallStatus.replace(/_/g, ' ').toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase());
            statusCount[friendlyStatus] = (statusCount[friendlyStatus] || 0) + 1;

            // Count intervention types
            interventions.forEach(iv => {
                const t = iv.type || 'Other';
                interventionTypes[t] = (interventionTypes[t] || 0) + 1;
            });

            trials.push({
                nctId,
                title: id.briefTitle || id.officialTitle || 'Untitled',
                officialTitle: id.officialTitle || '',
                summary: (desc.briefSummary || '').replace(/\n/g, ' ').substring(0, 300),
                status: friendlyStatus,
                rawStatus: overallStatus,
                phase: phases,
                sponsor: sponsorName,
                interventions,
                enrollment,
                startDate: status.startDateStruct?.date || null,
                completionDate: status.completionDateStruct?.date || null,
                lastUpdate: status.lastUpdatePostDateStruct?.date || null,
                studyType: design.studyType || 'Unknown',
                locations: locations.slice(0, 5),
                locationCount: locations.length,
                countries: [...new Set(locations.map(l => l.country).filter(Boolean))],
                url: `https://clinicaltrials.gov/study/${nctId}`
            });
        }

        res.json({
            total: trials.length,
            totalCountries: countriesSet.size,
            phaseBreakdown: phaseCount,
            statusBreakdown: statusCount,
            interventionTypes,
            trials
        });
    } catch (err) {
        console.error('Trials API error:', err.message);
        res.status(500).json({ error: 'Failed to fetch trials', message: err.message });
    }
});

// Research papers — fetch from Europe PMC (open-access papers with PDFs)
app.get('/api/papers', async (req, res) => {
    try {
        const { query: searchQuery, topic, page } = req.query;
        const pageNum = parseInt(page) || 1;
        const pageSize = 25;

        // Build search query
        let q = searchQuery
            ? `(Parkinson's disease) AND (${searchQuery})`
            : "(Parkinson's disease)";

        // Add topic filter
        const topicQueries = {
            'diagnosis': 'AND (diagnosis OR diagnostic OR biomarker OR imaging)',
            'treatment': 'AND (treatment OR therapy OR medication OR levodopa OR dopamine)',
            'exercise': 'AND (exercise OR physical activity OR rehabilitation OR physiotherapy)',
            'genetics': 'AND (genetic OR gene OR mutation OR LRRK2 OR GBA OR SNCA)',
            'nutrition': 'AND (nutrition OR diet OR vitamin OR supplement OR gut microbiome)',
            'sleep': 'AND (sleep OR insomnia OR REM OR circadian)',
            'mental-health': 'AND (depression OR anxiety OR cognitive OR dementia OR mood)',
            'alpha-synuclein': 'AND (alpha-synuclein OR synuclein OR Lewy body)',
            'neuroprotection': 'AND (neuroprotection OR neuroprotective OR disease-modifying)',
            'deep-brain-stimulation': 'AND (deep brain stimulation OR DBS OR neuromodulation)',
            'stem-cells': 'AND (stem cell OR cell therapy OR regenerative)',
            'epidemiology': 'AND (epidemiology OR prevalence OR incidence OR risk factor)'
        };

        if (topic && topicQueries[topic]) {
            q += ` ${topicQueries[topic]}`;
        }

        const params = new URLSearchParams({
            query: q,
            format: 'json',
            resultType: 'core',
            pageSize: String(pageSize),
            synonym: 'true'
        });

        // Page offset (Europe PMC uses cursorMark OR page param)
        if (pageNum > 1) {
            params.set('page', String(pageNum));
        }

        const apiRes = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`);
        const data = await apiRes.json();

        const results = data.resultList?.result || [];
        const papers = results.map(paper => {
            const pmcId = paper.pmcid || null;
            const pmid = paper.pmid || null;
            const doi = paper.doi || null;

            // Build PDF URL — PMC papers have free PDFs
            let pdfUrl = null;
            if (pmcId) {
                pdfUrl = `https://europepmc.org/backend/ptpmcrender.fcgi?accid=${pmcId}&blobtype=pdf`;
            }

            // Build full-text links
            let fullTextUrl = null;
            if (pmcId) {
                fullTextUrl = `https://europepmc.org/article/PMC/${pmcId}`;
            } else if (pmid) {
                fullTextUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
            } else if (doi) {
                fullTextUrl = `https://doi.org/${doi}`;
            }

            return {
                id: pmcId || pmid || doi || paper.id,
                title: paper.title || 'Untitled',
                authors: (paper.authorString || 'Unknown authors').substring(0, 200),
                journal: paper.journalTitle || paper.bookOrReportDetails?.publisher || 'Unknown journal',
                year: paper.pubYear || null,
                date: paper.firstPublicationDate || null,
                abstract: (paper.abstractText || '').substring(0, 500),
                doi,
                pmid,
                pmcId,
                isOpenAccess: paper.isOpenAccess === 'Y',
                citationCount: paper.citedByCount || 0,
                pdfUrl,
                fullTextUrl,
                source: paper.source || 'Europe PMC'
            };
        });

        res.json({
            total: data.hitCount || 0,
            returned: papers.length,
            page: pageNum,
            papers
        });
    } catch (err) {
        console.error('Papers API error:', err.message);
        res.status(500).json({ error: 'Failed to fetch papers', message: err.message });
    }
});

// Podcasts & Video — fetch from YouTube RSS + podcast feeds
app.get('/api/media', async (req, res) => {
    try {
        const { type } = req.query; // optional filter: 'video' | 'podcast'
        const { media, errors } = await fetchMediaFeeds();

        let filtered = media;
        if (type && (type === 'video' || type === 'podcast')) {
            filtered = media.filter(m => m.type === type);
        }

        res.json({
            total: filtered.length,
            videos: filtered.filter(m => m.type === 'video').length,
            podcasts: filtered.filter(m => m.type === 'podcast').length,
            sources: MEDIA_SOURCES,
            errors,
            media: filtered
        });
    } catch (err) {
        console.error('Media API error:', err.message);
        res.status(500).json({ error: 'Failed to fetch media', message: err.message });
    }
});

// Get fetch status
app.get('/api/fetch-status', (req, res) => {
    const articles = loadArticles();
    const today = new Date().toISOString().split('T')[0];
    const fetchedToday = articles.filter(a => a.isAutoFetched && a.dateAdded && a.dateAdded.startsWith(today));
    res.json({
        totalArticles: articles.length,
        fetchedToday: fetchedToday.length,
        lastFetch: articles.filter(a => a.isAutoFetched).sort((a, b) =>
            new Date(b.dateAdded) - new Date(a.dateAdded)
        )[0]?.dateAdded || null
    });
});

// ─── Fetch Engine ──────────────────────────────────────────────

async function runFetch() {
    console.log(`\n🔄 Starting content fetch at ${new Date().toISOString()}...`);

    const existing = loadArticles();
    let allFetched = [];
    const results = { pubmed: 0, clinicalTrials: 0, charities: 0, news: 0, errors: [] };

    // Fetch from all sources
    try {
        const pubmedArticles = await fetchPubMed();
        allFetched.push(...pubmedArticles);
        results.pubmed = pubmedArticles.length;
        console.log(`  📚 PubMed: ${pubmedArticles.length} articles`);
    } catch (err) {
        console.error('  ❌ PubMed fetch failed:', err.message);
        results.errors.push(`PubMed: ${err.message}`);
    }

    try {
        const trialArticles = await fetchClinicalTrials();
        allFetched.push(...trialArticles);
        results.clinicalTrials = trialArticles.length;
        console.log(`  🧪 ClinicalTrials.gov: ${trialArticles.length} articles`);
    } catch (err) {
        console.error('  ❌ ClinicalTrials.gov fetch failed:', err.message);
        results.errors.push(`ClinicalTrials: ${err.message}`);
    }

    try {
        const charityArticles = await fetchCharityFeeds();
        allFetched.push(...charityArticles);
        results.charities = charityArticles.length;
        console.log(`  💛 Charities: ${charityArticles.length} articles`);
    } catch (err) {
        console.error('  ❌ Charity feeds failed:', err.message);
        results.errors.push(`Charities: ${err.message}`);
    }

    try {
        const newsArticles = await fetchNewsFeeds();
        allFetched.push(...newsArticles);
        results.news = newsArticles.length;
        console.log(`  📰 News feeds: ${newsArticles.length} articles`);
    } catch (err) {
        console.error('  ❌ News feeds failed:', err.message);
        results.errors.push(`News: ${err.message}`);
    }

    // Auto-categorize and add metadata
    allFetched = allFetched.map(article => ({
        ...article,
        id: uuidv4(),
        category: article.category || categorizeArticle(article),
        dateAdded: new Date().toISOString(),
        isAutoFetched: true,
        hopeMeter: 0
    }));

    // Deduplicate against existing articles
    const newArticles = deduplicateArticles(existing, allFetched);
    const merged = [...newArticles, ...existing];
    saveArticles(merged);

    results.totalNew = newArticles.length;
    results.totalArticles = merged.length;
    console.log(`\n✅ Fetch complete: ${newArticles.length} new articles added (${merged.length} total)\n`);

    return results;
}

function getCategoryCounts(articles) {
    const counts = {};
    for (const a of articles) {
        const cat = a.category || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
}

// ─── Schedule daily fetch at 7am ──────────────────────────────

cron.schedule('0 7 * * *', () => {
    console.log('⏰ Scheduled daily fetch starting...');
    runFetch().catch(err => console.error('Scheduled fetch failed:', err));
});

// ─── Start Server ──────────────────────────────────────────────

// Catch-all: serve frontend for any non-API route (SPA support)
if (existsSync(DIST_DIR)) {
    app.get('/{*path}', (req, res) => {
        res.sendFile(join(DIST_DIR, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`\n🧠 Parkinson's Knowledge Hub running on http://localhost:${PORT}`);
    console.log(`   📅 Daily fetch scheduled at 7:00 AM`);
    console.log(`   📁 Data file: ${ARTICLES_FILE}`);
    console.log(`   🌐 Mode: ${existsSync(DIST_DIR) ? 'Production (serving built frontend)' : 'Development (API only)'}\n`);
});
