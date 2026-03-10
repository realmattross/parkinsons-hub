// "Explain Like I'm New" — Plain-English Glossary for PD Medical Terms
// Triggered when ELI5 mode is active; terms are highlighted in article text

export const ELI5_GLOSSARY = {
  // ── CORE BIOLOGY ──────────────────────────────────────────────
  'dopamine': {
    plain: 'a chemical messenger your brain uses to control smooth movement — PD destroys the cells that make it',
    category: 'biology'
  },
  'dopaminergic': {
    plain: 'relating to the brain cells or pathways that use dopamine',
    category: 'biology'
  },
  'substantia nigra': {
    plain: 'a tiny brain region (Latin for "black substance") where dopamine is made — the area most damaged in PD',
    category: 'biology'
  },
  'basal ganglia': {
    plain: 'a group of brain structures that coordinate movement — they malfunction in PD due to lack of dopamine',
    category: 'biology'
  },
  'alpha-synuclein': {
    plain: 'a protein that misfolds and clumps together in PD brains, forming toxic deposits that damage neurons',
    category: 'biology'
  },
  'lewy bodies': {
    plain: 'the toxic protein clumps (made of alpha-synuclein) found in the brains of PD patients — a hallmark of the disease',
    category: 'biology'
  },
  'lewy body': {
    plain: 'a toxic protein clump found in PD-affected brain cells',
    category: 'biology'
  },
  'neurodegeneration': {
    plain: 'the gradual death of nerve cells in the brain — the underlying process in PD',
    category: 'biology'
  },
  'neurotransmitter': {
    plain: 'a chemical that carries signals between brain cells — dopamine is the one most affected in PD',
    category: 'biology'
  },
  'neuroprotection': {
    plain: 'protecting brain cells from dying — a major goal of research, as no current drug does this for PD',
    category: 'biology'
  },
  'neuroinflammation': {
    plain: 'inflammation inside the brain, which worsens nerve cell damage in PD',
    category: 'biology'
  },
  'mitochondria': {
    plain: 'the energy factories inside cells — mitochondrial dysfunction is linked to nerve cell death in PD',
    category: 'biology'
  },
  'oxidative stress': {
    plain: 'cell damage caused by unstable molecules (free radicals) — a process that contributes to PD progression',
    category: 'biology'
  },
  'synaptic': {
    plain: 'relating to the junctions between nerve cells where signals are passed',
    category: 'biology'
  },
  'striatum': {
    plain: 'a key brain region that receives signals from the substantia nigra and controls movement and reward',
    category: 'biology'
  },

  // ── SYMPTOMS ──────────────────────────────────────────────────
  'bradykinesia': {
    plain: 'slowness of movement — one of the three main PD symptoms (along with tremor and rigidity)',
    category: 'symptom'
  },
  'tremor': {
    plain: 'involuntary shaking, usually starting in a hand or finger, often at rest',
    category: 'symptom'
  },
  'rigidity': {
    plain: 'muscle stiffness that makes movement feel stiff or "cogwheel" resistant',
    category: 'symptom'
  },
  'dyskinesia': {
    plain: 'involuntary, uncontrolled writhing or jerking movements — often a side effect of long-term levodopa',
    category: 'symptom'
  },
  'motor fluctuations': {
    plain: 'when medication effects wear off unpredictably, causing switching between good ("on") and poor ("off") control',
    category: 'symptom'
  },
  '"on" time': {
    plain: 'periods when medication is working well and movement is controlled',
    category: 'symptom'
  },
  '"off" time': {
    plain: 'periods when medication has worn off and PD symptoms return — freezing, stiffness, tremor',
    category: 'symptom'
  },
  'off time': {
    plain: 'periods when medication has worn off and PD symptoms return',
    category: 'symptom'
  },
  'on time': {
    plain: 'periods when medication is working well and movement is controlled',
    category: 'symptom'
  },
  'freezing of gait': {
    plain: 'a sudden inability to move the feet when walking, as if they are stuck to the floor',
    category: 'symptom'
  },
  'dysphagia': {
    plain: 'difficulty swallowing — a common non-motor PD symptom affecting eating and drinking',
    category: 'symptom'
  },
  'postural instability': {
    plain: 'loss of balance and difficulty maintaining an upright posture — increases fall risk',
    category: 'symptom'
  },
  'orthostatic hypotension': {
    plain: 'a drop in blood pressure when standing up, causing dizziness — common in PD',
    category: 'symptom'
  },
  'hyposmia': {
    plain: 'reduced sense of smell — often one of the earliest signs of PD, appearing years before motor symptoms',
    category: 'symptom'
  },
  'RBD': {
    plain: 'REM Sleep Behaviour Disorder — acting out vivid dreams during sleep; a strong early warning sign of PD',
    category: 'symptom'
  },
  'REM sleep behaviour disorder': {
    plain: 'acting out vivid dreams by moving, talking, or shouting during sleep — a strong early PD warning sign',
    category: 'symptom'
  },

  // ── TREATMENTS ────────────────────────────────────────────────
  'levodopa': {
    plain: 'the most effective PD drug — the body converts it to dopamine in the brain, reducing symptoms',
    category: 'treatment'
  },
  'l-dopa': {
    plain: 'shorthand for levodopa — the most effective PD drug',
    category: 'treatment'
  },
  'carbidopa': {
    plain: 'a drug combined with levodopa to prevent it breaking down too soon — allows more to reach the brain',
    category: 'treatment'
  },
  'dopamine agonist': {
    plain: 'a drug that mimics dopamine\'s effects in the brain — often used alongside or before levodopa',
    category: 'treatment'
  },
  'MAO-B inhibitor': {
    plain: 'a drug that slows the breakdown of dopamine in the brain, extending its effects',
    category: 'treatment'
  },
  'COMT inhibitor': {
    plain: 'a drug that prevents levodopa from being broken down in the blood before reaching the brain',
    category: 'treatment'
  },
  'DBS': {
    plain: 'Deep Brain Stimulation — a surgically implanted device (like a brain pacemaker) that sends electrical pulses to reduce symptoms',
    category: 'treatment'
  },
  'deep brain stimulation': {
    plain: 'surgery to implant a device (like a brain pacemaker) that sends electrical pulses to control movement symptoms',
    category: 'treatment'
  },
  'focused ultrasound': {
    plain: 'a non-surgical treatment that uses sound waves to precisely target and treat brain areas causing tremor',
    category: 'treatment'
  },
  'stem cell therapy': {
    plain: 'an experimental approach using specially grown cells to replace the dopamine-producing neurons lost in PD',
    category: 'treatment'
  },
  'gene therapy': {
    plain: 'an experimental approach that delivers corrective genetic material into brain cells to slow or stop PD progression',
    category: 'treatment'
  },
  'immunotherapy': {
    plain: 'using the body\'s immune system (or engineered antibodies) to clear toxic alpha-synuclein from the brain',
    category: 'treatment'
  },
  'disease-modifying': {
    plain: 'a treatment that actually slows or stops disease progression — not just relieving symptoms. No confirmed PD drug does this yet',
    category: 'treatment'
  },
  'neuroprotective': {
    plain: 'protecting brain cells from dying — the holy grail of PD research that current treatments don\'t achieve',
    category: 'treatment'
  },

  // ── RESEARCH TERMS ────────────────────────────────────────────
  'randomized controlled trial': {
    plain: 'the gold standard study design — patients are randomly assigned to receive treatment or placebo to give fair results',
    category: 'research'
  },
  'double-blind': {
    plain: 'neither patients nor researchers know who is getting the real treatment — removes bias from results',
    category: 'research'
  },
  'placebo': {
    plain: 'a dummy treatment (e.g. sugar pill) given to the control group in a trial — the real treatment must beat this',
    category: 'research'
  },
  'phase 1': {
    plain: 'the first human trial stage — testing safety and dosage in a small number of participants',
    category: 'research'
  },
  'phase 2': {
    plain: 'a trial testing whether a drug works and refining the dose — larger than Phase 1, still relatively small',
    category: 'research'
  },
  'phase 3': {
    plain: 'a large, rigorous trial needed for regulatory approval — typically hundreds or thousands of patients',
    category: 'research'
  },
  'biomarker': {
    plain: 'a measurable sign in blood, spinal fluid, or brain scans that indicates disease presence or progression',
    category: 'research'
  },
  'cohort study': {
    plain: 'a study following a group of people over time to understand how PD develops or how treatments work',
    category: 'research'
  },
  'meta-analysis': {
    plain: 'a study that combines results from many previous studies to draw stronger conclusions',
    category: 'research'
  },
  'UPDRS': {
    plain: 'Unified Parkinson\'s Disease Rating Scale — the main scoring system doctors use to measure symptom severity',
    category: 'research'
  },
  'MDS-UPDRS': {
    plain: 'the updated version of the UPDRS rating scale — assesses both motor and non-motor PD symptoms',
    category: 'research'
  },
  'prodromal': {
    plain: 'the pre-diagnosis phase of PD where symptoms are present but not yet recognised — may start years before diagnosis',
    category: 'research'
  },
  'idiopathic': {
    plain: 'of unknown cause — "idiopathic PD" means PD with no identified genetic or environmental cause (most common type)',
    category: 'research'
  },
  'aetiology': {
    plain: 'the cause or origin of a disease',
    category: 'research'
  },
  'etiology': {
    plain: 'the cause or origin of a disease',
    category: 'research'
  },
  'pathophysiology': {
    plain: 'the biological processes by which PD causes damage and symptoms in the body',
    category: 'research'
  },
  'in vivo': {
    plain: 'tested in a living organism (animal or human) — more meaningful than lab tests alone',
    category: 'research'
  },
  'in vitro': {
    plain: 'tested in a lab dish, not in a living organism — an early step before animal or human trials',
    category: 'research'
  },

  // ── GENETICS ──────────────────────────────────────────────────
  'LRRK2': {
    plain: 'a gene that, when mutated, is the most common genetic cause of PD — a key drug target',
    category: 'genetics'
  },
  'GBA': {
    plain: 'a gene whose variants are the most common genetic risk factor for PD — present in 5–15% of patients',
    category: 'genetics'
  },
  'SNCA': {
    plain: 'the gene that encodes alpha-synuclein — mutations in this gene cause a rare inherited form of PD',
    category: 'genetics'
  },
  'PINK1': {
    plain: 'a gene involved in cleaning up damaged mitochondria — mutations cause an early-onset inherited form of PD',
    category: 'genetics'
  },
  'PARKIN': {
    plain: 'a gene that acts like a quality-control system for cells — mutations cause early-onset PD',
    category: 'genetics'
  },
  'variant': {
    plain: 'a difference in a gene\'s DNA sequence — some variants increase PD risk, others are harmless',
    category: 'genetics'
  },
  'mutation': {
    plain: 'a change in DNA that disrupts normal function — can cause or increase risk of PD',
    category: 'genetics'
  },
  'genome-wide association study': {
    plain: 'a large study scanning the DNA of thousands of people to find genetic variants linked to a disease',
    category: 'genetics'
  },
  'GWAS': {
    plain: 'Genome-Wide Association Study — a large scan of DNA across thousands of people to find disease-linked genes',
    category: 'genetics'
  }
};

// Terms sorted by length (longest first) to ensure correct matching order
export const ELI5_TERMS_SORTED = Object.keys(ELI5_GLOSSARY)
  .sort((a, b) => b.length - a.length);
