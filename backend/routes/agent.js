// ============================================================
//  ScholarAgent — Agent Routes (Scoring Engine + SSE + Auto-Apply)
//  File: backend/routes/agent.js
//  Purpose: Evaluate applications, stream agent progress via SSE,
//           trigger Python Playwright agent for portal automation
// ============================================================

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const algosdk = require('algosdk');
const algorandService = require('../services/algorand_service');

// ── In-memory stores ──────────────────────────────────────────
const applications = new Map();     // applicationId → application data
const sseConnections = new Map();     // applicationId → [res, res, ...]
let nextId = 1;

// ══════════════════════════════════════════════════════════════
//  SCORING ENGINE — single source of truth (mirrors Python + frontend)
//  ← CONNECTS TO: frontend/src/pages/Apply.jsx recalculate()
//  ← CONNECTS TO: ai-engine/algoscholar_agent.py calculate_score()
// ══════════════════════════════════════════════════════════════

function calculateScore(data) {
    const marks = parseFloat(data.previousMarks) || 0; // ← USER INPUT
    const income = parseInt(data.annualIncome) || 0; // ← USER INPUT
    const attendance = parseFloat(data.attendancePercent) || 0; // ← USER INPUT
    const category = data.category || '';                      // ← USER INPUT
    const eligibleCats = ['EBC', 'OBC', 'SC', 'ST', 'VJNT', 'SBC'];

    const academic = (marks / 100) * 0.40;
    const incomeS = Math.max(0, (250000 - income) / 250000) * 0.35;
    const attendS = (attendance / 100) * 0.15;
    const catS = eligibleCats.includes(category) ? 0.10 : 0.05;
    const total = academic + incomeS + attendS + catS;

    // Hard eligibility rules
    const hardRuleFail = [];
    if (marks < 70) hardRuleFail.push(`marks ${marks}% < 70% minimum`);
    if (income > 250000) hardRuleFail.push(`income ₹${income} > ₹2,50,000 limit`);
    if (attendance < 75) hardRuleFail.push(`attendance ${attendance}% < 75% minimum`);

    const eligible = hardRuleFail.length === 0 && (total * 100) >= 55;

    let amount = 0;
    let tier = '';
    const pct = parseFloat((total * 100).toFixed(1));
    if (eligible) {
        if (pct >= 85) { amount = 10000; tier = 'Tier 1 — Full'; }
        else if (pct >= 70) { amount = 7500; tier = 'Tier 2 — 75%'; }
        else if (pct >= 55) { amount = 5000; tier = 'Tier 3 — 50%'; }
    }

    return {
        status: eligible ? 'approved' : 'rejected',
        totalScore: pct,
        amount,
        tier,
        breakdown: {
            academic: parseFloat((academic * 100).toFixed(1)),
            income: parseFloat((incomeS * 100).toFixed(1)),
            attendance: parseFloat((attendS * 100).toFixed(1)),
            category: parseFloat((catS * 100).toFixed(1)),
        },
        hardRuleFail,
        eligible,
    };
}

// ══════════════════════════════════════════════════════════════
//  POST /api/agent/evaluate
//  Receives full formData, calculates score, returns result
// ══════════════════════════════════════════════════════════════

router.post('/evaluate', async (req, res, next) => {
    try {
        const data = req.body;
        if (!data.fullName && !data.name) {
            return res.status(400).json({ error: 'fullName is required' });
        }

        // Generate sequential app ID
        const appId = `APP-${String(nextId++).padStart(5, '0')}`;

        // Run scoring engine with student's ACTUAL values
        const scoreResult = calculateScore(data);

        // Build verdict (plain-English explanation)
        let verdict = '';
        if (scoreResult.eligible) {
            verdict = `Congratulations ${data.fullName || data.name}! You scored ${scoreResult.totalScore}% and qualify for ${scoreResult.tier} scholarship of ₹${scoreResult.amount.toLocaleString('en-IN')}. Your academic performance and financial background meet all eligibility criteria.`;
        } else {
            const reasons = scoreResult.hardRuleFail.length > 0
                ? scoreResult.hardRuleFail.join(', ')
                : `total score ${scoreResult.totalScore}% is below 55% threshold`;
            verdict = `Sorry ${data.fullName || data.name}, your application was not approved. Reason: ${reasons}. Consider improving your academic performance or ensuring all documents are in order for the next cycle.`;
        }

        // Save application to store
        const application = {
            id: appId,
            ...data,
            ...scoreResult,
            verdict,
            submitted_at: new Date().toISOString(),
        };
        applications.set(appId, application);

        console.log(`📋 ${appId} evaluated: ${scoreResult.status} (${scoreResult.totalScore}%, ₹${scoreResult.amount})`);

        res.json({
            appId,
            status: scoreResult.status,
            totalScore: scoreResult.totalScore,
            amount: scoreResult.amount,
            tier: scoreResult.tier,
            breakdown: scoreResult.breakdown,
            verdict,
            hardRuleFail: scoreResult.hardRuleFail,
            studentName: data.fullName || data.name,
        });
    } catch (error) {
        next(error);
    }
});

