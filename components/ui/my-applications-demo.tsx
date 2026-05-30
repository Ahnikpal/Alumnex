"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, User, Briefcase, FileText, Users,
    LogOut, Search, Bell, MapPin, Calendar, Eye, X,
    ChevronRight, Inbox, Loader2
} from "lucide-react";
import { getCompanyLogo } from '../../lib/logo-utils';
import { fetchApplications, mapStatus, formatDate, deleteApplication, ApiApplication, fetchStudents, ApiStudent } from '../../lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────
type DisplayStatus = "Applied" | "Under Review" | "Shortlisted" | "Rejected" | "Accepted";
type FilterTab = DisplayStatus | "All";

interface Application {
    id: number;
    role: string;
    company: string;
    appliedDate: string;
    location: string;
    status: DisplayStatus;
}

function apiToApp(a: ApiApplication): Application {
    return {
        id: a.application_id,
        role: a.role,
        company: a.company,
        appliedDate: formatDate(a.applied_date),
        location: a.internship_location ?? "—",
        status: mapStatus(a.status) as DisplayStatus,
    };
}

const NAV_LINKS = [
    { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
    { label: "Opportunities", href: "/internships", icon: <Briefcase size={18} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={18} /> },
    { label: "Alumni Connect", href: "/alumni", icon: <Users size={18} /> },
];

const FILTER_TABS: FilterTab[] = ["All", "Applied", "Under Review", "Shortlisted", "Rejected", "Accepted"];

const STATUS_CONFIG: Record<DisplayStatus, { color: string; bg: string; border: string }> = {
    "Applied": { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    "Under Review": { color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    "Shortlisted": { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    "Rejected": { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    "Accepted": { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};

const STATS_CONFIG: { status: DisplayStatus; color: string }[] = [
    { status: "Applied", color: "#2563eb" },
    { status: "Under Review", color: "#d97706" },
    { status: "Shortlisted", color: "#16a34a" },
    { status: "Rejected", color: "#dc2626" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: DisplayStatus }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["Applied"];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, whiteSpace: "nowrap" }}>
            {status}
        </span>
    );
};

const DetailsModal = ({ app, onClose }: { app: Application; onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{ background: "#ffffff", borderRadius: 18, width: "100%", maxWidth: 480, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }}
            >
                <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Application Details</h2>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="#64748b" /></button>
                </div>
                <div style={{ padding: "20px 24px 30px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f9ff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                            {getCompanyLogo(app.company) ? (
                                <img src={getCompanyLogo(app.company)!} alt={app.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8, background: "#fff" }} />
                            ) : (
                                <span style={{ fontWeight: 900, fontSize: 20, color: "#2563eb" }}>{app.company[0]}</span>
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{app.role}</h3>
                            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, margin: 0 }}>{app.company}</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>Status</span>
                            <StatusBadge status={app.status} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>Applied On</span>
                            <span style={{ color: "#0f172a", fontWeight: 700 }}>{app.appliedDate}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>Location</span>
                            <span style={{ color: "#0f172a", fontWeight: 700 }}>{app.location}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ApplicationCard = ({ app, index, onWithdraw, onViewDetails }: { app: Application; index: number; onWithdraw: (id: number) => void; onViewDetails: (app: Application) => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ delay: index * 0.06, duration: 0.28 }}
        whileHover={{ y: -3, boxShadow: "0 12px 28px -6px rgba(0,0,0,0.09)" }}
        style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}
    >
        {/* Logo */}
        <div style={{ width: 50, height: 50, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f9ff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {getCompanyLogo(app.company) ? (
                <img src={getCompanyLogo(app.company)!} alt={app.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8, background: "#fff" }} />
            ) : (
                <span style={{ fontWeight: 900, fontSize: 18, color: "#2563eb" }}>{app.company[0]}</span>
            )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{app.role}</span>
                <StatusBadge status={app.status} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>{app.company}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                    <Calendar size={11} /> Applied {app.appliedDate}
                </span>
                {app.location !== "—" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                        <MapPin size={11} /> {app.location}
                    </span>
                )}
            </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => onViewDetails(app)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <Eye size={13} /> View Details
            </button>
            {app.status !== "Rejected" && app.status !== "Accepted" && (
                <button onClick={() => onWithdraw(app.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <X size={13} /> Withdraw
                </button>
            )}
        </div>
    </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MyApplicationsDemo() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [applications, setApplications] = useState<Application[]>([]);
    const [student, setStudent] = useState<ApiStudent | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [detailsApp, setDetailsApp] = useState<Application | null>(null);

    useEffect(() => {
        const userStored = localStorage.getItem("userData");
        if (!userStored) return;
        try {
            const user = JSON.parse(userStored);
            if (user.id && user.role === 'student') {
                Promise.all([fetchApplications(undefined, user.id), fetchStudents()])
                    .then(([apps, students]) => {
                        setApplications(apps.map(apiToApp));
                        const currentStudent = students.find(s => s.student_id === user.id);
                        if (currentStudent) setStudent(currentStudent);
                    })
                    .catch(e => setError(e.message))
                    .finally(() => setLoading(false));
            }
        } catch (e) {}
    }, []);

    const displayName = student?.name ?? "Arjun Raghav";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();


    const filtered = applications.filter(a => {
        const matchesTab = activeFilter === "All" || a.status === activeFilter;
        const matchesSearch = searchQuery === "" || 
                              a.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              a.company.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getCount = (tab: FilterTab) => {
        return applications.filter(a => {
            const matchesTab = tab === "All" || a.status === tab;
            const matchesSearch = searchQuery === "" || 
                                  a.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  a.company.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        }).length;
    };

    const handleWithdraw = async (id: number) => {
        try {
            await deleteApplication(id);
            setApplications(prev => prev.filter(a => a.id !== id));
        } catch (e: any) {
            alert(e.message || "Failed to withdraw application");
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>

            {/* ── Left Sidebar ── */}
            <aside style={{ width: sidebarOpen ? 248 : 72, flexShrink: 0, height: "100vh", position: "sticky", top: 0, background: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden" }}>
                <div style={{ padding: "0 20px", height: 72, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Briefcase size={16} color="#ffffff" /></div>
                    {sidebarOpen && <span style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>Alumnex</span>}
                </div>
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
                    {NAV_LINKS.map(link => {
                        const isActive = link.label === "My Applications";
                        return (
                            <Link key={link.href} href={link.href} title={link.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? "#1d4ed8" : "#64748b", background: isActive ? "#eff6ff" : "transparent", whiteSpace: "nowrap" }}>
                                <span style={{ color: isActive ? "#2563eb" : "#94a3b8", flexShrink: 0 }}>{link.icon}</span>
                                {sidebarOpen && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ padding: "12px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600, color: "#ef4444", whiteSpace: "nowrap" }}>
                        <LogOut size={18} style={{ flexShrink: 0 }} />{sidebarOpen && <span>Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* ── Right Area ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflowY: "auto" }}>
                <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#ffffff", borderBottom: "1px solid #e2e8f0", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => setSidebarOpen(o => !o)} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                        <div style={{ position: "relative" }}>
                            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <input 
                                type="text" 
                                placeholder="Search applications..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, fontSize: 13, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, width: 260, outline: "none", color: "#334155", fontFamily: "Inter, sans-serif" }} 
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ position: "relative" }}>
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
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Status Updated: Google</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Your status has been moved to 'Under Review'.</div>
                                            </div>
                                            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc' }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Deadline Approaching</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Submit your test for Razorpay within 24 hours.</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ width: 1, height: 36, background: "#e2e8f0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{displayName}</div><div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{student?.branch ? `${student.branch} Student` : "B.Tech Student"}</div></div>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #60a5fa, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900, overflow: "hidden" }}>
                                {student?.profile_picture ? (
                                    <img src={`http://localhost:5000${student.profile_picture}`} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: "36px 36px 48px", maxWidth: 1000, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>My Applications</h1>
                        <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 500 }}>Track and manage your internship applications</p>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
                        {STATS_CONFIG.map(({ status, color }) => (
                            <div key={status} style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "16px 20px", textAlign: "center" }}>
                                <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 2 }}>{applications.filter(a => a.status === status).length}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{status}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Filter Tabs */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #e2e8f0", marginBottom: 24, overflowX: "auto" }}>
                        {FILTER_TABS.map(tab => {
                            const isActive = activeFilter === tab;
                            return (
                                <button key={tab} onClick={() => setActiveFilter(tab)} style={{ padding: "10px 18px", fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? "#2563eb" : "#64748b", background: "transparent", border: "none", borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent", marginBottom: -2, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", flexShrink: 0, fontFamily: "Inter, sans-serif" }}>
                                    {tab}
                                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 20, borderRadius: "999px", fontSize: 10, fontWeight: 700, background: isActive ? "#dbeafe" : "#f1f5f9", color: isActive ? "#1d4ed8" : "#94a3b8", padding: "0 6px" }}>{getCount(tab)}</span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 12, color: "#94a3b8" }}>
                            <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Loading applications...</span>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "48px 24px", color: "#ef4444" }}>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>⚠️ {error}</p>
                            <p style={{ fontSize: 12, color: "#94a3b8" }}>Make sure the backend is running on http://localhost:5000</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filtered.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "64px 24px" }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><Inbox size={28} color="#60a5fa" /></div>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>No Applications Yet</h3>
                                    <p style={{ fontSize: 13, color: "#64748b", maxWidth: 260, margin: "0 0 24px", lineHeight: 1.6 }}>You haven't applied to any internships yet. Browse opportunities and apply.</p>
                                    <Link href="/internships" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "#2563eb", color: "#ffffff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                                        Browse Opportunities <ChevronRight size={15} />
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div key="list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {filtered.map((app, i) => <ApplicationCard key={app.id} app={app} index={i} onWithdraw={handleWithdraw} onViewDetails={setDetailsApp} />)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </main>
            </div>

            <AnimatePresence>
                {detailsApp && <DetailsModal app={detailsApp} onClose={() => setDetailsApp(null)} />}
            </AnimatePresence>
        </div>
    );
}
