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
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = void 0;
const rolesService = __importStar(require("./roles.service"));
const getRoles = async (req, res, next) => {
    try {
        const roles = await rolesService.getAllRoles();
        return res.json({ roles });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoles = getRoles;
const getRoleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = await rolesService.getRoleDetails(id);
        return res.json({ role });
    }
    catch (error) {
        if (error.message === 'Role not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.getRoleById = getRoleById;
const createRole = async (req, res, next) => {
    try {
        const { title, description, requirements } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Job title and description are required.' });
        }
        const userId = req.user.id;
        const roleId = await rolesService.createRole(title, description, requirements, userId);
        return res.status(201).json({
            message: 'Role created successfully.',
            roleId,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRole = createRole;
const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, isActive, requirements } = req.body;
        await rolesService.updateRole(id, { title, description, isActive, requirements });
        return res.json({ message: 'Role updated successfully.' });
    }
    catch (error) {
        if (error.message === 'Role not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        await rolesService.deleteRole(id);
        return res.json({ message: 'Role deleted successfully.' });
    }
    catch (error) {
        if (error.message === 'Role not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};
exports.deleteRole = deleteRole;