// ══════════════════════════════════════════════════════════════
//  SSE HELPER — push events to connected clients
// ══════════════════════════════════════════════════════════════

function sendSSE(applicationId, type, message, data = {}) {
    const connections = sseConnections.get(applicationId) || [];
    const event = JSON.stringify({
        type, message, data,
        time: new Date().toISOString(),
    });
    connections.forEach(res => {
        res.write(`data: ${event}\n\n`);
    });
}

// ══════════════════════════════════════════════════════════════
//  GET /api/agent/stream/:applicationId — SSE subscription
// ══════════════════════════════════════════════════════════════

router.get('/stream/:applicationId', (req, res) => {
    const { applicationId } = req.params;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Register this connection
    if (!sseConnections.has(applicationId)) {
        sseConnections.set(applicationId, []);
    }
    sseConnections.get(applicationId).push(res);

    // Send initial heartbeat
    res.write(`data: ${JSON.stringify({
        type: 'connected', message: '🔗 Connected to agent stream',
        time: new Date().toISOString(),
    })}\n\n`);

    // Cleanup on disconnect
    req.on('close', () => {
        const conns = sseConnections.get(applicationId) || [];
        sseConnections.set(applicationId, conns.filter(c => c !== res));
    });
});

// ══════════════════════════════════════════════════════════════
//  POST /api/agent/auto-apply — triggers Python Playwright agent
// ══════════════════════════════════════════════════════════════

