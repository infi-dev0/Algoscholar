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

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
                                    <h1>AI-Powered <span className="gradient-text">Autonomous</span> Scholarship</h1>
                                    <p>ScholarAgent evaluates student eligibility and disburses funds automatically using smart contracts on Algorand. No human approval required.</p>
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
                            <div className="feature-card">
                                <div className="feature-icon blue"><i className="fas fa-robot"></i></div>
                                <h3>AI Evaluation</h3>
                                <p>ML-powered scoring engine assesses merit, need, and potential automatically.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon green"><i className="fas fa-file-contract"></i></div>
                                <h3>Smart Contracts</h3>
                                <p>PyTeal contracts enforce policy rules and budget limits on-chain.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon purple"><i className="fas fa-coins"></i></div>
                                <h3>SCHOLAR Token</h3>
                                <p>Custom ASA token (₹1 = 1 SCHOLAR) for transparent fund tracking.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon orange"><i className="fas fa-bolt"></i></div>
                                <h3>Instant Payout</h3>
                                <p>Atomic transactions deliver funds to student wallets in under 5 seconds.</p>
                            </div>
                        </section>

                        <section className="pipeline-section">
                            <h2>System Workflow</h2>
                            <div className="pipeline-steps">
                                {[
                                    { icon: 'fa-user-edit', title: 'Student Applies', desc: 'Submit application with credentials' },
                                    { icon: 'fa-brain', title: 'AI Evaluates', desc: 'ML scoring engine assesses eligibility' },
                                    { icon: 'fa-clipboard-check', title: 'Policy Checked', desc: 'Income, marks, attendance rules validated' },
                                    { icon: 'fa-calculator', title: 'Budget Verified', desc: 'Treasury balance and limits confirmed' },
                                    { icon: 'fa-file-contract', title: 'Contract Called', desc: 'PyTeal smart contract invoked' },
                                    { icon: 'fa-coins', title: 'Token Allocated', desc: 'SCHOLAR ASA tokens minted' },
                                    { icon: 'fa-atom', title: 'Atomic Tx', desc: 'Single indivisible operation' },
                                    { icon: 'fa-paper-plane', title: 'Funds Sent', desc: 'Direct to Pera Wallet' },
                                    { icon: 'fa-link', title: 'On-Chain', desc: 'Immutably recorded on Algorand' },
                                ].map((step, i) => (
                                    <div className="pipeline-step" key={i}>
                                        <div className="step-dot"><i className={`fas ${step.icon}`}></i></div>
                                        <div className="step-info">
                                            <h4>{step.title}</h4>
                                            <p>{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
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
                    <Apply walletAddress={walletAddress} />
                )}

                {/* Apply Page — requires login */}
                {page === 'apply' && user && (
                    <Apply walletAddress={walletAddress} />
                )}
                {page === 'apply' && !user && (
                    <Login onLogin={(u) => { setUser(u); setPage('apply'); }} />
                )}

                {/* Dashboard — requires login */}
                {page === 'dashboard' && user && (
                    <Dashboard walletAddress={walletAddress} />
                )}
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
