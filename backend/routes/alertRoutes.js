import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '../services/storage.js';
import { validateAlert } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import { recordSecurityLog } from '../middleware/logger.js';

const router = express.Router();

// GET /api/alerts - List all alerts with optional query filters (status, severity)
router.get('/', (req, res, next) => {
  try {
    const { status, severity, limit = 50 } = req.query;
    let alerts = readData('alerts');

    if (status) {
      alerts = alerts.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }
    if (severity) {
      alerts = alerts.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
    }

    alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      count: alerts.length,
      alerts: alerts.slice(0, Number(limit))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/alerts/:id - Get single alert by ID
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const alerts = readData('alerts');
    const alert = alerts.find((a) => a.id === id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, alert });
  } catch (error) {
    next(error);
  }
});

// POST /api/alerts - Create new manual or rule-based alert (Protected)
router.post('/', verifyToken, validateAlert, (req, res, next) => {
  try {
    const { threat_id = null, source_ip = '127.0.0.1', alert_message, severity = 'Medium' } = req.body;
    const alerts = readData('alerts');

    const newAlert = {
      id: `alt-${Date.now().toString(36)}-${uuidv4().substring(0, 4)}`,
      threat_id,
      source_ip,
      alert_message: alert_message.trim(),
      severity,
      status: 'Open',
      created_at: new Date().toISOString()
    };

    alerts.unshift(newAlert);
    writeData('alerts', alerts);

    recordSecurityLog({
      user: req.user.username,
      action: 'MANUAL_ALERT_CREATED',
      description: `Security alert created manually: "${alert_message}" (Severity: ${severity})`,
      ip: source_ip
    });

    res.status(201).json({
      success: true,
      message: 'Security alert logged successfully.',
      alert: newAlert
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/alerts/:id - Update alert status or note (Protected)
router.put('/:id', verifyToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const alerts = readData('alerts');

    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    if (status && !['Open', 'Investigating', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted values: Open, Investigating, Resolved.'
      });
    }

    const previousStatus = alerts[index].status;
    if (status) alerts[index].status = status;
    if (note) alerts[index].analyst_note = note;
    alerts[index].updated_at = new Date().toISOString();
    alerts[index].updated_by = req.user.username;

    writeData('alerts', alerts);

    recordSecurityLog({
      user: req.user.username,
      action: 'ALERT_STATUS_UPDATED',
      description: `Alert [${id}] status modified: ${previousStatus} -> ${alerts[index].status}`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Alert updated successfully.',
      alert: alerts[index]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/alerts/:id/block-ip - Block Malicious IP and mark alert resolved (Protected)
router.post('/:id/block-ip', verifyToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const alerts = readData('alerts');
    const alert = alerts.find((a) => a.id === id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const targetIp = alert.source_ip;
    alert.status = 'Resolved';
    alert.updated_at = new Date().toISOString();
    alert.updated_by = req.user.username;
    alert.defense_action = `FIREWALL_BLOCKED: ${targetIp}`;

    writeData('alerts', alerts);

    recordSecurityLog({
      user: req.user.username,
      action: 'IP_BLOCKED',
      description: `Firewall defense policy executed: Source IP ${targetIp} dropped. Associated with alert ${id}.`,
      ip: targetIp
    });

    res.json({
      success: true,
      message: `Firewall blocked IP address ${targetIp} successfully. Alert set to Resolved.`,
      alert
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/alerts/:id - Delete / Dismiss alert (Protected)
router.delete('/:id', verifyToken, (req, res, next) => {
  try {
    const { id } = req.params;
    let alerts = readData('alerts');
    const alertToDelete = alerts.find((a) => a.id === id);

    if (!alertToDelete) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    alerts = alerts.filter((a) => a.id !== id);
    writeData('alerts', alerts);

    recordSecurityLog({
      user: req.user.username,
      action: 'ALERT_DELETED',
      description: `Alert [${id}] removed by ${req.user.username}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Alert record dismissed and deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
