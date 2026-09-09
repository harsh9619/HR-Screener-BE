import pool from '../../db';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<Omit<UserRow, 'password_hash' | 'updated_at'> | null> => {
  const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createUser = async (email: string, passwordHash: string, name: string): Promise<UserRow> => {
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();
  const now = new Date().toISOString();
  const result = await pool.query(
    `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, email.toLowerCase().trim(), passwordHash, name.trim(), now, now]
  );
  return result.rows[0];
};

