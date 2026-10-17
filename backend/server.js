import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { initSeedData } from './services/seedData.js';

import authRoutes from './routes/authRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import threatRoutes from './routes/threatRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import logRoutes from './routes/logRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logging Middleware
app.use(requestLogger);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'CyberGuard AI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/logs', logRoutes);

// Serve Static Frontend Assets in Production
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 Not Found Handling Middleware for Unmatched API endpoints
app.use(notFoundHandler);

// Global Error Handling Middleware
app.use(globalErrorHandler);

// Initialize Data & Boot Server
const startServer = async () => {
  await initSeedData();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  CyberGuard AI RESTful API Engine`);
    console.log(`🚀  Server running at http://localhost:${PORT}`);
    console.log(`📋  Health check:   http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

startServer();
