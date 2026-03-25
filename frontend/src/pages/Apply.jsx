// ============================================================
//  ScholarAgent — Student Application Form (Expanded)
//  File: frontend/src/pages/Apply.jsx
//  Purpose: Full 4-section form + live score preview
// ============================================================

import React, { useMemo } from 'react';
import ResultCard from '../components/ResultCard';

// ── Scoring Engine (mirrors backend + Python exactly) ──────
// ← CONNECTS TO: backend/routes/agent.js  calculateScore()
// ← CONNECTS TO: ai-engine/algoscholar_agent.py  calculate_score()
function recalculate(marks, income, attendance, category) {
    const m = parseFloat(marks) || 0;
    const inc = parseInt(income) || 0;
    const att = parseFloat(attendance) || 0;

    const academic = (m / 100) * 0.40;
    const incomeS = Math.max(0, (250000 - inc) / 250000) * 0.35;
    const attendS = (att / 100) * 0.15;
    const catS = ['EBC', 'OBC', 'SC', 'ST', 'VJNT', 'SBC'].includes(category)
        ? 0.10 : 0.05;
    const total = academic + incomeS + attendS + catS;

    return {
        academic: +((academic * 100).toFixed(1)),
        income: +((incomeS * 100).toFixed(1)),
        attendance: +((attendS * 100).toFixed(1)),
        category: +((catS * 100).toFixed(1)),
        total: +((total * 100).toFixed(1)),
    };
}

