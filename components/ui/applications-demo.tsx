"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Filter,
    Download,
    X,
    MapPin,
    Mail,
    Link as LinkIcon,
    Loader2
} from "lucide-react";
import {
    fetchApplications, updateApplicationStatus, formatDate, ApiApplication, fetchStudents, ApiStudent
} from "../../lib/api";
import AlumniHeader from "./alumni-header";
import AlumniSidebar from "./alumni-sidebar";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";

const API_BASE = 'http://localhost:5000';

/** Resolve a potentially-relative file URL to the backend origin */
function resolveFileUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ApplicationsDemo() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const filterInternshipId = searchParams.get("internship_id");
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [applications, setApplications] = useState<ApiApplication[]>([]);
    const [students, setStudents] = useState<Record<number, ApiStudent>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const userStored = localStorage.getItem("userData");
        if (!userStored) {
            router.push("/login");
            return;
        }

        let alumniId: number;
        try {
            const user = JSON.parse(userStored);
            if (!user.id || user.role !== 'alumni') {
                router.push("/login");
                return;
            }
            alumniId = user.id;
        } catch (e) {
            router.push("/login");
            return;
        }

        setLoading(true);
        Promise.all([fetchApplications(alumniId), fetchStudents()])
            .then(([apps, stus]) => {
                setApplications(apps);
                const stuMap = stus.reduce((acc, s) => ({ ...acc, [s.student_id]: s }), {});
                setStudents(stuMap);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [router]);

    const handleUpdateStatus = async (id: number, status: ApiApplication['status']) => {
        try {
            await updateApplicationStatus(id, status);
            setApplications(prev => prev.map(a => a.application_id === id ? { ...a, status } : a));
        } catch (e) {
            alert("Update failed: " + (e instanceof Error ? e.message : "Error"));
        }
    };

    const tabs = ["All", "Pending", "Under Review", "Shortlisted", "Rejected", "Accepted"];

    const filteredApps = applications.filter(app => {
        const matchesTab = activeTab === "All" || app.status.replace('_', ' ').toLowerCase() === activeTab.toLowerCase();
        const matchesSearch = app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             app.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesInternship = !filterInternshipId || app.internship_id === parseInt(filterInternshipId);
        
        return matchesTab && matchesSearch && matchesInternship;
    });

    // Get filtered internship info for header
    const filteredInternshipName = filterInternshipId && applications.length > 0 
        ? applications.find(a => a.internship_id === parseInt(filterInternshipId))?.role
        : null;

    const links = [
        { label: "Dashboard", href: "/alumni-dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Post Referral", href: "/alumni-dashboard/post-referral", icon: <UserPlus size={18} /> },
        { label: "Applications Received", href: "/alumni-dashboard/applications", icon: <Inbox size={18} /> },
        { label: "My Referrals", href: "/alumni-dashboard/my-referrals", icon: <ListOrdered size={18} /> },
    ];

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative">
                <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="Applications Received" />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12">
                    {/* Top Navigation */}
                    <AlumniHeader 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        searchPlaceholder="Search students..."
                        onSearch={setSearchQuery}
                    />

                    {/* Dashboard Content */}
                    <div className={styles.mainContent}>
                        <div className={cn(styles.sectionHeader, "mb-6")}>
                            <div>
                                <h1 className={styles.pageTitle}>
                                    {filteredInternshipName ? `Applications for ${filteredInternshipName}` : "Applications Received"}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    {filteredInternshipName 
                                        ? `Viewing candidates who applied for the ${filteredInternshipName} position.`
                                        : "Review and manage student applications for your postings."}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                {filterInternshipId && (
                                    <Link href="/alumni-dashboard/applications" className={styles.btnSecondary}>
                                        <X size={16} className="mr-2 inline" /> Clear Filter
                                    </Link>
                                )}
                                <button className={styles.btnSecondary}>
                                    <Filter size={16} className="mr-2 inline" /> Filter Options
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className={styles.filterTabsContainer}>
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(styles.filterTab, activeTab === tab && styles.filterTabActive)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Data Table Container */}
                        <div className={styles.tableContainer}>
                            <div className="overflow-x-auto">
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Applied For</th>
                                            <th>CGPA</th>
                                            <th>Department</th>
                                            <th>Resume</th>
                                            <th>Applied Date</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={8} className="text-center py-12 text-slate-400"><Loader2 className="animate-spin inline mr-2" size={20} /> Loading applications...</td></tr>
                                        ) : filteredApps.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center py-12 text-slate-400">No applications found.</td></tr>
                                        ) : filteredApps.map((app) => (
                                            <tr
                                                key={app.application_id}
                                                className={cn(styles.dataRow, styles.clickableRow)}
                                                onClick={() => setSelectedStudent(app)}
                                            >
                                                <td>
                                                    <div className={styles.avatarCell}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#64748b' }}>
                                                            {app.student_name[0]}
                                                        </div>
                                                        <span className="font-semibold text-slate-900">{app.student_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 leading-tight">{app.company}</span>
                                                        <span className="text-xs text-slate-500">{app.role}</span>
                                                    </div>
                                                </td>
                                                <td><span className="font-medium text-slate-700">{app.student_cgpa ?? "—"}</span></td>
                                                <td>{app.student_dept ?? "—"}</td>
                                                <td>
                                                    {resolveFileUrl(students[app.student_id]?.resume_url) ? (
                                                        <a 
                                                            href={resolveFileUrl(students[app.student_id].resume_url)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={styles.resumeBtn} 
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Download size={14} /> PDF
                                                        </a>
                                                    ) : (
                                                        <button 
                                                            className={cn(styles.resumeBtn, "opacity-50 cursor-not-allowed")} 
                                                            disabled
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <X size={14} /> N/A
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="text-slate-500 text-sm whitespace-nowrap">{formatDate(app.applied_date)}</td>
                                                <td>
                                                    <span className={cn(
                                                        styles.statusBadge,
                                                        app.status === 'pending' && styles.statusPending,
                                                        app.status === 'accepted' && styles.statusAccepted,
                                                        app.status === 'under_review' && styles.statusUnderReview,
                                                        app.status === 'rejected' && styles.statusRejected,
                                                        app.status === 'shortlisted' && styles.statusShortlisted
                                                    )}>
                                                        {app.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(app.application_id, 'shortlisted')}
                                                            className={cn(styles.actionBtn, styles.actionAccept)} 
                                                            title="Shortlist"
                                                        >
                                                            Slt
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(app.application_id, 'rejected')}
                                                            className={cn(styles.actionBtn, styles.actionReject)} 
                                                            title="Reject"
                                                        >
                                                            Rej
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className={styles.paginationContainer}>
                                <div className={styles.paginationText}>
                                    Showing <span className="font-semibold text-slate-900">1</span> to <span className="font-semibold text-slate-900">{filteredApps.length}</span> of <span className="font-semibold text-slate-900">128</span> results
                                </div>
                                <div className={styles.paginationControls}>
                                    <button className={styles.pageBtn} disabled><ChevronLeft size={16} /></button>
                                    <button className={cn(styles.pageBtn, styles.pageBtnActive)}>1</button>
                                    <button className={styles.pageBtn}>2</button>
                                    <button className={styles.pageBtn}>3</button>
                                    <span className="px-2 text-slate-400">...</span>
                                    <button className={styles.pageBtn}>12</button>
                                    <button className={styles.pageBtn}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Side Details Panel Overlay */}
            <AnimatePresence>
                {selectedStudent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.detailsPanelOverlay}
                        onClick={() => setSelectedStudent(null)}
                    >
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={styles.detailsPanel}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.detailsHeader}>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
                                    <p className="text-xs text-slate-500">Applied on {formatDate(selectedStudent.applied_date)}</p>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg" onClick={() => setSelectedStudent(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.detailsBody}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#64748b', marginBottom: 12 }}>
                                    {selectedStudent.student_name?.[0] ?? '?'}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedStudent.student_name}</h2>
                                <p className="text-emerald-600 font-medium mb-6">{selectedStudent.college} • {selectedStudent.student_dept ?? 'N/A'}</p>

                                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className={styles.detailsLabel}>CGPA</span>
                                        <span className={styles.detailsValue}>{selectedStudent.student_cgpa ?? '—'} / 10.0</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={styles.detailsLabel}>Application Status</span>
                                        <span className={styles.detailsValue}>{selectedStudent.status.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                <div className={styles.detailsItem}>
                                    <div className={styles.detailsLabel}>Contact Info</div>
                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Mail size={16} className="text-slate-400" /> {selectedStudent.student_email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Briefcase size={16} className="text-slate-400" /> {selectedStudent.role} @ {selectedStudent.company}
                                        </div>
                                        {selectedStudent.internship_location && (
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <MapPin size={16} className="text-slate-400" /> {selectedStudent.internship_location}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailsItem}>
                                    <div className={styles.detailsLabel}>Key Skills</div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {students[selectedStudent.student_id]?.skills
                                            ? students[selectedStudent.student_id].skills!.split(',').map((s: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">{s.trim()}</span>
                                              ))
                                            : <span className="text-slate-400 text-sm">No skills listed</span>
                                        }
                                    </div>
                                </div>

                                <div className={styles.detailsItem}>
                                    <div className={styles.detailsLabel}>Resume & Links</div>
                                    <div className="space-y-2 mt-2">
                                        {students[selectedStudent.student_id]?.portfolio_link && (
                                            <a href={students[selectedStudent.student_id].portfolio_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:underline">
                                                <LinkIcon size={14} /> Portfolio
                                            </a>
                                        )}
                                        {students[selectedStudent.student_id]?.linkedin_link && (
                                            <a href={students[selectedStudent.student_id].linkedin_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:underline">
                                                <LinkIcon size={14} /> LinkedIn
                                            </a>
                                        )}
                                        {resolveFileUrl(students[selectedStudent.student_id]?.resume_url) ? (
                                            <a href={resolveFileUrl(students[selectedStudent.student_id].resume_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:underline">
                                                <Download size={14} /> Download Resume (PDF)
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-sm">No resume uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailsFooter}>
                                <button className={cn(styles.btnSecondary, "flex-1")}>Reject</button>
                                <button className={cn(styles.btnPrimary, "flex-1 justify-center")}>Refer Candidate</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
