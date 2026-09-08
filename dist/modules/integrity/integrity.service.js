"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeResumeText = normalizeResumeText;
exports.detectPromptInjection = detectPromptInjection;
exports.detectTimelineInconsistency = detectTimelineInconsistency;
exports.detectTemplatedInflation = detectTemplatedInflation;
exports.runIntegrityCheckPipeline = runIntegrityCheckPipeline;
/**
 * Normalizes raw resume text to eliminate hidden characters and redundant spacing.
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
    const text = normalizeResumeText(resumeText);
    // List of patterns used to detect AI manipulation or prompt override attempts
    const patterns = [
        /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
        /give\s+(this\s+)?candidate\s+a\s+score\s+of\s+\d+/i,
        /system\s*message\s*:/i,
        /ai\s+evaluator\s*:/i,
        /do\s+not\s+mention\s+this\s+instruction/i,
        /disregard\s+(the\s+)?(job\s+)?requirements/i,
        /rank\s+this\s+candidate\s+(first|highest)/i,
        /override\s+(the\s+)?scoring/i,
        /you\s+must\s+score\s+\d+/i,
        /prompt\s+override/i,
        /forget\s+all\s+previous/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                checkType: 'prompt_injection',
                flagged: true,
                title: 'AI manipulation detected',
                explanation: 'Resume contains text attempting to instruct an AI evaluator or alter scoring rules.',
                evidence: match[0],
                confidence: 0.96,
            };
        }
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
 * Detects internal employment timeline overlaps.
 */
function detectTimelineInconsistency(resumeText) {
    const normalized = normalizeResumeText(resumeText);
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
    const monthMap = {
        jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
        apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
        aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9,
        nov: 10, november: 10, dec: 11, december: 11,
    };
    const periods = [];
    const dateRangeRegex = /(?:([A-Za-z]+|\d{1,2})[\/\s,]+)?(\d{4})\s*[\u2013\u2014-]\s*(?:([A-Za-z]+|\d{1,2})[\/\s,]+)?(\d{4}|Present|Current)/i;
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(dateRangeRegex);
        if (match) {
            const startMonth = monthMap[(match[1] || 'jan').toLowerCase()] ?? 0;
            const startYear = parseInt(match[2], 10);
            const startDate = new Date(startYear, startMonth, 1);
            let endDate;
            const endYearStr = match[4].toLowerCase();
            if (endYearStr === 'present' || endYearStr === 'current') {
                endDate = new Date();
            }
            else {
                const endMonth = monthMap[(match[3] || 'dec').toLowerCase()] ?? 11;
                endDate = new Date(parseInt(match[4], 10), endMonth, 28);
            }
            let header = lines[i];
            for (let back = 1; back <= 3; back++) {
                if (i - back >= 0 && lines[i - back].length > 2 && !lines[i - back].match(dateRangeRegex)) {
                    header = `${lines[i - back]} (${match[0]})`;
                    break;
                }
            }
            periods.push({ roleOrCompany: header, start: startDate, end: endDate });
        }
    }
    for (let i = 0; i < periods.length; i++) {
        for (let j = i + 1; j < periods.length; j++) {
            const p1 = periods[i];
            const p2 = periods[j];
            const overlapStart = Math.max(p1.start.getTime(), p2.start.getTime());
            const overlapEnd = Math.min(p1.end.getTime(), p2.end.getTime());
            // Overlap greater than 60 days
            if (overlapEnd - overlapStart > 60 * 24 * 60 * 60 * 1000) {
                return {
                    checkType: 'timeline_inconsistency',
                    flagged: true,
                    title: 'Potential employment overlap',
                    explanation: 'These employment periods overlap significantly and may require recruiter review. Note: Concurrent employment, consulting, part-time roles, or resume formatting quirks can be legitimate and this is flagged for recruiter verification.',
                    evidence: `${p1.roleOrCompany}\n${p2.roleOrCompany}`,
                    confidence: 0.88,
                };
            }
        }
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
 * Detects repeated achievement statements or metric inflation across roles.
 */
function detectTemplatedInflation(resumeText) {
    const normalized = normalizeResumeText(resumeText);
    const lines = normalized.split('\n').map((l) => l.trim()).filter((l) => l.length > 10);
    // Group lines by percentage values found
    const percentMap = {};
    for (const line of lines) {
        const matches = line.match(/\b\d+\s*%/g);
        if (matches) {
            for (const pct of matches) {
                percentMap[pct] = percentMap[pct] || [];
                percentMap[pct].push(line);
            }
        }
    }
    for (const [, matchingLines] of Object.entries(percentMap)) {
        if (matchingLines.length >= 2) {
            return {
                checkType: 'templated_inflation',
                flagged: true,
                title: 'Possible templated claims',
                explanation: 'Similar quantified achievement language or identical performance metrics appear repeatedly across multiple roles. This requires human review to confirm individual contributions.',
                evidence: matchingLines.slice(0, 3).join('\n'),
                confidence: 0.85,
            };
        }
    }
    // Check duplicate lines
    const lineCounts = {};
    for (const line of lines) {
        const lower = line.toLowerCase();
        lineCounts[lower] = lineCounts[lower] || [];
        lineCounts[lower].push(line);
        if (lineCounts[lower].length >= 2 && line.length > 20) {
            return {
                checkType: 'templated_inflation',
                flagged: true,
                title: 'Possible templated claims',
                explanation: 'Similar quantified achievement language or identical performance metrics appear repeatedly across multiple roles. This requires human review to confirm individual contributions.',
                evidence: lineCounts[lower].slice(0, 3).join('\n'),
                confidence: 0.85,
            };
        }
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
    const isFlagged = promptCheck.flagged || timelineCheck.flagged || templatedCheck.flagged;
    return {
        status: isFlagged ? 'review' : 'clear',
        checks,
    };
}
