// Parkinson's Knowledge Hub — Main Application
import '../style.css';
import { STATS_DATA } from './stats-data.js';
import { TIMELINE_DATA, ERAS } from './timeline-data.js';
import { ELI5_GLOSSARY, ELI5_TERMS_SORTED } from './eli5-glossary.js';

const API_BASE = '/api';

// ─── State ──────────────────────────────────────────────────────
let state = {
  articles: [],
  categories: {},
  currentCategory: 'all',
  searchQuery: '',
  selectedArticle: null,
  editingArticle: null,
  eli5Mode: false
};

// ─── Category Config ────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Drug Trials': '💊',
  'Breakthroughs': '⚡',
  'Exercise': '🏃',
  'Nutrition': '🥗',
  'Sleep': '😴',
  'Mental Health': '🧘',
  'Therapies': '🩺',
  'Technology': '🤖',
  'Community': '🤝',
  'General': '📝'
};

// ─── DOM References ─────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Initialize ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  loadArticles();
});

function bindEvents() {
  // Sidebar navigation
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      setActiveCategory(category);
    });
  });

  // Search
  const searchInput = $('#search-input');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = searchInput.value.trim();
      renderArticles();
    }, 200);
  });

  // Add entry
  $('#btn-add').addEventListener('click', () => openForm());

  // Fetch now
  $('#btn-fetch-now').addEventListener('click', fetchNow);
  $('#btn-empty-fetch')?.addEventListener('click', fetchNow);

  // Export
  $('#btn-export').addEventListener('click', exportData);

  // Import
  $('#btn-import').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', importData);

  // Modal close handlers
  $('#modal-detail-close').addEventListener('click', closeDetailModal);
  $('#modal-form-close').addEventListener('click', closeFormModal);
  $('#btn-form-cancel').addEventListener('click', closeFormModal);

  // Close modals on overlay click
  $('#modal-detail').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDetailModal();
  });
  $('#modal-form').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeFormModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
      closeFormModal();
    }
  });

  // Form submission
  $('#entry-form').addEventListener('submit', handleFormSubmit);

  // Mobile menu toggle
  $('#menu-toggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });

  // ELI5 toggle
  const eli5Btn = $('#eli5-toggle');
  if (eli5Btn) {
    eli5Btn.addEventListener('click', () => {
      state.eli5Mode = !state.eli5Mode;
      eli5Btn.classList.toggle('active', state.eli5Mode);
      document.body.classList.toggle('eli5-active', state.eli5Mode);
      const pip = $('#eli5-pip');
      if (pip) pip.style.display = state.eli5Mode ? 'block' : 'none';
      // Re-render if in article view
      if (!['stats','trials','papers','timeline','media'].includes(state.currentCategory)) {
        renderArticles();
      }
      showToast(state.eli5Mode ? '💬 Simple Mode ON — jargon will be explained' : '💬 Simple Mode OFF');
    });
  }
}

// ─── Data Loading ───────────────────────────────────────────────
async function loadArticles() {
  // If we're in stats view, don't load articles
  if (state.currentCategory === 'stats') return;

  try {
    const params = new URLSearchParams();
    if (state.currentCategory !== 'all') {
      params.set('category', state.currentCategory);
    }
    if (state.searchQuery) {
      params.set('search', state.searchQuery);
    }

    const res = await fetch(`${API_BASE}/articles?${params}`);
    const data = await res.json();

    state.articles = data.articles;
    state.categories = data.categories;

    updateCategoryCounts();
    renderArticles();
    updateFetchStatus();
  } catch (err) {
    console.error('Failed to load articles:', err);
    showEmptyState();
  }
}

