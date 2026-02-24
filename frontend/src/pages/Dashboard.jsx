// ============================================================
//  ScholarAgent — Transparency Dashboard
//  File: frontend/src/pages/Dashboard.jsx
// ============================================================

import React, { useState, useEffect } from 'react';
import { useAlgorand } from '../hooks/useAlgorand';

function Dashboard({ walletAddress }) {
    const { getApplications, getDashboardStats } = useAlgorand();
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [statsData, appsData] = await Promise.all([
                getDashboardStats(),
                getApplications(filter),
            ]);
            if (statsData) setStats(statsData);
            setApplications(appsData.applications || []);
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
        setLoadingData(false);
    };

    return (
        <div className="dashboard-page">
            <h2>Transparency Dashboard</h2>
            <p className="subtitle">Real-time overview of scholarship disbursements and treasury status.</p>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-value blue">{stats?.total_applications || 0}</div>
                    <div className="stat-label">Total Applications</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value green">{stats?.approved || 0}</div>
                    <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value red">{stats?.rejected || 0}</div>
                    <div className="stat-label">Rejected</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value orange">₹{(stats?.total_amount_approved || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Disbursed</div>
                </div>
            </div>

            {/* On-Chain State */}
            {stats?.on_chain_state && (
                <div style={{
                    padding: '20px', borderRadius: '12px', marginBottom: '24px',
                    background: '#f8f9fa', border: '1px solid #e5e7eb',
                }}>
                    <h4 style={{ fontFamily: 'Inter,sans-serif', fontSize: '.85rem', marginBottom: '12px' }}>
                        📋 On-Chain Contract State
                    </h4>
                    <div className="result-details">
                        <div className="detail">
                            <div className="detail-label">Monthly Limit</div>
                            <strong>₹{(stats.on_chain_state.monthly_limit || 50000).toLocaleString()}</strong>
                        </div>
                        <div className="detail">
                            <div className="detail-label">Distributed This Month</div>
                            <strong>₹{(stats.on_chain_state.total_distributed || 0).toLocaleString()}</strong>
                        </div>
                        <div className="detail">
                            <div className="detail-label">Max Per Student</div>
                            <strong>₹{(stats.on_chain_state.max_per_student || 10000).toLocaleString()}</strong>
                        </div>
                        <div className="detail">
                            <div className="detail-label">Status</div>
                            <strong>{stats.on_chain_state.paused ? '⏸ Paused' : '🟢 Active'}</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Applications List */}
            <div className="apps-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>Applications</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'pending', 'approved', 'rejected'].map(f => (
                            <button key={f}
                                className={filter === f ? 'btn-primary' : 'btn-secondary'}
                                style={{ padding: '6px 14px', fontSize: '.75rem', borderRadius: '6px' }}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                        <button className="btn-secondary" onClick={loadData}
                            style={{ padding: '6px 14px', fontSize: '.75rem', borderRadius: '6px' }}>
                            <i className="fas fa-refresh"></i> Refresh
                        </button>
                    </div>
                </div>

                {loadingData ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <span className="loader"></span>
                        <p style={{ marginTop: '8px', fontSize: '.85rem' }}>Loading...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '.9rem' }}>
                        No applications found. Submit one from the Apply page.
                    </div>
                ) : (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Header */}
                        <div className="app-row" style={{ background: '#1a1a2e', color: '#fff', fontSize: '.75rem', fontWeight: '700' }}>
                            <span></span>
                            <span>STUDENT</span>
                            <span>CATEGORY</span>
                            <span>SCORE</span>
                            <span>AMOUNT</span>
                        </div>

                        {applications.map((app) => (
                            <div className="app-row" key={app.id}>
                                <span className={`status-dot ${app.status}`}></span>
                                <div>
                                    <strong style={{ fontSize: '.85rem' }}>{app.name}</strong>
                                    <div style={{ fontSize: '.7rem', color: '#999' }}>{app.id}</div>
                                </div>
                                <span>{app.category}</span>
                                <span>{app.evaluation ? `${(app.evaluation.score * 100).toFixed(0)}%` : '—'}</span>
                                <span style={{ fontWeight: 600 }}>
                                    {app.evaluation?.approved
                                        ? `₹${app.evaluation.amount.toLocaleString()}`
                                        : app.status === 'rejected' ? '₹0' : 'Pending'
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Policy Rules */}
            <div style={{
                marginTop: '32px', padding: '20px', borderRadius: '12px',
                background: '#f8f9fa', border: '1px solid #e5e7eb',
            }}>
                <h4 style={{ fontFamily: 'Inter,sans-serif', fontSize: '.85rem', marginBottom: '12px' }}>
                    📜 Active Policy Rules
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '.82rem' }}>
                    <div><span style={{ color: '#999' }}>Max Family Income:</span> <strong>₹2,50,000/year</strong></div>
                    <div><span style={{ color: '#999' }}>Min Marks:</span> <strong>70%</strong></div>
                    <div><span style={{ color: '#999' }}>Min Attendance:</span> <strong>75%</strong></div>
                    <div><span style={{ color: '#999' }}>Eligible Categories:</span> <strong>SC, ST, OBC, EWS</strong></div>
                    <div><span style={{ color: '#999' }}>Max Per Student:</span> <strong>₹10,000/month</strong></div>
                    <div><span style={{ color: '#999' }}>Monthly Treasury:</span> <strong>₹50,000/month</strong></div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
