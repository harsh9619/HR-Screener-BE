import pool from '../../db';

export interface CandidateRow {
  id: string;
  role_id: string;
  name: string;
  email: string;
  resume_text: string;
  integrity_status: string;
  fit_score: number;
  created_at: string;
  updated_at: string;
  role_title?: string;
  flagged_count?: number;
}

export interface IntegrityCheckRow {
  id: string;
  checkType: string;
  flagged: boolean;
  title: string;
  explanation: string;
  evidence: string;
  confidence: string;
  createdAt: string;
}

export interface CandidateScoreRow {
  id: string;
  candidate_id: string;
  overall_score: number;
  summary: string;
  scoring_result: any;
  created_at: string;
  updated_at: string;
}

export const getRoleById = async (roleId: string) => {
  const result = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
  return result.rows[0] || null;
};

export const getRoleRequirementsByRoleId = async (roleId: string) => {
  const result = await pool.query(`
    SELECT requirement, is_must_have as "isMustHave"
    FROM role_requirements
    WHERE role_id = $1
    ORDER BY sort_order ASC
  `, [roleId]);
  return result.rows;
};

export const insertCandidate = async (
  id: string,
  roleId: string,
  name: string,
  email: string,
  resumeText: string,
  integrityStatus: string,
  fitScore: number,
  now: string
): Promise<void> => {
  await pool.query(`
    INSERT INTO candidates (id, role_id, name, email, resume_text, integrity_status, fit_score, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [id, roleId, name, email, resumeText, integrityStatus, fitScore, now, now]);
};

export const insertIntegrityCheck = async (
  id: string,
  candidateId: string,
  checkType: string,
  flagged: boolean,
  title: string,
  explanation: string,
  evidence: string | null,
  confidence: string | number,
  now: string
): Promise<void> => {
  await pool.query(`
    INSERT INTO integrity_checks (id, candidate_id, check_type, flagged, title, explanation, evidence, confidence, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [id, candidateId, checkType, flagged, title, explanation, evidence, confidence, now]);
};

export const insertCandidateScore = async (
  id: string,
  candidateId: string,
  overallScore: number,
  summary: string,
  scoringResult: string,
  now: string
): Promise<void> => {
  await pool.query(`
    INSERT INTO candidate_scores (id, candidate_id, overall_score, summary, scoring_result, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [id, candidateId, overallScore, summary, scoringResult, now, now]);
};

export const getCandidatesByRoleId = async (
  roleId: string,
  search: string,
  sortBy: string,
  order: string
): Promise<CandidateRow[]> => {
  let orderByClause = 'ORDER BY c.fit_score DESC';
  if (sortBy === 'name') {
    orderByClause = `ORDER BY c.name ${order === 'asc' ? 'ASC' : 'DESC'}`;
  } else if (sortBy === 'integrityStatus') {
    orderByClause = `ORDER BY c.integrity_status ${order === 'asc' ? 'ASC' : 'DESC'}, c.fit_score DESC`;
  }

  const query = `
    SELECT c.id, c.role_id as "roleId", c.name, c.email, c.integrity_status as "integrityStatus",
           c.fit_score as "fitScore", c.created_at as "createdAt",
           (SELECT COUNT(*) FROM integrity_checks ic WHERE ic.candidate_id = c.id AND ic.flagged = true) as flagged_count
    FROM candidates c
    WHERE c.role_id = $1 AND (c.name ILIKE $2 OR c.email ILIKE $3)
    ${orderByClause}
  `;

  const searchParam = `%${search}%`;
  const result = await pool.query(query, [roleId, searchParam, searchParam]);
  return result.rows;
};

export const getCandidateByIdWithRole = async (id: string): Promise<CandidateRow | null> => {
  const result = await pool.query(`
    SELECT c.*, r.title as role_title
    FROM candidates c
    JOIN roles r ON r.id = c.role_id
    WHERE c.id = $1
  `, [id]);
  return result.rows[0] || null;
};

export const getIntegrityChecksByCandidateId = async (candidateId: string): Promise<IntegrityCheckRow[]> => {
  const result = await pool.query(`
    SELECT id, check_type as "checkType", flagged, title, explanation, evidence, confidence, created_at as "createdAt"
    FROM integrity_checks
    WHERE candidate_id = $1
    ORDER BY created_at ASC
  `, [candidateId]);
  return result.rows;
};

export const getCandidateScoreByCandidateId = async (candidateId: string): Promise<CandidateScoreRow | null> => {
  const result = await pool.query('SELECT * FROM candidate_scores WHERE candidate_id = $1', [candidateId]);
  return result.rows[0] || null;
};

export const getCandidateById = async (id: string): Promise<CandidateRow | null> => {
  const result = await pool.query('SELECT * FROM candidates WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const deleteCandidateById = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM candidates WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};
