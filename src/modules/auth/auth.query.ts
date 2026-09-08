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
