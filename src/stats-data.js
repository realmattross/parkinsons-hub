// Stats & Facts — Curated Parkinson's Disease Statistics
// Sources: GBD 2021, BMJ, Parkinson's UK, Cure Parkinson's, MJ Fox Foundation

export const STATS_DATA = {
    headline: {
        globalPrevalence: {
            value: '11.77M',
            label: 'People Living with PD Globally',
            year: 2021,
            source: 'Global Burden of Disease Study 2021',
            change: '+274% since 1990'
        },
        fastestGrowing: {
            value: '#1',
            label: 'Fastest Growing Neurological Disorder',
            detail: 'Outpacing Alzheimer\'s in growth rate',
            source: 'BMJ, GBD Study'
        },
        projectedGrowth: {
            value: '25.2M',
            label: 'Projected Cases by 2050',
            detail: '+112% increase from 2021',
            source: 'BMJ 2025 projections'
        },
        averageAge: {
            value: '60+',
            label: 'Typical Onset Age',
            detail: '~10-15% are Young Onset (<50 years)',
            source: 'Parkinson\'s Foundation'
        }
    },

    prevalenceByCountry: [
        { country: 'China', flag: '🇨🇳', current: 3400000, projected2050: 10500000, growth: '209%' },
        { country: 'India', flag: '🇮🇳', current: 1200000, projected2050: 2800000, growth: '133%' },
        { country: 'United States', flag: '🇺🇸', current: 930000, projected2050: 1200000, growth: '29%' },
        { country: 'Germany', flag: '🇩🇪', current: 400000, projected2050: 574000, growth: '44%' },
        { country: 'Brazil', flag: '🇧🇷', current: 340000, projected2050: 620000, growth: '82%' },
        { country: 'United Kingdom', flag: '🇬🇧', current: 153000, projected2050: 307000, growth: '101%' },
        { country: 'France', flag: '🇫🇷', current: 270000, projected2050: 356000, growth: '32%' },
        { country: 'Spain', flag: '🇪🇸', current: 230000, projected2050: 351000, growth: '53%' },
        { country: 'Japan', flag: '🇯🇵', current: 290000, projected2050: 410000, growth: '41%' },
        { country: 'Australia', flag: '🇦🇺', current: 100000, projected2050: 175000, growth: '75%' },
        { country: 'Canada', flag: '🇨🇦', current: 100000, projected2050: 160000, growth: '60%' },
        { country: 'Italy', flag: '🇮🇹', current: 190000, projected2050: 177000, growth: '-7%' }
    ],

    projectedGrowth: [
        { year: 1990, cases: 3150000 },
        { year: 2000, cases: 4500000 },
        { year: 2010, cases: 6700000 },
        { year: 2021, cases: 11770000 },
        { year: 2030, cases: 15600000 },
        { year: 2040, cases: 20400000 },
        { year: 2050, cases: 25200000 }
    ],

    costData: {
        uk: {
            totalEconomicCost: '£3.6 billion',
            totalEconomicCostNote: 'per year (2023)',
            directHealthcareCost: '£728 million',
            directHealthcareNote: 'per year to the NHS',
            projectedCost2040: '£7.2 billion',
            projectedCostNote: 'if cases double as predicted',
            costBreakdown: [
                { category: 'Healthcare', percentage: 46.1, color: '#14b8a6' },
                { category: 'Productivity Loss', percentage: 37.4, color: '#8b5cf6' },
                { category: 'Patient & Family', percentage: 16.4, color: '#f59e0b' }
            ],
            costPerPatient: '£5,023',
            costPerPatientNote: 'average annual direct cost per patient',
            peopleLiving: '153,000',
            peopleLivingNote: 'people in UK living with PD'
        },
        us: {
            totalEconomicCost: '$52 billion',
            totalEconomicCostNote: 'per year (including indirect costs)',
            directHealthcareCost: '$25.4 billion',
            directHealthcareNote: 'direct medical costs per year',
            peopleLiving: '930,000',
            peopleLivingNote: 'people in US living with PD'
        },
        global: {
            totalEconomicCost: '$100+ billion',
            totalEconomicCostNote: 'estimated global economic burden'
        }
    },

    keyFacts: [
        { icon: '🧬', fact: 'About 15% of PD cases have a known genetic link', source: 'MJ Fox Foundation' },
        { icon: '🏃', fact: 'Vigorous exercise 3x/week can slow PD progression by 25-30%', source: 'Parkinson\'s Outcomes Project' },
        { icon: '☕', fact: 'Caffeine drinkers have 25% lower risk of developing PD', source: 'Meta-analysis, JAMA Neurology' },
        { icon: '😴', fact: 'REM Sleep Behaviour Disorder predicts PD up to 15 years before motor symptoms', source: 'Neurology Journal' },
        { icon: '💉', fact: 'Over 170 active clinical trials for PD treatments (as of 2025)', source: 'ClinicalTrials.gov' },
        { icon: '🥊', fact: 'Boxing-based exercise programs improve balance, gait speed, and quality of life in PD', source: 'Journal of Neurologic PT' },
        { icon: '🧠', fact: 'Alpha-synuclein aggregation can begin 20+ years before diagnosis', source: 'The Lancet Neurology' },
        { icon: '🥦', fact: 'Mediterranean diet is associated with later onset and slower progression of PD', source: 'Movement Disorders Journal' },
        { icon: '💰', fact: 'PD care costs increase from £2,471/year at diagnosis to £4,004/year after 10 years', source: 'UCL Research' },
        { icon: '🎯', fact: 'New blood tests can detect alpha-synuclein biomarkers for early PD diagnosis', source: 'The Lancet Neurology 2024' },
        { icon: '⚡', fact: 'Deep Brain Stimulation (DBS) can reduce motor symptoms by 60-70%', source: 'NEJM' },
        { icon: '🌍', fact: 'Western Sub-Saharan Africa will see the largest PD growth (+292%) by 2050', source: 'BMJ 2025' }
    ],

    demographics: {
        menVsWomen: { men: 1.5, women: 1, note: 'Men are 1.5x more likely to develop PD than women' },
        youngOnset: '10-15%',
        youngOnsetNote: 'of cases diagnosed before age 50',
        averageSurvival: '15-20 years',
        averageSurvivalNote: 'average time living with PD after diagnosis'
    }
};
