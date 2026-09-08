"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoleById = exports.deleteRoleRequirements = exports.updateRoleFields = exports.insertRoleRequirement = exports.insertRole = exports.getCandidatesByRoleId = exports.getRoleRequirementsByRoleId = exports.getRoleById = exports.getRolesWithMetrics = void 0;
const db_1 = __importDefault(require("../../db"));
const getRolesWithMetrics = async () => {
    const result = await db_1.default.query(`
    SELECT r.*,
      (SELECT COUNT(*) FROM candidates c WHERE c.role_id = r.id) as candidate_count,
      (SELECT COUNT(*) FROM candidates c WHERE c.role_id = r.id AND c.integrity_status = 'review') as review_count
    FROM roles r
    ORDER BY r.created_at DESC
  `);
    return result.rows;
};
exports.getRolesWithMetrics = getRolesWithMetrics;
const getRoleById = async (id) => {
    const result = await db_1.default.query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.getRoleById = getRoleById;
const getRoleRequirementsByRoleId = async (roleId) => {
    const result = await db_1.default.query(`
    SELECT id, role_id as "roleId", requirement, is_must_have as "isMustHave", sort_order as "sortOrder", created_at as "createdAt"
    FROM role_requirements
    WHERE role_id = $1
    ORDER BY sort_order ASC
  `, [roleId]);
    return result.rows;
};
exports.getRoleRequirementsByRoleId = getRoleRequirementsByRoleId;
const getCandidatesByRoleId = async (roleId) => {
    const result = await db_1.default.query(`
    SELECT id, role_id as "roleId", name, email, integrity_status as "integrityStatus", fit_score as "fitScore", created_at as "createdAt"
    FROM candidates
    WHERE role_id = $1
    ORDER BY fit_score DESC
  `, [roleId]);
    return result.rows;
};
exports.getCandidatesByRoleId = getCandidatesByRoleId;
const insertRole = async (id, title, description, createdById, now) => {
    await db_1.default.query(`
    INSERT INTO roles (id, title, description, created_by_id, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, true, $5, $6)
  `, [id, title, description, createdById, now, now]);
};
exports.insertRole = insertRole;
const insertRoleRequirement = async (id, roleId, requirement, isMustHave, sortOrder, now) => {
    await db_1.default.query(`
    INSERT INTO role_requirements (id, role_id, requirement, is_must_have, sort_order, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [id, roleId, requirement, isMustHave, sortOrder, now]);
};
exports.insertRoleRequirement = insertRoleRequirement;
const updateRoleFields = async (id, title, description, isActive, now) => {
    await db_1.default.query(`
    UPDATE roles
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active),
        updated_at = $4
    WHERE id = $5
  `, [title, description, isActive, now, id]);
};
exports.updateRoleFields = updateRoleFields;
const deleteRoleRequirements = async (roleId) => {
    await db_1.default.query('DELETE FROM role_requirements WHERE role_id = $1', [roleId]);
};
exports.deleteRoleRequirements = deleteRoleRequirements;
const deleteRoleById = async (id) => {
    const result = await db_1.default.query('DELETE FROM roles WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};
exports.deleteRoleById = deleteRoleById;
