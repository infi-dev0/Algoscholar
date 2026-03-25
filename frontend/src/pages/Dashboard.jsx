// ============================================================
//  ScholarAgent — Transparency Dashboard (Realistic)
//  File: frontend/src/pages/Dashboard.jsx
//  Displays real submitted applications from the Apply page
// ============================================================

import React, { useMemo } from 'react';

const MONTHLY_BUDGET = 50000;

function Dashboard({ walletAddress, submittedApplications = [] }) {

    // ── Computed Stats ────────────────────────────────────────
    const stats = useMemo(() => {
        const approved = submittedApplications.filter(a => a.status === 'approved');
        const rejected = submittedApplications.filter(a => a.status === 'rejected');
        const totalDisbursed = approved.reduce((sum, a) => sum + (a.amount || 0), 0);
        const avgScore = submittedApplications.length > 0
            ? (submittedApplications.reduce((s, a) => s + (a.totalScore || 0), 0) / submittedApplications.length).toFixed(1)
            : 0;
        return {
            total: submittedApplications.length,
            approved: approved.length,
            rejected: rejected.length,
            totalDisbursed,
            avgScore,
            budgetUsed: Math.min(totalDisbursed, MONTHLY_BUDGET),
            budgetPercent: Math.min((totalDisbursed / MONTHLY_BUDGET) * 100, 100).toFixed(1),
        };
    }, [submittedApplications]);

    // ── Activity Feed ─────────────────────────────────────────
    const activityFeed = useMemo(() => {
        return submittedApplications.map(app => {
            const time = app.submittedAt ? new Date(app.submittedAt) : new Date();
            const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            return {
                ...app,
                timeStr,
                dateStr,
            };
        });
    }, [submittedApplications]);

    return (
        <div className="dashboard-page">
            <div className="dash-header">
                <div>
                    <h2>Transparency Dashboard</h2>
                    <p className="subtitle">Overview of scholarship evaluations and treasury status.</p>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="dash-stats-row">
                <div className="dash-stat-card">
                    <div className="dash-stat-icon blue">
                        <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="dash-stat-info">
                        <div className="dash-stat-value">{stats.total}</div>
                        <div className="dash-stat-label">Total Applications</div>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon green">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="dash-stat-info">
                        <div className="dash-stat-value">{stats.approved}</div>
                        <div className="dash-stat-label">Approved</div>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon red">
                        <i className="fas fa-times-circle"></i>
                    </div>
                    <div className="dash-stat-info">
                        <div className="dash-stat-value">{stats.rejected}</div>
                        <div className="dash-stat-label">Rejected</div>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon orange">
                        <i className="fas fa-coins"></i>
                    </div>
                    <div className="dash-stat-info">
                        <div className="dash-stat-value">₹{stats.totalDisbursed.toLocaleString('en-IN')}</div>
                        <div className="dash-stat-label">Total Disbursed</div>
                    </div>
                </div>
            </div>

            {/* ── Two Column Layout ── */}
            <div className="dash-grid">
                {/* Left: Applications Table */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <h3><i className="fas fa-list-ul"></i> Recent Applications</h3>
                        <span className="dash-count-badge">{stats.total}</span>
                    </div>

                    {submittedApplications.length === 0 ? (
                        <div className="dash-empty-state">
                            <div className="dash-empty-icon">
                                <i className="fas fa-inbox"></i>
                            </div>
                            <p>No applications yet</p>
                            <span>Submit an application from the Apply page to see data here.</span>
                        </div>
                    ) : (
                        <div className="dash-table-wrap">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Score</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submittedApplications.map((app, i) => (
                                        <tr key={i} className="dash-table-row">
                                            <td>
                                                <div className="dash-student-cell">
                                                    <div className="dash-student-avatar" style={{
                                                        background: app.status === 'approved'
                                                            ? 'linear-gradient(135deg, #34a853, #2d8f47)'
                                                            : 'linear-gradient(135deg, #ea4335, #c33a2e)'
                                                    }}>
                                                        {(app.studentName || 'S').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="dash-student-name">{app.studentName || 'Student'}</div>
                                                        <div className="dash-student-meta">{app.appId} · {app.category || 'General'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`dash-score-badge ${app.totalScore >= 70 ? 'high' : app.totalScore >= 55 ? 'mid' : 'low'}`}>
                                                    {app.totalScore}%
                                                </span>
                                            </td>
                                            <td className="dash-amount">
                                                {app.status === 'approved'
                                                    ? `₹${(app.amount || 0).toLocaleString('en-IN')}`
                                                    : '—'}
                                            </td>
                                            <td>
                                                <span className={`dash-status-pill ${app.status}`}>
                                                    {app.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right: Treasury + Stats */}
                <div className="dash-sidebar">
                    {/* Treasury Budget Gauge */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <h3><i className="fas fa-vault"></i> Treasury Budget</h3>
                        </div>
                        <div className="dash-treasury">
                            <div className="dash-gauge-ring">
                                <svg viewBox="0 0 120 120" className="dash-gauge-svg">
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="52" fill="none"
                                        stroke={stats.budgetPercent > 80 ? '#ea4335' : stats.budgetPercent > 50 ? '#f9ab00' : '#34a853'}
                                        strokeWidth="10"
                                        strokeDasharray={`${(stats.budgetPercent / 100) * 326.7} 326.7`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                                    />
                                </svg>
                                <div className="dash-gauge-center">
                                    <div className="dash-gauge-value">{stats.budgetPercent}%</div>
                                    <div className="dash-gauge-label">Used</div>
                                </div>
                            </div>
                            <div className="dash-treasury-row">
                                <span>Disbursed</span>
                                <strong>₹{stats.budgetUsed.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="dash-treasury-row">
                                <span>Remaining</span>
                                <strong>₹{(MONTHLY_BUDGET - stats.budgetUsed).toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="dash-treasury-row">
                                <span>Monthly Cap</span>
                                <strong>₹{MONTHLY_BUDGET.toLocaleString('en-IN')}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Score Distribution */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <h3><i className="fas fa-chart-bar"></i> Quick Stats</h3>
                        </div>
                        <div className="dash-quick-stats">
                            <div className="dash-qs-item">
                                <span className="dash-qs-label">Avg Score</span>
                                <span className="dash-qs-value">{stats.avgScore}%</span>
                            </div>
                            <div className="dash-qs-item">
                                <span className="dash-qs-label">Approval Rate</span>
                                <span className="dash-qs-value">
                                    {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                            <div className="dash-qs-item">
                                <span className="dash-qs-label">Max Per Student</span>
                                <span className="dash-qs-value">₹10,000</span>
                            </div>
                            <div className="dash-qs-item">
                                <span className="dash-qs-label">Network</span>
                                <span className="dash-qs-value" style={{ color: '#34a853' }}>TestNet 🟢</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    {activityFeed.length > 0 && (
                        <div className="dash-panel">
                            <div className="dash-panel-header">
                                <h3><i className="fas fa-stream"></i> Activity</h3>
                            </div>
                            <div className="dash-activity">
                                {activityFeed.slice(0, 5).map((item, i) => (
                                    <div className="dash-activity-item" key={i}>
                                        <div className={`dash-activity-dot ${item.status}`}></div>
                                        <div className="dash-activity-content">
                                            <div className="dash-activity-text">
                                                <strong>{item.studentName || 'Student'}</strong>
                                                {item.status === 'approved'
                                                    ? ` approved — ₹${(item.amount || 0).toLocaleString('en-IN')}`
                                                    : ' — application rejected'}
                                            </div>
                                            <div className="dash-activity-time">{item.dateStr} · {item.timeStr}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Policy Rules */}
            <div className="dash-panel" style={{ marginTop: '24px' }}>
                <div className="dash-panel-header">
                    <h3><i className="fas fa-gavel"></i> Active Policy Rules</h3>
                </div>
                <div className="dash-policy-grid">
                    <div className="dash-policy-item">
                        <span className="dash-policy-label">Max Family Income</span>
                        <span className="dash-policy-value">₹2,50,000/year</span>
                    </div>
                    <div className="dash-policy-item">
                        <span className="dash-policy-label">Min Marks</span>
                        <span className="dash-policy-value">70%</span>
                    </div>
                    <div className="dash-policy-item">
                        <span className="dash-policy-label">Min Attendance</span>
                        <span className="dash-policy-value">75%</span>
                    </div>
                    <div className="dash-policy-item">
                        <span className="dash-policy-label">Eligible Categories</span>
                        <span className="dash-policy-value">SC, ST, OBC, EBC, VJNT, SBC</span>
                    </div>
                    <div className="dash-policy-item">
                        <span className="dash-policy-label">Max Per Student</span>
                        <span className="dash-policy-value">₹10,000/month</span>
                    </div>
                    <div className="dash-policy-item">
                        <span className="dash-policy-label">Monthly Treasury</span>
                        <span className="dash-policy-value">₹50,000/month</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