// ─── Rendering ──────────────────────────────────────────────────
function renderArticles() {
  const grid = $('#articles-grid');
  const emptyState = $('#empty-state');
  const loadingState = $('#loading-state');

  loadingState.style.display = 'none';

  let articles = state.articles;

  // Client-side search filtering (already done server-side, but also highlight)
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    articles = articles.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q)) ||
      a.source?.toLowerCase().includes(q)
    );
    $('#search-count').textContent = `${articles.length} result${articles.length !== 1 ? 's' : ''}`;
  } else {
    $('#search-count').textContent = '';
  }

  if (articles.length === 0) {
    grid.innerHTML = '';
    if (!state.searchQuery && state.currentCategory === 'all') {
      showEmptyState();
    } else {
      emptyState.style.display = 'none';
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px; filter: grayscale(0.3);">🔍</div>
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; color: var(--text-secondary); margin-bottom: 8px;">
            No articles found
          </h3>
          <p style="font-size: 13px; color: var(--text-muted);">
            ${state.searchQuery ? `No results for "${state.searchQuery}"` : `No articles in this category yet`}
          </p>
        </div>
      `;
    }
    return;
  }

  emptyState.style.display = 'none';

  grid.innerHTML = articles.map((article, idx) => renderCard(article, idx)).join('');

  // Bind card click handlers
  grid.querySelectorAll('.article-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      openArticle(id);
    });
  });
}

function renderCard(article, index) {
  const isNew = isNewToday(article.dateAdded);
  const category = article.category || 'General';
  const icon = CATEGORY_ICONS[category] || '📝';
  const formattedDate = formatDate(article.datePublished || article.dateAdded);
  const title = highlightText(article.title || 'Untitled', state.searchQuery);
  const summary = highlightText(
    (article.summary || '').substring(0, 200),
    state.searchQuery
  );

  return `
    <div class="article-card" data-id="${article.id}" data-category="${category}" style="animation-delay: ${index * 0.05}s">
      <div class="card-header">
        <span class="card-badge" data-category="${category}">${icon} ${category}</span>
        ${isNew ? '<span class="card-new-badge">✨ New</span>' : ''}
      </div>
      <h3 class="card-title">${title}</h3>
      ${summary ? `<p class="card-summary">${summary}</p>` : ''}
      ${article.tags && article.tags.length > 0 ? `
        <div class="card-tags">
          ${article.tags.slice(0, 4).map(t => `<span class="card-tag">${t}</span>`).join('')}
          ${article.tags.length > 4 ? `<span class="card-tag">+${article.tags.length - 4}</span>` : ''}
        </div>
      ` : ''}
      <div class="card-footer">
        <div class="card-meta">
          <span class="card-source">${article.source || ''}</span>
          <span class="card-date">${formattedDate}</span>
        </div>
      </div>
    </div>
  `;
}

function highlightText(text, query) {
  if (!query || !text) return text;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');
}

// ─── Category Navigation ────────────────────────────────────────
function setActiveCategory(category) {
  state.currentCategory = category;

  $$('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  // Close mobile sidebar
  $('#sidebar').classList.remove('open');

  // Handle stats view
  if (category === 'stats') {
    $('#content-header').style.display = 'none';
    $('#empty-state').style.display = 'none';
    $('#loading-state').style.display = 'none';
    renderStatsView();
    return;
  }

  // Handle trials view
  if (category === 'trials') {
    $('#content-header').style.display = 'none';
    $('#empty-state').style.display = 'none';
    $('#loading-state').style.display = 'flex';
    $('#articles-grid').innerHTML = '';
    loadTrials();
    return;
  }

  // Handle papers view
  if (category === 'papers') {
    $('#content-header').style.display = 'none';
    $('#empty-state').style.display = 'none';
    $('#loading-state').style.display = 'flex';
    $('#articles-grid').innerHTML = '';
    loadPapers();
    return;
  }

  // Handle timeline view
  if (category === 'timeline') {
    $('#content-header').style.display = 'none';
    $('#empty-state').style.display = 'none';
    $('#loading-state').style.display = 'none';
    renderTimelineView();
    return;
  }

  // Handle media view
  if (category === 'media') {
    $('#content-header').style.display = 'none';
    $('#empty-state').style.display = 'none';
    $('#loading-state').style.display = 'flex';
    $('#articles-grid').innerHTML = '';
    loadMedia();
    return;
  }

  // Restore normal view
  $('#content-header').style.display = 'flex';

  // Update header
  if (category === 'all') {
    $('#content-title').textContent = 'All Articles';
  } else {
    const icon = CATEGORY_ICONS[category] || '';
    $('#content-title').textContent = `${icon} ${category}`;
  }

  loadArticles();
}

function updateCategoryCounts() {
  const total = Object.values(state.categories).reduce((sum, c) => sum + c, 0);
  const countEl = $('#count-all');
  if (countEl) countEl.textContent = total;

  const categoryMap = {
    'Drug Trials': 'drug-trials',
    'Breakthroughs': 'breakthroughs',
    'Exercise': 'exercise',
    'Nutrition': 'nutrition',
    'Sleep': 'sleep',
    'Mental Health': 'mental-health',
    'Therapies': 'therapies',
    'Technology': 'technology',
    'Community': 'community',
    'General': 'general'
  };

  for (const [cat, slug] of Object.entries(categoryMap)) {
    const el = $(`#count-${slug}`);
    if (el) el.textContent = state.categories[cat] || 0;
  }

  // Update subtitle
  const subtitle = $('#content-subtitle');
  if (subtitle) {
    subtitle.textContent = `${total} article${total !== 1 ? 's' : ''} tracked`;
  }
}

// ─── Article Detail Modal ───────────────────────────────────────
function openArticle(id) {
  const article = state.articles.find(a => a.id === id);
  if (!article) return;

  state.selectedArticle = article;
  const modal = $('#modal-detail');
  const body = $('#modal-detail-body');

  const category = article.category || 'General';
  const icon = CATEGORY_ICONS[category] || '📝';

  body.innerHTML = `
    <span class="detail-category card-badge" data-category="${category}">${icon} ${category}</span>
    <h2 class="detail-title">${article.title || 'Untitled'}</h2>
    <div class="detail-meta">
      ${article.source ? `<span>📰 ${article.source}</span>` : ''}
      ${article.datePublished ? `<span>📅 ${formatDate(article.datePublished)}</span>` : ''}
      ${article.sourceUrl ? `<a href="${article.sourceUrl}" target="_blank" rel="noopener">🔗 View Original</a>` : ''}
    </div>
    <div class="detail-content">${formatContent(article.content || article.summary || 'No content available.')}</div>
    ${article.tags && article.tags.length > 0 ? `
      <div class="detail-tags">
        ${article.tags.map(t => `<span class="detail-tag">${t}</span>`).join('')}
      </div>
    ` : ''}
    <div class="detail-actions">
      <button class="btn-edit" id="btn-detail-edit">✏️ Edit</button>
      <button class="btn-danger" id="btn-detail-delete">🗑 Delete</button>
    </div>
  `;

  // Bind edit/delete
  body.querySelector('#btn-detail-edit').addEventListener('click', () => {
    closeDetailModal();
    openForm(article);
  });

  body.querySelector('#btn-detail-delete').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(article.id);
      closeDetailModal();
    }
  });

  modal.style.display = 'flex';
}

function closeDetailModal() {
  $('#modal-detail').style.display = 'none';
  state.selectedArticle = null;
}

function formatContent(content) {
  // Convert markdown-style bold
  let text = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  // ELI5 mode — annotate medical terms
  if (state.eli5Mode) {
    text = annotateELI5(text);
  }

  return text;
}

