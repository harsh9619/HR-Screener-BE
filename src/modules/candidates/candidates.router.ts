import { Router } from 'express';
import { authenticateJwt } from '../../middleware/auth.middleware';
import * as candidatesController from './candidates.controller';

const router = Router();

// Candidate endpoints for a specific role
router.post('/roles/:roleId/candidates', authenticateJwt, candidatesController.createCandidate);
router.get('/roles/:roleId/candidates', authenticateJwt, candidatesController.getCandidatesByRole);

// Candidate detail, compare, and delete endpoints
router.get('/candidates/:id', authenticateJwt, candidatesController.getCandidateById);
router.post('/candidates/compare', authenticateJwt, candidatesController.compareCandidates);
router.delete('/candidates/:id', authenticateJwt, candidatesController.deleteCandidate);

export default router;
