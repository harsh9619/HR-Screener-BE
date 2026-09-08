"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCandidateById = exports.getCandidateById = exports.getCandidateScoreByCandidateId = exports.getIntegrityChecksByCandidateId = exports.getCandidateByIdWithRole = exports.getCandidatesByRoleId = exports.insertCandidateScore = exports.insertIntegrityCheck = exports.insertCandidate = exports.getRoleRequirementsByRoleId = exports.getRoleById = void 0;
const db_1 = __importDefault(require("../../db"));
const getRoleById = async (roleId) => {
    const result = await db_1.default.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    return result.rows[0] || null;
};
exports.getRoleById = getRoleById;
const getRoleRequirementsByRoleId = async (roleId) => {
    const result = await db_1.default.query(`
    SELECT requirement, is_must_have as "isMustHave"
    FROM role_requirements
    WHERE role_id = $1
    ORDER BY sort_order ASC
  `, [roleId]);
    return result.rows;
};
exports.getRoleRequirementsByRoleId = getRoleRequirementsByRoleId;
const insertCandidate = async (id, roleId, name, email, resumeText, integrityStatus, fitScore, now) => {
    await db_1.default.query(`
    INSERT INTO candidates (id, role_id, name, email, resume_text, integrity_status, fit_score, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [id, roleId, name, email, resumeText, integrityStatus, fitScore, now, now]);
};
exports.insertCandidate = insertCandidate;
const insertIntegrityCheck = async (id, candidateId, checkType, flagged, title, explanation, evidence, confidence, now) => {
    await db_1.default.query(`
    INSERT INTO integrity_checks (id, candidate_id, check_type, flagged, title, explanation, evidence, confidence, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [id, candidateId, checkType, flagged, title, explanation, evidence, confidence, now]);
};
exports.insertIntegrityCheck = insertIntegrityCheck;
const insertCandidateScore = async (id, candidateId, overallScore, summary, scoringResult, now) => {
    await db_1.default.query(`
    INSERT INTO candidate_scores (id, candidate_id, overall_score, summary, scoring_result, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [id, candidateId, overallScore, summary, scoringResult, now, now]);
};
exports.insertCandidateScore = insertCandidateScore;
const getCandidatesByRoleId = async (roleId, search, sortBy, order) => {
    let orderByClause = 'ORDER BY c.fit_score DESC';
    if (sortBy === 'name') {
        orderByClause = `ORDER BY c.name ${order === 'asc' ? 'ASC' : 'DESC'}`;
    }
    else if (sortBy === 'integrityStatus') {
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
    const result = await db_1.default.query(query, [roleId, searchParam, searchParam]);
    return result.rows;
};
exports.getCandidatesByRoleId = getCandidatesByRoleId;
const getCandidateByIdWithRole = async (id) => {
    const result = await db_1.default.query(`
    SELECT c.*, r.title as role_title
    FROM candidates c
    JOIN roles r ON r.id = c.role_id
    WHERE c.id = $1
  `, [id]);
    return result.rows[0] || null;
};
exports.getCandidateByIdWithRole = getCandidateByIdWithRole;
const getIntegrityChecksByCandidateId = async (candidateId) => {
    const result = await db_1.default.query(`
    SELECT id, check_type as "checkType", flagged, title, explanation, evidence, confidence, created_at as "createdAt"
    FROM integrity_checks
    WHERE candidate_id = $1
    ORDER BY created_at ASC
  `, [candidateId]);
    return result.rows;
};
exports.getIntegrityChecksByCandidateId = getIntegrityChecksByCandidateId;
const getCandidateScoreByCandidateId = async (candidateId) => {
    const result = await db_1.default.query('SELECT * FROM candidate_scores WHERE candidate_id = $1', [candidateId]);
    return result.rows[0] || null;
};
exports.getCandidateScoreByCandidateId = getCandidateScoreByCandidateId;
const getCandidateById = async (id) => {
    const result = await db_1.default.query('SELECT * FROM candidates WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.getCandidateById = getCandidateById;
const deleteCandidateById = async (id) => {
    const result = await db_1.default.query('DELETE FROM candidates WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};
exports.deleteCandidateById = deleteCandidateById;
