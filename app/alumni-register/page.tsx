"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AlumniRegisterPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsRegistering(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = (formData.get('fullName') as string) || '';
        const email = (formData.get('email') as string) || '';
        const password = (formData.get('password') as string) || '';
        const company = (formData.get('companyName') as string) || '';
        const role = (formData.get('position') as string) || '';
        const graduation_year = parseInt(formData.get('gradYear') as string) || null;
        const location = '';   // not in the alumni form; can be added later

        try {
            const res = await fetch('http://localhost:5000/alumni', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, company, role, graduation_year, location }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsRegistering(false);
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
                        <Link href="/login" className="btn-primary-small">Login</Link>
                    </div>
                </div>
            </nav>

            <main className="login-page-wrapper">
                <div className="login-main-card" style={{ height: 'auto', maxWidth: '900px' }}>

                    {/* Left Brand Panel */}
                    <div className="login-brand-panel" style={{ padding: '3rem' }}>
                        <div className="brand-content">
                            <div className="brand-badge">Alumni Network</div>
                            <h2 className="brand-title">Empower the <span className="highlight">Next Generation</span></h2>
                            <p className="brand-text">Share your expertise and help juniors navigate their career paths.</p>
                        </div>
                        <div className="brand-media" style={{ marginTop: '2rem' }}>
                            <div className="floating-icons">
                                <i className="fas fa-briefcase icon-1"></i>
                                <i className="fas fa-handshake icon-2"></i>
                                <i className="fas fa-users icon-3"></i>
                            </div>
                        </div>
                    </div>

                    {/* Right Auth Panel */}
                    <div className="login-auth-panel" style={{ width: 'auto', flex: 1.2, padding: '3rem' }}>
                        <div className="auth-header" style={{ animation: 'revealIn 0.8s ease-out both' }}>
                            <h1>Join as Alumni</h1>
                            <p>Register to become a mentor</p>
                        </div>

                        <div className="auth-type-selector" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.2s' }}>
                            <Link href="/student-register" className="type-tab text-center">Student</Link>
                            <div className="type-tab active">Alumni</div>
                            <div className="tab-glider" style={{ transform: 'translateX(calc(100% + 0.3rem))' }}></div>
                        </div>

                        <form className="auth-form" onSubmit={handleRegisterSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.4s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Full Name</label>
                                    <input type="text" name="fullName" placeholder="John Doe" required />
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Current Company</label>
                                    <input type="text" name="companyName" placeholder="Google, Meta, etc." required />
                                </div>
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.5s' }}>
                                <label>Professional Email</label>
                                <input type="email" name="email" placeholder="name@company.com" required />
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.55s' }}>
                                <label>College Name</label>
                                <input type="text" name="collegeName" placeholder="Enter your alma mater" required />
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.6s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Current Position</label>
                                    <input type="text" name="position" placeholder="Software Engineer" required />
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Graduation Year</label>
                                    <input type="number" name="gradYear" placeholder="2020" required />
                                </div>
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.65s' }}>
                                <label>Branch</label>
                                <select className="custom-select" name="branch" required style={{ width: '100%', padding: '1rem', background: 'rgba(15, 12, 41, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', color: '#fff' }}>
                                    <option value="">Select Branch</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="MECH">Mechanical</option>
                                </select>
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.7s' }}>
                                <label>LinkedIn Profile</label>
                                <input type="url" name="linkedin" placeholder="https://linkedin.com/..." required />
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.8s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Password</label>
                                    <input type="password" name="password" placeholder="••••••••" required />
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Confirm Password</label>
                                    <input type="password" name="confirmPassword" placeholder="••••••••" required />
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {success && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', color: '#16a34a', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                    ✅ Account created successfully! Redirecting to login...
                                </div>
                            )}

                            <button type="submit" className="btn-submit-glow" style={{ marginTop: '1rem', animationDelay: '0.9s' }} disabled={isRegistering || success}>
                                {isRegistering && !success ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Registering...</>
                                ) : success ? (
                                    <><i className="fas fa-check"></i> Redirecting...</>
                                ) : (
                                    <>Register Alumni <i className="fas fa-id-badge"></i></>
                                )}
                            </button>

                            <div className="auth-footer" style={{ marginTop: '1.5rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '1s' }}>
                                <p>Already have an account? <Link href="/login">Login here</Link></p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
