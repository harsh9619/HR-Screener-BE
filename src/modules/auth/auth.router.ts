import { Router } from 'express';
import { authenticateJwt } from '../../middleware/auth.middleware';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
