// ============================================================
//  ScholarAgent — Application Routes
//  File: backend/routes/applications.js
// ============================================================

const express = require('express');
const router = express.Router();
const { evaluateApplication, checkAIHealth, getPolicy } = require('../services/ai_bridge');
const { getTransactionHistory, getStudentHistory, getAppState, getTreasuryBalance } = require('../services/algorand_service');

// In-memory store (replace with DB in production)
const applications = new Map();
let nextId = 1;

/**
 * POST /api/applications/submit
 * Student submits a new application
 */
router.post('/submit', async (req, res, next) => {
    try {
        const data = req.body;

        // Basic validation
        if (!data.name || !data.wallet_address) {
            return res.status(400).json({ error: 'name and wallet_address are required' });
        }

        const id = `APP-${String(nextId++).padStart(5, '0')}`;
        const application = {
            id,
            ...data,
            status: 'pending',
            submitted_at: new Date().toISOString(),
            evaluation: null,
        };

        applications.set(id, application);
        console.log(`📥 Application ${id} submitted by ${data.name}`);

        res.status(201).json({
            message: 'Application submitted successfully',
            application_id: id,
            status: 'pending',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/applications/:id
 * Get application details and status
 */
router.get('/:id', async (req, res, next) => {
    try {
        const app = applications.get(req.params.id);
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json(app);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/applications/student/:addr
 * Get all applications by a student wallet address
 */
router.get('/student/:addr', async (req, res, next) => {
    try {
        const studentApps = [];
        for (const [, app] of applications) {
            if (app.wallet_address === req.params.addr) {
                studentApps.push(app);
            }
        }

        // Also get on-chain history
        const history = await getStudentHistory(req.params.addr);

        res.json({ applications: studentApps, on_chain_history: history });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/applications/:id/evaluate
 * Trigger AI evaluation for an application
 */
router.post('/:id/evaluate', async (req, res, next) => {
    try {
        const app = applications.get(req.params.id);
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (app.status !== 'pending') {
            return res.status(400).json({ error: `Application already ${app.status}` });
        }

        console.log(`🧠 Evaluating application ${app.id}...`);

        // Call Python AI Engine
        const evaluation = await evaluateApplication({
            name: app.name,
            wallet_address: app.wallet_address,
            family_income: app.family_income,
            marks_percentage: app.marks_percentage,
            attendance_percentage: app.attendance_percentage,
            category: app.category,
            institution: app.institution || '',
            course: app.course || '',
        });

        // Update application
        app.evaluation = evaluation;
        app.status = evaluation.approved ? 'approved' : 'rejected';
        app.evaluated_at = new Date().toISOString();
        applications.set(app.id, app);

        console.log(`${evaluation.approved ? '✅' : '❌'} ${app.id}: ${evaluation.reason}`);

        res.json({
            application_id: app.id,
            status: app.status,
            evaluation,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/applications/pending
 * List all pending applications
 */
router.get('/', async (req, res, next) => {
    try {
        const status = req.query.status || 'all';
        const result = [];
        for (const [, app] of applications) {
            if (status === 'all' || app.status === status) {
                result.push(app);
            }
        }
        res.json({
            total: result.length,
            applications: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/applications/dashboard/stats
 * Dashboard statistics
 */
router.get('/dashboard/stats', async (req, res, next) => {
    try {
        let approved = 0, rejected = 0, pending = 0, totalAmount = 0;
        for (const [, app] of applications) {
            if (app.status === 'approved') { approved++; totalAmount += app.evaluation?.amount || 0; }
            else if (app.status === 'rejected') rejected++;
            else pending++;
        }

        const appState = await getAppState();

        res.json({
            total_applications: applications.size,
            approved,
            rejected,
            pending,
            total_amount_approved: totalAmount,
            on_chain_state: appState,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/applications/ai/health
 * Check AI Engine health
 */
router.get('/ai/health', async (req, res) => {
    const health = await checkAIHealth();
    res.json(health);
});

/**
 * GET /api/applications/ai/policy
 * Get current policy rules
 */
router.get('/ai/policy', async (req, res, next) => {
    try {
        const policy = await getPolicy();
        res.json(policy);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
