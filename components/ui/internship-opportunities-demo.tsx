"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, Briefcase, FileText, Users, LogOut,
    Search, Bell, MapPin, Clock, Calendar, Bookmark,
    ChevronDown, Filter, SlidersHorizontal, Check, Loader2
} from 'lucide-react';
import { getCompanyLogo } from '../../lib/logo-utils';
import {
    fetchInternships, postApplication, formatStipend,
    ApiInternship
} from '../../lib/api';

// --- Types ---
interface Opportunity {
    id: number;
    company: string;
    logo: string;
    logoBg: string;
    role: string;
    location: string;
    duration: string;
    stipend: string;
    skills: string[];
    daysLeft: number;
    featured?: boolean;
    logo_url?: string;
}

// Map backend row to display shape
function apiToOpp(i: ApiInternship, idx: number): Opportunity {
    const BG_POOL = ["#4285F4", "#00A4EF", "#FF9900", "#2874F0", "#0C2454", "#000000", "#0078D4", "#E4002B"];
    return {
        id: i.internship_id,
        company: i.company,
        logo: i.company[0] ?? "?",
        logoBg: BG_POOL[idx % BG_POOL.length],
        role: i.role,
        location: i.location ?? "Remote",
        duration: i.duration ?? "N/A",
        stipend: formatStipend(i.stipend),
        skills: [],      // backend doesn't store skills yet; empty gracefully
        daysLeft: 14,    // placeholder until backend exposes deadline
        featured: idx < 2,
        logo_url: i.logo_url
    };
}

const NAV_LINKS = [
    { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
    { label: "Opportunities", href: "/internships", icon: <Briefcase size={18} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={18} /> },
    { label: "Alumni Connect", href: "/alumni", icon: <Users size={18} /> },
];

const FILTER_PILLS = ["Tech", "Design", "Product", "Marketing", "Remote", "Full-time"];

// --- Sub-components ---
const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#64748b', border: `1.5px solid ${active ? '#2563eb' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
        {active && <Check size={14} />}{label}
    </button>
);

