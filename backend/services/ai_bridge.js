// ============================================================
//  ScholarAgent — AI Engine Bridge Service
//  File: backend/services/ai_bridge.js
//  Purpose: Node.js → Python AI Engine communication via HTTP
// ============================================================

const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5001';

/**
 * Call the Python AI Engine to evaluate a student application
 * @param {Object} applicationData - Student application data
 * @returns {Object} Evaluation result with approved, amount, score, reason
 */
async function evaluateApplication(applicationData) {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}/evaluate`, applicationData, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`AI Engine error: ${error.response.data.error || error.response.statusText}`);
        }
        throw new Error(`AI Engine unreachable at ${AI_ENGINE_URL}: ${error.message}`);
    }
}

/**
 * Check if the AI Engine is running
 */
async function checkAIHealth() {
    try {
        const response = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
        return response.data;
    } catch (error) {
        return { status: 'error', message: `AI Engine unreachable: ${error.message}` };
    }
}

/**
 * Batch evaluate multiple applications
 * @param {Array} applications - Array of application data
 */
async function batchEvaluate(applications) {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}/batch-evaluate`, {
            applications,
        }, { timeout: 30000 });
        return response.data;
    } catch (error) {
        throw new Error(`Batch evaluation failed: ${error.message}`);
    }
}

/**
 * Get current policy rules from AI Engine
 */
async function getPolicy() {
    try {
        const response = await axios.get(`${AI_ENGINE_URL}/policy`, { timeout: 3000 });
        return response.data;
    } catch (error) {
        throw new Error(`Could not fetch policy: ${error.message}`);
    }
}

module.exports = {
    evaluateApplication,
    checkAIHealth,
    batchEvaluate,
    getPolicy,
};
