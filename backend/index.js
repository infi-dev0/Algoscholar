// ============================================================
//  ScholarAgent — Node.js Backend Server
//  File: backend/index.js
//  Purpose: Express API server connecting React ↔ AI ↔ Algorand
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const applicationRoutes = require('./routes/applications');
const agentRoutes = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ScholarAgent Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/agent', agentRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// Start
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('  ScholarAgent — Node.js Backend');
    console.log(`  Running on http://localhost:${PORT}`);
    console.log('='.repeat(50));
});
