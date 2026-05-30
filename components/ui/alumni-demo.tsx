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
    TrendingUp,
    Award,
    Users,
    Briefcase
} from "lucide-react";
import {
    fetchReferrals, updateReferralStatus, ApiReferral, fetchApplications, ApiApplication
} from "../../lib/api";
import AlumniHeader from "./alumni-header";
import AlumniSidebar from "./alumni-sidebar";
import { useRouter } from "next/navigation";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";

export default function AlumniDashboardDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [referrals, setReferrals] = useState<ApiReferral[]>([]);
    const [applications, setApplications] = useState<ApiApplication[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    React.useEffect(() => {
        const stored = localStorage.getItem("userData");
        if (!stored) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(stored);
        const loggedInId = userData.id;

        if (!loggedInId || userData.role !== 'alumni') {
            router.push('/login');
            return;
        }

        Promise.all([
            fetchReferrals(loggedInId),
            fetchApplications(loggedInId)
        ])
            .then(([refData, appData]) => {
                setReferrals(refData);
                setApplications(appData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [router]);

    const handleAction = async (id: number, status: 'accepted' | 'rejected') => {
        try {
            await updateReferralStatus(id, status);
            setReferrals(prev => prev.map(r => r.referral_id === id ? { ...r, status } : r));
        } catch (e) {
            alert("Action failed: " + (e instanceof Error ? e.message : "Error"));
        }
    };

    const links = [
        { label: "Dashboard", href: "/alumni-dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Post Referral", href: "/alumni-dashboard/post-referral", icon: <UserPlus size={18} /> },
        { label: "Applications Received", href: "/alumni-dashboard/applications", icon: <Inbox size={18} /> },
        { label: "My Referrals", href: "/alumni-dashboard/my-referrals", icon: <ListOrdered size={18} /> },
    ];

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative">

                {/* Left Sidebar */}
                <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="Dashboard" />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12">
                    {/* Top Navigation */}
                    <AlumniHeader 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        searchPlaceholder="Search applications..."
                        onSearch={setSearchQuery}
                    />

                    {/* Dashboard Content */}
                    <div className={styles.mainContent}>
                        <div className={cn(styles.sectionHeader, "mb-8")}>
                            <div>
                                <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                                <p className="text-slate-500 mt-1">Welcome back. Here's your referral impact summary.</p>
                            </div>
                            <Link href="/alumni-dashboard/post-referral" className={styles.btnPrimary}>
                                <UserPlus size={16} /> Post New Referral
                            </Link>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <MetricCard title="Total Requests" value={referrals.length} trend="+2 this month" icon={<ListOrdered size={20} />} />
                            <MetricCard title="Pending" value={referrals.filter(r => r.status === 'pending').length} trend="Review required" icon={<Inbox size={20} />} />
                            <MetricCard title="Accepted" value={referrals.filter(r => r.status === 'accepted').length} trend="+5 this month" icon={<Users size={20} />} />
                            <MetricCard title="Successful Referrals" value={referrals.filter(r => r.status === 'accepted').length} trend="Total Impact" icon={<Award size={20} />} positive />
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Col: Table */}
                            <div className="lg:col-span-2">
                                <div className={styles.tableContainer}>
                                    <div className={styles.tableHeader}>
                                        <h2 className={styles.tableTitle}>Recent Applications</h2>
                                        <Link href="/alumni-dashboard/applications" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</Link>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className={styles.dataTable}>
                                            <thead>
                                                <tr>
                                                    <th>Student Name</th>
                                                    <th>Role Requested</th>
                                                    <th>CGPA</th>
                                                    <th>Department</th>
                                                    <th>Status</th>
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading applications...</td></tr>
                                                ) : applications.length === 0 ? (
                                                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">No applications received yet.</td></tr>
                                                ) : applications.filter(a => 
                                                    a.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    a.company.toLowerCase().includes(searchQuery.toLowerCase())
                                                ).slice(0, 5).map((app) => (
                                                    <ApplicationRow key={app.application_id} application={app} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Analytics & Badges */}
                            <div className="flex flex-col gap-6">
                                {/* Simple Chart Placeholder */}
                                <div className={cn(styles.card, "flex flex-col h-[280px]")}>
                                    <h3 className="font-bold text-slate-800 mb-4">Referral Impact Analytics</h3>
                                    <div className="flex-1 w-full bg-slate-50 flex items-end gap-2 p-4 rounded-lg border border-slate-100">
                                        {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex-1 bg-emerald-100 rounded-t-sm"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                            >
                                                <div className="w-full h-1 bg-emerald-500 rounded-t-sm"></div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                                        <span>Jan</span>
                                        <span>Feb</span>
                                        <span>Mar</span>
                                        <span>Apr</span>
                                        <span>May</span>
                                        <span>Jun</span>
                                        <span>Jul</span>
                                    </div>
                                </div>

                                {/* Contributor Badge */}
                                <div className={styles.contributorBadge}>
                                    <div className={styles.badgeIcon}>
                                        <Award size={24} />
                                    </div>
                                    <div className={styles.badgeContent}>
                                        <h4>Top Mentor '26</h4>
                                        <p>Given for guiding 10+ students to successful placements this year.</p>
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

const ApplicationRow = ({ application }: { application: ApiApplication }) => (
    <tr className={styles.dataRow}>
        <td>
            <div className="font-semibold text-slate-900">{application.student_name}</div>
        </td>
        <td>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">{application.company}</span>
                <span className="text-[10px] text-slate-500">{application.role}</span>
            </div>
        </td>
        <td><span className="font-medium text-slate-700">{application.student_cgpa ?? "—"}</span></td>
        <td>{application.student_dept ?? "—"}</td>
        <td>
            <span style={{ 
                padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                background: application.status === 'accepted' || application.status === 'shortlisted' ? '#dcfce7' : application.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                color: application.status === 'accepted' || application.status === 'shortlisted' ? '#16a34a' : application.status === 'rejected' ? '#ef4444' : '#64748b'
            }}>
                {application.status}
            </span>
        </td>
        <td className="text-right">
            <Link 
                href="/alumni-dashboard/applications" 
                className="text-[10px] font-bold text-emerald-600 hover:underline"
            >
                View Details
            </Link>
        </td>
    </tr>
);
