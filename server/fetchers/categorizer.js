// Auto-categorization engine
// Maps articles to categories based on keyword analysis

const CATEGORIES = {
    'Drug Trials': {
        weight: 10,
        keywords: [
            'trial', 'phase 1', 'phase 2', 'phase 3', 'phase 4', 'clinical trial',
            'drug', 'medication', 'pharmaceutical', 'FDA', 'EMA', 'approval',
            'levodopa', 'carbidopa', 'pramipexole', 'ropinirole', 'entacapone',
            'MAO-B', 'COMT', 'amantadine', 'safinamide', 'opicapone',
            'randomized', 'placebo', 'double-blind', 'efficacy', 'dosage',
            'investigational', 'pipeline', 'sponsor'
        ]
    },
    'Exercise': {
        weight: 8,
        keywords: [
            'exercise', 'fitness', 'physical activity', 'walking', 'gait',
            'treadmill', 'cycling', 'boxing', 'dance', 'yoga', 'tai chi',
            'strength training', 'balance', 'flexibility', 'aerobic',
            'physiotherapy', 'physical therapy', 'rehabilitation', 'mobility',
            'falls', 'posture', 'motor function', 'movement'
        ]
    },
    'Nutrition': {
        weight: 8,
        keywords: [
            'nutrition', 'diet', 'food', 'eating', 'vitamin', 'supplement',
            'protein', 'fiber', 'antioxidant', 'Mediterranean diet',
            'gut microbiome', 'microbiota', 'probiotics', 'omega-3',
            'caffeine', 'coffee', 'swallowing', 'dysphagia', 'weight'
        ]
    },
    'Sleep': {
        weight: 9,
        keywords: [
            'sleep', 'insomnia', 'REM', 'RBD', 'REM sleep behavior disorder',
            'circadian', 'melatonin', 'restless leg', 'fatigue',
            'daytime sleepiness', 'nocturia', 'sleep quality', 'sleep hygiene'
        ]
    },
    'Breakthroughs': {
        weight: 7,
        keywords: [
            'breakthrough', 'discovery', 'novel', 'first-ever', 'groundbreaking',
            'cure', 'reversal', 'disease-modifying', 'neuroprotection',
            'regeneration', 'stem cell', 'gene therapy', 'CRISPR',
            'biomarker', 'early detection', 'diagnostic', 'blood test',
            'alpha-synuclein', 'Lewy body', 'misfolded protein'
        ]
    },
    'Mental Health': {
        weight: 8,
        keywords: [
            'depression', 'anxiety', 'mental health', 'cognitive', 'dementia',
            'apathy', 'hallucination', 'psychosis', 'wellbeing', 'well-being',
            'mood', 'motivation', 'caregiver', 'carer', 'support group',
            'quality of life', 'emotional', 'stress', 'mindfulness'
        ]
    },
    'Therapies': {
        weight: 6,
        keywords: [
            'therapy', 'treatment', 'DBS', 'deep brain stimulation',
            'speech therapy', 'occupational therapy', 'LSVT', 'Lee Silverman',
            'focused ultrasound', 'neurostimulation', 'infusion', 'pump',
            'duodopa', 'apomorphine', 'non-pharmacological', 'complementary',
            'acupuncture', 'music therapy', 'art therapy'
        ]
    },
    'Technology': {
        weight: 6,
        keywords: [
            'technology', 'app', 'wearable', 'sensor', 'AI', 'artificial intelligence',
            'machine learning', 'digital health', 'telemedicine', 'telehealth',
            'robot', 'assistive device', 'smart', 'monitoring', 'tracking',
            'algorithm', 'data', 'platform'
        ]
    },
    'Community': {
        weight: 5,
        keywords: [
            'community', 'support group', 'charity', 'fundraising', 'awareness',
            'advocacy', 'campaign', 'story', 'living with', 'diagnosed',
            'young onset', 'YOPD', 'family', 'caregiver', 'carer',
            'event', 'conference', 'webinar', 'podcast'
        ]
    }
};

export function categorizeArticle(article) {
    const text = `${article.title} ${article.summary || ''} ${(article.tags || []).join(' ')}`.toLowerCase();

    let bestCategory = 'General';
    let bestScore = 0;

    for (const [category, config] of Object.entries(CATEGORIES)) {
        let score = 0;
        for (const keyword of config.keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score += config.weight;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
}

export function getAllCategories() {
    return ['Drug Trials', 'Exercise', 'Nutrition', 'Sleep', 'Breakthroughs', 'Mental Health', 'Therapies', 'Technology', 'Community', 'General'];
}
