"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { useRouter } from "next/navigation";
import {
    Search,
    ArrowUpDown,
    Plus,
    Briefcase,
    Users,
    TrendingUp,
    Award,
    MapPin,
    Calendar,
    FileEdit,
    Trash2,
    Eye,
    ChevronDown,
    LayoutDashboard,
    UserPlus,
    Inbox,
    ListOrdered,
    BarChart2,
    LogOut,
    Loader2,
    AlertTriangle,
    X,
    ChevronUp,
    CheckCircle2,
} from "lucide-react";
import {
    fetchInternships,
    deleteInternship,
    ApiInternship,
    formatDate,
} from "../../../lib/api";
import AlumniHeader from "../../../components/ui/alumni-header";
import AlumniSidebar from "../../../components/ui/alumni-sidebar";
import styles from "../alumni-dashboard.module.css";

type SortField = "posted_at" | "application_count" | "company" | "deadline";
type SortDir = "asc" | "desc";

interface DeleteModalProps {
    ref_: ApiInternship;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

function DeleteModal({ ref_, onConfirm, onCancel, loading }: DeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full z-10"
            >
                <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Referral</h3>
                        <p className="text-sm text-slate-500">This action cannot be undone.</p>
                    </div>
                </div>
                <p className="text-slate-600 mb-8 text-sm">
                    Are you sure you want to delete the referral for{" "}
                    <span className="font-bold text-slate-900">{ref_.role}</span> at{" "}
                    <span className="font-bold text-slate-900">{ref_.company}</span>?
                    All related applications will also be removed.
                </p>
                <div className="flex flex-col gap-4 mt-8">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        className="w-full px-6 py-4 rounded-xl font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-200 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Trash2 size={24} />}
                        DELETE PERMANENTLY
                    </button>
                    <button
                        onClick={onCancel}
                        style={{ backgroundColor: '#ffffff', color: '#64748b', border: '2px solid #e2e8f0' }}
                        className="w-full px-6 py-4 rounded-xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        No, Keep Referral
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function MyReferralsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [referrals, setReferrals] = useState<ApiInternship[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>("posted_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [deleteTarget, setDeleteTarget] = useState<ApiInternship | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [alumniId, setAlumniId] = useState<number | null>(null);

    // Read alumni_id from localStorage
    const router = useRouter();
    useEffect(() => {
        try {
            const stored = localStorage.getItem("userData");
            if (!stored) {
                router.push("/login");
                return;
            }
            const user = JSON.parse(stored);
            if (user.role !== 'alumni') {
                router.push("/login");
                return;
            }
            setAlumniId(user.id ?? null);
        } catch {
            router.push("/login");
        }
    }, [router]);

    const loadReferrals = () => {
        setLoading(true);
        fetchInternships()
            .then((data) => {
                const mine = alumniId != null
                    ? data.filter((i) => i.posted_by_id === alumniId)
                    : data;
                setReferrals(mine);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadReferrals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alumniId]);

    const links = [
        { label: "Dashboard", href: "/alumni-dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Post Referral", href: "/alumni-dashboard/post-referral", icon: <UserPlus size={18} /> },
        { label: "Applications Received", href: "/alumni-dashboard/applications", icon: <Inbox size={18} /> },
        { label: "My Referrals", href: "/alumni-dashboard/my-referrals", icon: <ListOrdered size={18} /> },
    ];

    // Computed stats
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter((r) => (r.status ?? "Active") === "Active").length;
    const totalApplications = referrals.reduce((sum, r) => sum + (r.application_count ?? 0), 0);
    const successRate = totalApplications > 0
        ? ((referrals.filter((r) => (r.application_count ?? 0) > 0).length / totalReferrals) * 100).toFixed(1)
        : "0";

    const summaryStats = [
        { label: "Total Referrals", value: totalReferrals.toString(), icon: <ListOrdered size={20} />, trend: null },
        { label: "Active Referrals", value: activeReferrals.toString(), icon: <CheckCircle2 size={20} />, trend: null },
        { label: "Total Applications", value: totalApplications.toString(), icon: <Users size={20} />, trend: null },
        { label: "Success Rate", value: `${successRate}%`, icon: <Award size={20} />, trend: null },
    ];

    // Sorting handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    // Filtered + sorted referrals
    const filteredReferrals = useMemo(() => {
        let result = referrals;
        // Search
        const q = searchQuery.toLowerCase();
        if (q) {
            result = result.filter(
                (r) =>
                    r.company.toLowerCase().includes(q) ||
                    r.role.toLowerCase().includes(q) ||
                    (r.location ?? "").toLowerCase().includes(q)
            );
        }
        // Filter
        if (activeFilter !== "All") {
            result = result.filter((r) => (r.status ?? "Active") === activeFilter);
        }
        // Sort
        result = [...result].sort((a, b) => {
            let aVal: any, bVal: any;
            if (sortField === "application_count") {
                aVal = a.application_count ?? 0;
                bVal = b.application_count ?? 0;
            } else if (sortField === "company") {
                aVal = a.company.toLowerCase();
                bVal = b.company.toLowerCase();
            } else if (sortField === "deadline") {
                aVal = a.deadline ?? "";
                bVal = b.deadline ?? "";
            } else {
                aVal = a.posted_at ?? "";
                bVal = b.posted_at ?? "";
            }
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return result;
    }, [referrals, searchQuery, activeFilter, sortField, sortDir]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteInternship(deleteTarget.internship_id);
            setReferrals((prev) => prev.filter((r) => r.internship_id !== deleteTarget.internship_id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const statusBadgeClass = (status?: string) => {
        switch (status ?? "Active") {
            case "Active": return styles.statusAccepted;
            case "Closed": return styles.statusRejected;
            case "Draft": return styles.statusPending;
            default: return styles.statusPending;
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1" />;
        return sortDir === "asc"
            ? <ChevronUp className="w-3 h-3 text-emerald-600 ml-1" />
            : <ChevronDown className="w-3 h-3 text-emerald-600 ml-1" />;
    };

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative text-slate-900">
                <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="My Referrals" />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12 relative">
                    <AlumniHeader
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        searchPlaceholder="Search your referrals..."
                        onSearch={setSearchQuery}
                    />

                    <div className={styles.mainContent}>
                        <div className={cn(styles.sectionHeader, "mb-8")}>
                            <div>
                                <h1 className={styles.pageTitle}>My Referrals</h1>
                                <p className="text-slate-500 mt-1">Manage and track your posted referrals</p>
                            </div>
                            <Link href="/alumni-dashboard/post-referral" className={styles.btnPrimary}>
                                <Plus size={16} /> Post New Referral
                            </Link>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {summaryStats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                                    className={styles.card}
                                >
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <h3 className={styles.metricTitle}>{stat.label}</h3>
                                            <div className="p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                                                {stat.icon}
                                            </div>
                                        </div>
                                        <div className={styles.metricValue}>
                                            {loading ? <Loader2 size={20} className="animate-spin text-slate-300" /> : stat.value}
                                        </div>
                                        <div className={cn(styles.trendIndicator, styles.trendPositive)}>
                                            <TrendingUp size={14} /> Live data
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Filters and List */}
                        <div className="space-y-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-100">
                                    {["All", "Active", "Draft", "Closed"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
                                                activeFilter === tab
                                                    ? "bg-white text-emerald-700 shadow-sm border border-slate-200/50"
                                                    : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            {tab}
                                            {tab !== "All" && (
                                                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                                    {referrals.filter((r) => (r.status ?? "Active") === tab).length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className={styles.tableContainer}>
                                <div className="overflow-x-auto">
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr>
                                                <th>
                                                    <button onClick={() => handleSort("company")} className="flex items-center gap-1 hover:text-slate-900">
                                                        Company <SortIcon field="company" />
                                                    </button>
                                                </th>
                                                <th>Role</th>
                                                <th>Location</th>
                                                <th>
                                                    <button onClick={() => handleSort("application_count")} className="flex items-center gap-1 hover:text-slate-900">
                                                        Applications <SortIcon field="application_count" />
                                                    </button>
                                                </th>
                                                <th>
                                                    <button onClick={() => handleSort("deadline")} className="flex items-center gap-1 hover:text-slate-900">
                                                        Deadline <SortIcon field="deadline" />
                                                    </button>
                                                </th>
                                                <th>Status</th>
                                                <th className="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-16 text-slate-400">
                                                        <Loader2 className="animate-spin inline mr-2" size={20} /> Loading referrals...
                                                    </td>
                                                </tr>
                                            ) : filteredReferrals.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-16 text-slate-400">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Briefcase size={32} className="text-slate-200" />
                                                            <p className="font-medium">
                                                                {searchQuery || activeFilter !== "All"
                                                                    ? "No referrals match your filters."
                                                                    : "You haven't posted any referrals yet."}
                                                            </p>
                                                            {!searchQuery && activeFilter === "All" && (
                                                                <Link href="/alumni-dashboard/post-referral" className="text-emerald-600 text-sm font-semibold hover:underline mt-1">
                                                                    + Post your first referral
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredReferrals.map((ref) => (
                                                    <tr key={ref.internship_id} className={styles.dataRow}>
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center p-1.5 shadow-sm overflow-hidden shrink-0">
                                                                    {ref.logo_url ? (
                                                                        <img src={`http://localhost:5000${ref.logo_url}`} alt={ref.company} className="w-full h-full object-contain" />
                                                                    ) : (
                                                                        <Briefcase size={16} className="text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <span className="font-bold text-slate-900">{ref.company}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="font-semibold text-slate-700">{ref.role}</span>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {ref.location || "Remote"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                                <Users className="w-4 h-4 text-slate-400" />
                                                                {ref.application_count ?? 0}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {ref.deadline ? formatDate(ref.deadline) : "—"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={cn(styles.statusBadge, statusBadgeClass(ref.status))}>
                                                                {ref.status ?? "Active"}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Link
                                                                    href={`/alumni-dashboard/applications?internship_id=${ref.internship_id}`}
                                                                    className={cn(styles.actionBtn, styles.actionAccept)}
                                                                    title="View Applications"
                                                                >
                                                                    <Eye size={16} />
                                                                </Link>
                                                                <Link
                                                                    href={`/alumni-dashboard/post-referral?edit=${ref.internship_id}`}
                                                                    className={cn(styles.actionBtn, styles.actionRefer)}
                                                                    title="Edit"
                                                                >
                                                                    <FileEdit size={16} />
                                                                </Link>
                                                                <button
                                                                    className={cn(styles.actionBtn, styles.actionReject)}
                                                                    title="Delete"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeleteTarget(ref);
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <DeleteModal
                        ref_={deleteTarget}
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteTarget(null)}
                        loading={deleteLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
