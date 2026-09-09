import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const result = await authService.registerUser(email, password, name);
    return res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Email address is already registered.') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await authService.loginUser(email, password);
    return res.json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials.') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};


