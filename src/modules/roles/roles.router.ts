import { Router } from 'express';
import { authenticateJwt } from '../../middleware/auth.middleware';
import * as rolesController from './roles.controller';

const router = Router();

router.get('/', authenticateJwt, rolesController.getRoles);
router.get('/:id', authenticateJwt, rolesController.getRoleById);
router.post('/', authenticateJwt, rolesController.createRole);
router.patch('/:id', authenticateJwt, rolesController.updateRole);
router.delete('/:id', authenticateJwt, rolesController.deleteRole);

export default router;
