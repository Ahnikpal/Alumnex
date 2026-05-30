"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<'student' | 'alumni'>('student');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'student' | 'alumni') => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { user } = await login({ email, password, userType: type });
            
            localStorage.setItem('userData', JSON.stringify({
                id: user.id,
                fullName: user.name,
                email: user.email,
                role: user.role,
                profile_picture: user.profile_picture || null,
                ...(type === 'alumni' && { company: user.company })
            }));
            
            router.push(type === 'student' ? '/student-dashboard' : '/alumni-dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-dark-theme min-h-screen">
            {/* Background Accents */}
            <div className="login-bg-glow">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
            </div>

            {/* Navbar */}
            <nav className="navbar" id="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <i className="fas fa-graduation-cap"></i>
                            <span>Alumnex</span>
                        </Link>
                    </div>
                    <div className="nav-links">
                        <Link href="/" className="nav-link">Home</Link>
                    </div>
                    <div className="nav-right">
                        <Link href="/student-register" className="btn-primary-small">Sign Up</Link>
                    </div>
                </div>
            </nav>

            <main className="login-page-wrapper">
                <div className="login-main-card">

                    {/* Left Panel: Brand Experience */}
                    <div className="login-brand-panel">
                        <div className="brand-content">
                            <div className="brand-badge">Premium Experience</div>
                            <h2 className="brand-title">Bridge the Gap Between <span className="highlight">Students</span> & <span className="highlight">Alumni</span></h2>
                            <p className="brand-text">Connect with mentors and land your dream internships through verified referrals.</p>
                        </div>
                        <div className="brand-media">
                            <div className="floating-icons">
                                <i className="fas fa-rocket icon-1"></i>
                                <i className="fas fa-briefcase icon-2"></i>
                                <i className="fas fa-graduation-cap icon-3"></i>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Auth Form */}
                    <div className="login-auth-panel">
                        <div className="auth-header">
                            <h1>Welcome Back</h1>
                            <p>Enter your credentials to access your account</p>
                        </div>

                        <div className="auth-type-selector" data-active={activeTab}>
                            <button
                                className={`type-tab ${activeTab === 'student' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('student'); setError(null); }}
                            >
                                Student
                            </button>
                            <button
                                className={`type-tab ${activeTab === 'alumni' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('alumni'); setError(null); }}
                            >
                                Alumni
                            </button>
                            <div className="tab-glider"></div>
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="forms-wrapper">
                            {/* Student Form */}
                            {activeTab === 'student' && (
                                <form className="auth-form" onSubmit={(e) => handleAuthSubmit(e, 'student')}>
                                    <div className="form-control">
                                        <label>Email Address</label>
                                        <input type="email" name="email" placeholder="name@college.edu" required />
                                    </div>
                                    <div className="form-control">
                                        <label>Password</label>
                                        <div className="password-input-group">
                                            <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required />
                                            <button type="button" className="psw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-actions-row">
                                        <label className="custom-checkbox">
                                            <input type="checkbox" />
                                            <span>Remember me</span>
                                        </label>
                                        <Link href="#" className="link-forgot">Forgot Password?</Link>
                                    </div>
                                    <button type="submit" className="btn-submit-glow" disabled={isLoggingIn}>
                                        {isLoggingIn ? (
                                            <><i className="fas fa-spinner fa-spin"></i> Logging in...</>
                                        ) : (
                                            <>Login Student <i className="fas fa-arrow-right"></i></>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Alumni Form */}
                            {activeTab === 'alumni' && (
                                <form className="auth-form" onSubmit={(e) => handleAuthSubmit(e, 'alumni')}>
                                    <div className="form-control">
                                        <label>Corporate Email</label>
                                        <input type="email" name="email" placeholder="name@company.com" required />
                                    </div>
                                    <div className="form-control">
                                        <label>Password</label>
                                        <div className="password-input-group">
                                            <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required />
                                            <button type="button" className="psw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-actions-row">
                                        <label className="custom-checkbox">
                                            <input type="checkbox" />
                                            <span>Remember account</span>
                                        </label>
                                        <Link href="#" className="link-forgot">Reset Password?</Link>
                                    </div>
                                    <button type="submit" className="btn-submit-glow" disabled={isLoggingIn}>
                                        {isLoggingIn ? (
                                            <><i className="fas fa-spinner fa-spin"></i> Logging in...</>
                                        ) : (
                                            <>Alumni Login <i className="fas fa-arrow-right"></i></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="social-login">
                            <p className="social-label"><span>Or continue with</span></p>
                            <div className="social-buttons">
                                <button className="btn-social">
                                    <i className="fab fa-google"></i> Google
                                </button>
                                <button className="btn-social">
                                    <i className="fab fa-linkedin"></i> LinkedIn
                                </button>
                            </div>
                        </div>

                        <div className="auth-footer">
                            <p>Don't have an account? <Link href="/student-register">Sign Up</Link></p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
