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

app.get('/health', (req, res) => {
  sendResponse(res, 200, true, 'Server is healthy', { timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

app.use(errorHandler);

export default app;