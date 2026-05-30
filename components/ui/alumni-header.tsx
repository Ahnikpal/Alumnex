"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, Menu, X, Check, Clock, User, Briefcase, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";
import { fetchNotifications, markAllNotificationsRead, ApiNotification, fetchReferralById, ApiReferral, updateReferralStatus, markNotificationRead } from "../../lib/api";

interface AlumniHeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
}

// Notifications will be fetched from API

export default function AlumniHeader({
    sidebarOpen,
    setSidebarOpen,
    searchPlaceholder = "Search...",
    onSearch
}: AlumniHeaderProps) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReferral, setSelectedReferral] = useState<ApiReferral | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [user, setUser] = useState<{ id?: number, fullName: string, role: string, profile_picture?: string | null } | null>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const loadUserData = () => {
        try {
            const stored = localStorage.getItem("userData");
            if (stored) {
                const data = JSON.parse(stored);
                setUser({
                    id: data.id,
                    fullName: data.fullName || data.name || "Guest Alumni",
                    role: data.role || "Alumni User",
                    profile_picture: data.profile_picture
                });
            }
        } catch (e) {
            console.error("Error loading user data in header:", e);
        }
    };

    const loadNotifications = async () => {
        if (!user?.id) return;
        setLoadingNotifs(true);
        try {
            const data = await fetchNotifications(user.id, 'alumni');
            setNotifications(data);
        } catch (e) {
            console.error("Error loading notifications:", e);
        } finally {
            setLoadingNotifs(false);
        }
    };

    const handleNotifClick = async (n: ApiNotification) => {
        console.log("Notification clicked:", n);
        setNotifOpen(false);
        
        // Mark as read immediately
        if (!n.is_read) {
            try {
                await markNotificationRead(n.notification_id);
                setNotifications(prev => prev.map(item => 
                    item.notification_id === n.notification_id ? { ...item, is_read: true } : item
                ));
            } catch(e) {}
        }

        if (n.related_type === 'referral' && n.related_id) {
            try {
                const data = await fetchReferralById(n.related_id);
                console.log("Fetched referral data:", data);
                setSelectedReferral(data);
                setIsDetailModalOpen(true);
            } catch (e) {
                console.error("Failed to load referral details", e);
                alert("Failed to load referral details. The record may have been deleted.");
            }
        } else {
            console.warn("Notification not interactable - missing related data.");
            alert("This is an older notification. For security and technical reasons, only new referral requests sent after the recent update can be opened to view resumes/messages. Please ask the student to resend the request if needed.");
        }
    };

    const handleReferralAction = async (status: 'accepted' | 'rejected') => {
        if (!selectedReferral) return;
        setActionLoading(true);
        try {
            await updateReferralStatus(selectedReferral.referral_id, status);
            setSelectedReferral(prev => prev ? { ...prev, status } : null);
            // Optionally close modal or show success
            setTimeout(() => {
                setIsDetailModalOpen(false);
                setSelectedReferral(null);
            }, 1000);
        } catch (e) {
            alert("Action failed: " + (e instanceof Error ? e.message : "Error"));
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        if (notifOpen) {
            loadNotifications();
        }
    }, [notifOpen, user?.id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        loadUserData();
        
        // Listen for local storage changes from other tabs/components
        window.addEventListener("storage", loadUserData);
        
        // Also listen for custom "profileUpdate" event for same-tab updates
        window.addEventListener("profileUpdate", loadUserData);
        
        return () => {
            window.removeEventListener("storage", loadUserData);
            window.removeEventListener("profileUpdate", loadUserData);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) onSearch(query);
    };

    return (
        <header className={styles.topNav}>
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={styles.iconButton}
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="relative hidden sm:block w-full max-w-md">
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={notifRef}>
                    <button 
                        className={styles.iconButton}
                        onClick={() => setNotifOpen(!notifOpen)}
                    >
                        <div className="relative">
                            <Bell size={20} />
                            {notifications.some(n => !n.is_read) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>
                    </button>

                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                    <button 
                                        onClick={async () => {
                                            if (!user?.id) return;
                                            try {
                                                await markAllNotificationsRead(user.id, 'alumni');
                                                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                            } catch(e) {}
                                        }}
                                        className="text-xs text-emerald-600 font-bold hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {loadingNotifs ? (
                                        <div className="p-8 text-center text-slate-400">Loading...</div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">
                                            <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div 
                                                key={n.notification_id} 
                                                onClick={() => handleNotifClick(n)}
                                                className={cn("p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3", !n.is_read && "bg-emerald-50/30")}
                                            >
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600")}>
                                                    <User size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-sm text-slate-900 truncate">{n.title}</span>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 text-center border-t border-slate-100">
                                    <button className="text-xs font-bold text-slate-500 hover:text-slate-800">View all notifications</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Link href="/alumni-dashboard/profile" className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{user?.fullName || "Guest Alumni"}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{user?.role || "Alumni User"}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
                        {user?.profile_picture ? (
                            <img 
                                src={`http://localhost:5000${user.profile_picture}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
                                {user?.fullName?.charAt(0) || "A"}
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {/* Referral Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedReferral && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                            onClick={() => setIsDetailModalOpen(false)} 
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
                            style={{ maxHeight: '90vh' }}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Referral Request</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Incoming Request Details</p>
                                </div>
                                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-8">
                                {/* Student Info */}
                                <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-black shrink-0">
                                        {selectedReferral.student_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 text-lg leading-tight">{selectedReferral.student_name}</h3>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Clock size={12} /> CGPA: {selectedReferral.student_cgpa || "—"}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <Briefcase size={12} /> {selectedReferral.student_dept || "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Internship Target */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Target Internship</h4>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="font-black text-slate-800">{selectedReferral.internship_role}</div>
                                        <div className="text-sm font-bold text-emerald-600">{selectedReferral.internship_company}</div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Personal Message</h4>
                                    <div className="p-5 bg-white rounded-xl border-2 border-slate-100 text-slate-600 text-sm leading-relaxed italic shadow-inner">
                                        "{selectedReferral.message || "No message provided."}"
                                    </div>
                                </div>

                                {/* Resume link */}
                                {selectedReferral.resume_url ? (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Attached Document</h4>
                                        <a 
                                            href={`http://localhost:5000${selectedReferral.resume_url}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                    <Clock size={20} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm">Resume.pdf</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Click to view/download</div>
                                                </div>
                                            </div>
                                            <div className="p-2 rounded-lg bg-emerald-500 text-slate-900 group-hover:scale-110 transition-transform">
                                                <Search size={16} />
                                            </div>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400 italic">
                                        No resume attached to this request.
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100">
                                {selectedReferral.status === 'pending' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleReferralAction('rejected')}
                                            disabled={actionLoading}
                                            className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-black hover:bg-white hover:border-slate-300 transition-all disabled:opacity-50"
                                        >
                                            REJECT
                                        </button>
                                        <button 
                                            onClick={() => handleReferralAction('accepted')}
                                            disabled={actionLoading}
                                            className="px-6 py-4 rounded-xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <Clock className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                            ACCEPT REQUEST
                                        </button>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "w-full py-4 rounded-xl text-center font-black uppercase text-sm tracking-widest",
                                        selectedReferral.status === 'accepted' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    )}>
                                        This request was {selectedReferral.status}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}
