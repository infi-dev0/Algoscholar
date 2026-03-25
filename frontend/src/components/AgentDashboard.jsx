// ============================================================
//  ScholarAgent — Agent Dashboard (SSE-Connected)
//  File: frontend/src/components/AgentDashboard.jsx
//  Purpose: Live agent log, stats, on-chain proof, milestones
// ============================================================

import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AgentDashboard({ applicationId, studentName, approvedScore, approvedAmount }) {
    const [logs, setLogs] = useState([]);
    const [applied, setApplied] = useState(0);
    const [approved, setApproved] = useState(0);
    const [totalDisbursed, setTotalDisbursed] = useState(0);
    const [appRef, setAppRef] = useState(null);
    const [appStatus, setAppStatus] = useState('pending');
    const [txId, setTxId] = useState(null);
    const [sbtTxId, setSbtTxId] = useState(null);
    const [confirmedAmount, setConfirmedAmount] = useState(approvedAmount);
    const [confirmedScore, setConfirmedScore] = useState(approvedScore);
    const [autoApplying, setAutoApplying] = useState(false);
    const logEndRef = useRef(null);

    // Auto-scroll log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // ── SSE connection to agent stream ──────────────────────
    // ← CONNECTS TO: backend/routes/agent.js  GET /api/agent/stream/:id
    useEffect(() => {
        if (!applicationId) return;
        const es = new EventSource(`${API_URL}/agent/stream/${applicationId}`);

        es.onmessage = (e) => {
            const data = JSON.parse(e.data);
            const ts = new Date().toLocaleTimeString();
            setLogs(prev => [...prev, { ...data, ts }]);

            if (data.type === 'application_submitted') {
                setApplied(n => n + 1);
                setAppRef(data.data?.referenceNumber);
                setAppStatus('submitted');
            }
            if (data.type === 'approved') {
                setApproved(n => n + 1);
                setAppStatus('approved');
                // ← amount/score from SSE event, not hardcoded
                if (data.data?.amount) setConfirmedAmount(data.data.amount);
                if (data.data?.score) setConfirmedScore(data.data.score);
            }
            if (data.type === 'disbursed') {
                setAppStatus('disbursed');
                setTxId(data.data?.txId);
                if (data.data?.amount) setTotalDisbursed(prev => prev + data.data.amount);
            }
            if (data.type === 'soulbound') {
                setSbtTxId(data.data?.txId);
            }
        };

        es.onerror = () => {
            setLogs(prev => [...prev, { type: 'error', message: 'SSE connection lost', ts: new Date().toLocaleTimeString() }]);
        };

        return () => es.close();
    }, [applicationId]);

    // ── Trigger auto-apply ──────────────────────────────────
    const handleAutoApply = async () => {
        setAutoApplying(true);
        try {
            // ← CONNECTS TO: backend/routes/agent.js  POST /api/agent/auto-apply
            await fetch(`${API_URL}/agent/auto-apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId }),
            });
        } catch (err) {
            setLogs(prev => [...prev, {
                type: 'error', message: `Auto-apply failed: ${err.message}`,
                ts: new Date().toLocaleTimeString()
            }]);
        }
    };

    const logColor = (type) => {
        switch (type) {
            case 'success': return '#34a853';
            case 'error': return '#ea4335';
            case 'warning': return '#f9ab00';
            default: return '#4285f4';
        }
    };

    const statusChip = (s) => {
        const colors = {
            pending: '#999', submitted: '#4285f4', approved: '#34a853', disbursed: '#f9ab00',
        };
        return (
            <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '.7rem', fontWeight: 700,
                background: colors[s] || '#999', color: '#fff', textTransform: 'uppercase',
            }}>{s}</span>
        );
    };

    // Tranche calculations from approved amount (not hardcoded)
    const tranche1 = Math.round((confirmedAmount || 0) * 0.40);
    const tranche2 = Math.round((confirmedAmount || 0) * 0.35);
    const tranche3 = Math.round((confirmedAmount || 0) * 0.25);

    return (
        <div className="agent-dashboard" style={{ marginTop: '24px' }}>
            {/* Agent Status Bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px', borderRadius: '10px', marginBottom: '20px',
                background: '#1a1a2e', color: '#fff', fontSize: '.82rem',
            }}>
                <div>
                    <span style={{ color: '#34a853', marginRight: '8px' }}>●</span>
                    <strong>AI Agent Active</strong> — 47 schemes monitored
                </div>
                <span style={{ color: '#999' }}>Last scan: {new Date().toLocaleTimeString()}</span>
            </div>

            {/* Stats Row */}
            <div className="stats-row" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <div className="stat-value blue">{applied}</div>
                    <div className="stat-label">Auto-Applied</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value green">{approved}</div>
                    <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value orange">₹{totalDisbursed.toLocaleString('en-IN')}</div>
                    <div className="stat-label">Total Disbursed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#a259ff' }}>47</div>
                    <div className="stat-label">Schemes Watched</div>
                </div>
            </div>

            {/* Auto-Apply Button */}
            {!autoApplying && appStatus === 'pending' && (
                <div style={{ marginBottom: '20px' }}>
                    <button className="btn-primary" onClick={handleAutoApply}>
                        🤖 Start Auto-Apply to MahaDBT
                    </button>
                </div>
            )}

            {/* Live Agent Log */}
            <div style={{
                background: '#0d0d1a', borderRadius: '10px', padding: '16px',
                marginBottom: '20px', maxHeight: '300px', overflowY: 'auto',
                fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '.78rem',
            }}>
                <div style={{ color: '#999', marginBottom: '8px', fontWeight: 700 }}>
                    📟 Agent Log
                </div>
                {logs.length === 0 && (
                    <div style={{ color: '#555' }}>Waiting for agent activity...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} style={{ color: logColor(log.type), marginBottom: '4px' }}>
                        <span style={{ color: '#555' }}>[{log.ts}]</span> {log.message}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>

            {/* Applications Table */}
            {appRef && (
                <div style={{
                    border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden',
                    marginBottom: '20px',
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.7fr 0.7fr 0.8fr',
                        padding: '10px 16px', background: '#1a1a2e', color: '#fff',
                        fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase',
                    }}>
                        <span>Reference</span><span>Scheme</span><span>Score</span>
                        <span>Amount</span><span>Status</span>
                    </div>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.7fr 0.7fr 0.8fr',
                        padding: '12px 16px', fontSize: '.82rem', alignItems: 'center',
                    }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{appRef}</span>
                        <span>EBC Scholarship 2025-26</span>
                        <span>{confirmedScore}%</span>
                        <span>₹{(confirmedAmount || 0).toLocaleString('en-IN')}</span>
                        <span>{statusChip(appStatus)}</span>
                    </div>
                </div>
            )}

            {/* On-Chain Proof (visible only after disbursed) */}
            {txId && (
                <div style={{
                    padding: '16px 20px', borderRadius: '10px', marginBottom: '20px',
                    background: 'rgba(52,168,83,.05)', border: '1px solid rgba(52,168,83,.2)',
                }}>
                    <h4 style={{ fontSize: '.85rem', marginBottom: '10px' }}>🔗 On-Chain Proof</h4>
                    <div style={{ fontSize: '.8rem', marginBottom: '6px' }}>
                        <strong>TX ID:</strong>{' '}
                        <code style={{ fontSize: '.75rem' }}>{txId}</code>
                        <button onClick={() => navigator.clipboard.writeText(txId)}
                            style={{
                                marginLeft: '8px', padding: '2px 8px', fontSize: '.7rem',
                                border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer',
                                background: 'transparent'
                            }}>
                            Copy
                        </button>
                        <a href={`https://lora.algonode.network/testnet/transaction/${txId}`} target="_blank" rel="noreferrer"
                            style={{ marginLeft: '8px', fontSize: '.75rem', color: '#34a853' }}>
                            View on Lora Explorer ↗
                        </a>
                    </div>
                </div>
            )}

            {/* Milestone Tracker */}
            {confirmedAmount > 0 && (
                <div style={{
                    padding: '16px 20px', borderRadius: '10px', marginBottom: '20px',
                    background: '#f8f9fa', border: '1px solid #e5e7eb',
                }}>
                    <h4 style={{ fontSize: '.85rem', marginBottom: '12px' }}>📊 Disbursement Milestones</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '.82rem' }}>
                        <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(52,168,83,.08)', textAlign: 'center' }}>
                            <div style={{ fontSize: '.7rem', color: '#999' }}>Tranche 1 — On approval</div>
                            <strong>₹{tranche1.toLocaleString('en-IN')}</strong>
                            <div>{appStatus === 'disbursed' ? '✅' : '⏳'}</div>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(66,133,244,.08)', textAlign: 'center' }}>
                            <div style={{ fontSize: '.7rem', color: '#999' }}>Tranche 2 — Mid-semester</div>
                            <strong>₹{tranche2.toLocaleString('en-IN')}</strong>
                            <div>⏳</div>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(162,89,255,.08)', textAlign: 'center' }}>
                            <div style={{ fontSize: '.7rem', color: '#999' }}>Tranche 3 — End semester</div>
                            <strong>₹{tranche3.toLocaleString('en-IN')}</strong>
                            <div>🔒</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Soul-Bound Credential Card */}
            {sbtTxId && (
                <div style={{
                    padding: '16px 20px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#fff', fontSize: '.82rem',
                }}>
                    <h4 style={{ marginBottom: '10px' }}>🏅 Soul-Bound Credential</h4>
                    <div>Token ID: <code style={{ color: '#fbbc04' }}>{sbtTxId}</code></div>
                    <div>Score: <strong>{confirmedScore}%</strong></div>
                    <div>Amount: <strong>₹{(confirmedAmount || 0).toLocaleString('en-IN')}</strong></div>
                    <div style={{ marginTop: '6px', color: '#999', fontSize: '.75rem' }}>
                        ARC-69 Standard • 🔒 Non-transferable — permanently locked to your wallet
                    </div>
                </div>
            )}
        </div>
    );
}

export default AgentDashboard;
