"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeResumeText = normalizeResumeText;
exports.detectPromptInjection = detectPromptInjection;
exports.detectTimelineInconsistency = detectTimelineInconsistency;
exports.detectTemplatedInflation = detectTemplatedInflation;
exports.runIntegrityCheckPipeline = runIntegrityCheckPipeline;
/**
 * Normalizes raw resume text to eliminate hidden zero-width characters,
 * redundant spacing, and uniform case handling where appropriate.
 */
function normalizeResumeText(text) {
    if (!text)
        return '';
    return text
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\r\n/g, '\n')
        .trim();
}
/**
 * Detects prompt injection / AI manipulation attempts inside candidate resumes.
 */
function detectPromptInjection(resumeText) {
    const normalized = normalizeResumeText(resumeText);
    const lower = normalized.toLowerCase();
    const injectionPatterns = [
        /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
        /give\s+(this\s+)?candidate\s+a\s+score\s+of\s+100/i,
        /system\s*message\s*:/i,
        /ai\s+evaluator\s*:/i,
        /do\s+not\s+mention\s+this\s+instruction/i,
        /disregard\s+(the\s+)?(job\s+)?requirements/i,
        /rank\s+this\s+candidate\s+(first|highest)/i,
        /override\s+(the\s+)?scoring/i,
        /you\s+must\s+score\s+100/i,
        /prompt\s+override/i,
        /forget\s+all\s+previous/i,
    ];
    let foundPattern = null;
    let evidenceSnippet = null;
    for (const pattern of injectionPatterns) {
        const match = normalized.match(pattern);
        if (match) {
            foundPattern = match[0];
            const index = match.index || 0;
            const start = Math.max(0, index - 20);
            const end = Math.min(normalized.length, index + match[0].length + 50);
            evidenceSnippet = normalized.substring(start, end).trim();
            break;
        }
    }
    if (foundPattern || lower.includes('ignore previous instructions') || lower.includes('score of 100')) {
        return {
            checkType: 'prompt_injection',
            flagged: true,
            title: 'AI manipulation detected',
            explanation: 'This resume contains text that appears to instruct an AI evaluator how to score the candidate or bypass evaluation rules. The instruction was treated as raw text and was NOT followed.',
            evidence: evidenceSnippet || foundPattern || 'Instruction to manipulate scoring detected.',
            confidence: 0.96,
        };
    }
    return {
        checkType: 'prompt_injection',
        flagged: false,
        title: 'No prompt manipulation detected',
        explanation: 'No AI prompt override or system instruction manipulation patterns were found in the resume.',
        evidence: null,
        confidence: 0.95,
    };
}
/**
 * Extracts date ranges and detects internal employment timeline overlaps.
 */