const OpportunityCard = ({ job, index, onApply, applying }: { job: Opportunity; index: number; onApply: (id: number) => void; applying: number | null }) => {
    const isApplying = applying === job.id;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
            style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
            {job.featured && (
                <div style={{ position: 'absolute', top: 20, right: 20, padding: '4px 10px', background: '#eff6ff', color: '#2563eb', fontSize: 10, fontWeight: 800, borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Featured</div>
            )}

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: job.logoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {job.logo_url ? (
                        <img src={`http://localhost:5000${job.logo_url}`} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4, background: '#fff' }} />
                    ) : getCompanyLogo(job.company) ? (
                        <img src={getCompanyLogo(job.company)!} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, background: '#fff' }} />
                    ) : (
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{job.logo}</span>
                    )}
                </div>
                <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.role}</h3>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: 0 }}>{job.company}</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#94a3b8' }}><MapPin size={14} /> {job.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#94a3b8' }}><Clock size={14} /> {job.duration}</div>
                <div style={{ padding: '4px 10px', borderRadius: 8, background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 800 }}>{job.stipend}</div>
            </div>

            {job.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                    {job.skills.map(skill => (
                        <span key={skill} style={{ padding: '4px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, color: '#475569' }}>{skill}</span>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="#ef4444" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>{job.daysLeft} days left</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Bookmark size={16} color="#64748b" />
                    </button>
                    <button
                        onClick={() => onApply(job.id)}
                        disabled={isApplying}
                        style={{ padding: '10px 18px', borderRadius: 10, background: isApplying ? '#93c5fd' : '#2563eb', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isApplying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        {isApplying ? <><Loader2 size={13} /> Applying…</> : 'Apply Now'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function InternshipOpportunitiesDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applying, setApplying] = useState<number | null>(null);
    const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
    const [toast, setToast] = useState<string | null>(null);
    const [student, setStudent] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        const userStored = localStorage.getItem("userData");
        if (userStored) {
            try {
                const user = JSON.parse(userStored);
                if (user.id && user.role === 'student') {
                    setStudent({ id: user.id, name: user.name || "Student" });
                }
            } catch (e) {}
        }

        fetchInternships()
            .then(data => setOpportunities(data.map(apiToOpp)))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleApply = async (internship_id: number) => {
        if (!student) return;
        if (appliedIds.has(internship_id)) return;
        setApplying(internship_id);
        try {
            await postApplication(student.id, internship_id);
            setAppliedIds(prev => new Set(prev).add(internship_id));
            setToast("Application submitted! 🎉");
            setTimeout(() => setToast(null), 3000);
        } catch (e: unknown) {
            setToast(e instanceof Error ? e.message : "Failed to apply");
            setTimeout(() => setToast(null), 3000);
        } finally {
            setApplying(null);
        }
    };

    // Filter logic
    const filteredOpportunities = opportunities.filter(job => {
        // 1. Search Query
        const matchesSearch = searchQuery === "" || 
            job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

        // 2. Active Filter Pill
        // Backend `role` string usually contains Tech, Design etc., but since we aren't enforcing strict dictionaries 
        // we do a fuzzy match on the role for demonstration (e.g. "Software" matches "Tech").
        let matchesFilter = true;
        if (activeFilter !== "All") {
             const roleLower = job.role.toLowerCase();
             if (activeFilter === "Tech" && !roleLower.includes("engineer") && !roleLower.includes("developer")) matchesFilter = false;
             if (activeFilter === "Design" && !roleLower.includes("design")) matchesFilter = false;
             if (activeFilter === "Product" && !roleLower.includes("product")) matchesFilter = false;
             if (activeFilter === "Remote" && job.location.toLowerCase() !== "remote") matchesFilter = false;
             // Add more robust matching if backend categorizes them strictly
        }

        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ position: 'fixed', top: 24, right: 24, zIndex: 100, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside style={{ width: sidebarOpen ? 248 : 80, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }}>
                <div style={{ padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={16} color="#fff" /></div>
                    {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>Alumnex</span>}
                </div>
                <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {NAV_LINKS.map(link => {
                        const isActive = link.label === "Opportunities";
                        return (
                            <Link key={link.href} href={link.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 700 : 600, color: isActive ? '#2563eb' : '#64748b', background: isActive ? '#eff6ff' : 'transparent' }}>
                                <span style={{ color: isActive ? '#2563eb' : '#94a3b8' }}>{link.icon}</span>
                                {sidebarOpen && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ padding: '14px', borderTop: '1px solid #e2e8f0' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 600, color: '#ef4444' }}>
                        <LogOut size={18} />{sidebarOpen && <span>Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <header style={{ height: 72, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><SlidersHorizontal size={20} /></button>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text" 
                                placeholder="Search by role, company, or skill..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '10px 16px 10px 38px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: 13, width: 340, outline: 'none', color: '#334155' }} 
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{opportunities.length}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Active Roles</span>
                            </div>
                            <div style={{ height: 24, width: 1, background: '#e2e8f0' }} />
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>{appliedIds.size}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Applied</span>
                            </div>
                        </div>
                        <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 8, cursor: 'pointer', position: 'relative' }}>
                            <Bell size={20} color="#64748b" />
                            <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
                        </button>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>
                            {student?.name ? student.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ST"}
                        </div>
                    </div>
                </header>

                <main style={{ padding: 40, overflowY: 'auto' }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.6px' }}>Internship Opportunities</h1>
                        <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, margin: 0 }}>Discover internships matched to your profile and skills</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <FilterPill label="All" active={activeFilter === "All"} onClick={() => setActiveFilter("All")} />
                            {FILTER_PILLS.map(pill => <FilterPill key={pill} label={pill} active={activeFilter === pill} onClick={() => setActiveFilter(pill)} />)}
                            <button style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: '#fff', color: '#0f172a', border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Filter size={16} /> More Filters
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                            Sort by: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', cursor: 'pointer' }}>Most Recent <ChevronDown size={16} /></div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 12, color: '#94a3b8' }}>
                            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Loading internships...</span>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#ef4444' }}>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>⚠️ {error}</p>
                            <p style={{ fontSize: 12, color: '#94a3b8' }}>Make sure the backend is running on http://localhost:5000</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                            {filteredOpportunities.length > 0 ? (
                                filteredOpportunities.map((job, idx) => (
                                    <OpportunityCard key={job.id} job={job} index={idx} onApply={handleApply} applying={applying} />
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', color: '#94a3b8' }}>
                                    <h3 style={{ fontSize: 18, color: '#1e293b', fontWeight: 800, marginBottom: 8 }}>No internships found</h3>
                                    <p style={{ fontSize: 14 }}>Try adjusting your filters or search query.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
