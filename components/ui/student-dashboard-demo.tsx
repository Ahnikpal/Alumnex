"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, Briefcase, FileText, Users, LogOut,
    Search, Bell, Send, Clock, CheckCircle, Eye,
    ArrowUpRight, MapPin, ExternalLink, ChevronRight,
    TrendingUp, Award, MoreHorizontal, Loader2
} from 'lucide-react';
import { getCompanyLogo } from '../../lib/logo-utils';
import { fetchApplications, fetchInternships, mapStatus, formatStipend, postApplication, ApiInternship, fetchStudents, ApiStudent, fetchStudentById } from '../../lib/api';
import { useRouter } from 'next/navigation';

// --- Data Types ---
interface DashMetric {
    title: string;
    value: string;
    trend: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

interface RecommendedJob {
    company: string;
    logo: string;
    logoBg: string;
    role: string;
    location: string;
    duration: string;
    stipend: string;
}

interface RecentApp {
    company: string;
    role: string;
    date: string;
    status: 'Applied' | 'Under Review' | 'Shortlisted';
    referral: string;
}

// --- Static metric definitions (values are overridden live) ---
const METRIC_DEFS = [
    { title: "Applications Sent", key: "applied", icon: <Send size={20} />, iconBg: "#eff6ff", iconColor: "#2563eb" },
    { title: "Under Review", key: "review", icon: <Clock size={20} />, iconBg: "#fffbeb", iconColor: "#d97706" },
    { title: "Shortlisted", key: "shortlist", icon: <CheckCircle size={20} />, iconBg: "#f0fdf4", iconColor: "#16a34a" },
    { title: "Profile Views", key: "views", icon: <Eye size={20} />, iconBg: "#f5f3ff", iconColor: "#7c3aed" },
];

const BG_POOL = ["#4285F4", "#00A4EF", "#FF9900", "#2874F0", "#0C2454", "#000000"];
function apiToJob(i: ApiInternship, idx: number): RecommendedJob {
    return {
        company: i.company,
        logo: i.company[0] ?? "?",
        logoBg: BG_POOL[idx % BG_POOL.length],
        role: i.role,
        location: i.location ?? "Remote",
        duration: i.duration ?? "N/A",
        stipend: formatStipend(i.stipend),
    };
}

const RECENT_APPS: RecentApp[] = [
    { company: "Amazon", role: "SDE Intern", date: "Today", status: 'Under Review', referral: "Rohit S. (Alumni)" },
    { company: "Flipkart", role: "Data Science Intern", date: "2 days ago", status: 'Applied', referral: "Deepika M. (SDE 2)" },
    { company: "Razorpay", role: "Frontend Intern", date: "5 days ago", status: 'Shortlisted', referral: "Karan T. (Frontend Lead)" },
];

const ALUMNI_QUICK: { name: string; role: string; company: string; initials: string; bg: string }[] = [
    { name: "Priya Sharma", role: "SDE", company: "Google", initials: "PS", bg: "#dbeafe" },
    { name: "Amit Kumar", role: "PM", company: "Microsoft", initials: "AK", bg: "#dcfce7" },
    { name: "Neha Reddy", role: "UI/UX", company: "Atlassian", initials: "NR", bg: "#fef3c7" },
];

const NAV_LINKS = [
    { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
    { label: "Opportunities", href: "/internships", icon: <Briefcase size={18} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={18} /> },
    { label: "Alumni Connect", href: "/alumni", icon: <Users size={18} /> },
];

// --- Sub-components ---
const StatusBadge = ({ status }: { status: RecentApp['status'] }) => {
    const styles = {
        'Applied': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
        'Under Review': { bg: '#fffbeb', color: '#b45309', border: '#fef3c7' },
        'Shortlisted': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
        'Rejected': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
        'Accepted': { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    }[status] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };

    return (
        <span style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`
        }}>
            {status}
        </span>
    );
};

export default function StudentDashboardDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [student, setStudent] = useState<ApiStudent | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [stats, setStats] = useState({ applied: 0, review: 0, shortlist: 0, views: 142 });
    const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
    const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [applyingTo, setApplyingTo] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem("userData");
        if (!stored) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(stored);
        const loggedInId = userData.id;

        if (!loggedInId || userData.role !== 'student') {
            router.push('/login');
            return;
        }

        const loadDashboardData = () => {
            setLoadingStats(true);
            Promise.all([
                fetchApplications(undefined, loggedInId), 
                fetchInternships(), 
                fetchStudentById(loggedInId)
            ]).then(([apps, internships, studentData]) => {
                setStudent(studentData);
                const mapped = apps.map(a => mapStatus(a.status));
                setStats({
                    applied: mapped.length, 
                    review: mapped.filter(s => s === 'Under Review').length,
                    shortlist: mapped.filter(s => s === 'Shortlisted').length,
                    views: 142,
                });
                setRecentApps(
                    apps.slice(0, 3).map(a => ({
                        company: a.company,
                        role: a.role,
                        date: new Date(a.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                        status: mapStatus(a.status) as RecentApp['status'],
                        referral: '—',
                    }))
                );
                setRecommendedJobs(internships.slice(0, 2).map(apiToJob));
            }).catch((err) => { 
                console.error("Dashboard load error:", err);
            }).finally(() => setLoadingStats(false));
        };

        loadDashboardData();

        // Listen for profile updates
        window.addEventListener("profileUpdate", loadDashboardData);
        return () => window.removeEventListener("profileUpdate", loadDashboardData);
    }, [router]);

    const handleApply = async (companyName: string) => {
        setApplyingTo(companyName);
        try {
            // Find the internship id (assuming we want to find the first match by company)
            // Realistically, the RecommendedJob interface should hold the DB `id`, but we'll lookup for now.
            const internships = await fetchInternships();
            const job = internships.find(i => i.company === companyName);
            if (job && student) {
                await postApplication(student.student_id, job.internship_id);
                setToastMessage(`Successfully applied to ${companyName}!`);
                // Update stats locally
                setStats(prev => ({ ...prev, applied: prev.applied + 1 }));
            } else {
                setToastMessage(`Failed to find internship for ${companyName}`);
            }
        } catch (e: any) {
            setToastMessage(e.message || "Failed to submit application");
        } finally {
            setApplyingTo(null);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const displayName = student?.name ?? "Arjun Raghav";
    const firstName = displayName.split(" ")[0];
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Toast */}
            {toastMessage && (
                <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 100, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 600, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)', transition: 'all 0.3s ease' }}>
                    {toastMessage}
                </div>
            )}

            {/* --- Sidebar --- */}
            <aside style={{
                width: sidebarOpen ? 248 : 80, flexShrink: 0,
                height: '100vh', position: 'sticky', top: 0,
                background: '#ffffff', borderRight: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden'
            }}>
                <div style={{ padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={16} color="#fff" />
                    </div>
                    {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>Alumnex</span>}
                </div>

                <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {NAV_LINKS.map(link => {
                        const isActive = link.label === "Dashboard";
                        return (
                            <Link key={link.href} href={link.href} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 700 : 600,
                                color: isActive ? '#2563eb' : '#64748b', background: isActive ? '#eff6ff' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                                <span style={{ color: isActive ? '#2563eb' : '#94a3b8' }}>{link.icon}</span>
                                {sidebarOpen && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '14px', borderTop: '1px solid #e2e8f0' }}>
                    <Link href="/" style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 600, color: '#ef4444'
                    }}>
                        <LogOut size={18} />
                        {sidebarOpen && <span>Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Top Header */}
                <header style={{
                    height: 72, background: '#fff', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 32px', position: 'sticky', top: 0, zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Search internships..." style={{
                                padding: '10px 16px 10px 38px', borderRadius: 12, border: '1px solid #e2e8f0',
                                background: '#f1f5f9', fontSize: 13, width: 300, outline: 'none', color: '#334155'
                            }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ position: "relative", padding: 8, borderRadius: 10, border: "none", background: "#f8fafc", cursor: "pointer", display: "flex", transition: 'background 0.2s' }}
                            >
                                <Bell size={19} color="#64748b" />
                                <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "2px solid white" }} />
                            </button>
                            
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, width: 300, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', zIndex: 100, overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Notifications</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>Mark all read</span>
                                        </div>
                                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', background: '#eff6ff' }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Application Shortlisted!</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Your application for Google has been shortlisted for an interview.</div>
                                            </div>
                                            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc' }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>New Opportunity</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>A new SDE Intern role was posted by Microsoft.</div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>View all notifications</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ height: 32, width: 1, background: '#e2e8f0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{displayName}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{student?.branch ? `${student.branch} Student` : "B.Tech Student"}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, overflow: 'hidden' }}>
                                {student?.profile_picture ? (
                                    <img src={`http://localhost:5000${student.profile_picture}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dash Content */}
                <main style={{ padding: 40, overflowY: 'auto' }}>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Good Evening, {firstName} 👋</h1>
                        <p style={{ fontSize: 14, color: '#64748b', margin: 0, fontWeight: 500 }}>Here's your application activity at a glance.</p>
                    </motion.div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
                        {METRIC_DEFS.map((m, idx) => {
                            const val = m.key === 'applied' ? stats.applied : m.key === 'review' ? stats.review : m.key === 'shortlist' ? stats.shortlist : stats.views;
                            return (
                                <motion.div key={m.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} style={{ background: '#fff', padding: 24, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: m.iconBg, color: m.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                        {m.icon}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{m.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                        {loadingStats ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#94a3b8' }} /> : <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{val}</span>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Two Columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32 }}>

                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                            {/* Recommended */}
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Recommended Internships</h2>
                                    <Link href="/internships" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        View all <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    {recommendedJobs.map((job, idx) => (
                                        <motion.div key={`${job.company}-${idx}`} whileHover={{ y: -4 }} style={{
                                            background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                                <div style={{
                                                    width: 48, height: 48, borderRadius: 12, background: job.logoBg,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    overflow: 'hidden', position: 'relative'
                                                }}>
                                                    {getCompanyLogo(job.company) ? (
                                                        <motion.img
                                                            src={getCompanyLogo(job.company)!}
                                                            alt={job.company}
                                                            whileHover={{ scale: 1.1 }}
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, background: '#fff' }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{job.logo}</span>
                                                    )}
                                                </div>
                                                <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <MoreHorizontal size={16} color="#94a3b8" />
                                                </button>
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{job.role}</h3>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 16px' }}>{job.company}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                                    <MapPin size={14} /> {job.location}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                                    <Clock size={14} /> {job.duration}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a' }}>{job.stipend}</div>
                                                <button 
                                                    onClick={() => handleApply(job.company)}
                                                    disabled={applyingTo === job.company}
                                                    style={{ padding: '8px 16px', borderRadius: 10, background: applyingTo === job.company ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: applyingTo === job.company ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    {applyingTo === job.company ? <Loader2 size={12} className="animate-spin" /> : null} Apply Now
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Recent Applications */}
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Applications</h2>
                                    <Link href="/applications" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>See Track Record</Link>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>COMPANY</th>
                                                <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>ROLE</th>
                                                <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>DATE</th>
                                                <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>STATUS</th>
                                                <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>REFERRAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentApps.map((app, i) => (
                                                <tr key={i} style={{ borderBottom: i === recentApps.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '18px 24px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{app.company}</td>
                                                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#475569', fontWeight: 600 }}>{app.role}</td>
                                                    <td style={{ padding: '18px 24px', fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{app.date}</td>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        <StatusBadge status={app.status} />
                                                    </td>
                                                    <td style={{ padding: '18px 24px', fontSize: 12, color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Award size={14} /> {app.referral}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                            {/* Profile Strength */}
                            <div style={{ padding: 28, background: '#ffffff', borderRadius: 24, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Profile Strength</h3>
                                <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px' }}>
                                    <svg width="140" height="140" viewBox="0 0 140 140">
                                        <circle cx="70" cy="70" r="58" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                        <circle cx="70" cy="70" r="58" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray="364.4" strokeDashoffset="65" strokeLinecap="round" transform="rotate(-90 70 70)" />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>82%</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Excellent</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, margin: '0 0 24px' }}>Add your certification to reach 90% and unlock premium badges.</p>
                                <button onClick={() => window.location.href='/profile'} style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#2563eb', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>Complete Profile</button>
                            </div>

                            {/* Alumni Quick Connect */}
                            <div style={{ padding: 28, background: '#ffffff', borderRadius: 24, border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Alumni Connections</h3>
                                    <Link href="/alumni" style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>See All</Link>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {ALUMNI_QUICK.map((alumni, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: alumni.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                                                    {alumni.initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{alumni.name}</div>
                                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{alumni.role} @ {alumni.company}</div>
                                                </div>
                                            </div>
                                            <button style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Connect</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <TrendingUp size={16} color="#2563eb" />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Connections increased by 20% this week</span>
                                </div>
                            </div>

                        </div>

                    </div>

                </main>
            </div>
        </div>
    );
}
