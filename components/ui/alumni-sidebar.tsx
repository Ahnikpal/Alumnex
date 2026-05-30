"use client";
import React from "react";
import Link from "next/link";
import { 
    LayoutDashboard, 
    UserPlus, 
    Inbox, 
    ListOrdered, 
    BarChart2, 
    LogOut, 
    GraduationCap,
    User
} from "lucide-react";
import { cn } from "../../lib/utils";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";

interface AlumniSidebarProps {
    sidebarOpen: boolean;
    activeLabel: string;
}

export default function AlumniSidebar({ sidebarOpen, activeLabel }: AlumniSidebarProps) {
    const links = [
        { label: "Dashboard", href: "/alumni-dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Post Referral", href: "/alumni-dashboard/post-referral", icon: <UserPlus size={20} /> },
        { label: "Applications Received", href: "/alumni-dashboard/applications", icon: <Inbox size={20} /> },
        { label: "My Referrals", href: "/alumni-dashboard/my-referrals", icon: <ListOrdered size={20} /> },
        { label: "Profile", href: "/alumni-dashboard/profile", icon: <User size={20} /> },
    ];

    return (
        <aside className={cn(styles.sidebarWrapper, sidebarOpen ? "w-64" : "w-20", "hidden md:flex flex-col h-screen sticky top-0")}>
            <div className="px-6 h-[72px] flex items-center gap-3 border-b border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-500/20">
                    <GraduationCap size={18} />
                </div>
                {sidebarOpen && <span className="font-black text-xl tracking-tight text-slate-900">Alumnex</span>}
            </div>

            <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2">
                {links.map((link, idx) => {
                    const isActive = link.label === activeLabel;
                    return (
                        <Link
                            key={idx}
                            href={link.href}
                            className={cn(
                                styles.sidebarItem, 
                                isActive ? "bg-emerald-50 text-emerald-600 font-bold" : "text-slate-500 font-semibold"
                            )}
                            title={link.label}
                        >
                            <span className={cn(isActive ? "text-emerald-600" : "text-slate-400")}>
                                {link.icon}
                            </span>
                            {sidebarOpen && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-200">
                <Link href="/" className={cn(styles.sidebarItem, "text-red-600 hover:bg-red-50 hover:text-red-700")}>
                    <LogOut size={18} />
                    {sidebarOpen && <span>Logout</span>}
                </Link>
            </div>
        </aside>
    );
}
