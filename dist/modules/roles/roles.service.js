"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleDetails = exports.getAllRoles = void 0;
const uuid_1 = require("uuid");
const rolesQuery = __importStar(require("./roles.query"));
const getAllRoles = async () => {
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
exports.getAllRoles = getAllRoles;
const getRoleDetails = async (id) => {
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
exports.getRoleDetails = getRoleDetails;
const createRole = async (title, description, requirements, userId) => {
    const roleId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    await rolesQuery.insertRole(roleId, title.trim(), description.trim(), userId, now);
    if (Array.isArray(requirements)) {
        for (let index = 0; index < requirements.length; index++) {
            const reqItem = requirements[index];
            if (reqItem.requirement && reqItem.requirement.trim()) {
                await rolesQuery.insertRoleRequirement((0, uuid_1.v4)(), roleId, reqItem.requirement.trim(), reqItem.isMustHave !== false, index, now);
            }
        }
    }
    return roleId;
};
exports.createRole = createRole;
const updateRole = async (id, data) => {
    const existingRole = await rolesQuery.getRoleById(id);
    if (!existingRole) {
        throw new Error('Role not found.');
    }
    const now = new Date().toISOString();
    await rolesQuery.updateRoleFields(id, data.title ? data.title.trim() : null, data.description ? data.description.trim() : null, data.isActive !== undefined ? Boolean(data.isActive) : null, now);
    if (Array.isArray(data.requirements)) {
        await rolesQuery.deleteRoleRequirements(id);
        for (let index = 0; index < data.requirements.length; index++) {
            const reqItem = data.requirements[index];
            if (reqItem.requirement && reqItem.requirement.trim()) {
                await rolesQuery.insertRoleRequirement((0, uuid_1.v4)(), id, reqItem.requirement.trim(), reqItem.isMustHave !== false, index, now);
            }
        }
    }
};
exports.updateRole = updateRole;
const deleteRole = async (id) => {
    const deleted = await rolesQuery.deleteRoleById(id);
    if (!deleted) {
        throw new Error('Role not found.');
    }
};
exports.deleteRole = deleteRole;
