"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, User, Briefcase, FileText, Users,
    LogOut, Search, Bell, MapPin, Globe, Linkedin,
    Github, Edit3, GraduationCap, Code, BriefcaseBusiness,
    Award, ExternalLink, Mail, Phone, ChevronRight
} from "lucide-react";
import { getCompanyLogo } from "../../lib/logo-utils";
import { fetchStudents, updateStudent, fetchStudentById, ApiStudent, uploadStudentFiles } from "../../lib/api";
import { X, Loader2, Check, Camera, FileUp } from "lucide-react";

// --- Types ---
interface SkillGroup {
    category: string;
    skills: string[];
    color: string;
}

// --- Data ---
const SKILLS: SkillGroup[] = [
    { category: "Languages", skills: ["Python", "Java", "JavaScript", "C++"], color: "#2563eb" },
    { category: "Frameworks", skills: ["React", "Next.js", "Node.js", "Express"], color: "#7c3aed" },
    { category: "Tools", skills: ["AWS", "Docker", "Git", "PostgreSQL"], color: "#0f766e" },
];

const NAV_LINKS = [
    { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
    { label: "Opportunities", href: "/internships", icon: <Briefcase size={18} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={18} /> },
    { label: "Alumni Connect", href: "/alumni", icon: <Users size={18} /> },
];

const EditProfileModal = ({ student, onClose, onSave }: { student: ApiStudent; onClose: () => void; onSave: (data: Partial<ApiStudent>) => Promise<void> }) => {
    const [formData, setFormData] = useState({
        name: student.name || "",
        college: student.college || "",
        branch: student.branch || "",
        location: student.location || "",
        about_me: student.about_me || "",
        skills: student.skills || "",
        github_link: student.github_link || "",
        linkedin_link: student.linkedin_link || "",
        portfolio_link: student.portfolio_link || "",
        cgpa: student.cgpa?.toString() || "",
        profile_picture: student.profile_picture || "",
        identity_url: student.identity_url || ""
    });
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [identityFile, setIdentityFile] = useState<File | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState(student.profile_picture || "");
    const [saving, setSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'identity' | 'resume') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'profile') {
            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePicPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else if (type === 'resume') {
            setResumeFile(file);
        } else {
            setIdentityFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let uploadedUrls = {};
            if (profilePicFile || identityFile || resumeFile) {
                uploadedUrls = await uploadStudentFiles(student.student_id, {
                    profile_picture: profilePicFile || undefined,
                    identity_url: identityFile || undefined,
                    resume: resumeFile || undefined
                });
            }

            await onSave({
                ...formData,
                ...uploadedUrls,
                cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined
            });
            onClose();
        } catch (err) {
            alert("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }}
            >
                <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Edit Profile</h2>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} color="#64748b" /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
                    {/* Profile Picture Upload */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                        <div style={{ position: "relative" }}>
                            <div style={{ 
                                width: 100, height: 100, borderRadius: "50%", 
                                border: "4px solid #f1f5f9", overflow: "hidden", 
                                background: "#f8fafc", display: "flex", 
                                alignItems: "center", justifyContent: "center" 
                            }}>
                                {profilePicPreview ? (
                                    <img src={profilePicPreview.startsWith('http') || profilePicPreview.startsWith('/') ? (profilePicPreview.startsWith('/') ? `http://localhost:5000${profilePicPreview}` : profilePicPreview) : profilePicPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <User size={40} color="#cbd5e1" />
                                )}
                            </div>
                            <label style={{ 
                                position: "absolute", bottom: 0, right: 0, 
                                width: 32, height: 32, borderRadius: "50%", 
                                background: "#2563eb", display: "flex", 
                                alignItems: "center", justifyContent: "center", 
                                cursor: "pointer", border: "2px solid #fff", color: "#fff" 
                            }}>
                                <Camera size={16} />
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'profile')} style={{ display: "none" }} />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Full Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Location</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>College</label>
                            <input type="text" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Branch</label>
                            <input type="text" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>CGPA</label>
                            <input type="number" step="0.01" value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>About Me</label>
                        <textarea rows={4} value={formData.about_me} onChange={e => setFormData({ ...formData, about_me: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", color: "#0f172a" }} placeholder="Speak about your journey, interests and goals..." />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Skills (comma separated)</label>
                        <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} placeholder="React, Node.js, Python, Figma..." />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>GitHub Link</label>
                            <input type="url" value={formData.github_link} onChange={e => setFormData({ ...formData, github_link: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>LinkedIn Link</label>
                            <input type="url" value={formData.linkedin_link} onChange={e => setFormData({ ...formData, linkedin_link: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0f172a" }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Identity Document (ID Card/Verification)</label>
                        <div style={{ 
                            border: "1.5px dashed #e2e8f0", borderRadius: 12, padding: "16px",
                            display: "flex", alignItems: "center", gap: 12, background: "#f8fafc"
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                                <FileUp size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{identityFile ? identityFile.name : (student.identity_url ? "identity_document.pdf" : "Upload Identity document")}</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>PDF, PNG, JPG up to 5MB</div>
                            </div>
                            <label style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                                Choose File
                                <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'identity')} style={{ display: "none" }} />
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Resume (PDF)</label>
                        <div style={{ 
                            border: "1.5px dashed #e2e8f0", borderRadius: 12, padding: "16px",
                            display: "flex", alignItems: "center", gap: 12, background: "#f8fafc"
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                                <FileText size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{resumeFile ? resumeFile.name : (student.resume_url ? "current_resume.pdf" : "Upload Resume")}</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>PDF up to 5MB</div>
                            </div>
                            <label style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                                Choose File
                                <input type="file" accept="application/pdf" onChange={e => handleFileChange(e, 'resume')} style={{ display: "none" }} />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 10 }}>
                        <button type="button" onClick={onClose} style={{ padding: "10px 24px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: "10px 32px", borderRadius: 12, border: "none", background: "#2563eb", fontSize: 14, fontWeight: 700, color: "#fff", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// --- Main Component ---
export default function StudentProfileDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [student, setStudent] = useState<ApiStudent | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadData = (id: number) => {
        fetchStudentById(id).then(setStudent).catch(console.error);
    };

    useEffect(() => {
        const userStored = localStorage.getItem("userData");
        if (userStored) {
            try {
                const user = JSON.parse(userStored);
                if (user.id && user.role === 'student') {
                    loadData(user.id);
                }
            } catch (e) {
                console.error("Failed to parse userData", e);
            }
        }
    }, []);

    const handleSave = async (data: Partial<ApiStudent>) => {
        if (!student) return;
        try {
            await updateStudent(student.student_id, data);
            
            // Refresh local state
            const updated = { ...student, ...data };
            setStudent(updated);

            // Sync with localStorage
            const stored = localStorage.getItem("userData");
            if (stored) {
                const sessionData = JSON.parse(stored);
                if (data.name) sessionData.fullName = data.name;
                if (data.profile_picture) sessionData.profile_picture = data.profile_picture;
                localStorage.setItem("userData", JSON.stringify(sessionData));
                
                // Notify other components
                window.dispatchEvent(new Event("profileUpdate"));
            }
        } catch (err) {
            console.error("Save error:", err);
            throw err;
        }
    };

    const displayName = student?.name ?? "Student";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const displayCollege = student ? `${student.branch || "Student"} at ${student.college || "University"}` : "Student Profile";
    const displayLocation = student?.location ?? "Location not set";
    const displayGPA = student?.cgpa ? `GPA: ${student.cgpa} / 10` : "GPA: —";

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>

            {/* --- Sidebar --- */}
            <aside style={{
                width: sidebarOpen ? 248 : 72, flexShrink: 0,
                height: "100vh", position: "sticky", top: 0,
                background: "#ffffff", borderRight: "1px solid #e2e8f0",
                display: "flex", flexDirection: "column",
                transition: "width 0.3s ease", overflow: "hidden",
            }}>
                <div style={{ padding: "0 20px", height: 72, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Briefcase size={16} color="#fff" />
                    </div>
                    {sidebarOpen && <span style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>Alumnex</span>}
                </div>
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
                    {NAV_LINKS.map(link => {
                        const isActive = link.label === "Profile";
                        return (
                            <Link key={link.href} href={link.href} title={link.label} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                                fontSize: 13, fontWeight: isActive ? 700 : 600,
                                color: isActive ? "#1d4ed8" : "#64748b",
                                background: isActive ? "#eff6ff" : "transparent",
                                whiteSpace: "nowrap",
                            }}>
                                <span style={{ color: isActive ? "#2563eb" : "#94a3b8", flexShrink: 0 }}>{link.icon}</span>
                                {sidebarOpen && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ padding: "12px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600, color: "#ef4444", whiteSpace: "nowrap" }}>
                        <LogOut size={18} style={{ flexShrink: 0 }} />
                        {sidebarOpen && <span>Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* --- Right Panel --- */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflowY: "auto" }}>

                {/* Top Nav */}
                <header style={{
                    position: "sticky", top: 0, zIndex: 20,
                    background: "#ffffff", borderBottom: "1px solid #e2e8f0",
                    height: 72, display: "flex", alignItems: "center",
                    justifyContent: "space-between", padding: "0 28px", gap: 16,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => setSidebarOpen(o => !o)} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "#94a3b8" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <div style={{ position: "relative" }}>
                            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <input type="text" placeholder="Search internships, companies..." style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, fontSize: 13, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, width: 260, outline: "none", color: "#334155", fontFamily: "Inter, sans-serif" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button style={{ position: "relative", padding: 8, borderRadius: 10, border: "none", background: "#f8fafc", cursor: "pointer", display: "flex" }}>
                            <Bell size={19} color="#64748b" />
                            <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "2px solid white" }} />
                        </button>
                        <div style={{ width: 1, height: 36, background: "#e2e8f0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{displayName}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{student?.branch ? `${student.branch} Student` : "B.Tech Student"}</div>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900, overflow: "hidden" }}>
                                {student?.profile_picture ? (
                                    <img src={`http://localhost:5000${student.profile_picture}`} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{ flex: 1, padding: "36px", boxSizing: "border-box" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>

                        {/* --- Left Column --- */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                            {/* Profile Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: "#ffffff", borderRadius: 20,
                                    border: "1px solid #e2e8f0", padding: "32px 24px",
                                    textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                }}
                            >
                                <div style={{
                                    width: 96, height: 96, borderRadius: "50%",
                                    margin: "0 auto 20px", padding: 3,
                                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "#2563eb" }}>
                                        {student?.profile_picture ? (
                                            <img src={`http://localhost:5000${student.profile_picture}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                </div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{displayName}</h2>
                                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 12px", fontWeight: 500 }}>{displayCollege}</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                                    <MapPin size={14} /> {displayLocation}
                                </div>

                                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                                    {[
                                        { Icon: Linkedin, href: student?.linkedin_link },
                                        { Icon: Github, href: student?.github_link },
                                        { Icon: Globe, href: student?.portfolio_link }
                                    ].map((item, i) => (
                                        item.href ? (
                                            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                                                <item.Icon size={18} />
                                            </a>
                                        ) : (
                                            <div key={i} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", opacity: 0.4, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                                                <item.Icon size={18} />
                                            </div>
                                        )
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setIsEditModalOpen(true)}
                                    style={{
                                        width: "100%", padding: "12px", borderRadius: 12,
                                        background: "#2563eb", color: "#fff", border: "none",
                                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                                    }}
                                >
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            </motion.div>

                            {/* Skills Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{
                                    background: "#ffffff", borderRadius: 20,
                                    border: "1px solid #e2e8f0", padding: "28px",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                }}
                            >
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <Code size={18} color="#2563eb" /> Skills & Tech DNA
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                    {student?.skills ? (
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.5px" }}>Core Competencies</div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                {student.skills.split(",").map(skill => (
                                                    <span key={skill.trim()} style={{
                                                        padding: "6px 14px", borderRadius: 10,
                                                        background: `#2563eb08`, border: `1px solid #2563eb22`,
                                                        fontSize: 12, fontWeight: 700, color: "#2563eb"
                                                    }}>
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        SKILLS.map(group => (
                                            <div key={group.category}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.5px" }}>{group.category}</div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                    {group.skills.map(skill => (
                                                        <span key={skill} style={{
                                                            padding: "6px 14px", borderRadius: 10,
                                                            background: `${group.color}08`, border: `1px solid ${group.color}22`,
                                                            fontSize: 12, fontWeight: 700, color: group.color
                                                        }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* --- Right Column --- */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                            {/* About Me */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                style={{
                                    background: "#ffffff", borderRadius: 20,
                                    border: "1px solid #e2e8f0", padding: "32px",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                }}
                            >
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>About Me</h3>
                                <div style={{ fontSize: 15, color: "#475569", lineHeight: "1.7", fontWeight: 500 }}>
                                    {student?.about_me ? (
                                        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{student.about_me}</p>
                                    ) : (
                                        <>
                                            <p style={{ margin: "0 0 16px" }}>
                                                I am a final year Computer Science student at IIT Delhi with a deep interest in Full-Stack Development and Distributed Systems. I love building tools that solve real-world problems and have been actively involved in community projects.
                                            </p>
                                            <p style={{ margin: 0 }}>
                                                Looking for internship opportunities where I can apply my skills in React, Next.js, and Node.js to create impactful user experiences and scalable architectures.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </motion.div>

                            {/* Education */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{
                                    background: "#ffffff", borderRadius: 20,
                                    border: "1px solid #e2e8f0", padding: "32px",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                }}
                            >
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <GraduationCap size={20} color="#2563eb" /> Education
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    {[
                                        { school: student?.college ?? "IIT Delhi", degree: `B.Tech in ${student?.branch ?? "Computer Science"}`, period: "2021 - 2025", stats: displayGPA },
                                        { school: "Modern Public School", degree: "Class XII (CBSE)", period: "2021", stats: "96.4%" }
                                    ].map((edu, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <GraduationCap size={20} color="#64748b" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{edu.school}</div>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{edu.period}</div>
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{edu.degree}</div>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>{edu.stats}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Experience/Projects */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                style={{
                                    background: "#ffffff", borderRadius: 20,
                                    border: "1px solid #e2e8f0", padding: "32px",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                }}
                            >
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <BriefcaseBusiness size={20} color="#2563eb" /> Experience & Projects
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    {[
                                        { title: "Backend Developer Intern", subtitle: "TechCorp · 3 months", type: "Experience", company: "TechCorp" },
                                        { title: "Interera Referral Platform", subtitle: "Next.js, TypeScript, PostgreSQL", type: "Project", company: "" },
                                        { title: "Crypto Portfolio Tracker", subtitle: "Python, Django, Redis", type: "Project", company: "" }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 12,
                                                background: item.type === "Experience" ? "#eff6ff" : "#f5f3ff",
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                                overflow: "hidden"
                                            }}>
                                                {item.type === "Experience" && getCompanyLogo(item.company) ? (
                                                    <img src={getCompanyLogo(item.company)!} alt={item.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6, background: "#fff" }} />
                                                ) : (
                                                    item.type === "Experience" ? <BriefcaseBusiness size={20} color="#2563eb" /> : <Code size={20} color="#7c3aed" />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{item.title}</div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                                                    {item.subtitle}
                                                </div>
                                            </div>
                                            <button style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Certifications */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    background: "#ffffff", borderRadius: 20,
                                    border: "1px solid #e2e8f0", padding: "32px",
                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                }}
                            >
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <Award size={20} color="#2563eb" /> Certifications
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    {[
                                        { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", company: "Amazon" },
                                        { name: "Professional Data Engineer", issuer: "Google Cloud", company: "Google" },
                                        { name: "Meta Front-End Developer", issuer: "Meta", company: "Meta" }
                                    ].map((cert, i) => (
                                        <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, background: "#fff", borderRadius: 8,
                                                border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center",
                                                overflow: "hidden"
                                            }}>
                                                {getCompanyLogo(cert.company) ? (
                                                    <img src={getCompanyLogo(cert.company)!} alt={cert.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                                                ) : (
                                                    <Award size={20} color="#d97706" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{cert.name}</div>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{cert.issuer}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {isEditModalOpen && student && (
                    <EditProfileModal 
                        student={student} 
                        onClose={() => setIsEditModalOpen(false)} 
                        onSave={handleSave} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
