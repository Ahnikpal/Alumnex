"use client";

import React, { useState, useEffect } from "react";
import { 
    User, 
    Mail, 
    Building2, 
    MapPin, 
    Linkedin, 
    Camera,
    Plus,
    Users,
    CheckCircle2,
    Trophy,
    Settings,
    GraduationCap,
    X,
    ListOrdered,
    TrendingUp,
    Bell,
    Loader2,
    Save,
    Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import AlumniHeader from "./alumni-header";
import AlumniSidebar from "./alumni-sidebar";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";
import { fetchAlumniById, updateAlumni, fetchReferrals, uploadAlumniProfilePicture } from "../../lib/api";

/**
 * AlumniProfile Component — fully connected to the backend.
 * Loads the logged-in alumni's profile data and allows saving changes.
 */
export default function AlumniProfile() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [alumniId, setAlumniId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        company: "",
        title: "",
        location: "",
        gradYear: "",
        linkedin: "",
        bio: "",
        skills: [] as string[],
        profilePicture: null as string | null,
    });

    const [stats, setStats] = useState({
        totalReferrals: 0,
        accepted: 0,
        hireRate: "0%",
    });

    const [newSkill, setNewSkill] = useState("");

    // Read alumni_id from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("userData");
            if (stored) {
                const user = JSON.parse(stored);
                setAlumniId(user.id ?? null);
            }
        } catch {
            setLoading(false);
        }
    }, []);

    // Fetch profile & stats once we have the alumni_id
    useEffect(() => {
        if (alumniId == null) {
            setLoading(false);
            return;
        }

        Promise.all([
            fetchAlumniById(alumniId),
            fetchReferrals(alumniId),
        ])
            .then(([data, referrals]) => {
                setProfile({
                    name: data.name ?? "",
                    email: data.email ?? "",
                    company: data.company ?? "",
                    title: data.role ?? "",
                    location: data.location ?? "",
                    gradYear: data.graduation_year?.toString() ?? "",
                    linkedin: data.linkedin ?? "",
                    bio: data.bio ?? "",
                    skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
                    profilePicture: data.profile_picture ?? null,
                });

                const accepted = referrals.filter(r => r.status === "accepted").length;
                const hireRate = referrals.length > 0
                    ? Math.round((accepted / referrals.length) * 100) + "%"
                    : "0%";
                setStats({ totalReferrals: referrals.length, accepted, hireRate });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [alumniId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setSaveStatus("idle");
    };

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && newSkill.trim()) {
            setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (idx: number) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
    };
    
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !alumniId) return;

        setSaving(true);
        try {
            const result = await uploadAlumniProfilePicture(alumniId, file);
            setProfile(prev => ({ ...prev, profilePicture: result.profile_picture }));
            
            // Update localStorage to keep sessions in sync
            const stored = localStorage.getItem("userData");
            if (stored) {
                const data = JSON.parse(stored);
                data.profile_picture = result.profile_picture;
                localStorage.setItem("userData", JSON.stringify(data));
                
                // Trigger a custom event so the header refreshes
                window.dispatchEvent(new Event("profileUpdate"));
            }
            
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!alumniId) return;
        setSaving(true);
        setSaveStatus("idle");
        try {
            await updateAlumni(alumniId, {
                name: profile.name,
                company: profile.company,
                role: profile.title,
                graduation_year: profile.gradYear ? parseInt(profile.gradYear) : null,
                location: profile.location,
                linkedin: profile.linkedin,
                bio: profile.bio,
                skills: profile.skills.join(", "),
            });

            // Sync with localStorage
            const stored = localStorage.getItem("userData");
            if (stored) {
                const data = JSON.parse(stored);
                data.fullName = profile.name;
                data.company = profile.company;
                data.role = "alumni"; // Keep role as string
                localStorage.setItem("userData", JSON.stringify(data));
                window.dispatchEvent(new Event("profileUpdate"));
            }

            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.dashboardWrapper}>
                <div className="flex w-full h-full relative">
                    <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="Profile" />
                    <main className="flex-1 flex items-center justify-center bg-slate-50 h-screen">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Loader2 size={32} className="animate-spin text-emerald-500" />
                            <p className="font-medium">Loading your profile...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative">
                <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="Profile" />

                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12 relative">
                    <AlumniHeader 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        searchPlaceholder="Search profile settings..."
                    />

                    <div className={styles.mainContent}>
                        <div className={cn(styles.sectionHeader, "mb-8")}>
                            <div>
                                <h1 className={styles.pageTitle}>Public Profile</h1>
                                <p className="text-slate-500 mt-1">Manage how you appear to the community and students.</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button 
                                    onClick={() => window.open(`/alumni/${alumniId}`, "_blank")}
                                    className={styles.btnSecondary}
                                >
                                    <Eye size={16} /> View Public Profile
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={cn(
                                        styles.btnPrimary,
                                        saving && "opacity-70 cursor-not-allowed",
                                        saveStatus === "success" && "bg-emerald-700",
                                        saveStatus === "error" && "bg-red-500"
                                    )}
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? "Saving..." : saveStatus === "success" ? "Saved!" : saveStatus === "error" ? "Error!" : "Save Changes"}
                                </button>
                            </div>
                        </div>

                        {/* Not logged in warning */}
                        {!alumniId && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-6 py-4 mb-6 text-sm font-medium">
                                ⚠️ You are not logged in. Profile changes won't be saved.
                            </div>
                        )}

                        {/* Top Profile Card */}
                        <div className={cn(styles.card, "mb-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-slate-50/50 border-emerald-100/50")}>
                            <div className="relative group shrink-0">
                                <input 
                                    type="file" 
                                    hidden 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*" 
                                />
                                <div className="w-28 h-28 rounded-2xl border-4 border-white overflow-hidden shadow-xl ring-1 ring-slate-200 transition-all group-hover:ring-emerald-400/50 relative">
                                    <img 
                                        src={profile.profilePicture ? `http://localhost:5000${profile.profilePicture}` : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?uxlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} 
                                        alt={profile.name} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-emerald-700 transition-all active:scale-90"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                            
                            <div className="text-center md:text-left flex-1 min-w-0">
                                <h2 className="text-2xl font-black text-slate-900 leading-tight truncate">{profile.name || "Your Name"}</h2>
                                <p className="text-emerald-600 font-bold text-base flex items-center justify-center md:justify-start gap-2">
                                    {profile.title || "Your Title"} <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {profile.company || "Your Company"}
                                </p>
                                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs">
                                        <MapPin size={14} className="text-slate-400" />
                                        {profile.location || "Location"}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs">
                                        <GraduationCap size={14} className="text-slate-400" />
                                        {profile.gradYear ? `Batch of ${profile.gradYear}` : "Grad Year"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-3 shrink-0">
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Profile Verified
                                </div>
                                <div className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <Users size={14} /> {stats.totalReferrals} Referrals
                                </div>
                            </div>
                        </div>

                        {/* Main Layout Grid (70/30) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Column - Form Area */}
                            <div className="lg:col-span-2 space-y-8">
                                
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionHeading}>Professional Credentials</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <div className={styles.inputGroup}>
                                            <input 
                                                type="text" 
                                                name="name"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={profile.name}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Full Name*</label>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <input 
                                                type="email" 
                                                className={cn(styles.floatingInput, "bg-slate-100 cursor-not-allowed opacity-70")}
                                                placeholder=" "
                                                value={profile.email}
                                                disabled
                                            />
                                            <label className={styles.floatingLabel}>Email Address (Linked)</label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <div className={styles.inputGroup}>
                                            <input 
                                                type="text" 
                                                name="title"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={profile.title}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Job Title*</label>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <input 
                                                type="text" 
                                                name="company"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={profile.company}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Company Name*</label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <div className={styles.inputGroup}>
                                            <input 
                                                type="text" 
                                                name="location"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={profile.location}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Location</label>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <input 
                                                type="text" 
                                                name="gradYear"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={profile.gradYear}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Graduation Year</label>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <input 
                                            type="text" 
                                            name="linkedin"
                                            className={styles.floatingInput}
                                            placeholder=" "
                                            value={profile.linkedin}
                                            onChange={handleInputChange}
                                        />
                                        <label className={styles.floatingLabel}>LinkedIn Profile URL</label>
                                    </div>

                                    <div className={cn(styles.inputGroup, styles.textareaGroup, "mb-0")}>
                                        <textarea 
                                            name="bio"
                                            className={styles.floatingInput}
                                            placeholder=" "
                                            value={profile.bio}
                                            onChange={handleInputChange}
                                        />
                                        <label className={styles.floatingLabel}>About / Biography</label>
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-slate-900">Expertise &amp; Skills</h2>
                                        <p className="text-xs text-slate-400">Press Enter to add a skill</p>
                                    </div>
                                    <div className={styles.tagContainer}>
                                        {profile.skills.map((skill, idx) => (
                                            <span key={idx} className={styles.tag}>
                                                {skill}
                                                <button onClick={() => handleRemoveSkill(idx)}>
                                                    <X size={12} className={styles.tagRemove} />
                                                </button>
                                            </span>
                                        ))}
                                        <input 
                                            type="text" 
                                            className={styles.tagInput}
                                            placeholder="Add skill and press Enter..."
                                            value={newSkill}
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={handleAddSkill}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Stats & Settings */}
                            <div className="space-y-6">
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <MetricCard title="Total Referrals" value={stats.totalReferrals.toString()} icon={<ListOrdered size={20} />} trend="Live data" positive />
                                    <MetricCard title="Accepted" value={stats.accepted.toString()} icon={<CheckCircle2 size={20} />} trend="Updated now" positive />
                                    <MetricCard title="Hire Rate" value={stats.hireRate} icon={<TrendingUp size={20} />} trend="Referral success" positive />
                                </div>

                                <div className={styles.card}>
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Settings size={18} className="text-slate-400" /> Interaction Prefs
                                    </h3>
                                    <div className="space-y-6">
                                        <PreferenceToggle 
                                            icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                                            label="Accepting Referrals" 
                                            description="Allow students to request referrals"
                                            active={true}
                                        />
                                        <PreferenceToggle 
                                            icon={<GraduationCap size={16} className="text-emerald-500" />}
                                            label="Mentorship Enrollment" 
                                            description="Show profile in mentor lists"
                                            active={true}
                                        />
                                        <PreferenceToggle 
                                            icon={<Bell size={16} className="text-slate-400" />}
                                            label="Email Notifications" 
                                            description="Receive alerts for new requests"
                                            active={true}
                                        />
                                    </div>
                                </div>

                                <div className={styles.contributorBadge}>
                                    <div className={styles.badgeIcon}>
                                        <Trophy size={24} />
                                    </div>
                                    <div className={styles.badgeContent}>
                                        <h4>Elite Contributor</h4>
                                        <p>Given for guiding 100+ students to successful placements.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/**
 * Metric Card sub-component
 */
const MetricCard = ({ title, value, trend, icon, positive }: any) => (
    <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
        className={styles.card}
    >
        <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
                <h3 className={styles.metricTitle}>{title}</h3>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                    {icon}
                </div>
            </div>
            <div className={styles.metricValue}>{value}</div>
            <div className={cn(styles.trendIndicator, positive && styles.trendPositive)}>
                <TrendingUp size={14} /> {trend}
            </div>
        </div>
    </motion.div>
);

/**
 * Preference Toggle sub-component
 */
function PreferenceToggle({ icon, label, description, active: initialActive }: { icon: React.ReactNode, label: string, description: string, active: boolean }) {
    const [active, setActive] = useState(initialActive);
    return (
        <div className="flex items-center justify-between group cursor-pointer" onClick={() => setActive(!active)}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">{label}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{description}</p>
                </div>
            </div>
            <div className={cn(
                "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300",
                active ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "bg-slate-200"
            )}>
                <div className={cn(
                    "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm",
                    active ? "right-[3px]" : "left-[3px]"
                )} />
            </div>
        </div>
    );
}
