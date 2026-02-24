// ============================================================
//  ScholarAgent — Student Application Form
//  File: frontend/src/pages/Apply.jsx
// ============================================================

import React, { useState } from 'react';
import { useAlgorand } from '../hooks/useAlgorand';

function Apply({ walletAddress }) {
    const { submitApplication, evaluateApplication, loading, error } = useAlgorand();
    const [result, setResult] = useState(null);
    const [applicationId, setApplicationId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        wallet_address: walletAddress || '',
        family_income: '',
        marks_percentage: '',
        attendance_percentage: '',
        category: 'General',
        institution: '',
        course: '',
    });

    // Auto-fill wallet address when it changes
    React.useEffect(() => {
        if (walletAddress) {
            setForm(prev => ({ ...prev, wallet_address: walletAddress }));
        }
    }, [walletAddress]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Step 1: Submit application
            const submitResult = await submitApplication({
                ...form,
                family_income: parseFloat(form.family_income),
                marks_percentage: parseFloat(form.marks_percentage),
                attendance_percentage: parseFloat(form.attendance_percentage),
            });
            setApplicationId(submitResult.application_id);

            // Step 2: Immediately trigger AI evaluation
            const evalResult = await evaluateApplication(submitResult.application_id);
            setResult(evalResult.evaluation);
        } catch (err) {
            console.error('Application error:', err);
        }
    };

    return (
        <div className="apply-page">
            <h2>Apply for Scholarship</h2>
            <p className="subtitle">Fill in your details. The AI agent will evaluate your eligibility automatically.</p>

            {!walletAddress && (
                <div style={{
                    padding: '12px 20px', borderRadius: '8px', marginBottom: '24px',
                    background: 'rgba(251,188,4,.08)', border: '1px solid rgba(251,188,4,.2)',
                    fontSize: '.85rem', color: '#b8860b',
                }}>
                    ⚠️ Please connect your Pera Wallet first to auto-fill your address.
                </div>
            )}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} required placeholder="Priya Sharma" />
                        </div>
                        <div className="form-group">
                            <label>Wallet Address *</label>
                            <input name="wallet_address" value={form.wallet_address} onChange={handleChange} required
                                placeholder="ALGO..." style={{ fontFamily: 'monospace', fontSize: '.8rem' }} />
                        </div>
                        <div className="form-group">
                            <label>Annual Family Income (₹) *</label>
                            <input name="family_income" type="number" value={form.family_income} onChange={handleChange}
                                required placeholder="180000" min="0" />
                        </div>
                        <div className="form-group">
                            <label>Marks Percentage (%) *</label>
                            <input name="marks_percentage" type="number" value={form.marks_percentage} onChange={handleChange}
                                required placeholder="85" min="0" max="100" step="0.1" />
                        </div>
                        <div className="form-group">
                            <label>Attendance (%) *</label>
                            <input name="attendance_percentage" type="number" value={form.attendance_percentage} onChange={handleChange}
                                required placeholder="90" min="0" max="100" step="0.1" />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select name="category" value={form.category} onChange={handleChange}>
                                <option value="General">General</option>
                                <option value="General-EWS">General-EWS</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Institution</label>
                            <input name="institution" value={form.institution} onChange={handleChange} placeholder="IIT Delhi" />
                        </div>
                        <div className="form-group">
                            <label>Course</label>
                            <input name="course" value={form.course} onChange={handleChange} placeholder="B.Tech CSE" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <><span className="loader"></span> Evaluating...</> : <><i className="fas fa-paper-plane"></i> Submit & Evaluate</>}
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{
                        marginTop: '16px', padding: '12px', borderRadius: '8px',
                        background: 'rgba(234,67,53,.05)', border: '1px solid rgba(234,67,53,.2)',
                        fontSize: '.85rem', color: '#ea4335',
                    }}>
                        ❌ {error}
                    </div>
                )}
            </div>

            {/* Evaluation Result */}
            {result && (
                <div className={`result-card ${result.approved ? 'approved' : 'rejected'}`}>
                    <div className="result-header">
                        <span className={`result-badge ${result.approved ? 'approved' : 'rejected'}`}>
                            {result.approved ? '✅ APPROVED' : '❌ REJECTED'}
                        </span>
                        <span style={{ fontSize: '.8rem', color: '#999' }}>ID: {applicationId}</span>
                    </div>

                    <div className="result-details">
                        <div className="detail">
                            <div className="detail-label">Eligibility Score</div>
                            <strong>{(result.score * 100).toFixed(1)}%</strong>
                        </div>
                        <div className="detail">
                            <div className="detail-label">Scholarship Amount</div>
                            <strong>₹{result.amount?.toLocaleString() || '0'}</strong>
                        </div>
                    </div>

                    <p style={{ marginTop: '12px', fontSize: '.85rem', color: '#666' }}>
                        {result.reason}
                    </p>

                    {result.policy_violations?.length > 0 && (
                        <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '.82rem', color: '#ea4335' }}>
                            {result.policy_violations.map((v, i) => <li key={i}>{v}</li>)}
                        </ul>
                    )}

                    {result.breakdown && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,.02)', borderRadius: '8px' }}>
                            <div className="detail-label" style={{ marginBottom: '8px' }}>Score Breakdown</div>
                            <div className="result-details">
                                {Object.entries(result.breakdown).map(([key, data]) => (
                                    <div className="detail" key={key}>
                                        <div className="detail-label">{key} ({data.eligible ? '✅' : '❌'})</div>
                                        <strong>{(data.score * 100).toFixed(1)}%</strong>
                                        <span style={{ fontSize: '.75rem', color: '#999' }}> (weight: {data.weight})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Apply;
