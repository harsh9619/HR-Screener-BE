import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser } from './auth.query';

const JWT_SECRET = process.env.JWT_SECRET || 'crystal_group_candidate_screener_super_secret_jwt_key_2026';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const registerUser = async (email: string, password: string, name: string): Promise<LoginResult> => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email address is already registered.');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await createUser(email, passwordHash, name);

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials.');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};