function annotateELI5(html) {
  // Work on plain text portions only (not inside HTML tags)
  return html.replace(/>([^<]+)</g, (match, textContent) => {
    let annotated = textContent;
    for (const term of ELI5_TERMS_SORTED) {
      const entry = ELI5_GLOSSARY[term];
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
      if (regex.test(annotated)) {
        annotated = annotated.replace(regex, (match) => {
          return `<span class="eli5-term" data-plain="${entry.plain.replace(/"/g,"'")}" data-category="${entry.category}">${match}<span class="eli5-tooltip">${entry.plain}</span></span>`;
        });
        break; // Only annotate the longest matching term per segment
      }
    }
    return `>${annotated}<`;
  });
}

// ─── Add/Edit Form ──────────────────────────────────────────────
function openForm(article = null) {
  state.editingArticle = article;
  const modal = $('#modal-form');
  const title = $('#modal-form-title');

  if (article) {
    title.textContent = 'Edit Entry';
    $('#form-id').value = article.id;
    $('#form-title').value = article.title || '';
    $('#form-category').value = article.category || 'General';
    $('#form-source').value = article.source || '';
    $('#form-url').value = article.sourceUrl || '';
    $('#form-summary').value = article.summary || '';
    $('#form-content').value = article.content || '';
    $('#form-tags').value = (article.tags || []).join(', ');
    state.hopeValue = 0; // kept for compatibility
  } else {
    title.textContent = 'Add New Entry';
    $('#entry-form').reset();
    $('#form-id').value = '';
  }

  modal.style.display = 'flex';
  setTimeout(() => $('#form-title').focus(), 100);
}

function closeFormModal() {
  $('#modal-form').style.display = 'none';
  state.editingArticle = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const article = {
    title: $('#form-title').value,
    category: $('#form-category').value,
    source: $('#form-source').value,
    sourceUrl: $('#form-url').value,
    summary: $('#form-summary').value,
    content: $('#form-content').value,
    tags: $('#form-tags').value.split(',').map(t => t.trim()).filter(Boolean)
  };

  const id = $('#form-id').value;

  try {
    if (id) {
      await fetch(`${API_BASE}/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      showToast('✅ Article updated');
    } else {
      await fetch(`${API_BASE}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      showToast('✅ Entry saved');
    }

    closeFormModal();
    loadArticles();
  } catch (err) {
    showToast('❌ Failed to save');
    console.error(err);
  }
}

// ─── API Actions ────────────────────────────────────────────────
async function fetchNow() {
  const btn = $('#btn-fetch-now');
  const status = $('#fetch-status');

  btn.classList.add('fetching');
  btn.innerHTML = '<span>🔄</span> Fetching...';
  status.classList.add('fetching');
  status.querySelector('.status-text').textContent = 'Fetching...';

  $('#loading-state').style.display = 'flex';
  $('#articles-grid').innerHTML = '';
  $('#empty-state').style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/fetch-now`, { method: 'POST' });
    const result = await res.json();

    showToast(`✅ ${result.totalNew} new articles added`);
    loadArticles();
  } catch (err) {
    showToast('❌ Fetch failed — is the server running?');
    console.error(err);
  } finally {
    btn.classList.remove('fetching');
    btn.innerHTML = '<span>🔄</span> Fetch Now';
    status.classList.remove('fetching');
    status.querySelector('.status-text').textContent = 'Ready';
    $('#loading-state').style.display = 'none';
  }
}

async function deleteArticle(id) {
  try {
    await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' });
    showToast('🗑 Article deleted');
    loadArticles();
  } catch (err) {
    showToast('❌ Failed to delete');
  }
}

async function updateFetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/fetch-status`);
    const data = await res.json();

    const status = $('#fetch-status');
    if (data.fetchedToday > 0) {
      status.querySelector('.status-text').textContent = `${data.fetchedToday} new today`;
    } else {
      status.querySelector('.status-text').textContent = `${data.totalArticles} articles`;
    }
  } catch {
    // Silent fail
  }
}

// ─── Export/Import ──────────────────────────────────────────────
async function exportData() {
  try {
    const res = await fetch(`${API_BASE}/export`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parkinsons-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Data exported');
  } catch (err) {
    showToast('❌ Export failed');
  }
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    const res = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    showToast(`📤 Imported ${result.imported} new articles`);
    loadArticles();
  } catch (err) {
    showToast('❌ Import failed');
  }

  e.target.value = '';
}

