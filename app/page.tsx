"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Application } from '@splinetool/runtime';

export default function LandingPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Performance Optimization: Set will-change to hint GPU acceleration
            canvasRef.current.style.willChange = 'transform, opacity';

            const spline = new Application(canvasRef.current);

            spline.load('https://prod.spline.design/oMPSUEdkSyvmOHza/scene.splinecode')
                .then(() => {
                    // 1. First, make sure the UI is usable and the loader is removed
                    if (loaderRef.current) {
                        loaderRef.current.style.opacity = '0';
                        loaderRef.current.style.transition = 'opacity 0.6s ease';
                        setTimeout(() => {
                            if (loaderRef.current) loaderRef.current.style.display = 'none';
                        }, 650);
                    }
                    if (canvasRef.current) {
                        canvasRef.current.style.opacity = '1';
                    }

                    // 2. Rendering Optimization: Force 1.0 pixel ratio for maximum performance 
                    try {
                        const app = spline as any;
                        if (typeof app.setPixelRatio === 'function') app.setPixelRatio(1);
                        if (typeof app.setQuality === 'function') app.setQuality('performance');
                    } catch (e) {
                        // Silicon-valley style silent fail for non-critical optimizations
                    }
                })
                .catch(err => {
                    console.warn('Spline scene failed to load:', err);
                    // Critical fallback: Ensure loader is removed so content is visible
                    if (loaderRef.current) loaderRef.current.style.display = 'none';
                    if (canvasRef.current) canvasRef.current.style.opacity = '0.5'; 
                });
        }
    }, []);

    return (
        <>
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
                        <Link href="#features" className="nav-link">Features</Link>
                        <Link href="#how-it-works" className="nav-link">How It Works</Link>
                        <Link href="#contact" className="nav-link">Contact</Link>
                    </div>

                    <div className="nav-right">
                        <Link href="/login" className="btn-login">Login</Link>
                        <Link href="/student-register" className="btn-primary-small">Get Started</Link>
                    </div>

                    <div className="mobile-menu-btn" id="mobileMenuBtn">
                        <i className="fas fa-bars"></i>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className="mobile-menu" id="mobileMenu">
                <Link href="/" className="mobile-link">Home</Link>
                <Link href="#features" className="mobile-link">Features</Link>
                <Link href="#how-it-works" className="mobile-link">How It Works</Link>
                <Link href="#contact" className="mobile-link">Contact</Link>
                <Link href="/login" className="mobile-link">Login</Link>
                <Link href="/student-register" className="mobile-link">Get Started</Link>
            </div>

            {/* Hero Section */}
            <section className="hero hero-fullscreen-3d">
                {/* CSS Starfield background */}
                <div className="hero-stars" aria-hidden="true">
                    <div className="stars-layer stars-sm"></div>
                    <div className="stars-layer stars-md"></div>
                    <div className="stars-layer stars-lg"></div>
                </div>

                {/* Spline 3D fullscreen background */}
                <div className="spline-bg" id="splineBg">
                    <div className="spline-loader" id="splineLoader" ref={loaderRef}>
                        <div className="spline-loader-inner">
                            <div className="spline-spinner"></div>
                            <p>Loading 3D Scene...</p>
                        </div>
                    </div>
                    <canvas id="splineCanvas" ref={canvasRef}></canvas>
                    {/* Dark overlay to tint the Spline canvas */}
                    <div className="spline-dark-overlay"></div>
                </div>

                {/* Bottom glow orb (EverVault style) */}
                <div className="hero-glow-orb" aria-hidden="true"></div>

                {/* Overlay content */}
                <div className="hero-overlay-content">
                    <div className="hero-badge fadeInUp">
                        <span className="badge-dot"></span>
                        <span className="badge-text">Connecting Future Professionals</span>
                    </div>

                    <h1 className="hero-title textRevealWord">
                        <span className="word-reveal">Bridge</span>
                        <span className="word-reveal">the</span>
                        <span className="word-reveal">Gap</span>
                        <span className="word-reveal">Between</span><br />
                        <span className="highlight-text gradient-glow">Students</span>
                        <span className="word-reveal">and</span>
                        <span className="highlight-text gradient-glow">Alumni</span>
                    </h1>

                    <p className="hero-subtitle textFadeSlideUp">
                        Get direct referrals from alumni for internships at top companies.
                        Build your career with guidance from those who've <span className="highlight-accent-text">walked your path</span>.
                    </p>

                    <div className="hero-cta">
                        <Link href="/student-register" className="btn-primary" data-testid="join-student-btn">
                            <span>Join as Student</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                        <Link href="/alumni-register" className="btn-secondary" data-testid="join-alumni-btn">
                            <span>Join as Alumni</span>
                            <i className="fas fa-user-tie"></i>
                        </Link>
                    </div>

                    <div className="hero-stats hero-stats-dark">
                        <div className="stat-item">
                            <div className="stat-number" data-count="2500">2500</div>
                            <div className="stat-label">Students</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number" data-count="850">850</div>
                            <div className="stat-label">Alumni</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number" data-count="1200">1200</div>
                            <div className="stat-label">Referrals</div>
                        </div>
                    </div>
                </div>

                <div className="scroll-indicator scroll-indicator-light">
                    <div className="mouse"></div>
                    <span>Scroll to explore</span>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="container">
                    <div className="section-header reveal-on-scroll">
                        <h2 className="section-title">Why Choose Alumnex?</h2>
                        <p className="section-subtitle">Everything you need to kickstart your career</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card reveal-on-scroll">
                            <div className="feature-icon"><i className="fas fa-handshake"></i></div>
                            <h3>Direct Alumni Connection</h3>
                            <p>Connect directly with alumni from your college working at top companies worldwide</p>
                        </div>

                        <div className="feature-card reveal-on-scroll">
                            <div className="feature-icon"><i className="fas fa-briefcase"></i></div>
                            <h3>Exclusive Internships</h3>
                            <p>Access internship opportunities shared exclusively by alumni</p>
                        </div>

                        <div className="feature-card reveal-on-scroll">
                            <div className="feature-icon"><i className="fas fa-rocket"></i></div>
                            <h3>Fast Referrals</h3>
                            <p>Get referrals within 48 hours from verified alumni</p>
                        </div>

                        <div className="feature-card reveal-on-scroll">
                            <div className="feature-icon"><i className="fas fa-chart-line"></i></div>
                            <h3>Track Progress</h3>
                            <p>Monitor your applications and referral status in real time</p>
                        </div>

                        <div className="feature-card reveal-on-scroll">
                            <div className="feature-icon"><i className="fas fa-shield-alt"></i></div>
                            <h3>Verified Profiles</h3>
                            <p>All alumni profiles are verified via LinkedIn and email</p>
                        </div>

                        <div className="feature-card reveal-on-scroll">
                            <div className="feature-icon"><i className="fas fa-comments"></i></div>
                            <h3>Mentorship Support</h3>
                            <p>Career guidance and interview prep from professionals</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works" id="how-it-works">
                <div className="container">
                    <div className="section-header reveal-on-scroll">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">Three simple steps to your dream internship</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-item reveal-on-scroll">
                            <div className="step-number">01</div>
                            <div className="step-content">
                                <h3>Create Your Profile</h3>
                                <p>Sign up and tell us about your background, skills, and the career path you want to follow.</p>
                            </div>
                            <div className="step-visual"><i className="fas fa-user-plus"></i></div>
                        </div>
                        <div className="step-item reveal-on-scroll">
                            <div className="step-number">02</div>
                            <div className="step-content">
                                <h3>Connect with Alumni</h3>
                                <p>Browse verified alumni from your college working at companies you are interested in.</p>
                            </div>
                            <div className="step-visual"><i className="fas fa-users"></i></div>
                        </div>
                        <div className="step-item reveal-on-scroll">
                            <div className="step-number">03</div>
                            <div className="step-content">
                                <h3>Secure Referrals</h3>
                                <p>Request referrals and get guidance to fast-track your application process.</p>
                            </div>
                            <div className="step-visual"><i className="fas fa-certificate"></i></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section" id="contact">
                <div className="cta-content container reveal-on-scroll">
                    <h2 className="cta-title">Ready to Bridge the Gap?</h2>
                    <p className="cta-subtitle">Join thousands of students landing internships via alumni referrals.</p>
                    <div className="cta-buttons">
                        <Link href="/student-register" className="btn-primary">Join as Student</Link>
                        <Link href="/alumni-register" className="btn-secondary">Join as Alumni</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#06010e', borderTop: '1px solid rgba(167,139,250,0.15)', padding: '2.5rem 2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Work Sans',sans-serif", color: '#fff' }}>
                        <i className="fas fa-graduation-cap" style={{ color: '#a78bfa' }}></i>
                        <span>Alumnex</span>
                    </div>
                    <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.875rem' }}>© 2026 Alumnex Platform. Bridging students with alumni.</p>
                    <Link href="#contact" style={{ color: '#a78bfa', fontSize: '0.875rem', transition: 'color 0.2s' }}>Contact Support</Link>
                </div>
            </footer>
        </>
    );
}
