import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { timestamp: new Date().toISOString() } });
});

// SIGNUP ROUTE
app.post('/api/auth/signup', async (req, res) => {
  console.log('Signup API called');
  console.log('Request body:', req.body);
  
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at',
      [name, email, hashedPassword, role || 'contributor']
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  console.log('Login API called');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// CREATE ISSUE
app.post('/api/issues', async (req, res) => {
  console.log('Create issue API called');
  
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const reporterId = decoded.id;
    
    const { title, description, type } = req.body;
    
    if (!title || !description || !type) {
      return res.status(400).json({ success: false, message: 'Title, description and type are required' });
    }
    
    if (description.length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters' });
    }
    
    const result = await pool.query(
      'INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, type, reporterId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create issue error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET ALL ISSUES
app.get('/api/issues', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM issues ORDER BY created_at DESC');
    res.json({
      success: true,
      message: 'Issues retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching issues' });
  }
});

// GET SINGLE ISSUE
app.get('/api/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    
    res.json({
      success: true,
      message: 'Issue retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching issue' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
});