// ============================================================
//  ScholarAgent — React Frontend
//  File: frontend/src/App.jsx
// ============================================================

import React, { useState, useEffect } from 'react';
import Apply from './pages/Apply';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import WalletConnect from './components/WalletConnect';
import { auth, onAuthStateChanged, signOut } from './firebase';
import ImageSequence from './components/ImageSequence';
import ScrollingStrips from './components/ScrollingStrips';
import './App.css';

function App() {
    const [page, setPage] = useState('home');
    const [walletAddress, setWalletAddress] = useState(null);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // ── Lifted state from Apply (survives navigation) ───────
    const [formData, setFormData] = useState({
        fullName: '', dateOfBirth: '', aadhaarNumber: '', mobileNumber: '',
        email: '', gender: '', permanentAddress: '',
        institution: '', course: '', yearOfStudy: '',
        previousMarks: '', attendancePercent: '', rollNumber: '',
        fatherName: '', motherName: '', annualIncome: '', category: 'General',
        bankAccount: '', ifscCode: '', algoWallet: '',
        documents: { aadhaar: null, income: null, marksheet: null, caste: null, bonafide: null, bank: null },
    });
    const [applyResult, setApplyResult] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);

    // ── Submitted applications store (feeds Dashboard) ──────
    const [submittedApplications, setSubmittedApplications] = useState([]);

    const handleNewSubmission = (result) => {
        // Prevent duplicates (user might click both buttons)
        setSubmittedApplications(prev => {
            if (prev.some(a => a.appId === result.appId)) return prev;
            return [
                {
                    ...result,
                    studentName: result.studentName || formData.fullName,
                    category: formData.category,
                    institution: formData.institution,
                    submittedAt: new Date().toISOString(),
                },
                ...prev,
            ];
        });
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Sync wallet address to formData
    useEffect(() => {
        if (walletAddress) setFormData(prev => ({ ...prev, algoWallet: walletAddress }));
    }, [walletAddress]);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setPage('home');
    };

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#f8f9fa',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
                    <p style={{ marginTop: '16px', color: '#666', fontSize: '.9rem' }}>Loading AlgoScholar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Navigation */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo" onClick={() => setPage('home')}>
                        <div className="logo-icon">A</div>
                        <span>AlgoScholar</span>
                    </div>
                    <div className="nav-links">
                        {!user ? (
                            /* ── Not logged in: Home + Login ── */
                            <>
                                <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</button>
                                <button className="login-nav-btn" onClick={() => setPage('login')}>
                                    <i className="fas fa-sign-in-alt"></i> Login
                                </button>
                            </>
                        ) : (
                            /* ── Logged in: Apply + Dashboard + Wallet + Logout ── */
                            <>
                                <button className={page === 'apply' ? 'active' : ''} onClick={() => setPage('apply')}>Apply</button>
                                <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>Dashboard</button>
                                <WalletConnect
                                    walletAddress={walletAddress}
                                    onConnect={setWalletAddress}
                                    onDisconnect={() => setWalletAddress(null)}
                                />
                                <div className="user-menu">
                                    <div className="user-avatar">
                                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <button className="logout-btn" onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="main-content">
                {/* Home Page — visible to everyone */}
                {page === 'home' && (
                    <div className="home-page">
                        <ScrollingStrips />
                        <section className="hero-section">
                            <div className="hero-layout">
                                {/* Hero Text — Left Side */}
                                <div className="hero-text">
                                    <h1>India's First <span className="gradient-text">Autonomous</span> Scholarship Agent</h1>{/* ← TEXT UPDATED */}
                                    <p>Fill your details once.AI scores your eligibility, Playwright auto-applies to government portals, and SCHOLAR tokens land in your Pera Wallet — zero human intervention.</p>{/* ← TEXT UPDATED */}
                                    <div className="hero-actions">
                                        {user ? (
                                            <button className="btn-primary" onClick={() => setPage('apply')}>
                                                <i className="fas fa-paper-plane"></i> Apply Now
                                            </button>
                                        ) : (
                                            <button className="btn-primary" onClick={() => setPage('login')}>
                                                <i className="fas fa-sign-in-alt"></i> Get Started
                                            </button>
                                        )}
                                        <button className="btn-secondary" onClick={() => user ? setPage('dashboard') : setPage('login')}>
                                            <i className="fas fa-chart-bar"></i> View Dashboard
                                        </button>
                                    </div>
                                </div>

                                {/* Hero Animation — Right Side */}
                                <div className="hero-visual">
                                    <ImageSequence
                                        folderName="video-sequence"
                                        filePrefix="Video Project_"
                                        fileSuffix=".jpg"
                                        frameCount={72}
                                        fps={6}
                                        interactive={false}
                                        className="hero-video-sequence"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="features-grid">
                            {/* CARD 1 — AI Scoring */}
                            <div className="feature-card">
                                <div className="feature-icon blue">{/* ← ICON UPDATED: raw inline SVG */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                                    </svg>
                                </div>
                                <h3>AI Scoring</h3>{/* ← TEXT UPDATED */}
                                <p>AI evaluates every application using weighted formula: academic ×0.40, income ×0.35, attendance ×0.15, category ×0.10.</p>{/* ← TEXT UPDATED */}
                            </div>
                            {/* CARD 2 — Autonomous Agent ← NEW CARD ADDED */}
                            <div className="feature-card">
                                <div className="feature-icon green">{/* ← ICON UPDATED: raw inline SVG */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <circle cx="12" cy="5" r="2" />
                                        <path d="M12 7v4" />
                                        <line x1="8" y1="16" x2="8" y2="16" />
                                        <line x1="16" y1="16" x2="16" y2="16" />
                                        <path d="M9 15h1v2H9z" />
                                        <path d="M14 15h1v2h-1z" />
                                        <path d="M7 11V9a5 5 0 0 1 10 0v2" />
                                    </svg>
                                </div>
                                <h3>Autonomous Agent</h3>
                                <p>Playwright agent auto-opens MahaDBT portal, fills every field, solves captcha & submits — student never touches another form.</p>
                            </div>
                            {/* CARD 3 — PyTeal Contract */}
                            <div className="feature-card">
                                <div className="feature-icon purple">{/* ← ICON UPDATED: raw inline SVG */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14,2 14,8 20,8" />
                                        <line x1="9" y1="13" x2="15" y2="13" />
                                        <polyline points="9,16 11,18 9,20" />
                                        <polyline points="15,16 13,18 15,20" />
                                    </svg>
                                </div>
                                <h3>PyTeal Contract</h3>{/* ← TEXT UPDATED */}
                                <p>PyTeal smart contract on Algorand TestNet enforces eligibility rules, ₹50,000 monthly budget cap, and per-student limits.</p>{/* ← TEXT UPDATED */}
                            </div>
                            {/* CARD 4 — SCHOLAR Token */}
                            <div className="feature-card">
                                <div className="feature-icon orange">{/* ← ICON UPDATED: raw inline SVG */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" />
                                        <path d="M9 12h6" />
                                        <path d="M12 9v6" />
                                        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" opacity="0.15" />
                                    </svg>
                                </div>
                                <h3>SCHOLAR Token</h3>
                                <p>Custom ASA token (₹1 = 1 SCHOLAR) for transparent, immutable fund tracking on-chain.</p>{/* ← TEXT UPDATED */}
                            </div>
                            {/* CARD 5 — Auto-Collected to Pera */}
                            <div className="feature-card">
                                <div className="feature-icon blue">{/* ← ICON UPDATED: raw inline SVG */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 12V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
                                        <path d="M20 12h-6a2 2 0 0 0 0 4h6" />
                                        <circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" />
                                        <polyline points="12,5 16,2 20,5" />
                                    </svg>
                                </div>
                                <h3>Auto-Collected to Pera</h3>{/* ← TEXT UPDATED */}
                                <p>On approval, SCHOLAR tokens sent directly to student's Pera Wallet via atomic transaction. Soul-Bound ARC-69 credential minted as proof.</p>{/* ← TEXT UPDATED */}
                            </div>
                        </section>

                        <section className="pipeline-section">
                            <div className="pipeline-header">
                                <span className="pipeline-badge">HOW IT WORKS</span>
                                <h2>End-to-End Autonomous Flow</h2>
                                <p className="pipeline-subtitle">From application to disbursement — zero human intervention, fully on-chain.</p>
                            </div>

                            <div className="pipeline-phases">
                                {/* ── PHASE 1: Application & Evaluation ── */}
                                <div className="pipeline-phase">
                                    <div className="phase-label">
                                        <span className="phase-number">Phase 1</span>
                                        <span className="phase-title">Application & Evaluation</span>
                                    </div>
                                    <div className="phase-steps">
                                        {[
                                            { num: '01', icon: 'fa-id-card', title: 'Student Applies', desc: 'Fills full form — Aadhaar, marks, income, attendance, category & Pera Wallet address. Uploads 6 documents once, forever.', color: '#4285f4' },
                                            { num: '02', icon: 'fa-microchip', title: 'AI Scores', desc: 'AI evaluates real input: academic×0.40 + income×0.35 + attendance×0.15 + category×0.10. Score calculated live from user data.', color: '#7c3aed' },
                                            { num: '03', icon: 'fa-shield-alt', title: 'Hard Rules Validated', desc: 'Policy engine checks: marks ≥70%, income ≤₹2,50,000, attendance ≥75%. Any failure → instant rejection with reason.', color: '#34a853' },
                                        ].map((step, i) => (
                                            <div className="flow-step" key={i} style={{ '--step-color': step.color, '--step-delay': `${i * 0.1}s` }}>
                                                <div className="flow-step-number">{step.num}</div>
                                                <div className="flow-step-icon"><i className={`fas ${step.icon}`}></i></div>
                                                <div className="flow-step-content">
                                                    <h4>{step.title}</h4>
                                                    <p>{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Connector Arrow ── */}
                                <div className="phase-connector">
                                    <div className="connector-line"></div>
                                    <div className="connector-arrow"><i className="fas fa-chevron-down"></i></div>
                                    <div className="connector-line"></div>
                                </div>

                                {/* ── PHASE 2: Blockchain Processing ── */}
                                <div className="pipeline-phase">
                                    <div className="phase-label">
                                        <span className="phase-number">Phase 2</span>
                                        <span className="phase-title">Smart Contract Execution</span>
                                    </div>
                                    <div className="phase-steps">
                                        {[
                                            { num: '04', icon: 'fa-robot', title: 'Agent Auto-Applies', desc: 'Playwright agent opens MahaDBT portal, calls window.autoFillForm() with student data, solves captcha, submits — no human involved.', color: '#f59e0b' },
                                            { num: '05', icon: 'fa-file-signature', title: 'Smart Contract Called', desc: 'PyTeal contract on Algorand TestNet validates budget, monthly cap, and student eligibility on-chain before any disbursement.', color: '#ea4335' },
                                            { num: '06', icon: 'fa-coins', title: 'SCHOLAR Tokens Allocated', desc: 'SCHOLAR ASA created — amount set by scoring tier: ₹10,000 / ₹7,500 / ₹5,000. Agent treasury wallet signs the transfer.', color: '#4285f4' },
                                        ].map((step, i) => (
                                            <div className="flow-step" key={i} style={{ '--step-color': step.color, '--step-delay': `${(i + 3) * 0.1}s` }}>
                                                <div className="flow-step-number">{step.num}</div>
                                                <div className="flow-step-icon"><i className={`fas ${step.icon}`}></i></div>
                                                <div className="flow-step-content">
                                                    <h4>{step.title}</h4>
                                                    <p>{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Connector Arrow ── */}
                                <div className="phase-connector">
                                    <div className="connector-line"></div>
                                    <div className="connector-arrow"><i className="fas fa-chevron-down"></i></div>
                                    <div className="connector-line"></div>
                                </div>

                                {/* ── PHASE 3: Disbursement & Credentialing ── */}
                                <div className="pipeline-phase">
                                    <div className="phase-label">
                                        <span className="phase-number">Phase 3</span>
                                        <span className="phase-title">Disbursement & Credentialing</span>
                                    </div>
                                    <div className="phase-steps">
                                        {[
                                            { num: '07', icon: 'fa-atom', title: 'Atomic Transaction', desc: 'Contract call + ASA transfer grouped as one atomic transaction. Either both succeed or both fail — no partial disbursement possible.', color: '#7c3aed' },
                                            { num: '08', icon: 'fa-wallet', title: 'Auto-Collected to Pera', desc: 'SCHOLAR tokens arrive in student\'s Pera Wallet automatically. Indexer confirms receipt. Student notified instantly — zero manual steps.', color: '#34a853' },
                                            { num: '09', icon: 'fa-certificate', title: 'Soul-Bound Credential', desc: 'Non-transferable ARC-69 ASA minted as permanent proof — stores score, amount, scheme & timestamp. Locked to wallet forever.', color: '#f59e0b' },
                                        ].map((step, i) => (
                                            <div className="flow-step" key={i} style={{ '--step-color': step.color, '--step-delay': `${(i + 6) * 0.1}s` }}>
                                                <div className="flow-step-number">{step.num}</div>
                                                <div className="flow-step-icon"><i className={`fas ${step.icon}`}></i></div>
                                                <div className="flow-step-content">
                                                    <h4>{step.title}</h4>
                                                    <p>{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Login Page */}
                {page === 'login' && !user && (
                    <Login onLogin={(u) => { setUser(u); setPage('apply'); }} />
                )}

                {/* Redirect to apply if logged in and on login page */}
                {page === 'login' && user && (
                    <Apply
                        walletAddress={walletAddress}
                        formData={formData}
                        setFormData={setFormData}
                        result={applyResult}
                        setResult={setApplyResult}
                        showDashboard={showDashboard}
                        setShowDashboard={setShowDashboard}
                        onSubmission={handleNewSubmission}
                    />
                )}

                {/* Apply Page — uses CSS show/hide to preserve state */}
                <div style={{ display: (page === 'apply' && user) ? 'block' : 'none' }}>
                    <Apply
                        walletAddress={walletAddress}
                        formData={formData}
                        setFormData={setFormData}
                        result={applyResult}
                        setResult={setApplyResult}
                        showDashboard={showDashboard}
                        setShowDashboard={setShowDashboard}
                        onSubmission={handleNewSubmission}
                    />
                </div>
                {page === 'apply' && !user && (
                    <Login onLogin={(u) => { setUser(u); setPage('apply'); }} />
                )}

                {/* Dashboard — uses CSS show/hide */}
                <div style={{ display: (page === 'dashboard' && user) ? 'block' : 'none' }}>
                    <Dashboard
                        walletAddress={walletAddress}
                        submittedApplications={submittedApplications}
                    />
                </div>
                {page === 'dashboard' && !user && (
                    <Login onLogin={(u) => { setUser(u); setPage('dashboard'); }} />
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2026 ScholarAgent · Built on Algorand · A2A Autonomous Payments</p>
            </footer>
        </div>
    );
}

export default App;
