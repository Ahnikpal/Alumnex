"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard, User, Briefcase, FileText, Users, LogOut,
    Search, Bell, BriefcaseBusiness
} from "lucide-react";
import { ProfileHeader } from "./Header";
import { StrengthCard } from "./StrengthCard";
import { AboutSection, EducationSection, SkillsSection, ResumeSection } from "./Sections";
import { cn } from "../../../lib/utils";
import styles from "../../../app/student-dashboard/student-dashboard.module.css";

export default function StudentProfileStitch() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Profile", href: "/profile", icon: <User size={20} /> },
        { label: "Opportunities", href: "/internships", icon: <Briefcase size={20} /> },
        { label: "My Applications", href: "/applications", icon: <FileText size={20} /> },
        { label: "Alumni Connect", href: "/alumni", icon: <Users size={20} /> },
        { label: "Logout", href: "/", icon: <LogOut size={20} /> },
    ];

    const profileData = {
        name: "Alex Rivera",
        department: "Computer Science Junior",
        year: "Class of 2025",
        cgpa: "9.2/10.0",
        university: "Stanford University",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        bio: "Passionate software engineering student with a focus on full-stack development and cloud architecture. I've spent the last 3 years building scalable web applications using React, Node.js, and AWS. Seeking internship opportunities where I can contribute to meaningful projects and learn from world-class engineering teams.",
        skills: ["React.js", "TypeScript", "Next.js", "Node.js", "Python", "AWS", "Framer Motion", "PostgreSQL"],
        resume: { filename: "Alex_Rivera_Resume.pdf", date: "2 days ago", size: "1.2 MB" },
        strength: 78,
        tips: ["Add past internship experiences", "Complete your project descriptions", "Verify your student email"]
    };

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative">
                {/* Left Sidebar */}
                <aside className={cn(styles.sidebarWrapper, sidebarOpen ? "w-64" : "w-20", "hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out")}>
                    <div className="p-6 flex items-center gap-3 border-b border-slate-200 h-[73px]">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                            <Briefcase size={18} />
                        </div>
                        {sidebarOpen && <span className="font-bold text-lg tracking-tight">Alumnex</span>}
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
                        {links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.href}
                                className={cn(styles.sidebarItem, link.label === "Profile" && styles.sidebarActive)}
                                title={link.label}
                            >
                                {link.icon}
                                {sidebarOpen && <span>{link.label}</span>}
                            </Link>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-200">
                        <Link href="/" className={cn(styles.sidebarItem, "text-red-600 hover:bg-red-50 hover:text-red-700")}>
                            <LogOut size={18} />
                            {sidebarOpen && <span>Logout</span>}
                        </Link>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12">
                    <TopNav scrolled={scrolled} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <main className={styles.mainContent}>
                        <div className={cn(styles.sectionHeader, "mb-8")}>
                            <div>
                                <h1 className={styles.pageTitle}>My Profile</h1>
                                <p className="text-slate-500 mt-1">Manage your profile and track your progress.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-8">
                                <ProfileHeader {...profileData} />
                                <AboutSection bio={profileData.bio} />
                                <EducationSection
                                    university={profileData.university}
                                    degree="Bachelor of Technology • Computer Science"
                                    duration="2021 - 2025"
                                    location="Palo Alto, California"
                                    major="Specialization in Software Systems"
                                />
                            </div>
                            <div className="space-y-8">
                                <StrengthCard percentage={profileData.strength} tips={profileData.tips} />
                                <SkillsSection skills={profileData.skills} />
                                <ResumeSection {...profileData.resume} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

const TopNav = ({ scrolled, sidebarOpen, setSidebarOpen }: { scrolled: boolean, sidebarOpen: boolean, setSidebarOpen: (o: boolean) => void }) => (
    <header className={cn(
        styles.topNav,
        scrolled && styles.topNavScrolled
    )}>
        <div className="flex items-center gap-4">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={styles.iconButton}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <p className="font-bold text-slate-500 text-sm hidden sm:block">Alumnex · Profile</p>
        </div>

        <div className="flex items-center gap-4">
            <button className={styles.iconButton}>
                <div className="relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </div>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-900">Alex Rivera</div>
                    <div className="text-xs text-slate-500">Student</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    AR
                </div>
            </div>
        </div>
    </header>
);
