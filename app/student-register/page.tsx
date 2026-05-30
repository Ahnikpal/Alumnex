"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentRegisterPage() {
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
        const branch = (formData.get('branch') as string) || '';
        const college = (formData.get('university') as string) || 'SRM University';
        const cgpa = parseFloat(formData.get('cgpa') as string) || null;
        const location = (formData.get('city') as string) || '';

        try {
            const res = await fetch('http://localhost:5000/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, branch, college, cgpa, location }),
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
                            <div className="brand-badge">Student Portal</div>
                            <h2 className="brand-title">Join the <span className="highlight">Future</span> of Internships</h2>
                            <p className="brand-text">Create your profile to access exclusive referrals and mentorship.</p>
                        </div>
                        <div className="brand-media" style={{ marginTop: '2rem' }}>
                            <div className="floating-icons">
                                <i className="fas fa-graduation-cap icon-1"></i>
                                <i className="fas fa-laptop-code icon-2"></i>
                                <i className="fas fa-brain icon-3"></i>
                            </div>
                        </div>
                    </div>

                    {/* Right Auth Panel */}
                    <div className="login-auth-panel" style={{ width: 'auto', flex: 1.2, padding: '3rem' }}>
                        <div className="auth-header" style={{ animation: 'revealIn 0.8s ease-out both' }}>
                            <h1>Create Account</h1>
                            <p>Enter your details to get started</p>
                        </div>

                        <div className="auth-type-selector" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.2s' }}>
                            <div className="type-tab active">Student</div>
                            <Link href="/alumni-register" className="type-tab text-center">Alumni</Link>
                            <div className="tab-glider"></div>
                        </div>

                        <form className="auth-form" onSubmit={handleRegisterSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.4s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Full Name</label>
                                    <input type="text" name="fullName" placeholder="Enter your full name" required />
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Register Number</label>
                                    <input type="text" name="registerNumber" placeholder="e.g. RA211100..." required />
                                </div>
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.5s' }}>
                                <label>College Email</label>
                                <input type="email" name="email" placeholder="yourname@college.edu" required />
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.6s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Branch</label>
                                    <select className="custom-select" name="branch" required style={{ width: '100%', padding: '1rem', background: 'rgba(15, 12, 41, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', color: '#fff' }}>
                                        <option value="">Select Branch</option>
                                        <option value="CSE">Computer Science</option>
                                        <option value="ECE">Electronics</option>
                                        <option value="MECH">Mechanical</option>
                                    </select>
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Year</label>
                                    <select className="custom-select" name="year" required style={{ width: '100%', padding: '1rem', background: 'rgba(15, 12, 41, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', color: '#fff' }}>
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '0.7s' }}>
                                <label>SRM University Campus</label>
                                <select className="custom-select" name="university" required style={{ width: '100%', padding: '1rem', background: 'rgba(15, 12, 41, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', color: '#fff' }}>
                                    <option value="">Select Campus</option>
                                    <option>SRM KTR CAMPUS</option>
                                    <option>SRM NCR CAMPUS</option>
                                    <option>SRM AP CAMPUS</option>
                                    <option>SRM RAMAPURAM CAMPUS</option>
                                </select>
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.8s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>City</label>
                                    <input type="text" name="city" placeholder="e.g. Chennai" required />
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>CGPA</label>
                                    <input type="number" name="cgpa" step="0.01" min="0" max="10" placeholder="e.g. 9.5" required />
                                </div>
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '0.9s' }}>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Contact Number</label>
                                    <input type="tel" name="phone" placeholder="+91 00000 00000" required />
                                </div>
                                <div className="form-control" style={{ flex: 1 }}>
                                    <label>Password</label>
                                    <input type="password" name="password" placeholder="••••••••" required />
                                </div>
                            </div>

                            <div className="form-control" style={{ animation: 'revealIn 0.8s ease-out both', animationDelay: '1s' }}>
                                <label>Confirm Password</label>
                                <input type="password" name="confirmPassword" placeholder="••••••••" required />
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

                            <button type="submit" className="btn-submit-glow" style={{ marginTop: '1rem', animationDelay: '1s' }} disabled={isRegistering || success}>
                                {isRegistering && !success ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Creating Account...</>
                                ) : success ? (
                                    <><i className="fas fa-check"></i> Redirecting...</>
                                ) : (
                                    <>Create Account <i className="fas fa-user-plus"></i></>
                                )}
                            </button>

                            <div className="auth-footer" style={{ marginTop: '1.5rem', animation: 'revealIn 0.8s ease-out both', animationDelay: '1.1s' }}>
                                <p>Already have an account? <Link href="/login">Login here</Link></p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
