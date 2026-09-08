import { v4 as uuidv4 } from 'uuid';
import * as candidatesQuery from './candidates.query';
import { runIntegrityCheckPipeline } from '../integrity/integrity.service';
import { calculateFitScore } from '../scoring/scoring.service';

export interface CreateCandidateInput {
  name: string;
  email: string;
  resumeText: string;
}

export const createCandidate = async (roleId: string, input: CreateCandidateInput) => {
  const role = await candidatesQuery.getRoleById(roleId);
  if (!role) {
    throw new Error('Role not found.');
  }

  const rawReqs = await candidatesQuery.getRoleRequirementsByRoleId(roleId);
  const roleRequirements = rawReqs.map((r: any) => ({
    requirement: r.requirement,
    isMustHave: Boolean(r.isMustHave),
  }));

  const integrityResult = runIntegrityCheckPipeline(input.resumeText);
  const scoreResult = calculateFitScore(input.resumeText, roleRequirements);

  const candidateId = uuidv4();
  const now = new Date().toISOString();

  await candidatesQuery.insertCandidate(
    candidateId,
    roleId,
    input.name.trim(),
    input.email.trim().toLowerCase(),
    input.resumeText,
    integrityResult.status,
    scoreResult.overallScore,
    now
  );

  for (const check of integrityResult.checks) {
    await candidatesQuery.insertIntegrityCheck(
      uuidv4(),
      candidateId,
      check.checkType,
      Boolean(check.flagged),
      check.title,
      check.explanation,
      check.evidence,
      check.confidence,
      now
    );
  }

  const scoreId = uuidv4();
  await candidatesQuery.insertCandidateScore(
    scoreId,
    candidateId,
    scoreResult.overallScore,
    scoreResult.summary,
    JSON.stringify(scoreResult.requirements),
    now
  );

  return {
    candidateId,
    integrityStatus: integrityResult.status,
    fitScore: scoreResult.overallScore,
  };
};

export const listCandidatesByRole = async (
  roleId: string,
  queryParams: { sortBy?: string; order?: string; search?: string }
) => {
  const sortBy = queryParams.sortBy || 'fitScore';
  const order = queryParams.order || 'desc';
  const search = queryParams.search || '';

  const rows = await candidatesQuery.getCandidatesByRoleId(roleId, search, sortBy, order);
  return rows.map((c: any) => ({
    id: c.id,
    roleId: c.roleId,
    name: c.name,
    email: c.email,
    integrityStatus: c.integrityStatus,
    fitScore: c.fitScore,
    flaggedCount: Number(c.flagged_count || 0),
    createdAt: c.createdAt,
  }));
};

export const getCandidateDetails = async (id: string) => {
  const candidate = await candidatesQuery.getCandidateByIdWithRole(id);
  if (!candidate) {
    throw new Error('Candidate not found.');
  }

  const checks = await candidatesQuery.getIntegrityChecksByCandidateId(id);
  const formattedIntegrityChecks = checks.map((ic) => ({
    ...ic,
    flagged: Boolean(ic.flagged),
  }));

  const candidateScoreRow = await candidatesQuery.getCandidateScoreByCandidateId(id);
  let candidateScore = null;
  if (candidateScoreRow) {
    candidateScore = {
      overallScore: candidateScoreRow.overall_score,
      summary: candidateScoreRow.summary,
      requirements: typeof candidateScoreRow.scoring_result === 'string'
        ? JSON.parse(candidateScoreRow.scoring_result)
        : candidateScoreRow.scoring_result,
    };
  }

  return {
    id: candidate.id,
    roleId: candidate.role_id,
    roleTitle: candidate.role_title,
    name: candidate.name,
    email: candidate.email,
    resumeText: candidate.resume_text,
    integrityStatus: candidate.integrity_status,
    fitScore: candidate.fit_score,
    createdAt: candidate.created_at,
    updatedAt: candidate.updated_at,
    integrityChecks: formattedIntegrityChecks,
    candidateScore,
  };
};

export const compareCandidates = async (candidateIdA: string, candidateIdB: string) => {
  const candidateA = await candidatesQuery.getCandidateById(candidateIdA);
  const candidateB = await candidatesQuery.getCandidateById(candidateIdB);

  if (!candidateA || !candidateB) {
    throw new Error('One or both candidates were not found.');
  }

  const scoreRowA = await candidatesQuery.getCandidateScoreByCandidateId(candidateIdA);
  const scoreRowB = await candidatesQuery.getCandidateScoreByCandidateId(candidateIdB);

  const reqsA = scoreRowA ? (typeof scoreRowA.scoring_result === 'string' ? JSON.parse(scoreRowA.scoring_result) : scoreRowA.scoring_result) : [];
  const reqsB = scoreRowB ? (typeof scoreRowB.scoring_result === 'string' ? JSON.parse(scoreRowB.scoring_result) : scoreRowB.scoring_result) : [];

  const matchedMustHaveA = reqsA.filter((r: any) => r.isMustHave && r.matched).length;
  const matchedMustHaveB = reqsB.filter((r: any) => r.isMustHave && r.matched).length;

  let explanation = '';
  if (candidateA.fit_score > candidateB.fit_score) {
    explanation = `${candidateA.name} (${candidateA.fit_score}%) ranks above ${candidateB.name} (${candidateB.fit_score}%) primarily because ${candidateA.name} satisfies ${matchedMustHaveA} must-have criteria compared to ${matchedMustHaveB} for ${candidateB.name}.`;
    if (candidateB.integrity_status === 'review' && candidateA.integrity_status === 'clear') {
      explanation += ` Additionally, ${candidateB.name} has flagged integrity review items requiring recruiter verification.`;
    }
  } else if (candidateB.fit_score > candidateA.fit_score) {
    explanation = `${candidateB.name} (${candidateB.fit_score}%) ranks above ${candidateA.name} (${candidateA.fit_score}%) because ${candidateB.name} satisfies ${matchedMustHaveB} must-have criteria compared to ${matchedMustHaveA} for ${candidateA.name}.`;
    if (candidateA.integrity_status === 'review' && candidateB.integrity_status === 'clear') {
      explanation += ` Additionally, ${candidateA.name} has flagged integrity review items requiring recruiter verification.`;
    }
  } else {
    explanation = `Both ${candidateA.name} and ${candidateB.name} have equal fit scores (${candidateA.fit_score}%). Compare individual requirement evidence excerpts to evaluate nuanced experience.`;
  }

  return {
    candidateA: {
      id: candidateA.id,
      name: candidateA.name,
      fitScore: candidateA.fit_score,
      integrityStatus: candidateA.integrity_status,
      matchedMustHaves: matchedMustHaveA,
    },
    candidateB: {
      id: candidateB.id,
      name: candidateB.name,
      fitScore: candidateB.fit_score,
      integrityStatus: candidateB.integrity_status,
      matchedMustHaves: matchedMustHaveB,
    },
    explanation,
  };
};

export const deleteCandidate = async (id: string) => {
  const deleted = await candidatesQuery.deleteCandidateById(id);
  if (!deleted) {
    throw new Error('Candidate not found.');
  }
};
