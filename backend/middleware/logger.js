import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '../services/storage.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${color}${res.statusCode}\x1b[0m (${duration}ms) - IP: ${req.ip || req.socket.remoteAddress}`);
  });

  next();
};

export const recordSecurityLog = ({ user = 'system', action, description, ip = '127.0.0.1' }) => {
  try {
    const logs = readData('logs');
    const newLog = {
      id: `log-${Date.now()}-${uuidv4().substring(0, 4)}`,
      user: typeof user === 'object' ? user.username : user,
      action,
      description,
      ip_address: ip,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog); // keep latest first
    if (logs.length > 200) logs.length = 200; // prevent unbounded growth
    writeData('logs', logs);
    return newLog;
  } catch (err) {
    console.error('Failed to write security log:', err);
    return null;
  }
};
