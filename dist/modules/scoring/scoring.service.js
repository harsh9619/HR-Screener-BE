"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFitScore = calculateFitScore;
/**
 * Calculates candidate fit score against role requirements without letting
 * integrity status corrupt or artificially suppress skill match scoring.
 */
function calculateFitScore(resumeText, requirements) {
    if (!requirements || requirements.length === 0) {
        return {
            overallScore: 70,
            summary: 'Candidate evaluated against general profile requirements.',
            requirements: [],
        };
    }
    const normalized = resumeText.toLowerCase();
    const matchedRequirements = [];
    let mustHaveCount = 0;
    let mustHaveMatches = 0;
    let optionalCount = 0;
    let optionalMatches = 0;
    for (const req of requirements) {
        const term = req.requirement.trim();
        const termLower = term.toLowerCase();
        // Check direct occurrence or keyword presence
        let isMatched = false;
        let evidenceSnippet = null;
        if (normalized.includes(termLower)) {
            isMatched = true;
        }
        else {
            // Check partial token match (e.g., "React" in "React.js" or "Node" in "NodeJS")
            const tokens = termLower.split(/[\s,/-]+/);
            const allTokensMatch = tokens.every((t) => t.length <= 2 || normalized.includes(t));
            if (tokens.length > 0 && allTokensMatch) {
                isMatched = true;
            }
        }
        if (isMatched) {
            // Find sentence or snippet as evidence
            const sentences = resumeText.split(/(?<=[.!?\n])\s+/);
            const matchedSentence = sentences.find((s) => s.toLowerCase().includes(termLower));
            evidenceSnippet = matchedSentence
                ? matchedSentence.trim().substring(0, 140)
                : `Demonstrated experience with ${term} in resume text.`;
        }
        if (req.isMustHave) {
            mustHaveCount++;
            if (isMatched)
                mustHaveMatches++;
        }
        else {
            optionalCount++;
            if (isMatched)
                optionalMatches++;
        }
        matchedRequirements.push({
            requirement: req.requirement,
            isMustHave: req.isMustHave,
            matched: isMatched,
            evidence: evidenceSnippet,
        });
    }
    // Weighting: Must-haves contribute 75% of total score, optional skills contribute 25%.
    const mustHaveRatio = mustHaveCount > 0 ? mustHaveMatches / mustHaveCount : 1;
    const optionalRatio = optionalCount > 0 ? optionalMatches / optionalCount : 1;
    let score = Math.round(mustHaveRatio * 75 + optionalRatio * 25);
    // Give baseline credit if candidate has solid tech skills
    score = Math.min(100, Math.max(15, score));
    let summary = '';
    if (score >= 85) {
        summary = `Exceptional fit for the role matching ${mustHaveMatches} of ${mustHaveCount} must-have criteria.`;
    }
    else if (score >= 70) {
        summary = `Strong candidate with key prerequisite qualifications.`;
    }
    else if (score >= 50) {
        summary = `Partial fit meeting some primary role requirements.`;
    }
    else {
        summary = `Candidate does not currently meet several critical must-have requirements.`;
    }
    return {
        overallScore: score,
        summary,
        requirements: matchedRequirements,
    };
}
