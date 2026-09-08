import { Router } from 'express';
import { authenticateJwt } from '../../middleware/auth.middleware';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticateJwt, authController.getMe);

export default router;
