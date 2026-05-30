"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, User, Briefcase, FileText, Users,
    LogOut, Search, Bell, MapPin, ChevronDown, X,
    Upload, Send, UserCheck, Loader2
} from "lucide-react";
import { getCompanyLogo } from "../../lib/logo-utils";
import {
    fetchAlumni, postReferral,
    ApiAlumni, fetchStudents, ApiStudent,
    fetchInternships, ApiInternship
} from "../../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Alumni {
    id: number;
    name: string;
    initials: string;
    avatarColor: string;
    avatarBg: string;
    company: string;
    role: string;
    batch: string;
    location: string;
    tags: string[];
    tagColors: { color: string; bg: string }[];
}

// Colour pools for dynamically fetched alumni
const AVATAR_COLOURS = [
    { color: "#1d4ed8", bg: "#dbeafe" },
    { color: "#15803d", bg: "#dcfce7" },
    { color: "#c2410c", bg: "#ffedd5" },
    { color: "#7c3aed", bg: "#ede9fe" },
    { color: "#0e7490", bg: "#cffafe" },
    { color: "#b45309", bg: "#fef3c7" },
];
const TAG_COLOUR_POOL = [
    { color: "#1d4ed8", bg: "#eff6ff" },
    { color: "#7c3aed", bg: "#f5f3ff" },
    { color: "#0f766e", bg: "#f0fdfa" },
    { color: "#15803d", bg: "#dcfce7" },
    { color: "#b45309", bg: "#fef3c7" },
    { color: "#be185d", bg: "#fce7f3" },
];

function apiToAlumni(a: ApiAlumni, idx: number): Alumni {
    const avt = AVATAR_COLOURS[idx % AVATAR_COLOURS.length];
    const initials = a.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return {
        id: a.alumni_id,
        name: a.name,
        initials,
        avatarColor: avt.color,
        avatarBg: avt.bg,
        company: a.company,
        role: a.role,
        batch: a.graduation_year ? `Class of ${a.graduation_year}` : "Alumni",
        location: a.location ?? "—",
        tags: [],
        tagColors: [],
    };
}

