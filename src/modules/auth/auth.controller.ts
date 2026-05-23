import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../config/database';
import { sendResponse } from '../../utils/response';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'contributor' } = req.body;
    
    if (!name) return sendResponse(res, 400, false, 'Name is required');
    if (!email) return sendResponse(res, 400, false, 'Email is required');
    if (!password) return sendResponse(res, 400, false, 'Password is required');
    if (password.length < 6) {
      return sendResponse(res, 400, false, 'Password must be at least 6 characters');
    }
    
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return sendResponse(res, 409, false, 'Email already registered');
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );
    
    sendResponse(res, 201, true, 'User registered successfully', result.rows[0]);
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }
    
    const result = await query(
      'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    delete user.password;
    sendResponse(res, 200, true, 'Login successful', { token, user });
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};