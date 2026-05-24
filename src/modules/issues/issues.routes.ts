import { Router } from 'express';
import {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
  getMetrics,
} from './issues.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// ⚠️ SPECIFIC routes MUST come BEFORE generic /:id routes
router.get('/metrics/overview',
  authenticate,
  requireRole('maintainer'),
  getMetrics
);

router.get('/', getAllIssues);

router.get('/:id', getSingleIssue);

router.post('/',
  authenticate,
  requireRole('contributor', 'maintainer'),
  createIssue
);

router.patch('/:id',
  authenticate,
  updateIssue
);

router.delete('/:id',
  authenticate,
  requireRole('maintainer'),
  deleteIssue
);

export default router;