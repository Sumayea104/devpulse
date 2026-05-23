import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  sendResponse(res, statusCode, false, message, null);
};