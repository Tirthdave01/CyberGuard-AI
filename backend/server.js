import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { initSeedData } from './services/seedData.js';

import authRoutes from './routes/authRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import threatRoutes from './routes/threatRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import logRoutes from './routes/logRoutes.js';

dotenv.config();

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

// 404 Not Found Handling Middleware
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
