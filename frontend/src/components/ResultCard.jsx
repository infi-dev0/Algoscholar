// ============================================================
//  ScholarAgent — Result Card (Dynamic, Zero Hardcoded Values)
//  File: frontend/src/components/ResultCard.jsx
//  Purpose: Display evaluation result from API — all props-driven
// ============================================================

import React from 'react';
import AgentDashboard from './AgentDashboard';

function ResultCard({ result, onAutoApply, onViewDashboard, showDashboard }) {
    if (!result) return null;

    // ← All values come from API response (backend scoring engine)
    const {
        appId,              // ← auto-generated sequential ID
        status,             // ← "approved" | "rejected"
        totalScore,         // ← from scoring engine (e.g. 64.0)
        amount,             // ← from tier calculation (e.g. 5000)
        tier,               // ← e.g. "Tier 3 — 50%"
        breakdown,          // ← { academic, income, attendance, category }
        verdict,            // ← plain-English explanation
        hardRuleFail,       // ← any failed eligibility rules
        studentName,        // ← from form input
    } = result;

    const isApproved = status === 'approved';

    // Progress bar widths: (value / max_possible_for_weight) * 100
    const barData = [
        { key: 'academic', label: 'Academic', value: breakdown?.academic || 0, max: 40, weight: '0.40', color: '#4285f4' },
        { key: 'income', label: 'Income', value: breakdown?.income || 0, max: 35, weight: '0.35', color: '#34a853' },
        { key: 'attendance', label: 'Attendance', value: breakdown?.attendance || 0, max: 15, weight: '0.15', color: '#fbbc04' },
        { key: 'category', label: 'Category', value: breakdown?.category || 0, max: 10, weight: '0.10', color: '#a259ff' },
    ];

    return (
        <div>
            <div className={`result-card ${isApproved ? 'approved' : 'rejected'}`}>
                {/* Header: Badge + ID + Student Name */}
                <div className="result-header">
                    <div>
                        <span className={`result-badge ${isApproved ? 'approved' : 'rejected'}`}>
                            {isApproved ? '✅ APPROVED' : '❌ REJECTED'}
                        </span>
                        {studentName && (
                            <span style={{ marginLeft: '12px', fontWeight: 600, fontSize: '.95rem' }}>
                                {studentName}
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: '.8rem', color: '#999' }}>ID: {appId}</span>
                </div>

                {/* Score + Amount */}
                <div className="result-details">
                    <div className="detail">
                        <div className="detail-label">Eligibility Score</div>
                        <strong>{totalScore}%</strong>
                    </div>
                    <div className="detail">
                        <div className="detail-label">Scholarship Amount</div>
                        <strong>₹{(amount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    {tier && (
                        <div className="detail">
                            <div className="detail-label">Tier</div>
                            <strong>{tier}</strong>
                        </div>
                    )}
                </div>

                {/* Verdict */}
                {verdict && (
                    <p style={{ marginTop: '12px', fontSize: '.85rem', color: '#666', lineHeight: 1.6 }}>
                        {verdict}
                    </p>
                )}

                {/* Hard Rule Failures */}
                {hardRuleFail && hardRuleFail.length > 0 && (
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '.82rem', color: '#ea4335' }}>
                        {hardRuleFail.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                )}

                {/* Score Breakdown with Progress Bars */}
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,.02)', borderRadius: '8px' }}>
                    <div className="detail-label" style={{ marginBottom: '12px' }}>Score Breakdown</div>
                    {barData.map(bar => (
                        <div key={bar.key} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '4px' }}>
                                <span>{bar.label}</span>
                                <span>
                                    <strong>{bar.value}%</strong>
                                    <span style={{ color: '#999', marginLeft: '6px' }}>(weight: {bar.weight})</span>
                                </span>
                            </div>
                            <div style={{
                                height: '8px', borderRadius: '4px', background: '#e5e7eb', overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%', borderRadius: '4px',
                                    width: `${(bar.value / bar.max) * 100}%`,
                                    background: bar.color,
                                    transition: 'width 0.4s ease',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                {isApproved && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={onAutoApply}>
                            🤖 Auto-Apply to MahaDBT
                        </button>
                        <button className="btn-secondary" onClick={onViewDashboard}>
                            📋 View Agent Dashboard
                        </button>
                    </div>
                )}
            </div>

            {/* Agent Dashboard (mounts when triggered) */}
            {showDashboard && (
                <AgentDashboard
                    applicationId={appId}
                    studentName={studentName}
                    approvedScore={totalScore}
                    approvedAmount={amount}
                />
            )}
        </div>
    );
}

export default ResultCard;