// ─── Stats & Facts View ─────────────────────────────────────────
function renderStatsView() {
  const grid = $('#articles-grid');
  const d = STATS_DATA;

  grid.innerHTML = `
    <div class="stats-dashboard">
      <!-- Headline Stats -->
      <div class="stats-section">
        <h2 class="stats-section-title">📈 The Global Picture</h2>
        <div class="stats-headline-grid">
          ${renderHeadlineStat(d.headline.globalPrevalence.value, d.headline.globalPrevalence.label, d.headline.globalPrevalence.change, 'var(--accent)')}
          ${renderHeadlineStat(d.headline.fastestGrowing.value, d.headline.fastestGrowing.label, d.headline.fastestGrowing.detail, '#f59e0b')}
          ${renderHeadlineStat(d.headline.projectedGrowth.value, d.headline.projectedGrowth.label, d.headline.projectedGrowth.detail, '#8b5cf6')}
          ${renderHeadlineStat(d.headline.averageAge.value, d.headline.averageAge.label, d.headline.averageAge.detail, '#ec4899')}
        </div>
      </div>

      <!-- Growth Timeline -->
      <div class="stats-section">
        <h2 class="stats-section-title">📊 Projected Global Growth</h2>
        <p class="stats-section-desc">Number of people living with Parkinson's disease worldwide</p>
        <div class="stats-growth-chart">
          ${d.projectedGrowth.map((point, i) => {
    const maxCases = d.projectedGrowth[d.projectedGrowth.length - 1].cases;
    const height = (point.cases / maxCases) * 100;
    const isFuture = point.year > 2021;
    return `
              <div class="growth-bar-wrapper" style="animation-delay: ${i * 0.1}s">
                <span class="growth-bar-value">${(point.cases / 1000000).toFixed(1)}M</span>
                <div class="growth-bar ${isFuture ? 'growth-bar-projected' : ''}" style="height: ${height}%"></div>
                <span class="growth-bar-year">${point.year}</span>
              </div>
            `;
  }).join('')}
        </div>
        <p class="stats-source">Source: Global Burden of Disease Study 2021, BMJ 2025</p>
      </div>

      <!-- Prevalence by Country -->
      <div class="stats-section">
        <h2 class="stats-section-title">🌍 Prevalence by Country</h2>
        <p class="stats-section-desc">Current estimates and 2050 projections</p>
        <div class="stats-country-list">
          ${d.prevalenceByCountry.map((c, i) => {
    const maxProjected = d.prevalenceByCountry[0].projected2050;
    const barWidth = (c.projected2050 / maxProjected) * 100;
    const currentWidth = (c.current / maxProjected) * 100;
    return `
              <div class="country-row" style="animation-delay: ${i * 0.05}s">
                <div class="country-info">
                  <span class="country-flag">${c.flag}</span>
                  <span class="country-name">${c.country}</span>
                  <span class="country-growth ${c.growth.startsWith('-') ? 'negative' : ''}">↗ ${c.growth}</span>
                </div>
                <div class="country-bars">
                  <div class="country-bar-bg">
                    <div class="country-bar country-bar-projected" style="width: ${barWidth}%"></div>
                    <div class="country-bar country-bar-current" style="width: ${currentWidth}%"></div>
                  </div>
                  <div class="country-numbers">
                    <span class="country-current">${formatNumber(c.current)}</span>
                    <span class="country-arrow">→</span>
                    <span class="country-projected">${formatNumber(c.projected2050)}</span>
                  </div>
                </div>
              </div>
            `;
  }).join('')}
        </div>
        <div class="stats-legend">
          <span class="legend-item"><span class="legend-dot" style="background: var(--accent)"></span> Current</span>
          <span class="legend-item"><span class="legend-dot" style="background: rgba(139, 92, 246, 0.5)"></span> Projected 2050</span>
        </div>
        <p class="stats-source">Source: GBD 2021, BMJ, Parkinson's Europe</p>
      </div>

      <!-- UK Cost Data -->
      <div class="stats-section">
        <h2 class="stats-section-title">💷 Cost to UK Healthcare</h2>
        <div class="stats-cost-grid">
          <div class="cost-card cost-card-primary">
            <span class="cost-value">${d.costData.uk.totalEconomicCost}</span>
            <span class="cost-label">Total Economic Cost</span>
            <span class="cost-note">${d.costData.uk.totalEconomicCostNote}</span>
          </div>
          <div class="cost-card">
            <span class="cost-value">${d.costData.uk.directHealthcareCost}</span>
            <span class="cost-label">Direct NHS Cost</span>
            <span class="cost-note">${d.costData.uk.directHealthcareNote}</span>
          </div>
          <div class="cost-card cost-card-warning">
            <span class="cost-value">${d.costData.uk.projectedCost2040}</span>
            <span class="cost-label">Projected by 2040</span>
            <span class="cost-note">${d.costData.uk.projectedCostNote}</span>
          </div>
          <div class="cost-card">
            <span class="cost-value">${d.costData.uk.peopleLiving}</span>
            <span class="cost-label">People in UK with PD</span>
            <span class="cost-note">And growing</span>
          </div>
        </div>
        <div class="cost-breakdown">
          <h3 class="cost-breakdown-title">Cost Breakdown</h3>
          <div class="cost-breakdown-bar">
            ${d.costData.uk.costBreakdown.map(b => `
              <div class="breakdown-segment" style="width: ${b.percentage}%; background: ${b.color}" title="${b.category}: ${b.percentage}%">
                <span class="breakdown-label">${b.category}</span>
                <span class="breakdown-pct">${b.percentage}%</span>
              </div>
            `).join('')}
          </div>
        </div>
        <p class="stats-source">Source: Cure Parkinson's, Parkinson's UK, UCL Research</p>
      </div>

      <!-- US Cost -->
      <div class="stats-section stats-section-compact">
        <h2 class="stats-section-title">💵 US Economic Burden</h2>
        <div class="stats-cost-grid stats-cost-grid-compact">
          <div class="cost-card">
            <span class="cost-value">${d.costData.us.totalEconomicCost}</span>
            <span class="cost-label">Total Cost (incl. indirect)</span>
            <span class="cost-note">${d.costData.us.totalEconomicCostNote}</span>
          </div>
          <div class="cost-card">
            <span class="cost-value">${d.costData.us.directHealthcareCost}</span>
            <span class="cost-label">Direct Medical Costs</span>
            <span class="cost-note">${d.costData.us.directHealthcareNote}</span>
          </div>
          <div class="cost-card">
            <span class="cost-value">${d.costData.us.peopleLiving}</span>
            <span class="cost-label">People in US with PD</span>
          </div>
        </div>
      </div>

      <!-- Key Facts -->
      <div class="stats-section">
        <h2 class="stats-section-title">💡 Key Facts & Insights</h2>
        <div class="stats-facts-grid">
          ${d.keyFacts.map((f, i) => `
            <div class="fact-card" style="animation-delay: ${i * 0.05}s">
              <span class="fact-icon">${f.icon}</span>
              <p class="fact-text">${f.fact}</p>
              <span class="fact-source">${f.source}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Demographics -->
      <div class="stats-section">
        <h2 class="stats-section-title">👥 Demographics</h2>
        <div class="stats-demo-grid">
          <div class="demo-card">
            <div class="demo-visual">
              <span class="demo-icon-large">♂️</span>
              <span class="demo-ratio">1.5x</span>
            </div>
            <p class="demo-text">${d.demographics.menVsWomen.note}</p>
          </div>
          <div class="demo-card">
            <span class="demo-value">${d.demographics.youngOnset}</span>
            <span class="demo-label">Young Onset (YOPD)</span>
            <p class="demo-text">${d.demographics.youngOnsetNote}</p>
          </div>
          <div class="demo-card">
            <span class="demo-value">${d.demographics.averageSurvival}</span>
            <span class="demo-label">Years After Diagnosis</span>
            <p class="demo-text">${d.demographics.averageSurvivalNote}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHeadlineStat(value, label, detail, color) {
  return `
    <div class="headline-stat">
      <span class="headline-value" style="color: ${color}">${value}</span>
      <span class="headline-label">${label}</span>
      <span class="headline-detail">${detail}</span>
    </div>
  `;
}

// ─── Live Trials View ───────────────────────────────────────────
async function loadTrials() {
  try {
    const res = await fetch(`${API_BASE}/trials`);
    const data = await res.json();
    $('#loading-state').style.display = 'none';
    renderTrialsView(data);
  } catch (err) {
    $('#loading-state').style.display = 'none';
    showToast('❌ Failed to load trials — is the server running?');
    console.error(err);
  }
}

function renderTrialsView(data) {
  const grid = $('#articles-grid');
  const statusColors = {
    'Recruiting': '#34d399',
    'Active Not Recruiting': '#60a5fa',
    'Not Yet Recruiting': '#fbbf24',
    'Enrolling By Invitation': '#a78bfa'
  };

  const phaseColors = {
    'PHASE1': '#f472b6',
    'PHASE2': '#fbbf24',
    'PHASE3': '#34d399',
    'PHASE4': '#60a5fa',
    'EARLY_PHASE1': '#c084fc',
    'NA': '#94a3b8',
    'Not Specified': '#94a3b8'
  };

  grid.innerHTML = `
    <div class="trials-dashboard">
      <!-- Summary Header -->
      <div class="trials-hero">
        <div class="trials-hero-content">
          <h2 class="trials-hero-title">🧪 Live Clinical Trials</h2>
          <p class="trials-hero-desc">Real-time data from ClinicalTrials.gov — active and recruiting Parkinson's disease studies worldwide</p>
        </div>
        <div class="trials-hero-stats">
          <div class="trials-stat-big">
            <span class="trials-stat-value">${data.total}</span>
            <span class="trials-stat-label">Active Trials</span>
          </div>
          <div class="trials-stat-big">
            <span class="trials-stat-value">${data.totalCountries}</span>
            <span class="trials-stat-label">Countries</span>
          </div>
        </div>
      </div>

      <!-- Phase & Status Breakdown -->
      <div class="trials-breakdown-row">
        <div class="trials-breakdown-card">
          <h3 class="trials-breakdown-title">By Phase</h3>
          <div class="trials-pills">
            ${Object.entries(data.phaseBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([phase, count]) => {
        const label = phase.replace('PHASE', 'Phase ').replace('EARLY_PHASE1', 'Early Phase 1').replace('NA', 'N/A');
        const color = phaseColors[phase] || '#94a3b8';
        return `<span class="trials-pill" style="--pill-color: ${color}">${label} <strong>${count}</strong></span>`;
      }).join('')}
          </div>
        </div>
        <div class="trials-breakdown-card">
          <h3 class="trials-breakdown-title">By Status</h3>
          <div class="trials-pills">
            ${Object.entries(data.statusBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => {
        const color = statusColors[status] || '#94a3b8';
        return `<span class="trials-pill" style="--pill-color: ${color}">${status} <strong>${count}</strong></span>`;
      }).join('')}
          </div>
        </div>
      </div>

      <!-- Intervention Types -->
      <div class="trials-intervention-section">
        <h3 class="trials-breakdown-title">Intervention Types</h3>
        <div class="trials-intervention-bars">
          ${Object.entries(data.interventionTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, count]) => {
        const maxCount = Math.max(...Object.values(data.interventionTypes));
        const pct = (count / maxCount) * 100;
        const friendlyType = type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        return `
                <div class="intervention-row">
                  <span class="intervention-label">${friendlyType}</span>
                  <div class="intervention-bar-bg">
                    <div class="intervention-bar" style="width: ${pct}%"></div>
                  </div>
                  <span class="intervention-count">${count}</span>
                </div>
              `;
      }).join('')}
        </div>
      </div>

      <!-- Trial Cards -->
      <div class="trials-list-header">
        <h3 class="trials-list-title">All ${data.total} Trials</h3>
        <input type="text" class="trials-search" id="trials-search" placeholder="Filter trials..." />
      </div>
      <div class="trials-list" id="trials-list">
        ${data.trials.map((trial, i) => renderTrialCard(trial, i, statusColors, phaseColors)).join('')}
      </div>
    </div>
  `;

  // Bind trial search
  const trialSearch = $('#trials-search');
  if (trialSearch) {
    let timeout;
    trialSearch.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const q = trialSearch.value.toLowerCase();
        document.querySelectorAll('.trial-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? '' : 'none';
        });
      }, 200);
    });
  }
}

