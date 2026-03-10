// Parkinson's Disease — Historical Milestones & Pipeline
// Curated timeline from first description to current trials and future hopes

export const TIMELINE_DATA = [
  // ── FOUNDATIONS ──────────────────────────────────────────────
  {
    year: 1817,
    era: 'foundations',
    title: 'The Shaking Palsy',
    body: 'James Parkinson, a London surgeon, publishes "An Essay on the Shaking Palsy" — the first clinical description of the condition that would bear his name. He described six patients with resting tremor, abnormal posture, and a tendency to fall forward.',
    significance: 'landmark',
    tags: ['history', 'diagnosis'],
    icon: '📜'
  },
  {
    year: 1872,
    era: 'foundations',
    title: 'Charcot Names the Disease',
    body: 'French neurologist Jean-Martin Charcot renames the condition "Parkinson\'s Disease" and adds muscular rigidity and slowness (bradykinesia) to the clinical description, distinguishing it from tremor caused by other conditions.',
    significance: 'major',
    tags: ['history', 'diagnosis'],
    icon: '🏥'
  },
  {
    year: 1912,
    era: 'foundations',
    title: 'Lewy Bodies Discovered',
    body: 'Friedrich Lewy identifies abnormal protein deposits — later named Lewy bodies — in the brains of PD patients. These clumps of alpha-synuclein protein are now considered a hallmark pathological feature of the disease.',
    significance: 'landmark',
    tags: ['pathology', 'alpha-synuclein'],
    icon: '🔬'
  },
  {
    year: 1919,
    era: 'foundations',
    title: 'Substantia Nigra Identified',
    body: 'Konstantin Tretiakoff establishes that the loss of neurons in the substantia nigra — a small region in the midbrain — is the key brain change in PD. This discovery laid the foundation for understanding dopamine\'s role decades later.',
    significance: 'landmark',
    tags: ['pathology', 'neuroscience'],
    icon: '🧠'
  },

  // ── DOPAMINE ERA ───────────────────────────────────────────────
  {
    year: 1957,
    era: 'dopamine',
    title: 'Dopamine Discovered in the Brain',
    body: 'Arvid Carlsson discovers that dopamine is a neurotransmitter in its own right — not just a precursor to adrenaline — and that it is highly concentrated in the basal ganglia. He later shares the Nobel Prize in Physiology or Medicine in 2000 for this work.',
    significance: 'landmark',
    tags: ['dopamine', 'neuroscience', 'Nobel Prize'],
    icon: '⚗️'
  },
  {
    year: 1960,
    era: 'dopamine',
    title: 'Dopamine Deficiency Confirmed',
    body: 'Oleh Hornykiewicz demonstrates that PD patients have almost no dopamine in the substantia nigra — sometimes less than 1% of normal levels. This breakthrough reveals the core biochemical defect in Parkinson\'s disease.',
    significance: 'landmark',
    tags: ['dopamine', 'pathology'],
    icon: '🔭'
  },
  {
    year: 1967,
    era: 'dopamine',
    title: 'Levodopa Transforms Treatment',
    body: 'George Cotzias shows that high oral doses of levodopa (L-DOPA) dramatically improve PD symptoms. This remains the most effective symptomatic treatment for PD more than 50 years later. For many patients, it was like waking from a frozen state.',
    significance: 'landmark',
    tags: ['levodopa', 'treatment', 'drug therapy'],
    icon: '💊'
  },
  {
    year: 1975,
    era: 'dopamine',
    title: 'Carbidopa–Levodopa Combination',
    body: 'The combination of carbidopa and levodopa (Sinemet) is approved, dramatically reducing side effects by preventing levodopa from breaking down before reaching the brain. This formulation is still widely prescribed today.',
    significance: 'major',
    tags: ['levodopa', 'treatment', 'drug approval'],
    icon: '💊'
  },
  {
    year: 1987,
    era: 'dopamine',
    title: 'Dopamine Agonists Arrive',
    body: 'Bromocriptine and later pramipexole and ropinirole expand the treatment toolkit, mimicking dopamine\'s effects in the brain. These drugs help manage symptoms and are particularly useful in younger patients to delay levodopa complications.',
    significance: 'major',
    tags: ['dopamine agonists', 'treatment'],
    icon: '💊'
  },

  // ── SURGICAL REVOLUTION ────────────────────────────────────────
  {
    year: 1992,
    era: 'surgical',
    title: 'Pallidotomy Revived',
    body: 'Lauri Laitinen revives pallidotomy — a surgical procedure targeting the globus pallidus — showing remarkable improvement in tremor and dyskinesias in advanced PD. This reignited interest in surgical approaches.',
    significance: 'major',
    tags: ['surgery', 'treatment'],
    icon: '🩺'
  },
  {
    year: 1997,
    era: 'surgical',
    title: 'Deep Brain Stimulation (DBS) Approved',
    body: 'The FDA approves deep brain stimulation for PD tremor — one of the most significant surgical advances in neurology. Electrodes implanted in the brain\'s subthalamic nucleus deliver electrical pulses that dramatically reduce motor symptoms without destroying tissue.',
    significance: 'landmark',
    tags: ['DBS', 'surgery', 'FDA approval'],
    icon: '⚡'
  },
  {
    year: 2002,
    era: 'surgical',
    title: 'DBS Approved for Advanced PD',
    body: 'DBS approval is expanded to treat the full range of advanced PD motor symptoms, not just tremor. It becomes an established option for patients who have exhausted medication options or face severe motor fluctuations.',
    significance: 'major',
    tags: ['DBS', 'surgery', 'FDA approval'],
    icon: '⚡'
  },

  // ── GENETICS REVOLUTION ────────────────────────────────────────
  {
    year: 1997,
    era: 'genetics',
    title: 'Alpha-Synuclein Gene Discovered',
    body: 'The first gene linked to familial PD is identified — SNCA, which encodes alpha-synuclein. Mutations cause the protein to misfold and accumulate as Lewy bodies. This discovery links genetics to the pathology already seen in brain tissue.',
    significance: 'landmark',
    tags: ['genetics', 'alpha-synuclein', 'SNCA'],
    icon: '🧬'
  },
  {
    year: 2004,
    era: 'genetics',
    title: 'LRRK2 Mutation Identified',
    body: 'Mutations in the LRRK2 gene are found to be the most common genetic cause of PD, responsible for ~1–2% of all cases and ~5% of familial cases. It becomes a major drug target, with LRRK2 inhibitors now in clinical trials.',
    significance: 'landmark',
    tags: ['genetics', 'LRRK2'],
    icon: '🧬'
  },
  {
    year: 2009,
    era: 'genetics',
    title: 'GBA Gene: Most Common Risk Factor',
    body: 'Variants in the GBA gene — previously associated with Gaucher\'s disease — are identified as the most common genetic risk factor for PD, present in 5–15% of patients. GBA-targeting therapies are now in active clinical trials.',
    significance: 'major',
    tags: ['genetics', 'GBA'],
    icon: '🧬'
  },

  // ── UNDERSTANDING THE DISEASE ──────────────────────────────────
  {
    year: 2003,
    era: 'understanding',
    title: 'Braak Staging System',
    body: 'Heiko Braak proposes that PD may begin in the gut and nasal passages — not the brain — and spread upward through the nervous system via alpha-synuclein propagation. The gut-brain axis in PD becomes a major research focus.',
    significance: 'major',
    tags: ['pathology', 'gut-brain', 'staging'],
    icon: '🔬'
  },
  {
    year: 2013,
    era: 'understanding',
    title: 'Prion-Like Spread Confirmed',
    body: 'Studies of patients who received fetal dopamine cell transplants show that Lewy bodies spread from host brain tissue into the transplanted cells — confirming that alpha-synuclein can spread between neurons like a prion, reshaping disease models.',
    significance: 'major',
    tags: ['alpha-synuclein', 'pathology', 'prion'],
    icon: '🔬'
  },
  {
    year: 2016,
    era: 'understanding',
    title: 'Gut Microbiome Linked to PD',
    body: 'Research establishes that the gut microbiome of PD patients differs significantly from healthy controls — and that gut bacteria may influence PD onset and progression via the vagus nerve. Diet and probiotics enter the research agenda.',
    significance: 'major',
    tags: ['gut microbiome', 'nutrition', 'research'],
    icon: '🦠'
  },

  // ── MODERN BREAKTHROUGHS ───────────────────────────────────────
  {
    year: 2017,
    era: 'modern',
    title: 'Focused Ultrasound Approved',
    body: 'The FDA approves MRI-guided focused ultrasound for PD tremor — a non-invasive procedure that uses sound waves to create a tiny lesion in the thalamus. No incision, no implant. A major step forward for patients who can\'t or won\'t have brain surgery.',
    significance: 'major',
    tags: ['focused ultrasound', 'treatment', 'non-invasive'],
    icon: '🔊'
  },
  {
    year: 2019,
    era: 'modern',
    title: 'Blood-Based Biomarker Breakthrough',
    body: 'Researchers develop a test detecting misfolded alpha-synuclein in cerebrospinal fluid (and later blood), enabling early diagnosis years before symptoms appear. The race to find a definitive blood test for PD accelerates significantly.',
    significance: 'major',
    tags: ['biomarker', 'early diagnosis', 'alpha-synuclein'],
    icon: '🩸'
  },
  {
    year: 2022,
    era: 'modern',
    title: 'Alpha-Synuclein Seed Amplification Assay',
    body: 'The SAA test — a skin or CSF test detecting misfolded alpha-synuclein — shows >85% sensitivity and near-perfect specificity for PD. This is the closest thing yet to a definitive diagnostic test and could transform early intervention.',
    significance: 'landmark',
    tags: ['biomarker', 'diagnosis', 'alpha-synuclein'],
    icon: '🩸'
  },
  {
    year: 2023,
    era: 'modern',
    title: 'LRRK2 Inhibitor Phase 2 Results',
    body: 'DNL201 and DNL151 (now BIIB122), LRRK2 inhibitors developed by Denali Therapeutics and Biogen, show promising Phase 2 results — demonstrating target engagement and a manageable safety profile. The first potential disease-modifying drugs approach Phase 3.',
    significance: 'major',
    tags: ['LRRK2', 'disease-modifying', 'clinical trial', 'drug trial'],
    icon: '🧪'
  },
  {
    year: 2024,
    era: 'modern',
    title: 'Prasinezumab Phase 2 Results',
    body: 'Roche\'s anti-alpha-synuclein antibody prasinezumab shows slowing of motor progression in a subgroup of faster-progressing patients — the first hint that targeting alpha-synuclein directly may work. A larger Phase 2b trial is underway.',
    significance: 'major',
    tags: ['alpha-synuclein', 'immunotherapy', 'disease-modifying', 'clinical trial'],
    icon: '🧪'
  },
  {
    year: 2024,
    era: 'modern',
    title: 'Stem Cell Trial Begins (BlueRock/Bayer)',
    body: 'BlueRock Therapeutics (a Bayer company) reports Phase 1 results of bemdaneprocel — the first pluripotent stem cell-derived dopamine neuron therapy. Early data shows safety and possible efficacy signals, with a larger trial launched.',
    significance: 'major',
    tags: ['stem cells', 'cell therapy', 'clinical trial'],
    icon: '🩸'
  },

  // ── PIPELINE / NEAR FUTURE ─────────────────────────────────────
  {
    year: 2025,
    era: 'pipeline',
    title: 'GBA Gene Therapy Trials Expand',
    body: 'Multiple gene therapy approaches targeting GBA1 mutations — including AAV-based therapies — enter mid-stage trials. For the 10–15% of PD patients with GBA variants, these represent a potential precision medicine approach.',
    significance: 'major',
    tags: ['gene therapy', 'GBA', 'genetics', 'clinical trial'],
    icon: '🧬'
  },
  {
    year: 2025,
    era: 'pipeline',
    title: 'Adaptive DBS Systems',
    body: 'Next-generation "closed-loop" DBS systems that read brain signals in real-time and automatically adjust stimulation are entering clinical use. Unlike traditional DBS, these respond to the patient\'s moment-to-moment brain activity.',
    significance: 'major',
    tags: ['DBS', 'technology', 'adaptive'],
    icon: '🤖'
  },
  {
    year: 2026,
    era: 'pipeline',
    title: 'Disease-Modifying Trials: Phase 3',
    body: 'Several Phase 3 trials are expected to report results, including LRRK2 inhibitors and alpha-synuclein-targeting therapies. If successful, these would be the first treatments to actually slow or stop PD progression — not just manage symptoms.',
    significance: 'landmark',
    tags: ['disease-modifying', 'clinical trial', 'LRRK2', 'alpha-synuclein'],
    icon: '🔭',
    isPipeline: true
  },
  {
    year: 2028,
    era: 'pipeline',
    title: 'Blood Test for Early PD',
    body: 'Multiple blood-based alpha-synuclein and neuroinflammation biomarker panels are expected to reach clinical validation, enabling diagnosis years before motor symptoms — transforming the window for intervention.',
    significance: 'landmark',
    tags: ['biomarker', 'early diagnosis', 'blood test'],
    icon: '🩸',
    isPipeline: true
  },
  {
    year: 2030,
    era: 'pipeline',
    title: 'Personalised Precision Medicine',
    body: 'The convergence of genetic profiling, digital biomarkers from wearables, gut microbiome analysis, and AI-powered diagnostics is expected to enable truly personalised treatment — different drugs for LRRK2 vs GBA vs sporadic PD patients.',
    significance: 'major',
    tags: ['precision medicine', 'AI', 'genetics', 'future'],
    icon: '🎯',
    isPipeline: true
  }
];

export const ERAS = {
  foundations: { label: 'Foundations', color: '#94a3b8', years: '1817–1919' },
  dopamine:    { label: 'Dopamine Era', color: '#a78bfa', years: '1957–1987' },
  surgical:    { label: 'Surgical Revolution', color: '#60a5fa', years: '1992–2002' },
  genetics:    { label: 'Genetics Revolution', color: '#34d399', years: '1997–2009' },
  understanding: { label: 'Understanding PD', color: '#fbbf24', years: '2003–2016' },
  modern:      { label: 'Modern Breakthroughs', color: '#f472b6', years: '2017–2024' },
  pipeline:    { label: 'The Pipeline', color: '#fb923c', years: '2025–2030+' }
};
