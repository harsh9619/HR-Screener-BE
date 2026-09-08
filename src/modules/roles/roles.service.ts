import { v4 as uuidv4 } from 'uuid';
import * as rolesQuery from './roles.query';

export interface RequirementInput {
  requirement: string;
  isMustHave?: boolean;
}

export const getAllRoles = async () => {
  const roles = await rolesQuery.getRolesWithMetrics();
  return roles.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    createdById: r.created_by_id,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    candidateCount: Number(r.candidate_count || 0),
    reviewCount: Number(r.review_count || 0),
  }));
};

export const getRoleDetails = async (id: string) => {
  const role = await rolesQuery.getRoleById(id);
  if (!role) {
    throw new Error('Role not found.');
  }

  const requirements = await rolesQuery.getRoleRequirementsByRoleId(id);
  const candidates = await rolesQuery.getCandidatesByRoleId(id);

  return {
    id: role.id,
    title: role.title,
    description: role.description,
    createdById: role.created_by_id,
    isActive: Boolean(role.is_active),
    createdAt: role.created_at,
    updatedAt: role.updated_at,
    requirements: requirements.map((req) => ({
      ...req,
      isMustHave: Boolean(req.isMustHave),
    })),
    candidates,
  };
};

export const createRole = async (
  title: string,
  description: string,
  requirements: RequirementInput[] | undefined,
  userId: string
) => {
  const roleId = uuidv4();
  const now = new Date().toISOString();

  await rolesQuery.insertRole(roleId, title.trim(), description.trim(), userId, now);

  if (Array.isArray(requirements)) {
    for (let index = 0; index < requirements.length; index++) {
      const reqItem = requirements[index];
      if (reqItem.requirement && reqItem.requirement.trim()) {
        await rolesQuery.insertRoleRequirement(
          uuidv4(),
          roleId,
          reqItem.requirement.trim(),
          reqItem.isMustHave !== false,
          index,
          now
        );
      }
    }
  }

  return roleId;
};

export const updateRole = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    isActive?: boolean;
    requirements?: RequirementInput[];
  }
) => {
  const existingRole = await rolesQuery.getRoleById(id);
  if (!existingRole) {
    throw new Error('Role not found.');
  }

  const now = new Date().toISOString();
  await rolesQuery.updateRoleFields(
    id,
    data.title ? data.title.trim() : null,
    data.description ? data.description.trim() : null,
    data.isActive !== undefined ? Boolean(data.isActive) : null,
    now
  );

  if (Array.isArray(data.requirements)) {
    await rolesQuery.deleteRoleRequirements(id);

    for (let index = 0; index < data.requirements.length; index++) {
      const reqItem = data.requirements[index];
      if (reqItem.requirement && reqItem.requirement.trim()) {
        await rolesQuery.insertRoleRequirement(
          uuidv4(),
          id,
          reqItem.requirement.trim(),
          reqItem.isMustHave !== false,
          index,
          now
        );
      }
    }
  }
};

export const deleteRole = async (id: string) => {
  const deleted = await rolesQuery.deleteRoleById(id);
  if (!deleted) {
    throw new Error('Role not found.');
  }
};
