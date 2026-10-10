import express from 'express';
import { readData, writeData } from '../services/storage.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { recordSecurityLog } from '../middleware/logger.js';

const router = express.Router();

// GET /api/logs - List security audit logs
router.get('/', (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;
    let logs = readData('logs');

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
    }

    res.json({
      success: true,
      count: logs.length,
      logs: logs.slice(0, Number(limit))
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/logs - Create manual audit log entry (Protected)
router.post('/', verifyToken, (req, res, next) => {
  try {
    const { action, description, ip } = req.body;
    if (!action || !description) {
      return res.status(400).json({ success: false, message: 'Action and description are required.' });
    }

    const log = recordSecurityLog({
      user: req.user.username,
      action: action.toUpperCase(),
      description,
      ip: ip || req.ip
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/logs - Clear logs (Admin only)
router.delete('/', verifyToken, requireRole(['admin']), (req, res, next) => {
  try {
    writeData('logs', []);
    recordSecurityLog({
      user: req.user.username,
      action: 'AUDIT_LOGS_PURGED',
      description: 'System audit logs cleared by administrator.',
      ip: req.ip
    });
    res.json({ success: true, message: 'Security logs cleared successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
