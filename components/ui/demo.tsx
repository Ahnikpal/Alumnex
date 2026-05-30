"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "../../lib/utils";
import {
    LayoutDashboard,
    User,
    Briefcase,
    FileText,
    LogOut,
    Search,
    Bell,
    ChevronRight,
    Send,
    Clock,
    CheckCircle2,
    Eye,
    Plus
} from "lucide-react";
import styles from "../../app/student-dashboard/dashboard-v2.module.css";

export default function StudentDashboardDemo() {
    const links = [
        {
            label: "Dashboard",
            href: "/student-dashboard",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Profile",
            href: "/profile",
            icon: <User size={20} />,
        },
        {
            label: "Opportunities",
            href: "/internships",
            icon: <Briefcase size={20} />,
        },
        {
            label: "Applications",
            href: "/applications",
            icon: <FileText size={20} />,
        },
        {
            label: "Logout",
            href: "/",
            icon: <LogOut size={20} />,
        },
    ];
    const [open, setOpen] = useState(false);

    return (
        <div className={cn(styles.dashboardWrapper, "flex flex-col md:flex-row w-full h-screen mx-auto")}>
            <AnimatedBackground />

            <Sidebar open={open} setOpen={setOpen} animate={true}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden z-10">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink
                                    key={idx}
                                    link={link}
                                    className={cn(styles.sidebarItem, link.label === "Dashboard" && styles.sidebarActive)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 z-10">
                        <SidebarLink
                            link={{
                                label: "Arjun R.",
                                href: "/profile",
                                icon: (
                                    <Image
                                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80"
                                        className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                            className={styles.sidebarItem}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            <DashboardContent />
        </div>
    );
}

const AnimatedBackground = () => (
    <div className={styles.animatedBg}>
        <div className={cn(styles.orb, styles.orb1)} />
        <div className={cn(styles.orb, styles.orb2)} />
    </div>
);

const Logo = () => (
    <div className="flex items-center gap-2 px-2">
        <div className={styles.iconBox} style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--cyan-primary)' }}>
            <Briefcase size={20} />
        </div>
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold tracking-wider text-white"
        >
            Alumnex
        </motion.span>
    </div>
);

const LogoIcon = () => (
    <div className="flex justify-center">
        <div className={styles.iconBox} style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--cyan-primary)' }}>
            <Briefcase size={20} />
        </div>
    </div>
);

const DashboardContent = () => {
    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
            {/* Top Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(styles.glassCard, "mb-8 flex flex-col md:flex-row items-center justify-between gap-4 py-4")}
            >
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground opacity-60">Pages</span>
                    <ChevronRight size={14} className="opacity-40" />
                    <span className="font-medium">Dashboard</span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>
                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-sm shadow-lg">
                        AR
                    </div>
                </div>
            </motion.div>

            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Arjun</span> 👋</h1>
                <p className="text-muted-foreground">Your future is waiting. Ready to find your next internship?</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Applications Sent"
                    value="24"
                    icon={<Send size={20} />}
                    color="rgba(0, 242, 255, 0.1)"
                    accent="var(--cyan-primary)"
                    delay={0.2}
                />
                <StatCard
                    label="Under Review"
                    value="12"
                    icon={<Clock size={20} />}
                    color="rgba(245, 158, 11, 0.1)"
                    accent="#f59e0b"
                    delay={0.3}
                />
                <StatCard
                    label="Shortlisted"
                    value="05"
                    icon={<CheckCircle2 size={20} />}
                    color="rgba(16, 185, 129, 0.1)"
                    accent="#10b981"
                    delay={0.4}
                />
                <StatCard
                    label="Profile Views"
                    value="142"
                    icon={<Eye size={20} />}
                    color="rgba(117, 81, 255, 0.1)"
                    accent="var(--purple-accent)"
                    delay={0.5}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recent Applications */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className={cn(styles.glassCard, "relative overflow-hidden group")}>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">Build your future</h2>
                            <p className="text-muted-foreground mb-6 max-w-md">Unlock exclusive opportunities through alumni referrals and premium mentorship programs.</p>
                            <Link
                                href="/internships"
                                className="inline-flex items-center gap-2 bg-cyan-500 text-black px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                            >
                                Get Started <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.glassCard}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Recent Applications</h3>
                            <Link href="/applications" className="text-cyan-400 text-sm font-semibold hover:underline">VIEW ALL</Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            <ApplicationItem
                                company="Google"
                                logo={<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 font-bold">G</div>}
                                status="Shortlisted"
                                date="24 Feb, 2026"
                                statusColor="#10b981"
                            />
                            <ApplicationItem
                                company="Microsoft"
                                logo={<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 font-bold">M</div>}
                                status="In Review"
                                date="21 Feb, 2026"
                                statusColor="#f59e0b"
                            />
                            <ApplicationItem
                                company="Amazon"
                                logo={<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-orange-400 font-bold">A</div>}
                                status="Pending"
                                date="18 Feb, 2026"
                                statusColor="var(--cyan-primary)"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-8">
                    {/* Profile Strength */}
                    <div className={cn(styles.glassCard, "flex flex-col items-center text-center py-8")}>
                        <div className="relative w-40 h-40 mb-6">
                            <svg className={cn(styles.progressRing, "w-full h-full")}>
                                <circle
                                    className="text-white/5"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                />
                                <motion.circle
                                    className={styles.progressRingCircle}
                                    strokeWidth="8"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * 0.85) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">85%</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Strength</span>
                            </div>
                        </div>
                        <h4 className="text-lg font-bold mb-1">Profile Strength</h4>
                        <p className="text-sm text-muted-foreground px-4 mb-6">Your profile is almost complete! Add a portfolio to reach 100%.</p>
                        <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95">Boost Now</button>
                    </div>

                    {/* Alumni Connection */}
                    <div className={styles.glassCard}>
                        <h3 className="text-lg font-bold mb-6">Alumni Connections</h3>
                        <div className="flex flex-col gap-5">
                            <AlumniItem name="Priya Sharma" role="SDE @ Google" initial="PS" color="bg-blue-500/20 text-blue-400" />
                            <AlumniItem name="Amit Kumar" role="PM @ Microsoft" initial="AK" color="bg-purple-500/20 text-purple-400" />
                            <AlumniItem name="Neha Reddy" role="DS @ Amazon" initial="NR" color="bg-orange-500/20 text-orange-400" />
                        </div>
                        <button className="w-full mt-6 py-2 text-sm text-cyan-400 font-semibold border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition-all">Explore Network</button>
                    </div>
                </div>
            </div>
        </main>
    );
};

const StatCard = ({ label, value, icon, color, accent, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className={cn(styles.glassCard, styles.statCard)}
    >
        <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={styles.iconBox} style={{ background: color, color: accent }}>
            {icon}
        </div>
    </motion.div>
);

const ApplicationItem = ({ company, logo, status, date, statusColor }: any) => (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group">
        <div className="flex items-center gap-4">
            {logo}
            <div>
                <h4 className="font-bold text-sm">{company}</h4>
                <p className="text-[11px] text-muted-foreground">{date}</p>
            </div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-opacity-10"
                style={{ color: statusColor, background: `${statusColor}20`, border: `1px solid ${statusColor}40` }}
            >
                {status}
            </span>
        </div>
    </div>
);

const AlumniItem = ({ name, role, initial, color }: any) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", color)}>
                {initial}
            </div>
            <div>
                <h4 className="text-sm font-semibold">{name}</h4>
                <p className="text-[11px] text-muted-foreground">{role}</p>
            </div>
        </div>
        <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-black transition-all">
            <Plus size={14} />
        </button>
    </div>
);