function renderTrialCard(trial, index, statusColors, phaseColors) {
  const statusColor = statusColors[trial.status] || '#94a3b8';
  const phaseLabel = trial.phase.replace('PHASE', 'Phase ').replace('EARLY_PHASE1', 'Early Phase 1').replace('NA', 'N/A');
  const phaseColor = phaseColors[trial.phase] || '#94a3b8';

  const interventionList = trial.interventions
    .map(iv => iv.name)
    .filter(Boolean)
    .join(', ') || 'Not specified';

  const countriesStr = trial.countries.length > 0
    ? trial.countries.slice(0, 3).join(', ') + (trial.countries.length > 3 ? ` +${trial.countries.length - 3}` : '')
    : '';

  return `
    <div class="trial-card" style="animation-delay: ${index * 0.03}s">
      <div class="trial-card-header">
        <span class="trial-status" style="--status-color: ${statusColor}">${trial.status}</span>
        <span class="trial-phase" style="color: ${phaseColor}">${phaseLabel}</span>
      </div>
      <h4 class="trial-title">${trial.title}</h4>
      ${trial.summary ? `<p class="trial-summary">${trial.summary}</p>` : ''}
      <div class="trial-details">
        <div class="trial-detail-row">
          <span class="trial-detail-label">💊 Intervention</span>
          <span class="trial-detail-value">${interventionList}</span>
        </div>
        <div class="trial-detail-row">
          <span class="trial-detail-label">🏢 Sponsor</span>
          <span class="trial-detail-value">${trial.sponsor}</span>
        </div>
        ${trial.enrollment ? `
          <div class="trial-detail-row">
            <span class="trial-detail-label">👥 Enrollment</span>
            <span class="trial-detail-value">${trial.enrollment.toLocaleString()} participants</span>
          </div>
        ` : ''}
        ${countriesStr ? `
          <div class="trial-detail-row">
            <span class="trial-detail-label">🌍 Location</span>
            <span class="trial-detail-value">${countriesStr}${trial.locationCount > 0 ? ` (${trial.locationCount} site${trial.locationCount > 1 ? 's' : ''})` : ''}</span>
          </div>
        ` : ''}
      </div>
      <div class="trial-card-footer">
        <span class="trial-nct">${trial.nctId}</span>
        ${trial.startDate ? `<span class="trial-date">Started: ${trial.startDate}</span>` : ''}
        <a href="${trial.url}" target="_blank" rel="noopener" class="trial-link">View on ClinicalTrials.gov →</a>
      </div>
    </div>
  `;
}

