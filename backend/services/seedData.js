import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from './storage.js';

export const initSeedData = async () => {
  // 1. Users Seed
  const existingUsers = readData('users');
  if (existingUsers.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const analystPasswordHash = await bcrypt.hash('analyst123', salt);

    const initialUsers = [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@cyberguard.ai',
        password: adminPasswordHash,
        role: 'admin',
        created_at: new Date('2026-10-01T08:00:00Z').toISOString()
      },
      {
        id: uuidv4(),
        username: 'analyst',
        email: 'analyst@cyberguard.ai',
        password: analystPasswordHash,
        role: 'analyst',
        created_at: new Date('2026-10-02T09:30:00Z').toISOString()
      }
    ];
    writeData('users', initialUsers);
    console.log('✔ Initial Users seeded (admin/admin123, analyst/analyst123)');
  }

  // 2. Network Traffic Seed
  const existingTraffic = readData('traffic');
  if (existingTraffic.length === 0) {
    const initialTraffic = [
      {
        id: 'trf-101',
        source_ip: '185.220.101.5',
        destination_ip: '192.168.1.10',
        protocol: 'TCP',
        source_port: 54122,
        destination_port: 22,
        packet_size: 1480,
        flags: 'SYN',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'trf-102',
        source_ip: '45.33.32.156',
        destination_ip: '192.168.1.25',
        protocol: 'TCP',
        source_port: 48920,
        destination_port: 80,
        packet_size: 65400,
        flags: 'ACK,PSH',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'trf-103',
        source_ip: '10.0.0.88',
        destination_ip: '192.168.1.1',
        protocol: 'UDP',
        source_port: 5353,
        destination_port: 53,
        packet_size: 128,
        flags: 'NONE',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      },
      {
        id: 'trf-104',
        source_ip: '198.51.100.77',
        destination_ip: '192.168.1.50',
        protocol: 'TCP',
        source_port: 60114,
        destination_port: 3389,
        packet_size: 2048,
        flags: 'SYN',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        id: 'trf-105',
        source_ip: '192.168.1.105',
        destination_ip: '142.250.190.46',
        protocol: 'HTTPS',
        source_port: 51240,
        destination_port: 443,
        packet_size: 512,
        flags: 'ACK',
        timestamp: new Date().toISOString()
      }
    ];
    writeData('traffic', initialTraffic);
  }

  // 3. Threats Seed
  const existingThreats = readData('threats');
  if (existingThreats.length === 0) {
    const initialThreats = [
      {
        id: 'thr-201',
        traffic_id: 'trf-101',
        source_ip: '185.220.101.5',
        threat_type: 'Brute Force Attack',
        severity: 'High',
        confidence_score: 0.94,
        algorithm_used: 'Random Forest (NSL-KDD)',
        detected_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'thr-202',
        traffic_id: 'trf-102',
        source_ip: '45.33.32.156',
        threat_type: 'DDoS (SYN Flood)',
        severity: 'Critical',
        confidence_score: 0.98,
        algorithm_used: 'Deep Neural Network (CICIDS2017)',
        detected_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'thr-203',
        traffic_id: 'trf-104',
        source_ip: '198.51.100.77',
        threat_type: 'Port Scanning Anomaly',
        severity: 'Medium',
        confidence_score: 0.88,
        algorithm_used: 'Support Vector Machine (UNSW-NB15)',
        detected_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ];
    writeData('threats', initialThreats);
  }

  // 4. Alerts Seed
  const existingAlerts = readData('alerts');
  if (existingAlerts.length === 0) {
    const initialAlerts = [
      {
        id: 'alt-301',
        threat_id: 'thr-201',
        source_ip: '185.220.101.5',
        alert_message: 'Repeated unauthorized SSH connection bursts detected from external IP.',
        severity: 'High',
        status: 'Open',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'alt-302',
        threat_id: 'thr-202',
        source_ip: '45.33.32.156',
        alert_message: 'High volume packet flood exceeding 64KB threshold targeting HTTP port 80.',
        severity: 'Critical',
        status: 'Investigating',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'alt-303',
        threat_id: 'thr-203',
        source_ip: '198.51.100.77',
        alert_message: 'Systematic sequential probe attempts against port 3389 (RDP).',
        severity: 'Medium',
        status: 'Resolved',
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ];
    writeData('alerts', initialAlerts);
  }

  // 5. Security Logs Seed
  const existingLogs = readData('logs');
  if (existingLogs.length === 0) {
    const initialLogs = [
      {
        id: 'log-401',
        user: 'system',
        action: 'AI_MODEL_INITIALIZED',
        description: 'Random Forest & Neural Net classifiers loaded with NSL-KDD dataset parameters.',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: 'log-402',
        user: 'admin',
        action: 'USER_LOGIN_SUCCESS',
        description: 'Administrator authenticated from management console.',
        ip_address: '192.168.1.105',
        created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
      },
      {
        id: 'log-403',
        user: 'system',
        action: 'THREAT_DETECTED',
        description: 'Critical DDoS signature flagged on external gateway interface.',
        ip_address: '45.33.32.156',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];
    writeData('logs', initialLogs);
  }
};