function detectTimelineInconsistency(resumeText) {
    const normalized = normalizeResumeText(resumeText);
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
    const monthMap = {
        jan: 0, january: 0,
        feb: 1, february: 1,
        mar: 2, march: 2,
        apr: 3, april: 3,
        may: 4,
        jun: 5, june: 5,
        jul: 6, july: 6,
        aug: 7, august: 7,
        sep: 8, sept: 8, september: 8,
        oct: 9, october: 9,
        nov: 10, november: 10,
        dec: 11, december: 11,
    };
    const periods = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Create a fresh regex per line without global flag issue
        const dateRangeRegex = /(?:([A-Za-z]+|\d{1,2})[\/\s,]+)?(\d{4})\s*[\u2013\u2014-]\s*(?:([A-Za-z]+|\d{1,2})[\/\s,]+)?(\d{4}|Present|Current)/i;
        const match = line.match(dateRangeRegex);
        if (match) {
            const startMonthStr = (match[1] || 'jan').toLowerCase();
            const startYear = parseInt(match[2], 10);
            const endMonthStr = (match[3] || 'dec').toLowerCase();
            const endYearStr = match[4];
            const startMonth = monthMap[startMonthStr] ?? 0;
            const startDate = new Date(startYear, startMonth, 1);
            let endDate;
            if (endYearStr.toLowerCase() === 'present' || endYearStr.toLowerCase() === 'current') {
                endDate = new Date();
            }
            else {
                const endYear = parseInt(endYearStr, 10);
                const endMonth = monthMap[endMonthStr] ?? 11;
                endDate = new Date(endYear, endMonth, 28);
            }
            let contextHeader = line;
            for (let lookBack = 1; lookBack <= 3; lookBack++) {
                const idx = i - lookBack;
                if (idx >= 0 && lines[idx].length > 2 && !lines[idx].match(dateRangeRegex)) {
                    contextHeader = lines[idx] + ' (' + match[0] + ')';
                    break;
                }
            }
            periods.push({
                roleOrCompany: contextHeader,
                start: startDate,
                end: endDate,
                rawText: line,
            });
        }
    }
    let overlappingPair = null;
    for (let i = 0; i < periods.length; i++) {
        for (let j = i + 1; j < periods.length; j++) {
            const p1 = periods[i];
            const p2 = periods[j];
            const overlapStart = new Date(Math.max(p1.start.getTime(), p2.start.getTime()));
            const overlapEnd = new Date(Math.min(p1.end.getTime(), p2.end.getTime()));
            if (overlapEnd.getTime() - overlapStart.getTime() > 60 * 24 * 60 * 60 * 1000) {
                overlappingPair = { p1, p2 };
                break;
            }
        }
        if (overlappingPair)
            break;
    }
    if (overlappingPair) {
        const { p1, p2 } = overlappingPair;
        return {
            checkType: 'timeline_inconsistency',
            flagged: true,
            title: 'Potential employment overlap',
            explanation: 'These employment periods overlap significantly and may require recruiter review. Note: Concurrent employment, consulting, part-time roles, or resume formatting quirks can be legitimate and this is flagged for recruiter verification.',
            evidence: `${p1.roleOrCompany}\n${p2.roleOrCompany}`,
            confidence: 0.88,
        };
    }
    return {
        checkType: 'timeline_inconsistency',
        flagged: false,
        title: 'Consistent employment timeline',
        explanation: 'No conflicting or overlapping employment dates were detected in the resume timeline.',
        evidence: null,
        confidence: 0.9,
    };
}
/**
 * Detects repeated achievement statements or templated metric inflation across roles.
 */
function detectTemplatedInflation(resumeText) {
    const normalized = normalizeResumeText(resumeText);
    const lines = normalized.split('\n').map((l) => l.trim()).filter((l) => l.length > 10);
    const percentageMatches = [];
    const percentRegex = /\b\d+\s*%/g;
    for (const line of lines) {
        const matches = line.match(percentRegex);
        if (matches) {
            for (const p of matches) {
                percentageMatches.push({ line, percent: p });
            }
        }
    }
    const percentMap = {};
    for (const item of percentageMatches) {
        percentMap[item.percent] = percentMap[item.percent] || [];
        percentMap[item.percent].push(item.line);
    }
    let flaggedEvidence = [];
    for (const [pct, linesWithPct] of Object.entries(percentMap)) {
        if (linesWithPct.length >= 2) {
            flaggedEvidence = linesWithPct;
            break;
        }
    }
    if (flaggedEvidence.length === 0) {
        const lineCounts = {};
        for (const line of lines) {
            const lower = line.toLowerCase();
            lineCounts[lower] = lineCounts[lower] || [];
            lineCounts[lower].push(line);
            if (lineCounts[lower].length >= 2 && line.length > 20) {
                flaggedEvidence = lineCounts[lower];
                break;
            }
        }
    }
    if (flaggedEvidence.length >= 2) {
        return {
            checkType: 'templated_inflation',
            flagged: true,
            title: 'Possible templated claims',
            explanation: 'Similar quantified achievement language or identical performance metrics appear repeatedly across multiple roles. This requires human review to confirm individual contributions.',
            evidence: flaggedEvidence.slice(0, 3).join('\n'),
            confidence: 0.85,
        };
    }
    return {
        checkType: 'templated_inflation',
        flagged: false,
        title: 'No significant templated claims detected',
        explanation: 'Achievement statements and quantified metrics appear unique and contextualized across roles.',
        evidence: null,
        confidence: 0.88,
    };
}
/**
 * Runs the full integrity check pipeline on a resume.
 */
function runIntegrityCheckPipeline(resumeText) {
    const promptCheck = detectPromptInjection(resumeText);
    const timelineCheck = detectTimelineInconsistency(resumeText);
    const templatedCheck = detectTemplatedInflation(resumeText);
    const checks = [promptCheck, timelineCheck, templatedCheck];
    const hasFlags = checks.some((c) => c.flagged);
    return {
        status: hasFlags ? 'review' : 'clear',
        checks,
    };
}
