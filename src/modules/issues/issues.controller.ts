import { Request, Response } from 'express';
import { query } from '../../config/database';
import { sendResponse } from '../../utils/response';

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user.id;
    
    if (!title) return sendResponse(res, 400, false, 'Title is required');
    if (title.length > 150) return sendResponse(res, 400, false, 'Title max 150 characters');
    if (!description) return sendResponse(res, 400, false, 'Description is required');
    if (description.length < 20) return sendResponse(res, 400, false, 'Description min 20 characters');
    if (!type || !['bug', 'feature_request'].includes(type)) {
      return sendResponse(res, 400, false, 'Type must be bug or feature_request');
    }
    
    const result = await query(
      `INSERT INTO issues (title, description, type, reporter_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, type, reporterId]
    );
    
    sendResponse(res, 201, true, 'Issue created successfully', result.rows[0]);
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = 'newest', type, status } = req.query;
    
    let sql = 'SELECT * FROM issues';
    const conditions: string[] = [];
    const values: any[] = [];
    
    if (type) { 
      values.push(type); 
      conditions.push(`type = $${values.length}`); 
    }
    if (status) { 
      values.push(status); 
      conditions.push(`status = $${values.length}`); 
    }
    if (conditions.length > 0) { 
      sql += ' WHERE ' + conditions.join(' AND '); 
    }
    
    const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';
    sql += ` ORDER BY created_at ${sortOrder}`;
    
    const issues = await query(sql, values);
    
    if (issues.rows.length === 0) {
      return sendResponse(res, 200, true, 'Issues retrieved', []);
    }
    

    const reporterIds: number[] = [];
    for (const issue of issues.rows) {
      reporterIds.push(issue.reporter_id);
    }
    
   
    const reporters: any[] = [];
    for (const id of reporterIds) {
      const result = await query('SELECT id, name, role FROM users WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        reporters.push(result.rows[0]);
      }
    }
    
  
    const reporterMap = new Map();
    for (const reporter of reporters) {
      reporterMap.set(reporter.id, reporter);
    }
    
    const issuesWithReporters = [];
    for (const issue of issues.rows) {
      issuesWithReporters.push({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporterMap.get(issue.reporter_id) || null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      });
    }
    
    sendResponse(res, 200, true, 'Issues retrieved', issuesWithReporters);
  } catch (error) {
    console.error('Get all issues error:', error);
    sendResponse(res, 500, false, 'Internal server error');
  }
};

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const issueResult = await query('SELECT * FROM issues WHERE id = $1', [id]);
    
    if (issueResult.rows.length === 0) {
      return sendResponse(res, 404, false, 'Issue not found');
    }
    
    const issue = issueResult.rows[0];
    const reporterResult = await query('SELECT id, name, role FROM users WHERE id = $1', [issue.reporter_id]);
    
    sendResponse(res, 200, true, 'Issue retrieved', {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporterResult.rows[0] || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, type, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const issueResult = await query('SELECT * FROM issues WHERE id = $1', [id]);
    if (issueResult.rows.length === 0) {
      return sendResponse(res, 404, false, 'Issue not found');
    }
    
    const issue = issueResult.rows[0];
    
    if (userRole === 'contributor') {
      if (issue.reporter_id !== userId) {
        return sendResponse(res, 403, false, 'Forbidden');
      }
      if (issue.status !== 'open') {
        return sendResponse(res, 409, false, 'Issue cannot be edited');
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    if (title !== undefined) { updates.push(`title = $${paramCounter++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${paramCounter++}`); values.push(description); }
    if (type !== undefined) { updates.push(`type = $${paramCounter++}`); values.push(type); }
    if (status !== undefined && userRole === 'maintainer') { 
      updates.push(`status = $${paramCounter++}`); values.push(status); 
    }
    
    if (updates.length === 0) {
      return sendResponse(res, 400, false, 'No valid fields to update');
    }
    
    values.push(id);
    const result = await query(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    sendResponse(res, 200, true, 'Issue updated successfully', result.rows[0]);
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return sendResponse(res, 404, false, 'Issue not found');
    }
    
    sendResponse(res, 200, true, 'Issue deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM issues
    `);
    
    sendResponse(res, 200, true, 'Metrics retrieved', result.rows[0]);
  } catch (error) {
    sendResponse(res, 500, false, 'Internal server error');
  }
};