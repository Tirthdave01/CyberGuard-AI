import express from 'express';
import { readData } from '../services/storage.js';

const router = express.Router();

// GET /api/threats - List all detected threats
router.get('/', (req, res, next) => {
  try {
    const { severity } = req.query;
    let threats = readData('threats');

    if (severity) {
      threats = threats.filter((t) => t.severity.toLowerCase() === severity.toLowerCase());
    }

    threats.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));

    res.json({
      success: true,
      count: threats.length,
      threats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/threats/stats - Dashboard analytics summary
router.get('/stats', (req, res, next) => {
  try {
    const traffic = readData('traffic');
    const threats = readData('threats');
    const alerts = readData('alerts');
    const logs = readData('logs');

    // Group threats by type
    const threatsByType = {};
    const severityCount = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };

    threats.forEach((t) => {
      threatsByType[t.threat_type] = (threatsByType[t.threat_type] || 0) + 1;
      if (severityCount[t.severity] !== undefined) {
        severityCount[t.severity]++;
      }
    });

    // Alert status count
    const alertsByStatus = {
      Open: 0,
      Investigating: 0,
      Resolved: 0
    };

    alerts.forEach((a) => {
      if (alertsByStatus[a.status] !== undefined) {
        alertsByStatus[a.status]++;
      }
    });

    // Count blocked IP actions from logs
    const blockedIps = logs.filter((l) => l.action === 'IP_BLOCKED').length;

    res.json({
      success: true,
      stats: {
        total_packets: traffic.length,
        total_threats: threats.length,
        active_alerts: alerts.filter((a) => a.status !== 'Resolved').length,
        critical_threats: severityCount.Critical,
        blocked_ips: blockedIps,
        threats_by_type: threatsByType,
        severity_breakdown: severityCount,
        alerts_by_status: alertsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
