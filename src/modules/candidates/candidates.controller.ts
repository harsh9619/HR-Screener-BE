import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as candidatesService from './candidates.service';

export const createCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;
    const { name, email, resumeText } = req.body;

    if (!name || !email || !resumeText) {
      return res.status(400).json({ error: 'Name, email, and resume text are required.' });
    }

    const result = await candidatesService.createCandidate(roleId, { name, email, resumeText });
    return res.status(201).json({
      message: 'Candidate created and evaluated successfully.',
      ...result,
    });
  } catch (error: any) {
    if (error.message === 'Role not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const getCandidatesByRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;
    const { sortBy, order, search } = req.query as Record<string, string>;

    const candidates = await candidatesService.listCandidatesByRole(roleId, { sortBy, order, search });
    return res.json({ candidates });
  } catch (error) {
    next(error);
  }
};

export const getCandidateById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const candidate = await candidatesService.getCandidateDetails(id);
    return res.json({ candidate });
  } catch (error: any) {
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const compareCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateIdA, candidateIdB } = req.body;

    if (!candidateIdA || !candidateIdB) {
      return res.status(400).json({ error: 'Both candidateIdA and candidateIdB are required.' });
    }

    const comparison = await candidatesService.compareCandidates(candidateIdA, candidateIdB);
    return res.json(comparison);
  } catch (error: any) {
    if (error.message === 'One or both candidates were not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await candidatesService.deleteCandidate(id);
    return res.json({ message: 'Candidate deleted successfully.' });
  } catch (error: any) {
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