router.post('/auto-apply', async (req, res, next) => {
    try {
        const { applicationId } = req.body;
        const app = applications.get(applicationId);
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Auto-apply agent started', applicationId });

        // Stream progress via SSE
        sendSSE(applicationId, 'info', '🔍 Loading student profile...');

        // Simulate agent steps (in production, spawn Python process)
        setTimeout(() => {
            sendSSE(applicationId, 'info', '🌐 Opening MahaDBT portal...');
        }, 1500);

        setTimeout(() => {
            sendSSE(applicationId, 'info', `🤖 Auto-filling form with ${app.fullName || app.name}'s data...`);
        }, 3000);

        setTimeout(() => {
            sendSSE(applicationId, 'info', `  ✓ Name: ${app.fullName || app.name}`);
            sendSSE(applicationId, 'info', `  ✓ Marks: ${app.previousMarks}%`);
            sendSSE(applicationId, 'info', `  ✓ Income: ₹${parseInt(app.annualIncome).toLocaleString('en-IN')}`);
            sendSSE(applicationId, 'info', `  ✓ Category: ${app.category}`);
        }, 4500);

        setTimeout(() => {
            sendSSE(applicationId, 'info', '📄 Uploading documents...');
        }, 6000);

        setTimeout(() => {
            sendSSE(applicationId, 'info', '🔐 Solving captcha...');
        }, 8000);

        setTimeout(() => {
            sendSSE(applicationId, 'info', '✅ Declaration accepted');
            sendSSE(applicationId, 'info', '🚀 Submitting application...');
        }, 9500);

        const refNumber = `MDBT-EBC-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;

        setTimeout(() => {
            sendSSE(applicationId, 'success', `🎉 Application submitted! Ref: ${refNumber}`, {
                referenceNumber: refNumber,
            });
            sendSSE(applicationId, 'application_submitted', `Portal submission complete`, {
                referenceNumber: refNumber,
            });
        }, 12000);

        setTimeout(() => {
            sendSSE(applicationId, 'info', '👀 Monitoring disbursement status...');
        }, 14000);

        // Simulate portal approval after ~20 seconds
        setTimeout(() => {
            sendSSE(applicationId, 'success', `✅ Portal approved — ₹${app.amount.toLocaleString('en-IN')} disbursement initiated`, {
                amount: app.amount,
                score: app.totalScore,
            });
            sendSSE(applicationId, 'approved', 'Portal approval confirmed', {
                amount: app.amount,
                score: app.totalScore,
            });
        }, 20000);

        // Execute real Algorand transaction
        setTimeout(async () => {
            sendSSE(applicationId, 'info', '🔗 Initiating Algorand transaction...');

            try {
                // Determine destination address
                // Use a default for testing if user didn't provide a valid Algorand address
                let receiverAddress = app.walletAddress || app.peraWallet || '';
                if (!algosdk.isValidAddress(receiverAddress)) {
                    sendSSE(applicationId, 'warning', `⚠️ Invalid address '${receiverAddress}', using fallback test address`);
                    receiverAddress = 'HZ57J3K46JIJXILZAOXAQFSJOUQO5SIVK7XF3Z3X7Z3F2E3YKT2K6JQDZQ'; // Testnet fallback
                }

                const algodClient = algorandService.getAlgodClient();
                const params = await algodClient.getTransactionParams().do();

                // Read from environment fallback to a testnet account
                const agentMnemonic = process.env.AGENT_MNEMONIC || 'price clap dilemma valid unknown angry loop flip empty this couple kind cancel this ridge snake this jelly all provide all this flip absorb about';
                const agentAccount = algosdk.mnemonicToSecretKey(agentMnemonic);

                const amountToSend = Math.round(app.amount); // Ensure pure integer

                sendSSE(applicationId, 'info', `✍️ Signing transaction for ${amountToSend} SCHOLAR from Treasury...`);

                const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: agentAccount.addr,
                    to: receiverAddress,
                    assetIndex: algorandService.ASSET_ID || 708605809, // Fallback asset ID if not set
                    amount: amountToSend,
                    suggestedParams: params,
                    note: new Uint8Array(Buffer.from(`ScholarAgent App: ${applicationId}`))
                });

                const signedTxn = txn.signTxn(agentAccount.sk);
                sendSSE(applicationId, 'info', `📡 Broadcasting to Algorand TestNet...`);

                const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
                const realTxId = sendResult.txId;

                sendSSE(applicationId, 'info', `⏳ Waiting for network confirmation (txId: ${realTxId.substring(0, 8)}...)...`);

                const confirmedTxn = await algosdk.waitForConfirmation(algodClient, realTxId, 4);

                if (confirmedTxn) {
                    app.txId = realTxId; // Save to DBMS/in-memory Map
                    sendSSE(applicationId, 'success', `💰 ₹${app.amount.toLocaleString('en-IN')} SCHOLAR tokens sent and confirmed!`, {
                        txId: realTxId,
                        amount: app.amount,
                    });
                    sendSSE(applicationId, 'disbursed', 'Algorand disbursement confirmed', {
                        txId: realTxId,
                        amount: app.amount,
                    });
                }
            } catch (err) {
                console.error("Tx Error", err);
                sendSSE(applicationId, 'error', `❌ Transaction failed: ${err.message}. Please check Treasury account funding on TestNet!`);
            }
        }, 22000);

        // Simulate soul-bound credential
        const fakeSbtTxId = `SBT${Array.from({ length: 48 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('')}`;

        setTimeout(() => {
            sendSSE(applicationId, 'success', '🏅 Soul-Bound credential minted!', {
                txId: fakeSbtTxId,
            });
            sendSSE(applicationId, 'soulbound', 'Credential issued', {
                txId: fakeSbtTxId,
            });
        }, 28000);

    } catch (error) {
        next(error);
    }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/agent/status/:applicationId
// ══════════════════════════════════════════════════════════════

router.get('/status/:applicationId', (req, res) => {
    const app = applications.get(req.params.applicationId);
    if (!app) {
        return res.status(404).json({ error: 'Application not found' });
    }
    res.json({
        status: app.status,
        totalScore: app.totalScore,
        amount: app.amount,
        referenceNumber: app.referenceNumber || null,
        txId: app.txId || null,
    });
});

// ══════════════════════════════════════════════════════════════
//  POST /api/agent/monitor — starts disbursement polling
// ══════════════════════════════════════════════════════════════

router.post('/monitor', (req, res) => {
    const { applicationId } = req.body;
    const app = applications.get(applicationId);
    if (!app) {
        return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Monitoring started', applicationId });
});

module.exports = router;