function getAmountTier(totalPct) {
    if (totalPct >= 85) return { amount: 10000, tier: 'Tier 1 — Full' };
    if (totalPct >= 70) return { amount: 7500, tier: 'Tier 2 — 75%' };
    if (totalPct >= 55) return { amount: 5000, tier: 'Tier 3 — 50%' };
    return { amount: 0, tier: 'Not eligible' };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Apply({ walletAddress, formData, setFormData, result, setResult, showDashboard, setShowDashboard, onSubmission }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            documents: { ...prev.documents, [name]: files[0] || null },
        }));
    };

    // ── Live score preview ────────────────────────────────────
    const liveScore = useMemo(() => {
        return recalculate(
            formData.previousMarks,
            formData.annualIncome,
            formData.attendancePercent,
            formData.category
        );
    }, [formData.previousMarks, formData.annualIncome,
    formData.attendancePercent, formData.category]);

    const liveTier = useMemo(() => getAmountTier(liveScore.total), [liveScore.total]);

    // ── Field validation helpers ──────────────────────────────
    const marksOk = formData.previousMarks !== '' && parseFloat(formData.previousMarks) >= 70;
    const attOk = formData.attendancePercent !== '' && parseFloat(formData.attendancePercent) >= 75;
    const incomeOk = formData.annualIncome !== '' && parseInt(formData.annualIncome) <= 250000;
    const eligibleCats = ['EBC', 'OBC', 'SC', 'ST', 'VJNT', 'SBC'];
    const catOk = eligibleCats.includes(formData.category);

    // ── Submit & Evaluate ─────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // ← CONNECTS TO: backend/routes/agent.js  POST /api/agent/evaluate
            const response = await fetch(`${API_URL}/agent/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), // ← USER INPUT: all formData fields
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Evaluation failed');
            }
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    // Score bar color helper
    const scoreColor = liveScore.total >= 70 ? '#34a853'
        : liveScore.total >= 55 ? '#f9ab00'
            : '#ea4335';

    // ── If result received, show ResultCard ────────────────────
    if (result) {
        return (
            <div className="apply-page">
                <ResultCard
                    result={result}
                    onAutoApply={() => { setShowDashboard(true); if (onSubmission) onSubmission(result); }}
                    onViewDashboard={() => { setShowDashboard(true); if (onSubmission) onSubmission(result); }}
                    showDashboard={showDashboard}
                />
            </div>
        );
    }

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

                    {/* ── SECTION 1: Personal Information ── */}
                    <div className="form-section-header">
                        <span className="section-number">1</span>
                        <h3>Personal Information</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name (as per Aadhaar) *</label>
                            <input name="fullName" value={formData.fullName} onChange={handleChange}
                                required placeholder="Priya Sharma" />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth *</label>
                            <input name="dateOfBirth" type="date" value={formData.dateOfBirth}
                                onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Aadhaar Number *</label>
                            <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                                required placeholder="XXXX XXXX XXXX" maxLength={14} />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number *</label>
                            <input name="mobileNumber" type="tel" value={formData.mobileNumber}
                                onChange={handleChange} required placeholder="+91 9876543210" />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input name="email" type="email" value={formData.email}
                                onChange={handleChange} required placeholder="student@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Gender *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label>Permanent Address *</label>
                            <input name="permanentAddress" value={formData.permanentAddress}
                                onChange={handleChange} required placeholder="Full address" />
                        </div>
                    </div>

                    {/* ── SECTION 2: Academic Information ── */}
                    <div className="form-section-header">
                        <span className="section-number">2</span>
                        <h3>Academic Information</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Institution *</label>
                            <input name="institution" value={formData.institution} onChange={handleChange}
                                required placeholder="IIT Delhi" />
                        </div>
                        <div className="form-group">
                            <label>Course *</label>
                            <select name="course" value={formData.course} onChange={handleChange} required>
                                <option value="">Select Course</option>
                                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                                <option value="B.Sc.">B.Sc.</option>
                                <option value="B.Com.">B.Com.</option>
                                <option value="B.A.">B.A.</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MBA">MBA</option>
                                <option value="Medical (MBBS)">Medical (MBBS)</option>
                                <option value="Diploma">Diploma</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Year of Study *</label>
                            <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required>
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Previous Marks (%) * {formData.previousMarks && (
                                <span className={`field-hint ${marksOk ? 'ok' : 'fail'}`}>
                                    {marksOk ? '✓ Eligible' : '✗ Min 70% required'}
                                </span>
                            )}</label>
                            <input name="previousMarks" type="number" value={formData.previousMarks}
                                onChange={handleChange} required placeholder="85"
                                min="0" max="100" step="0.1" />
                        </div>
                        <div className="form-group">
                            <label>Attendance (%) * {formData.attendancePercent && (
                                <span className={`field-hint ${attOk ? 'ok' : 'fail'}`}>
                                    {attOk ? '✓ Eligible' : '✗ Min 75% required'}
                                </span>
                            )}</label>
                            <input name="attendancePercent" type="number" value={formData.attendancePercent}
                                onChange={handleChange} required placeholder="90"
                                min="0" max="100" step="0.1" />
                        </div>
                        <div className="form-group">
                            <label>Roll Number *</label>
                            <input name="rollNumber" value={formData.rollNumber} onChange={handleChange}
                                required placeholder="2024CSE001" />
                        </div>
                    </div>

                    {/* ── SECTION 3: Financial Information ── */}
                    <div className="form-section-header">
                        <span className="section-number">3</span>
                        <h3>Financial Information</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Father's Name *</label>
                            <input name="fatherName" value={formData.fatherName} onChange={handleChange}
                                required placeholder="Rajesh Sharma" />
                        </div>
                        <div className="form-group">
                            <label>Mother's Name *</label>
                            <input name="motherName" value={formData.motherName} onChange={handleChange}
                                required placeholder="Anita Sharma" />
                        </div>
                        <div className="form-group">
                            <label>Annual Family Income (₹) * {formData.annualIncome && (
                                <span className={`field-hint ${incomeOk ? 'ok' : 'fail'}`}>
                                    {incomeOk ? '✓ Within limit' : '✗ Max ₹2,50,000'}
                                </span>
                            )}</label>
                            <input name="annualIncome" type="number" value={formData.annualIncome}
                                onChange={handleChange} required placeholder="180000"
                                min="0" max="1000000" />
                        </div>
                        <div className="form-group">
                            <label>Category * {formData.category && (
                                <span className={`field-hint ${catOk ? 'ok' : 'amber'}`}>
                                    {catOk ? '✓ Reserved' : '○ General'}
                                </span>
                            )}</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="General">General</option>
                                <option value="EBC">EBC</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="VJNT">VJNT</option>
                                <option value="SBC">SBC</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Bank Account Number *</label>
                            <input name="bankAccount" value={formData.bankAccount} onChange={handleChange}
                                required placeholder="1234567890" />
                        </div>
                        <div className="form-group">
                            <label>IFSC Code *</label>
                            <input name="ifscCode" value={formData.ifscCode} onChange={handleChange}
                                required placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div className="form-group full-width">
                            <label>Algorand Wallet (for SCHOLAR token)</label>
                            <input name="algoWallet" value={formData.algoWallet} onChange={handleChange}
                                placeholder="ALGO..." style={{ fontFamily: 'monospace', fontSize: '.8rem' }} />
                        </div>
                    </div>

                    {/* ── LIVE SCORE PREVIEW ── */}
                    {(formData.previousMarks || formData.annualIncome || formData.attendancePercent) && (
                        <div className="live-score-preview">
                            <h4>📊 Live Eligibility Preview</h4>
                            <div className="score-bars">
                                <div className="score-bar-item">
                                    <div className="score-bar-header">
                                        <span>Academic</span>
                                        <span>{liveScore.academic}% <small style={{ color: '#999' }}>weight: 0.40</small></span>
                                    </div>
                                    <div className="score-bar-track">
                                        <div className="score-bar-fill" style={{ width: `${(liveScore.academic / 40) * 100}%`, background: '#4285f4' }} />
                                    </div>
                                    <small className="score-formula">= (marks / 100) × 0.40</small>
                                </div>
                                <div className="score-bar-item">
                                    <div className="score-bar-header">
                                        <span>Income</span>
                                        <span>{liveScore.income}% <small style={{ color: '#999' }}>weight: 0.35</small></span>
                                    </div>
                                    <div className="score-bar-track">
                                        <div className="score-bar-fill" style={{ width: `${(liveScore.income / 35) * 100}%`, background: '#34a853' }} />
                                    </div>
                                    <small className="score-formula">= max(0, (250000 − income) / 250000) × 0.35</small>
                                </div>
                                <div className="score-bar-item">
                                    <div className="score-bar-header">
                                        <span>Attendance</span>
                                        <span>{liveScore.attendance}% <small style={{ color: '#999' }}>weight: 0.15</small></span>
                                    </div>
                                    <div className="score-bar-track">
                                        <div className="score-bar-fill" style={{ width: `${(liveScore.attendance / 15) * 100}%`, background: '#fbbc04' }} />
                                    </div>
                                    <small className="score-formula">= (attendance / 100) × 0.15</small>
                                </div>
                                <div className="score-bar-item">
                                    <div className="score-bar-header">
                                        <span>Category</span>
                                        <span>{liveScore.category}% <small style={{ color: '#999' }}>weight: 0.10</small></span>
                                    </div>
                                    <div className="score-bar-track">
                                        <div className="score-bar-fill" style={{ width: `${(liveScore.category / 10) * 100}%`, background: '#a259ff' }} />
                                    </div>
                                    <small className="score-formula">= 10% if reserved category, else 5%</small>
                                </div>
                            </div>
                            <div className="score-total" style={{ borderColor: scoreColor }}>
                                <div className="score-total-label">TOTAL SCORE</div>
                                <div className="score-total-value" style={{ color: scoreColor }}>
                                    {liveScore.total}<span className="score-percent">%</span>
                                </div>
                                <div className="score-total-tier">
                                    {liveTier.amount > 0
                                        ? `${liveTier.tier} — ₹${liveTier.amount.toLocaleString('en-IN')}`
                                        : 'Below threshold — ₹0'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SECTION 4: Documents ── */}
                    <div className="form-section-header">
                        <span className="section-number">4</span>
                        <h3>Upload Documents</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Aadhaar Card (PDF/JPG)</label>
                            <input type="file" name="aadhaar" accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Income Certificate (PDF)</label>
                            <input type="file" name="income" accept=".pdf"
                                onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Marksheet (PDF)</label>
                            <input type="file" name="marksheet" accept=".pdf"
                                onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Caste Certificate (PDF)</label>
                            <input type="file" name="caste" accept=".pdf"
                                onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Bonafide Certificate (PDF)</label>
                            <input type="file" name="bonafide" accept=".pdf"
                                onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Bank Passbook (PDF)</label>
                            <input type="file" name="bank" accept=".pdf"
                                onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading
                                ? <><span className="loader"></span> Evaluating...</>
                                : <><i className="fas fa-paper-plane"></i> Submit &amp; Evaluate</>}
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
        </div>
    );
}

export default Apply;
