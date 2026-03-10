// ClinicalTrials.gov API v2 fetcher
// Pulls active/recruiting Parkinson's disease trials

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

export async function fetchClinicalTrials() {
    const params = new URLSearchParams({
        'query.cond': 'Parkinson\'s disease',
        'filter.overallStatus': 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING',
        'sort': 'LastUpdatePostDate:desc',
        'pageSize': '20',
        'fields': 'NCTId,BriefTitle,OfficialTitle,BriefSummary,OverallStatus,Phase,StartDate,CompletionDate,LeadSponsorName,InterventionName,InterventionType,Condition,LocationCity,LocationCountry,LastUpdatePostDate'
    });

    const res = await fetch(`${BASE_URL}?${params}`);
    const data = await res.json();

    const studies = data.studies || [];
    const articles = [];

    for (const study of studies) {
        const protocol = study.protocolSection || {};
        const id = protocol.identificationModule || {};
        const status = protocol.statusModule || {};
        const design = protocol.designModule || {};
        const sponsor = protocol.sponsorCollaboratorsModule || {};
        const arms = protocol.armsInterventionsModule || {};
        const desc = protocol.descriptionModule || {};

        const nctId = id.nctId || '';
        const interventions = (arms.interventions || [])
            .map(i => `${i.name} (${i.type})`)
            .join(', ');

        const phases = (design.phases || []).join(', ') || 'Not specified';
        const sponsorName = sponsor.leadSponsor?.name || 'Unknown';

        articles.push({
            title: id.briefTitle || id.officialTitle || 'Untitled Trial',
            summary: desc.briefSummary?.replace(/\n/g, ' ').substring(0, 500) || '',
            content: buildTrialContent({
                nctId,
                officialTitle: id.officialTitle,
                status: status.overallStatus,
                phases,
                interventions,
                sponsorName,
                startDate: status.startDateStruct?.date,
                completionDate: status.completionDateStruct?.date,
                briefSummary: desc.briefSummary
            }),
            source: 'ClinicalTrials.gov',
            sourceUrl: `https://clinicaltrials.gov/study/${nctId}`,
            datePublished: status.lastUpdatePostDateStruct?.date || new Date().toISOString(),
            tags: extractTrialTags(interventions, phases, id.briefTitle || ''),
            category: 'Drug Trials'
        });
    }

    return articles;
}

function buildTrialContent({ nctId, officialTitle, status, phases, interventions, sponsorName, startDate, completionDate, briefSummary }) {
    let content = '';

    if (officialTitle) content += `**Official Title:** ${officialTitle}\n\n`;
    content += `**NCT ID:** ${nctId}\n`;
    content += `**Status:** ${status}\n`;
    content += `**Phase:** ${phases}\n`;
    if (interventions) content += `**Interventions:** ${interventions}\n`;
    content += `**Sponsor:** ${sponsorName}\n`;
    if (startDate) content += `**Start Date:** ${startDate}\n`;
    if (completionDate) content += `**Expected Completion:** ${completionDate}\n`;
    if (briefSummary) content += `\n---\n\n${briefSummary}`;

    return content;
}

function extractTrialTags(interventions, phases, title) {
    const tags = ['clinical trial'];
    const text = `${interventions} ${title}`.toLowerCase();

    if (phases.includes('3') || phases.includes('4')) tags.push('late-stage');
    if (phases.includes('1') || phases.includes('2')) tags.push('early-stage');
    if (text.includes('gene therapy')) tags.push('gene therapy');
    if (text.includes('stem cell')) tags.push('stem cell');
    if (text.includes('antibody') || text.includes('immunotherapy')) tags.push('immunotherapy');
    if (text.includes('levodopa') || text.includes('l-dopa')) tags.push('levodopa');
    if (text.includes('dopamine')) tags.push('dopamine');
    if (text.includes('alpha-synuclein') || text.includes('synuclein')) tags.push('alpha-synuclein');
    if (text.includes('exercise') || text.includes('rehabilitation')) tags.push('exercise');
    if (text.includes('neuroprotect')) tags.push('neuroprotection');
    if (text.includes('deep brain') || text.includes('DBS')) tags.push('DBS');

    return tags;
}
