import pool from '../../db';

export interface RoleRow {
  id: string;
  title: string;
  description: string;
  created_by_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  candidate_count?: number;
  review_count?: number;
}

export interface RoleRequirementRow {
  id: string;
  roleId: string;
  requirement: string;
  isMustHave: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface RoleCandidateRow {
  id: string;
  roleId: string;
  name: string;
  email: string;
  integrityStatus: string;
  fitScore: number;
  createdAt: string;
}

export const getRolesWithMetrics = async (): Promise<RoleRow[]> => {
  const result = await pool.query(`
    SELECT r.*,
      (SELECT COUNT(*) FROM candidates c WHERE c.role_id = r.id) as candidate_count,
      (SELECT COUNT(*) FROM candidates c WHERE c.role_id = r.id AND c.integrity_status = 'review') as review_count
    FROM roles r
    ORDER BY r.created_at DESC
  `);
  return result.rows;
};

export const getRoleById = async (id: string): Promise<RoleRow | null> => {
  const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getRoleRequirementsByRoleId = async (roleId: string): Promise<RoleRequirementRow[]> => {
  const result = await pool.query(`
    SELECT id, role_id as "roleId", requirement, is_must_have as "isMustHave", sort_order as "sortOrder", created_at as "createdAt"
    FROM role_requirements
    WHERE role_id = $1
    ORDER BY sort_order ASC
  `, [roleId]);
  return result.rows;
};

export const getCandidatesByRoleId = async (roleId: string): Promise<RoleCandidateRow[]> => {
  const result = await pool.query(`
    SELECT id, role_id as "roleId", name, email, integrity_status as "integrityStatus", fit_score as "fitScore", created_at as "createdAt"
    FROM candidates
    WHERE role_id = $1
    ORDER BY fit_score DESC
  `, [roleId]);
  return result.rows;
};

export const insertRole = async (
  id: string,
  title: string,
  description: string,
  createdById: string,
  now: string
): Promise<void> => {
  await pool.query(`
    INSERT INTO roles (id, title, description, created_by_id, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, true, $5, $6)
  `, [id, title, description, createdById, now, now]);
};

export const insertRoleRequirement = async (
  id: string,
  roleId: string,
  requirement: string,
  isMustHave: boolean,
  sortOrder: number,
  now: string
): Promise<void> => {
  await pool.query(`
    INSERT INTO role_requirements (id, role_id, requirement, is_must_have, sort_order, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [id, roleId, requirement, isMustHave, sortOrder, now]);
};

export const updateRoleFields = async (
  id: string,
  title: string | null,
  description: string | null,
  isActive: boolean | null,
  now: string
): Promise<void> => {
  await pool.query(`
    UPDATE roles
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active),
        updated_at = $4
    WHERE id = $5
  `, [title, description, isActive, now, id]);
};

export const deleteRoleRequirements = async (roleId: string): Promise<void> => {
  await pool.query('DELETE FROM role_requirements WHERE role_id = $1', [roleId]);
};

export const deleteRoleById = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM roles WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};
