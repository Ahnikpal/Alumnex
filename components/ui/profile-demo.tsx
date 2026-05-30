"use client";
import React, { useState } from "react";
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
    Mail,
    Phone,
    MapPin,
    Edit3,
    ExternalLink,
    Code,
    Globe,
    Award
} from "lucide-react";
import styles from "../../app/student-dashboard/dashboard-v2.module.css";

export default function ProfileDemo() {
    const [open, setOpen] = useState(false);

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

    return (
        <div className={cn(styles.dashboardWrapper, "flex flex-col md:flex-row w-full h-screen mx-auto")}>
            <AnimatedBackground />

            <Sidebar open={open} setOpen={setOpen} animate={true}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden z-10">
                        <Logo />
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink
                                    key={idx}
                                    link={link}
                                    className={cn(styles.sidebarItem, link.label === "Profile" && styles.sidebarActive)}
                                />
                            ))}
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            <ProfileContent />
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

const ProfileContent = () => {
    const skills = [
        { name: "Frontend Development", level: 90, icon: <Code size={14} /> },
        { name: "UI/UX Design", level: 85, icon: <Globe size={14} /> },
        { name: "Backend Architecture", level: 80, icon: <Award size={14} /> },
    ];

    return (
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
            {/* Minimal Header Section */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.profileHeader}
            >
                <div className={styles.avatarWrapper}>
                    <Image
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=140&q=80"
                        alt="Arjun Reddy"
                        width={140}
                        height={140}
                        className={styles.avatarImage}
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Arjun Reddy</h1>
                    <p className="text-muted-foreground text-lg mb-6">Full Stack Developer & Product Designer</p>
                    <div className="flex items-center justify-center gap-4">
                        <button className={styles.editButton}>
                            Edit Profile
                        </button>
                        <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <Edit3 size={18} />
                        </button>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: About & Skills */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* About Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={styles.glassCard}
                    >
                        <h2 className={styles.sectionTitle}>About</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            An innovative Full Stack Developer with a passion for building high-performance web applications. Currently focused on creating seamless user experiences using Next.js and Framer Motion. I enjoy solving complex architectural problems and staying ahead of the curve with modern SaaS trends.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                            <ContactItem icon={<Mail size={16} />} label="Email" value="arjun@alumnex.ai" />
                            <ContactItem icon={<Phone size={16} />} label="Phone" value="+91 98765 43210" />
                            <ContactItem icon={<MapPin size={16} />} label="Location" value="SRM • Chennai, IN" />
                        </div>
                    </motion.section>

                    {/* Experience section placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className={cn(styles.glassCard, "cursor-pointer")}
                        >
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <Award size={18} className="text-cyan-400" /> Education
                            </h3>
                            <p className="text-sm font-semibold">B.Tech Computer Science</p>
                            <p className="text-xs text-muted-foreground">SRM University • 2022 - 2026</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className={cn(styles.glassCard, "cursor-pointer")}
                        >
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <ExternalLink size={18} className="text-purple-400" /> Portfolio
                            </h3>
                            <p className="text-sm font-semibold">arjun.dev</p>
                            <p className="text-xs text-muted-foreground">View my recent case studies</p>
                        </motion.div>
                    </div>
                </div>

                {/* Right Column: Skills & Details */}
                <div className="flex flex-col gap-8">
                    {/* Skills Section */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={styles.glassCard}
                    >
                        <h2 className={styles.sectionTitle}>Expertise</h2>
                        <div className="flex flex-col gap-6">
                            {skills.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold flex items-center gap-2">
                                            {skill.icon} {skill.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{skill.level}%</span>
                                    </div>
                                    <div className={styles.skillTrack}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.level}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (i * 0.1) }}
                                            className={styles.skillBar}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Badges/Tags */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={styles.glassCard}
                    >
                        <h2 className={styles.sectionTitle}>Tech DNA</h2>
                        <div className="flex flex-wrap gap-2">
                            {["Next.js", "TypeScript", "Tailwind", "Node.js", "AWS", "Framer Motion", "Three.js", "GraphQL"].map((tag, i) => (
                                <span key={i} className={styles.badge}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </div>
        </main>
    );
};

const ContactItem = ({ icon, label, value }: any) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
            {icon} {label}
        </span>
        <span className="text-sm font-semibold">{value}</span>
    </div>
);