// ─── Research Papers Archive ───────────────────────────────────
let papersState = { topic: '', query: '', page: 1 };

async function loadPapers(opts = {}) {
  papersState = { ...papersState, ...opts };
  try {
    const params = new URLSearchParams();
    if (papersState.topic) params.set('topic', papersState.topic);
    if (papersState.query) params.set('query', papersState.query);
    params.set('page', String(papersState.page));

    const res = await fetch(`${API_BASE}/papers?${params}`);
    const data = await res.json();
    $('#loading-state').style.display = 'none';
    renderPapersView(data);
  } catch (err) {
    $('#loading-state').style.display = 'none';
    showToast('❌ Failed to load papers');
    console.error(err);
  }
}

const PAPER_TOPICS = [
  { id: '', label: 'All Topics', icon: '📚' },
  { id: 'diagnosis', label: 'Diagnosis', icon: '🩺' },
  { id: 'treatment', label: 'Treatment', icon: '💊' },
  { id: 'exercise', label: 'Exercise', icon: '🏋️' },
  { id: 'genetics', label: 'Genetics', icon: '🧬' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥦' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'mental-health', label: 'Mental Health', icon: '🧠' },
  { id: 'alpha-synuclein', label: 'α-Synuclein', icon: '🧪' },
  { id: 'neuroprotection', label: 'Neuroprotection', icon: '🛡️' },
  { id: 'deep-brain-stimulation', label: 'DBS', icon: '⚡' },
  { id: 'stem-cells', label: 'Stem Cells', icon: '🩸' },
  { id: 'epidemiology', label: 'Epidemiology', icon: '🌍' }
];

function renderPapersView(data) {
  const grid = $('#articles-grid');

  grid.innerHTML = `
    <div class="papers-dashboard">
      <div class="papers-hero">
        <div class="papers-hero-content">
          <h2 class="papers-hero-title">📚 Research Papers Archive</h2>
          <p class="papers-hero-desc">Open-access Parkinson's research from Europe PMC — browse, search, and download PDFs</p>
        </div>
        <div class="papers-hero-stats">
          <div class="papers-stat-big">
            <span class="papers-stat-value">${data.total > 1000 ? Math.floor(data.total / 1000) + 'K+' : data.total.toLocaleString()}</span>
            <span class="papers-stat-label">Papers Found</span>
          </div>
        </div>
      </div>

      <div class="papers-controls">
        <div class="papers-search-row">
          <input type="text" class="papers-search" id="papers-search" placeholder="Search papers... (e.g. levodopa, LRRK2, exercise)" value="${papersState.query || ''}" />
          <button class="papers-search-btn" id="papers-search-btn">🔍 Search</button>
        </div>
        <div class="papers-topics" id="papers-topics">
          ${PAPER_TOPICS.map(t => `
            <button class="papers-topic-btn ${papersState.topic === t.id ? 'active' : ''}" data-topic="${t.id}">
              <span>${t.icon}</span> ${t.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="papers-results-header">
        <span class="papers-showing">Showing ${data.returned} of ${data.total.toLocaleString()} papers</span>
      </div>

      <div class="papers-list" id="papers-list">
        ${data.papers.map((paper, i) => renderPaperCard(paper, i)).join('')}
      </div>

      ${data.returned >= 25 ? `
        <div class="papers-pagination">
          ${papersState.page > 1 ? '<button class="papers-page-btn" id="papers-prev">← Previous</button>' : ''}
          <span class="papers-page-info">Page ${papersState.page}</span>
          <button class="papers-page-btn" id="papers-next">Next →</button>
        </div>
      ` : ''}
    </div>
  `;

  // Bind search
  const searchInput = $('#papers-search');
  const searchBtn = $('#papers-search-btn');
  const doSearch = () => {
    papersState.page = 1;
    $('#loading-state').style.display = 'flex';
    $('#articles-grid').innerHTML = '';
    loadPapers({ query: searchInput.value, page: 1 });
  };
  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  // Bind topic filter buttons
  document.querySelectorAll('.papers-topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      papersState.page = 1;
      $('#loading-state').style.display = 'flex';
      $('#articles-grid').innerHTML = '';
      loadPapers({ topic: btn.dataset.topic, page: 1 });
    });
  });

  // Bind pagination
  const prevBtn = document.querySelector('#papers-prev');
  const nextBtn = document.querySelector('#papers-next');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    $('#loading-state').style.display = 'flex';
    $('#articles-grid').innerHTML = '';
    loadPapers({ page: papersState.page - 1 });
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    $('#loading-state').style.display = 'flex';
    $('#articles-grid').innerHTML = '';
    loadPapers({ page: papersState.page + 1 });
  });
}

function renderPaperCard(paper, index) {
  return `
    <div class="paper-card" style="animation-delay: ${index * 0.03}s">
      <div class="paper-card-header">
        ${paper.isOpenAccess ? '<span class="paper-oa-badge">🔓 Open Access</span>' : '<span class="paper-closed-badge">🔒 Restricted</span>'}
        ${paper.pdfUrl ? '<a href="' + paper.pdfUrl + '" target="_blank" rel="noopener" class="paper-pdf-btn">📄 PDF</a>' : ''}
      </div>
      <h4 class="paper-title">${paper.title}</h4>
      <p class="paper-authors">${paper.authors}</p>
      <div class="paper-meta">
        <span class="paper-journal">${paper.journal}</span>
        ${paper.year ? `<span class="paper-year">${paper.year}</span>` : ''}
        ${paper.citationCount > 0 ? `<span class="paper-citations">📌 ${paper.citationCount} citations</span>` : ''}
      </div>
      ${paper.abstract ? `<p class="paper-abstract">${paper.abstract}</p>` : ''}
      <div class="paper-card-footer">
        ${paper.pmcId ? `<span class="paper-id">${paper.pmcId}</span>` : ''}
        ${paper.pmid ? `<span class="paper-id">PMID: ${paper.pmid}</span>` : ''}
        ${paper.fullTextUrl ? `<a href="${paper.fullTextUrl}" target="_blank" rel="noopener" class="paper-link">Read Full Text →</a>` : ''}
      </div>
    </div>
  `;
}

// ─── Timeline View ─────────────────────────────────────────────

function renderTimelineView() {
  const grid = $('#articles-grid');

  const eraKeys = Object.keys(ERAS);
  const byEra = {};
  for (const key of eraKeys) byEra[key] = [];
  for (const event of TIMELINE_DATA) {
    if (byEra[event.era]) byEra[event.era].push(event);
  }

  grid.innerHTML = `
    <div class="timeline-dashboard">
      <div class="timeline-hero">
        <div class="timeline-hero-content">
          <h2 class="timeline-hero-title">🕐 Parkinson's Disease Timeline</h2>
          <p class="timeline-hero-desc">From James Parkinson's 1817 essay to today's disease-modifying trials — 200 years of science, persistence, and hope.</p>
        </div>
        <div class="timeline-era-legend">
          ${eraKeys.map(key => `
            <button class="timeline-era-btn" data-era="${key}" style="--era-color: ${ERAS[key].color}">
              <span class="era-dot" style="background: ${ERAS[key].color}"></span>
              <span>${ERAS[key].label}</span>
              <small>${ERAS[key].years}</small>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="timeline-track" id="timeline-track">
        ${eraKeys.map(eraKey => {
          const era = ERAS[eraKey];
          const events = byEra[eraKey];
          if (!events.length) return '';
          return `
            <div class="timeline-era-block" data-era="${eraKey}" id="era-${eraKey}">
              <div class="timeline-era-header" style="--era-color: ${era.color}">
                <div class="era-line" style="background: ${era.color}"></div>
                <div class="era-label-pill" style="background: ${era.color}20; border-color: ${era.color}40; color: ${era.color}">
                  ${era.label}
                  <span class="era-years">${era.years}</span>
                </div>
              </div>
              <div class="timeline-events">
                ${events.map((event, idx) => renderTimelineEvent(event, era.color, idx)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="timeline-footer">
        <p>Sources: Parkinson's Foundation, Michael J. Fox Foundation, Nature Reviews Neurology, FDA, ClinicalTrials.gov</p>
        <p class="timeline-pipeline-note">🔭 Items marked as pipeline are projections based on current trial progress — not confirmed outcomes.</p>
      </div>
    </div>
  `;

  // Era jump buttons
  grid.querySelectorAll('.timeline-era-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(`era-${btn.dataset.era}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderTimelineEvent(event, eraColor, idx) {
  const isLandmark = event.significance === 'landmark';
  const isPipeline = event.isPipeline;

  return `
    <div class="timeline-event ${isLandmark ? 'timeline-event-landmark' : ''} ${isPipeline ? 'timeline-event-pipeline' : ''}"
         style="animation-delay: ${idx * 0.07}s; --era-color: ${eraColor}">
      <div class="timeline-event-dot" style="background: ${eraColor}; box-shadow: 0 0 0 4px ${eraColor}30">
        <span class="timeline-event-icon">${event.icon}</span>
      </div>
      <div class="timeline-event-card">
        <div class="timeline-event-meta">
          <span class="timeline-event-year" style="color: ${eraColor}">${event.year}${isPipeline ? ' (projected)' : ''}</span>
          ${isLandmark ? `<span class="timeline-landmark-badge">★ Landmark</span>` : ''}
          ${isPipeline ? `<span class="timeline-pipeline-badge">🔭 Pipeline</span>` : ''}
        </div>
        <h3 class="timeline-event-title">${event.title}</h3>
        <p class="timeline-event-body">${event.body}</p>
        ${event.tags && event.tags.length ? `
          <div class="timeline-event-tags">
            ${event.tags.slice(0, 4).map(t => `<span class="timeline-tag">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ─── Media / Podcast View ───────────────────────────────────────

let mediaState = { filter: 'all' };

async function loadMedia() {
  try {
    const res = await fetch(`${API_BASE}/media`);
    const data = await res.json();
    $('#loading-state').style.display = 'none';
    renderMediaView(data);
  } catch (err) {
    $('#loading-state').style.display = 'none';
    showToast('❌ Failed to load media — is the server running?');
    console.error(err);
  }
}

function renderMediaView(data) {
  const grid = $('#articles-grid');

  const allMedia = data.media || [];
  const videos = allMedia.filter(m => m.type === 'video');
  const podcasts = allMedia.filter(m => m.type === 'podcast');

  grid.innerHTML = `
    <div class="media-dashboard">
      <div class="media-hero">
        <div class="media-hero-content">
          <h2 class="media-hero-title">🎙️ Podcasts & Videos</h2>
          <p class="media-hero-desc">The best PD content from leading foundations, researchers, and community voices — videos and podcasts in one place.</p>
        </div>
        <div class="media-hero-stats">
          <div class="media-stat">
            <span class="media-stat-value">${videos.length}</span>
            <span class="media-stat-label">Videos</span>
          </div>
          <div class="media-stat">
            <span class="media-stat-value">${podcasts.length}</span>
            <span class="media-stat-label">Episodes</span>
          </div>
        </div>
      </div>

      <div class="media-filter-bar">
        <button class="media-filter-btn ${mediaState.filter === 'all' ? 'active' : ''}" data-filter="all">🎯 All</button>
        <button class="media-filter-btn ${mediaState.filter === 'video' ? 'active' : ''}" data-filter="video">📺 Videos</button>
        <button class="media-filter-btn ${mediaState.filter === 'podcast' ? 'active' : ''}" data-filter="podcast">🎙️ Podcasts</button>
      </div>

      ${data.errors && data.errors.length > 0 ? `
        <div class="media-errors-note">⚠️ Some sources unavailable: ${data.errors.join(', ')}</div>
      ` : ''}

      <div class="media-grid" id="media-grid">
        ${allMedia.map((item, i) => renderMediaCard(item, i)).join('')}
      </div>

      ${allMedia.length === 0 ? `
        <div class="media-empty">
          <div style="font-size:48px;margin-bottom:16px">🎙️</div>
          <h3>No media available right now</h3>
          <p>YouTube and podcast feeds may be temporarily unavailable. Try again in a moment.</p>
        </div>
      ` : ''}
    </div>
  `;

  // Filter buttons
  grid.querySelectorAll('.media-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      mediaState.filter = btn.dataset.filter;
      grid.querySelectorAll('.media-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mediaItems = grid.querySelectorAll('.media-card');
      mediaItems.forEach(card => {
        const type = card.dataset.type;
        const show = mediaState.filter === 'all' || type === mediaState.filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // Video play buttons
  grid.querySelectorAll('.media-play-btn[data-embed]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.media-card');
      const thumb = card.querySelector('.media-thumb-container');
      const embedUrl = btn.dataset.embed + '?autoplay=1&rel=0';
      thumb.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="media-iframe"></iframe>`;
    });
  });
}

function renderMediaCard(item, index) {
  const isVideo = item.type === 'video';
  const date = formatDate(item.datePublished);

  return `
    <div class="media-card" data-type="${item.type}" style="animation-delay: ${index * 0.04}s">
      <div class="media-thumb-container">
        ${item.thumbnail
          ? `<img class="media-thumb" src="${item.thumbnail}" alt="${item.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=media-thumb-fallback>${isVideo ? '📺' : '🎙️'}</div>'">`
          : `<div class="media-thumb-fallback">${isVideo ? '📺' : '🎙️'}</div>`
        }
        ${isVideo && item.embedUrl
          ? `<button class="media-play-btn" data-embed="${item.embedUrl}" title="Play video">▶</button>`
          : ''
        }
        <span class="media-type-badge ${isVideo ? 'badge-video' : 'badge-podcast'}">${isVideo ? '📺 Video' : '🎙️ Podcast'}</span>
      </div>
      <div class="media-card-body">
        <div class="media-source">${item.source}</div>
        <h4 class="media-title">
          <a href="${item.sourceUrl}" target="_blank" rel="noopener">${item.title}</a>
        </h4>
        ${item.summary ? `<p class="media-summary">${(item.summary || '').substring(0, 180)}...</p>` : ''}
        <div class="media-card-footer">
          <span class="media-date">${date}</span>
          ${item.duration ? `<span class="media-duration">⏱ ${item.duration}</span>` : ''}
          ${!isVideo && item.audioUrl
            ? `<a href="${item.audioUrl}" target="_blank" rel="noopener" class="media-listen-btn">▶ Listen</a>`
            : ''
          }
          ${isVideo
            ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener" class="media-watch-btn">Watch →</a>`
            : ''
          }
        </div>
      </div>
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

// ─── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateStr;
  }
}

function isNewToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return (now - date) < 24 * 60 * 60 * 1000;
}

function showEmptyState() {
  $('#empty-state').style.display = 'flex';
  $('#articles-grid').innerHTML = '';

  // Re-bind fetch button in empty state
  const btn = $('#btn-empty-fetch');
  if (btn) {
    btn.addEventListener('click', fetchNow);
  }
}

function showToast(message) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