const NAV_LINKS = [
    { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
    { label: "Opportunities", href: "/internships", icon: <Briefcase size={18} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={18} /> },
    { label: "Alumni Connect", href: "/alumni", icon: <Users size={18} /> },
];

const FILTER_OPTIONS = [
    { label: "Company", options: ["All", "Google", "Microsoft", "Amazon", "Flipkart", "Razorpay", "CRED"] },
    { label: "Role", options: ["All", "SDE", "Product Manager", "Data Engineer", "UX Designer", "Frontend Lead"] },
    { label: "Location", options: ["All", "Bangalore", "Hyderabad", "Pune", "Mumbai"] },
];

// ─── Alumni Profile Modal ───────────────────────────────────────────────────
const AlumniProfileModal = ({
    alumni,
    onClose,
}: {
    alumni: Alumni;
    onClose: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(15,23,42,0.4)",
                backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 24,
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    background: "#ffffff", borderRadius: 32,
                    boxShadow: "0 40px 100px -20px rgba(15, 23, 42, 0.3)",
                    width: "100%", maxWidth: 500, overflow: "hidden",
                    position: "relative",
                    border: "1px solid rgba(226, 232, 240, 0.8)"
                }}
            >
                {/* Banner/Header */}
                <div style={{ 
                    height: 140, 
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%)", 
                    position: "relative" 
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        opacity: 0.15,
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                    <button 
                        onClick={onClose} 
                        style={{ 
                            position: "absolute", top: 20, right: 20, 
                            width: 36, height: 36, borderRadius: "12px", 
                            border: "none", background: "rgba(255,255,255,0.2)", 
                            color: "#fff", cursor: "pointer", 
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            backdropFilter: "blur(8px)",
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div style={{ padding: "0 40px 40px", marginTop: -50, textAlign: 'center' }}>
                    <div style={{ 
                        width: 100, height: 100, borderRadius: 28, 
                        background: alumni.avatarBg, 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontWeight: 900, fontSize: 36, color: alumni.avatarColor, 
                        margin: '0 auto 20px',
                        border: "6px solid #fff", 
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                        position: 'relative',
                        zIndex: 2
                    }}>
                        {alumni.initials}
                    </div>
                    
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: '-0.5px' }}>{alumni.name}</h2>
                    <p style={{ fontSize: 13, color: "#6366f1", margin: "0 0 28px", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {alumni.role} @ {alumni.company}
                    </p>

                    <div style={{ 
                        display: "grid", gridTemplateColumns: "1fr 1fr", 
                        gap: 20, marginBottom: 32, padding: '20px',
                        background: '#f8fafc', borderRadius: 24,
                        border: '1px solid #f1f5f9'
                    }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Education</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', gap: 8, fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
                                <Briefcase size={14} color="#6366f1" />
                                {alumni.batch}
                            </div>
                        </div>
                        <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Location</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', gap: 8, fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
                                <MapPin size={14} color="#6366f1" />
                                {alumni.location}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 36, textAlign: 'left' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            About
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                        </div>
                        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                            Passionate professional working at {alumni.company}. Excited to help current students with referrals and career guidance. Feel free to reach out for a quick chat!
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <button style={{ 
                            flex: 1, height: 52, borderRadius: 16, 
                            border: "2px solid #e2e8f0", background: "#fff", 
                            color: "#1e293b", fontSize: 14, fontWeight: 800, 
                            cursor: "pointer", fontFamily: "Inter, sans-serif",
                            transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}>
                            Visit LinkedIn
                        </button>
                        <button onClick={onClose} style={{ 
                            flex: 1, height: 52, borderRadius: 16, 
                            border: "none", background: "#3b82f6", 
                            color: "#fff", fontSize: 14, fontWeight: 800, 
                            cursor: "pointer", fontFamily: "Inter, sans-serif",
                            boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.5)',
                            transition: 'all 0.2s ease'
                        }}>
                            Got it
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Referral Modal ──────────────────────────────────────────────────────────
const ReferralModal = ({
    alumni,
    onClose,
}: {
    alumni: Alumni;
    onClose: () => void;
}) => {
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Dynamic Internship Selection ---
    const [internships, setInternships] = useState<ApiInternship[]>([]);
    const [selectedInternshipId, setSelectedInternshipId] = useState<number | "">("");
    const [loadingInternships, setLoadingInternships] = useState(true);

    useEffect(() => {
        fetchInternships()
            .then(data => {
                // Filter internships posted by this alumni
                const postedByThisAlumni = data.filter(i => i.posted_by_id === alumni.id);
                setInternships(postedByThisAlumni);
                if (postedByThisAlumni.length > 0) {
                    setSelectedInternshipId(postedByThisAlumni[0].internship_id);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingInternships(false));
    }, [alumni.id]);

    const handleSend = async () => {
        if (!selectedInternshipId) {
            setError("Please select an internship role.");
            return;
        }

        const userStored = localStorage.getItem("userData");
        if (!userStored) {
            setError("Session not found. Please login again.");
            return;
        }

        setSending(true);
        setError(null);
        try {
            const user = JSON.parse(userStored);
            await postReferral({ 
                student_id: user.id, 
                alumni_id: alumni.id, 
                internship_id: Number(selectedInternshipId), 
                message,
                resume: resumeFile
            });
            setSent(true);
            setTimeout(onClose, 1500);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to send request");
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                background: "rgba(15,23,42,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 24,
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                style={{
                    background: "#ffffff", borderRadius: 18,
                    boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
                    width: "100%", maxWidth: 480, overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Request Referral</h2>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0", fontWeight: 500 }}>
                            {alumni.name} · <span style={{ color: "#2563eb" }}>{alumni.company}</span>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} color="#64748b" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 24px 0" }}>
                    {sent ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "24px 0 36px" }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <UserCheck size={26} color="#16a34a" />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Request Sent!</h3>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Your referral request has been sent to {alumni.name}.</p>
                        </motion.div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Select Internship Role *</label>
                                {loadingInternships ? (
                                    <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 10, fontSize: 13, color: "#94a3b8" }}>Loading roles...</div>
                                ) : internships.length === 0 ? (
                                    <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: 10, fontSize: 13, color: "#dc2626", border: "1px solid #fecaca", fontWeight: 600 }}>This alumni hasn't posted any internships yet.</div>
                                ) : (
                                    <div style={{ position: "relative" }}>
                                        <select 
                                            value={selectedInternshipId} 
                                            onChange={e => setSelectedInternshipId(Number(e.target.value))}
                                            style={{ width: "100%", padding: "10px 14px", fontSize: 13, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none", color: "#1e293b", fontFamily: "Inter, sans-serif", appearance: "none" }}
                                        >
                                            {internships.map(i => (
                                                <option key={i.internship_id} value={i.internship_id}>{i.role} @ {i.company}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Message</label>
                                <textarea placeholder={`Hi ${alumni.name}, I'm interested in an internship at ${alumni.company}...`} value={message} onChange={e => setMessage(e.target.value)} rows={4}
                                    style={{ width: "100%", padding: "10px 14px", fontSize: 13, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, outline: "none", color: "#1e293b", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ marginBottom: 22 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Attach Resume</label>
                                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 14px", border: "1.5px dashed #cbd5e1", borderRadius: 10, background: "#f8fafc", cursor: "pointer", gap: 6 }}>
                                    <Upload size={18} color="#94a3b8" />
                                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{fileName ? fileName : "Click to upload (PDF, max 5MB)"}</span>
                                    <input type="file" accept=".pdf" style={{ display: "none" }} onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFileName(file.name);
                                            setResumeFile(file);
                                        } else {
                                            setFileName(null);
                                            setResumeFile(null);
                                        }
                                    }} />
                                </label>
                            </div>
                            {error && <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>{error}</p>}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!sent && (
                    <div style={{ padding: "16px 24px 22px", display: "flex", gap: 10 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancel</button>
                        <button onClick={handleSend} disabled={!selectedInternshipId || sending || internships.length === 0}
                            style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: (selectedInternshipId && internships.length > 0) ? "#2563eb" : "#93c5fd", color: "#ffffff", fontSize: 13, fontWeight: 700, cursor: (selectedInternshipId && internships.length > 0) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "Inter, sans-serif", transition: "background 0.2s" }}>
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            {sending ? "Sending…" : "Send Request"}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// ─── Alumni Card ─────────────────────────────────────────────────────────────
const AlumniCard = ({ alumni, index, onRequestReferral, onViewProfile }: { alumni: Alumni; index: number; onRequestReferral: (a: Alumni) => void; onViewProfile: (a: Alumni) => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.3 }}
        whileHover={{ y: -4, boxShadow: "0 16px 36px -8px rgba(0,0,0,0.11)" }}
        style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "22px 20px 18px", display: "flex", flexDirection: "column" }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0, background: alumni.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: alumni.avatarColor, border: `2px solid ${alumni.avatarColor}22` }}>
                {alumni.initials}
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{alumni.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    {getCompanyLogo(alumni.company) && (
                        <img src={getCompanyLogo(alumni.company)!} alt={alumni.company} style={{ width: 14, height: 14, objectFit: "contain" }} />
                    )}
                    {alumni.role} · {alumni.company}
                </div>
            </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>{alumni.batch}</span>
            {alumni.location !== "—" && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                    <MapPin size={11} /> {alumni.location}
                </span>
            )}
        </div>

        {alumni.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                {alumni.tags.map((tag, i) => (
                    <span key={tag} style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: alumni.tagColors[i]?.color ?? "#1d4ed8", background: alumni.tagColors[i]?.bg ?? "#eff6ff", border: `1px solid ${alumni.tagColors[i]?.color ?? "#1d4ed8"}33` }}>{tag}</span>
                ))}
            </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <button onClick={() => onViewProfile(alumni)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>View Profile</button>
            <button onClick={() => onRequestReferral(alumni)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", background: "#2563eb", color: "#ffffff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Request Referral</button>
        </div>
    </motion.div>
);

// ─── Filter Dropdown ─────────────────────────────────────────────────────────
const FilterDropdown = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div style={{ position: "relative" }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: "none", padding: "8px 34px 8px 14px", fontSize: 12, fontWeight: 600, color: "#374151", background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 9, cursor: "pointer", outline: "none", fontFamily: "Inter, sans-serif" }}>
            {options.map(o => <option key={o} value={o}>{o === "All" ? label : o}</option>)}
        </select>
        <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AlumniConnectDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ Company: "All", Role: "All", Location: "All" });
    // ── API state ──
    const [alumniData, setAlumniData] = useState<Alumni[]>([]);
    const [student, setStudent] = useState<ApiStudent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [modalAlumni, setModalAlumni] = useState<Alumni | null>(null);
    const [profileModalAlumni, setProfileModalAlumni] = useState<Alumni | null>(null);

    useEffect(() => {
        const userStored = localStorage.getItem("userData");
        let studentId: number | undefined;
        if (userStored) {
            try {
                const user = JSON.parse(userStored);
                if (user.id && user.role === 'student') studentId = user.id;
            } catch (e) {}
        }

        Promise.all([fetchAlumni(), fetchStudents()])
            .then(([alumni, students]) => {
                setAlumniData(alumni.map(apiToAlumni));
                if (studentId) {
                    const currentStudent = students.find(s => s.student_id === studentId);
                    if (currentStudent) setStudent(currentStudent);
                }
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const displayName = student?.name ?? "Arjun Raghav";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();


    const filtered = alumniData.filter(a => {
        const q = search.toLowerCase();
        const matchSearch = !q || a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
        const matchCompany = filters.Company === "All" || a.company === filters.Company;
        const matchRole = filters.Role === "All" || a.role.includes(filters.Role);
        const matchLocation = filters.Location === "All" || a.location === filters.Location;
        return matchSearch && matchCompany && matchRole && matchLocation;
    });

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>

            {/* ── Sidebar ── */}
            <aside style={{ width: sidebarOpen ? 248 : 72, flexShrink: 0, height: "100vh", position: "sticky", top: 0, background: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden" }}>
                <div style={{ padding: "0 20px", height: 72, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Briefcase size={16} color="#fff" /></div>
                    {sidebarOpen && <span style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>Alumnex</span>}
                </div>
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
                    {NAV_LINKS.map(link => {
                        const isActive = link.label === "Alumni Connect";
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

            {/* ── Right Panel ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflowY: "auto" }}>
                <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#ffffff", borderBottom: "1px solid #e2e8f0", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => setSidebarOpen(o => !o)} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "#94a3b8" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                        <div style={{ position: "relative" }}>
                            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <input 
                                type="text" 
                                placeholder="Search alumni, companies..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Referral Request Accepted</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Rahul Sharma has accepted your referral request.</div>
                                            </div>
                                            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc' }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>New Alumni Joined</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>3 new alumni from Google just joined the platform.</div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>View all notifications</span>
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

                <main style={{ flex: 1, padding: "36px 36px 48px", boxSizing: "border-box" }}>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Alumni Connect</h1>
                        <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 500 }}>Connect with alumni and request internship referrals</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={{ position: "relative", marginBottom: 18 }}>
                        <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input type="text" placeholder="Search alumni, companies, or roles..." value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: "100%", paddingLeft: 44, paddingRight: 20, paddingTop: 12, paddingBottom: 12, fontSize: 14, background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 12, outline: "none", color: "#1e293b", fontFamily: "Inter, sans-serif", boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
                        {FILTER_OPTIONS.map(f => (
                            <FilterDropdown key={f.label} label={f.label} options={f.options} value={filters[f.label as keyof typeof filters]} onChange={v => setFilters(prev => ({ ...prev, [f.label]: v }))} />
                        ))}
                        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "flex", alignItems: "center" }}>{filtered.length} alumni found</span>
                    </motion.div>

                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 12, color: "#94a3b8" }}>
                            <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Loading alumni...</span>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "48px 24px", color: "#ef4444" }}>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>⚠️ {error}</p>
                            <p style={{ fontSize: 12, color: "#94a3b8" }}>Make sure the backend is running on http://localhost:5000</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filtered.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "64px 24px", color: "#94a3b8" }}>
                                    <Users size={40} style={{ margin: "0 auto 16px" }} />
                                    <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#475569" }}>No alumni found</p>
                                    <p style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
                                </motion.div>
                            ) : (
                                <div key="grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                                    {filtered.map((a, i) => (
                                        <AlumniCard key={a.id} alumni={a} index={i} onRequestReferral={setModalAlumni} onViewProfile={setProfileModalAlumni} />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </main>
            </div>

            <AnimatePresence>
                {modalAlumni && <ReferralModal alumni={modalAlumni} onClose={() => setModalAlumni(null)} />}
            </AnimatePresence>

            <AnimatePresence>
                {profileModalAlumni && <AlumniProfileModal alumni={profileModalAlumni} onClose={() => setProfileModalAlumni(null)} />}
            </AnimatePresence>
        </div>
    );
}
