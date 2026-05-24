import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import issueRoutes from './modules/issues/issues.routes';
import { errorHandler } from './middleware/errorHandler';
import { sendResponse } from './utils/response';

dotenv.config();




const app = express();

app.use(cors());
app.use(express.json());

// ✅ Home Page - API Documentation UI
app.get('/', (req, res) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://devpulse-production-7845.up.railway.app' 
    : `http://${req.get('host')}`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevPulse API - Backend Assignment</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            
            h1 {
                color: #667eea;
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .badge {
                display: inline-block;
                background: #48bb78;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9em;
                margin-bottom: 30px;
            }
            
            .status {
                background: #f0f0f0;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 30px;
                border-left: 4px solid #48bb78;
            }
            
            h2 {
                color: #2d3748;
                margin-top: 30px;
                margin-bottom: 15px;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 10px;
            }
            
            .endpoint {
                background: #f7fafc;
                margin: 15px 0;
                padding: 15px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
                transition: transform 0.2s;
            }
            
            .endpoint:hover {
                transform: translateX(5px);
                background: #edf2f7;
            }
            
            .method {
                display: inline-block;
                font-weight: bold;
                padding: 4px 12px;
                border-radius: 5px;
                font-size: 0.85em;
                margin-right: 15px;
            }
            
            .GET { background: #48bb78; color: white; }
            .POST { background: #4299e1; color: white; }
            .PUT { background: #ed8936; color: white; }
            .DELETE { background: #f56565; color: white; }
            
            .url {
                font-family: 'Courier New', monospace;
                font-size: 1.1em;
                color: #2d3748;
            }
            
            .description {
                color: #718096;
                margin-top: 8px;
                font-size: 0.9em;
            }
            
            .code {
                background: #2d3748;
                color: #a0aec0;
                padding: 12px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 0.85em;
                margin-top: 10px;
                overflow-x: auto;
            }
            
            footer {
                margin-top: 40px;
                text-align: center;
                color: #a0aec0;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            
            @media (max-width: 768px) {
                .container { padding: 20px; }
                h1 { font-size: 1.8em; }
                .url { font-size: 0.9em; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 DevPulse API</h1>
            <div class="badge">✅ Backend Assignment</div>
            
            <div class="status">
                <strong>📡 Server Status:</strong> Running<br>
                <strong>🌍 Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>⏰ Time:</strong> ${new Date().toISOString()}
            </div>
            
            <h2>📋 Available Endpoints</h2>
            
            <div class="endpoint">
                <span class="method GET">GET</span>
                <span class="url">/health</span>
                <div class="description">🔍 Health check - Verify server is running</div>
            </div>
            
            <h2>🔐 Authentication Routes</h2>
            
            <div class="endpoint">
                <span class="method POST">POST</span>
                <span class="url">/api/auth/register</span>
                <div class="description">📝 Register new user</div>
                <div class="code">
                    { "email": "user@example.com", "password": "123456" }
                </div>
            </div>
            
            <div class="endpoint">
                <span class="method POST">POST</span>
                <span class="url">/api/auth/login</span>
                <div class="description">🔑 Login user</div>
                <div class="code">
                    { "email": "user@example.com", "password": "123456" }
                </div>
            </div>
            
            <h2>📝 Issues Routes (Requires Auth Token)</h2>
            
            <div class="endpoint">
                <span class="method GET">GET</span>
                <span class="url">/api/issues</span>
                <div class="description">📋 Get all issues</div>
            </div>
            
            <div class="endpoint">
                <span class="method GET">GET</span>
                <span class="url">/api/issues/:id</span>
                <div class="description">🔍 Get single issue by ID</div>
            </div>
            
            <div class="endpoint">
                <span class="method POST">POST</span>
                <span class="url">/api/issues</span>
                <div class="description">✨ Create new issue</div>
                <div class="code">
                    { "title": "Bug found", "description": "Detailed description" }
                </div>
            </div>
            
            <div class="endpoint">
                <span class="method PUT">PUT</span>
                <span class="url">/api/issues/:id</span>
                <div class="description">✏️ Update issue</div>
            </div>
            
            <div class="endpoint">
                <span class="method DELETE">DELETE</span>
                <span class="url">/api/issues/:id</span>
                <div class="description">🗑️ Delete issue</div>
            </div>
            
            <h2>🛠️ How to Test</h2>
            <div class="code">
                1. Use Postman, Thunder Client, or any API client<br>
                2. First register a user: POST /api/auth/register<br>
                3. Login to get JWT token: POST /api/auth/login<br>
                4. Copy the token from response<br>
                5. Add header: Authorization: Bearer &lt;your_token&gt;<br>
                6. Test issues endpoints with the token
            </div>
            
            <footer>
                <p>🚀 DevPulse Backend Assignment | Built with Node.js, Express, TypeScript</p>
                <p>📌 API Base URL: ${process.env.NODE_ENV === 'production' ? 'https://devpulse-production-7845.up.railway.app' : 'http://localhost:5000'}</p>
            </footer>
        </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  sendResponse(res, 200, true, 'Server is healthy', { timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

app.use(errorHandler);

export default app;