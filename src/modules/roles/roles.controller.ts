import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as rolesService from './roles.service';

export const getRoles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await rolesService.getAllRoles();
    return res.json({ roles });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const role = await rolesService.getRoleDetails(id);
    return res.json({ role });
  } catch (error: any) {
    if (error.message === 'Role not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, requirements } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Job title and description are required.' });
    }

    const userId = req.user!.id;
    const roleId = await rolesService.createRole(title, description, requirements, userId);

    return res.status(201).json({
      message: 'Role created successfully.',
      roleId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, isActive, requirements } = req.body;

    await rolesService.updateRole(id, { title, description, isActive, requirements });
    return res.json({ message: 'Role updated successfully.' });
  } catch (error: any) {
    if (error.message === 'Role not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const deleteRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await rolesService.deleteRole(id);
    return res.json({ message: 'Role deleted successfully.' });
  } catch (error: any) {
    if (error.message === 'Role not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
