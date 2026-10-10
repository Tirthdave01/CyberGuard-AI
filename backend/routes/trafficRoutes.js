import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '../services/storage.js';
import { analyzePacket } from '../services/aiEngine.js';
import { validateTrafficPacket } from '../middleware/validate.js';
import { recordSecurityLog } from '../middleware/logger.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/traffic - List traffic packets
router.get('/', (req, res, next) => {
  try {
    const { protocol, limit = 50 } = req.query;
    let traffic = readData('traffic');

    if (protocol) {
      traffic = traffic.filter((p) => p.protocol.toUpperCase() === protocol.toUpperCase());
    }

    // Sort by timestamp desc
    traffic.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      total: traffic.length,
      packets: traffic.slice(0, Number(limit))
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/traffic - Ingest & Analyze Packet (Protected)
router.post('/', verifyToken, validateTrafficPacket, (req, res, next) => {
  try {
    const {
      source_ip,
      destination_ip,
      protocol,
      source_port = Math.floor(1024 + Math.random() * 60000),
      destination_port,
      packet_size = 512,
      flags = 'ACK'
    } = req.body;

    const trafficList = readData('traffic');
    const threatsList = readData('threats');
    const alertsList = readData('alerts');

    const newPacket = {
      id: `trf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      source_ip,
      destination_ip,
      protocol: protocol.toUpperCase(),
      source_port: Number(source_port),
      destination_port: Number(destination_port),
      packet_size: Number(packet_size),
      flags: flags.toUpperCase(),
      timestamp: new Date().toISOString()
    };

    trafficList.unshift(newPacket);
    writeData('traffic', trafficList);

    // AI Threat Analysis
    const aiResult = analyzePacket(newPacket);
    let newThreat = null;
    let newAlert = null;

    if (aiResult.is_threat) {
      newThreat = {
        id: `thr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        traffic_id: newPacket.id,
        source_ip: newPacket.source_ip,
        threat_type: aiResult.threat_type,
        severity: aiResult.severity,
        confidence_score: aiResult.confidence_score,
        risk_score: aiResult.risk_score,
        algorithm_used: aiResult.algorithm_used,
        detected_at: new Date().toISOString()
      };
      threatsList.unshift(newThreat);
      writeData('threats', threatsList);

      // Generate Alert
      newAlert = {
        id: `alt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        threat_id: newThreat.id,
        source_ip: newPacket.source_ip,
        alert_message: `${aiResult.threat_type} detected: port ${newPacket.destination_port} target from ${newPacket.source_ip}`,
        severity: aiResult.severity,
        status: 'Open',
        recommended_action: aiResult.recommended_action,
        created_at: new Date().toISOString()
      };
      alertsList.unshift(newAlert);
      writeData('alerts', alertsList);

      recordSecurityLog({
        user: req.user.username,
        action: 'AI_ALERT_GENERATED',
        description: `Alert generated for ${aiResult.threat_type} from ${source_ip} (Severity: ${aiResult.severity})`,
        ip: source_ip
      });
    }

    res.status(201).json({
      success: true,
      message: aiResult.is_threat ? 'Threat identified and alert generated!' : 'Packet analyzed - Benign traffic.',
      packet: newPacket,
      ai_analysis: aiResult,
      threat: newThreat,
      alert: newAlert
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/traffic/analyze - Test / Sandbox packet without saving
router.post('/analyze', (req, res, next) => {
  try {
    const aiResult = analyzePacket(req.body);
    res.json({
      success: true,
      analysis: aiResult
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/traffic/simulate - Generate simulated batch for live demonstrations
router.post('/simulate', verifyToken, (req, res, next) => {
  try {
    const samplePackets = [
      {
        source_ip: '194.26.29.112',
        destination_ip: '192.168.1.10',
        protocol: 'TCP',
        source_port: 55410,
        destination_port: 22,
        packet_size: 1500,
        flags: 'SYN'
      },
      {
        source_ip: '91.240.118.17',
        destination_ip: '192.168.1.50',
        protocol: 'TCP',
        source_port: 48900,
        destination_port: 80,
        packet_size: 72000,
        flags: 'SYN,ACK'
      },
      {
        source_ip: '192.168.1.110',
        destination_ip: '8.8.8.8',
        protocol: 'UDP',
        source_port: 53112,
        destination_port: 53,
        packet_size: 78,
        flags: 'NONE'
      },
      {
        source_ip: '185.190.140.2',
        destination_ip: '192.168.1.20',
        protocol: 'TCP',
        source_port: 59000,
        destination_port: 44500,
        packet_size: 64,
        flags: 'FIN,PSH'
      }
    ];

    const trafficList = readData('traffic');
    const threatsList = readData('threats');
    const alertsList = readData('alerts');

    const generated = [];

    for (const item of samplePackets) {
      const packet = {
        id: `trf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        ...item,
        timestamp: new Date().toISOString()
      };
      trafficList.unshift(packet);

      const aiResult = analyzePacket(packet);
      if (aiResult.is_threat) {
        const threat = {
          id: `thr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          traffic_id: packet.id,
          source_ip: packet.source_ip,
          threat_type: aiResult.threat_type,
          severity: aiResult.severity,
          confidence_score: aiResult.confidence_score,
          risk_score: aiResult.risk_score,
          algorithm_used: aiResult.algorithm_used,
          detected_at: new Date().toISOString()
        };
        threatsList.unshift(threat);

        const alert = {
          id: `alt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          threat_id: threat.id,
          source_ip: packet.source_ip,
          alert_message: `Live Simulation: ${aiResult.threat_type} flagged targeting ${packet.destination_ip}:${packet.destination_port}`,
          severity: aiResult.severity,
          status: 'Open',
          recommended_action: aiResult.recommended_action,
          created_at: new Date().toISOString()
        };
        alertsList.unshift(alert);
      }
      generated.push(packet);
    }

    writeData('traffic', trafficList);
    writeData('threats', threatsList);
    writeData('alerts', alertsList);

    recordSecurityLog({
      user: req.user.username,
      action: 'TRAFFIC_SIMULATION',
      description: `Injected burst of ${samplePackets.length} simulated network packets with AI inspection.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: `Successfully simulated ${samplePackets.length} network packets.`,
      simulated_packets: generated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/traffic/:id - Delete packet log entry
router.delete('/:id', verifyToken, (req, res, next) => {
  try {
    const { id } = req.params;
    let trafficList = readData('traffic');
    const initialLen = trafficList.length;
    trafficList = trafficList.filter((p) => p.id !== id);

    if (trafficList.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Packet log not found.' });
    }

    writeData('traffic', trafficList);
    res.json({ success: true, message: 'Packet record deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
