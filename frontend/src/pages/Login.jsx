// ============================================================
//  ScholarAgent — Login / Sign Up Page
//  File: frontend/src/pages/Login.jsx
//  Modern 3D animated auth page with Firebase
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    googleProvider,
    signInWithPopup,
    updateProfile,
} from '../firebase';
import ImageSequence from '../components/ImageSequence';

function Login({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);

    // ── 3D Particle Animation ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let particles = [];
        let mouse = { x: -1000, y: -1000 };

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        const COLORS = ['#b3cefb', '#f5a9a2', '#fde49e', '#a3d9b1', '#c4b5fd', '#fcd9a0'];
        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                z: Math.random() * 400 + 50,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                vz: (Math.random() - 0.5) * 0.2,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 3 + 1,
            });
        }

        const handleMouse = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        canvas.addEventListener('mousemove', handleMouse);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        const alpha = (1 - dist / 100) * 0.05;
                        ctx.strokeStyle = `rgba(26, 26, 46, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Update and draw particles
            particles.forEach((p) => {
                // Mouse repulsion
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < 80) {
                    p.vx += (mdx / mDist) * 0.3;
                    p.vy += (mdy / mDist) * 0.3;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Boundaries
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
                if (p.z < 50) p.vz = Math.abs(p.vz);
                if (p.z > 450) p.vz = -Math.abs(p.vz);

                // 3D depth scale
                const scale = 400 / (400 + p.z);
                const drawSize = p.size * scale * 2;
                const alpha = scale * 0.35;

                // Glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, drawSize * 3);
                gradient.addColorStop(0, p.color + Math.round(alpha * 25).toString(16).padStart(2, '0'));
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(p.x - drawSize * 3, p.y - drawSize * 3, drawSize * 6, drawSize * 6);

                // Dot
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            // Floating geometric shapes (3D wireframes)
            const time = Date.now() * 0.001;
            drawWireframeShape(ctx, w * 0.15, h * 0.2, time, '#4285f4', 30);
            drawWireframeShape(ctx, w * 0.85, h * 0.3, time * 0.7, '#ea4335', 25);
            drawWireframeShape(ctx, w * 0.1, h * 0.8, time * 1.3, '#34a853', 20);
            drawWireframeShape(ctx, w * 0.9, h * 0.85, time * 0.5, '#fbbc04', 28);

            animId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouse);
        };
    }, []);

    function drawWireframeShape(ctx, cx, cy, angle, color, size) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.06;
        const sides = 6;
        const rotSpeed = angle;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const a = (i / sides) * Math.PI * 2 + rotSpeed;
            const x = cx + Math.cos(a) * size;
            const y = cy + Math.sin(a) * size * 0.6;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Inner ring
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const a = (i / sides) * Math.PI * 2 - rotSpeed * 0.6;
            const x = cx + Math.cos(a) * size * 0.5;
            const y = cy + Math.sin(a) * size * 0.5 * 0.6;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Connecting lines
        for (let i = 0; i < sides; i++) {
            const a1 = (i / sides) * Math.PI * 2 + rotSpeed;
            const a2 = (i / sides) * Math.PI * 2 - rotSpeed * 0.6;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a1) * size, cy + Math.sin(a1) * size * 0.6);
            ctx.lineTo(cx + Math.cos(a2) * size * 0.5, cy + Math.sin(a2) * size * 0.5 * 0.6);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // ── Auth Handlers ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
                if (form.name) {
                    await updateProfile(cred.user, { displayName: form.name });
                }
                onLogin(cred.user);
            } else {
                const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
                onLogin(cred.user);
            }
        } catch (err) {
            const msg = err.code?.replace('auth/', '').replace(/-/g, ' ') || err.message;
            setError(msg.charAt(0).toUpperCase() + msg.slice(1));
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            onLogin(result.user);
        } catch (err) {
            const msg = err.code?.replace('auth/', '').replace(/-/g, ' ') || err.message;
            setError(msg.charAt(0).toUpperCase() + msg.slice(1));
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            {/* 3D Canvas Background */}
            <canvas ref={canvasRef} className="login-canvas" />

            {/* Floating Orbs */}
            <div className="login-orb orb-1"></div>
            <div className="login-orb orb-2"></div>
            <div className="login-orb orb-3"></div>

            <div className="login-container">
                {/* Left — Illustration */}
                <div className="login-visual">
                    <div className="visual-content">
                        <div className="visual-glow"></div>
                        <ImageSequence
                            folderName="image-sequence"
                            filePrefix="A_smooth_cinematic_202602240101_2l5nj_"
                            fileSuffix=".jpg"
                            frameCount={80}
                            fps={12}
                            interactive={true}
                            className="login-illustration"
                        />
                        <div className="visual-text">
                            <h2>Welcome to <span>AlgoScholar</span></h2>
                            <p>AI-Powered Autonomous Scholarship Platform on Algorand</p>
                            <div className="visual-features">
                                <div className="vf-item"><i className="fas fa-robot"></i> AI Evaluation</div>
                                <div className="vf-item"><i className="fas fa-coins"></i> SCHOLAR Token</div>
                                <div className="vf-item"><i className="fas fa-bolt"></i> Instant Payout</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Form */}
                <div className="login-form-panel">
                    <div className="form-header">
                        <div className="form-logo">
                            <div className="logo-icon">A</div>
                            <span>AlgoScholar</span>
                        </div>
                        <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                        <p>{isSignUp ? 'Start your scholarship journey today' : 'Sign in to access your dashboard'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {isSignUp && (
                            <div className="input-group">
                                <i className="fas fa-user"></i>
                                <input type="text" placeholder="Full Name" value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                        )}

                        <div className="input-group">
                            <i className="fas fa-envelope"></i>
                            <input type="email" placeholder="Email Address" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>

                        <div className="input-group">
                            <i className="fas fa-lock"></i>
                            <input type="password" placeholder="Password" value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                        </div>

                        {error && (
                            <div className="auth-error">
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? (
                                <><span className="loader"></span> Please wait...</>
                            ) : (
                                isSignUp ? <><i className="fas fa-user-plus"></i> Create Account</> : <><i className="fas fa-sign-in-alt"></i> Sign In</>
                            )}
                        </button>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading}>
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            Google
                        </button>
                    </form>

                    <div className="auth-toggle">
                        {isSignUp ? (
                            <p>Already have an account? <button onClick={() => { setIsSignUp(false); setError(''); }}>Sign In</button></p>
                        ) : (
                            <p>Don't have an account? <button onClick={() => { setIsSignUp(true); setError(''); }}>Create Account</button></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
