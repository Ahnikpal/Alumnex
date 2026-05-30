"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "../../lib/utils";
import {
    LayoutDashboard,
    UserPlus,
    Inbox,
    ListOrdered,
    BarChart2,
    LogOut,
    Search,
    Bell,
    UploadCloud,
    X,
    MapPin,
    Briefcase,
    Calendar,
    DollarSign,
    Loader2
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createInternship, fetchInternshipById, updateInternship, ApiInternship } from "../../lib/api";
import AlumniHeader from "./alumni-header";
import AlumniSidebar from "./alumni-sidebar";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";

export default function PostReferralDemo() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Form State for Live Preview
    const [formData, setFormData] = useState({
        role: "",
        company: "",
        location: "",
        type: "Full-Time",
        stipend: "",
        deadline: "",
        description: "",
        skills: ["React", "TypeScript", "Node.js"],
        newSkill: ""
    });

    // Fetch data if in edit mode
    React.useEffect(() => {
        if (editId) {
            fetchInternshipById(parseInt(editId))
                .then(data => {
                    setFormData({
                        role: data.role,
                        company: data.company,
                        location: data.location || "",
                        type: data.duration || "Full-Time", // Mapping duration to type for demo
                        stipend: data.stipend || "",
                        deadline: data.deadline ? data.deadline.split('T')[0] : "",
                        description: data.description || "",
                        skills: ["React", "TypeScript", "Node.js"], // Skills aren't in DB yet
                        newSkill: ""
                    });
                    if (data.logo_url) {
                        setLogoPreview(`http://localhost:5000${data.logo_url}`);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch internship for edit:", err);
                    alert("Error loading referral data");
                });
        }
    }, [editId]);

    const links = [
        { label: "Dashboard", href: "/alumni-dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Post Referral", href: "/alumni-dashboard/post-referral", icon: <UserPlus size={18} /> },
        { label: "Applications Received", href: "/alumni-dashboard/applications", icon: <Inbox size={18} /> },
        { label: "My Referrals", href: "/alumni-dashboard/my-referrals", icon: <ListOrdered size={18} /> },
    ];

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSkill = (e: any) => {
        if (e.key === 'Enter' && formData.newSkill.trim() !== '') {
            e.preventDefault();
            if (!formData.skills.includes(formData.newSkill.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, prev.newSkill.trim()],
                    newSkill: ""
                }));
            }
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = async () => {
        if (!formData.company || !formData.role) {
            alert("Company and Role are required");
            return;
        }

        const userStored = localStorage.getItem("userData");
        if (!userStored) {
            router.push("/login");
            return;
        }
        
        const user = JSON.parse(userStored);
        const alumniId = user.id;

        setIsPublishing(true);
        try {
            const payload: any = {
                company: formData.company,
                role: formData.role,
                location: formData.location,
                duration: formData.type,
                stipend: formData.stipend,
                description: formData.description,
                deadline: formData.deadline || null
            };

            if (editId) {
                await updateInternship(parseInt(editId), payload);
                alert("Success! Your referral has been updated.");
            } else {
                payload.posted_by = alumniId;
                payload.logo_file = logoFile || undefined;
                await createInternship(payload);
                alert("Success! Your referral opportunity has been published.");
            }
            router.push("/alumni-dashboard/my-referrals");
        } catch (e) {
            alert("Failed: " + (e instanceof Error ? e.message : "Error"));
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative">
                <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="Post Referral" />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12">
                    {/* Top Navigation */}
                    <AlumniHeader 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        searchPlaceholder="Search tools..."
                    />

                    {/* Dashboard Content */}
                    <div className={styles.mainContent}>
                        <div className={cn(styles.sectionHeader, "mb-8")}>
                            <div>
                                <h1 className={styles.pageTitle}>Post New Referral</h1>
                                <p className="text-slate-500 mt-1">Create a new opportunity for students to apply directly through you.</p>
                            </div>
                             <div className="flex gap-4">
                                <button className={styles.btnSecondary}>Save Draft</button>
                                <button 
                                    className={styles.btnPrimary}
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                >
                                    {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                    {isPublishing ? "Publishing..." : "Publish Referral"}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Col: Form Area */}
                            <div className="lg:col-span-2">

                                {/* Section 1: Company */}
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionHeading}>Company Information</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className={styles.inputGroup}>
                                            <input
                                                type="text"
                                                name="company"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={formData.company}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Company Name*</label>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <input
                                                type="text"
                                                name="location"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={formData.location}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Location (City or Remote)*</label>
                                        </div>
                                    </div>

                                    <div className="w-full mb-6">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 transform-none relative">
                                            Company Logo
                                        </label>
                                        <label className={cn(styles.uploadArea, "block w-full relative transform-none cursor-pointer")}>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            {logoPreview ? (
                                                <div className="flex items-center justify-center gap-4 py-2">
                                                    <div className="w-20 h-20 rounded-xl border-2 border-emerald-100 overflow-hidden bg-white shadow-sm">
                                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-slate-900">Logo Uploaded</p>
                                                        <p className="text-xs text-slate-500 mb-2">Click to change</p>
                                                        <button 
                                                            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setLogoPreview(null); setLogoFile(null);}} 
                                                            className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-4">
                                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                        <UploadCloud className="text-slate-400" size={24} />
                                                    </div>
                                                    <p className="font-bold text-slate-700">Click to upload or drag logo here</p>
                                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Section 2: Internship */}
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionHeading}>Role Details</h2>

                                    <div className={styles.inputGroup}>
                                        <input
                                            type="text"
                                            name="role"
                                            className={styles.floatingInput}
                                            placeholder=" "
                                            value={formData.role}
                                            onChange={handleInputChange}
                                        />
                                        <label className={styles.floatingLabel}>Role Title (e.g., Frontend Intern)*</label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className={styles.inputGroup}>
                                            <select
                                                name="type"
                                                className={styles.floatingInput}
                                                value={formData.type}
                                                onChange={handleInputChange}
                                            >
                                                <option>Full-Time</option>
                                                <option>Part-Time</option>
                                                <option>Internship</option>
                                                <option>Contract</option>
                                            </select>
                                            <label className={styles.floatingLabel}>Employment Type</label>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <input
                                                type="text"
                                                name="stipend"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={formData.stipend}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Stipend/Salary</label>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <input
                                                type="date"
                                                name="deadline"
                                                className={styles.floatingInput}
                                                placeholder=" "
                                                value={formData.deadline}
                                                onChange={handleInputChange}
                                            />
                                            <label className={styles.floatingLabel}>Application Deadline</label>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Required Skills</label>
                                        <div className={styles.tagContainer}>
                                            {formData.skills.map((skill, i) => (
                                                <span key={i} className={styles.tag}>
                                                    {skill}
                                                    <X size={12} className={styles.tagRemove} onClick={() => removeSkill(skill)} />
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                name="newSkill"
                                                className={styles.tagInput}
                                                placeholder="Add a skill and press Enter"
                                                value={formData.newSkill}
                                                onChange={handleInputChange}
                                                onKeyDown={addSkill}
                                            />
                                        </div>
                                    </div>

                                    <div className={cn(styles.inputGroup, styles.textareaGroup, "mb-0")}>
                                        <textarea
                                            name="description"
                                            className={styles.floatingInput}
                                            placeholder=" "
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                        <label className={styles.floatingLabel}>Job Description & Requirements</label>
                                    </div>
                                </div>

                                {/* Section 3: Instructions */}
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionHeading}>Referral Filtering Rules</h2>

                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                            <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" defaultChecked />
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">Require minimum CGPA</div>
                                                <div className="text-xs text-slate-500 mt-1">Only allow students above 8.0 CGPA to apply.</div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                            <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" defaultChecked />
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">Force Portfolio Link</div>
                                                <div className="text-xs text-slate-500 mt-1">Make providing a portfolio or GitHub link mandatory.</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                            </div>

                            {/* Right Col: Live Preview Panel */}
                            <div className="relative">
                                <div className={styles.previewWrapper}>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Preview
                                    </h3>

                                    <div className={styles.previewCard}>
                                        <div className={styles.previewHeader}>
                                            <div className={styles.previewLogo}>
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                                ) : (
                                                    <Briefcase size={28} className="text-slate-300" />
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.previewBody}>
                                            <h4 className={styles.previewTitle}>
                                                {formData.role || "Frontend Developer Intern"}
                                            </h4>
                                            <div className={styles.previewCompany}>
                                                {formData.company || "Acme Corp"} • Student Referral
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
                                                <div className={styles.previewDetail}>
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {formData.location || "San Francisco, CA"}
                                                </div>
                                                <div className={styles.previewDetail}>
                                                    <Briefcase size={14} className="text-slate-400" />
                                                    {formData.type}
                                                </div>
                                                <div className={styles.previewDetail}>
                                                    <DollarSign size={14} className="text-slate-400" />
                                                    {formData.stipend || "$45/hr"}
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.skills.map((skill, i) => (
                                                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {formData.skills.length === 0 && (
                                                        <span className="text-sm text-slate-400 italic">No skills added yet</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 mt-auto">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">
                                                        Deadline: {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : "Not set"}
                                                    </span>
                                                    <span className="font-semibold text-emerald-600">Referred by Sarah Jenkins</span>
                                                </div>
                                            </div>
                                        </div>
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
