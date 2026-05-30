"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard, User, Briefcase, FileText, Users, LogOut,
    Search, Bell, BriefcaseBusiness, MapPin, Clock, ChevronDown,
    X, SlidersHorizontal, ExternalLink, CheckCircle2, IndianRupee,
    RotateCcw, TrendingUp, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import styles from "../../app/student-dashboard/student-dashboard.module.css";

const INTERNSHIPS = [
    {
        id: 1,
        company: "Google",
        companyColor: "bg-blue-100 text-blue-600",
        companyInitials: "G",
        role: "Software Engineering Intern",
        location: "Remote",
        locationType: "Remote",
        domain: "Engineering",
        duration: "3 months",
        stipend: "₹80,000/mo",
        postedBy: "Priya Sharma",
        postedAt: "2 days ago",
        verified: true,
        description: "Join Google's engineering team and build scalable backend systems using Go and Kubernetes. Work with world-class engineers on Google Cloud infrastructure.",
        eligibility: "B.Tech/B.E. 3rd or 4th year, CGPA ≥ 8.0",
    },
    {
        id: 2,
        company: "Microsoft",
        companyColor: "bg-green-100 text-green-600",
        companyInitials: "Ms",
        role: "Product Design Intern",
        location: "Hyderabad",
        locationType: "Onsite",
        domain: "Design",
        duration: "6 months",
        stipend: "₹60,000/mo",
        postedBy: "Aditya Kumar",
        postedAt: "5 days ago",
        verified: true,
        description: "Design intuitive user experiences for Microsoft 365 products. Collaborate with PMs and engineers to deliver pixel-perfect designs.",
        eligibility: "Any year, portfolio required",
    },
    {
        id: 3,
        company: "Razorpay",
        companyColor: "bg-indigo-100 text-indigo-600",
        companyInitials: "Rp",
        role: "Full Stack Engineer Intern",
        location: "Hybrid · Bangalore",
        locationType: "Hybrid",
        domain: "Engineering",
        duration: "3 months",
        stipend: "₹50,000/mo",
        postedBy: "Neha Kapoor",
        postedAt: "1 week ago",
        verified: true,
        description: "Work on Razorpay's payment infrastructure, building features for millions of Indian merchants. Tech stack: Node.js, React, PostgreSQL.",
        eligibility: "B.Tech 3rd/4th year with strong DSA background",
    },
    {
        id: 4,
        company: "Groww",
        companyColor: "bg-emerald-100 text-emerald-600",
        companyInitials: "Gw",
        role: "Data Science Intern",
        location: "Bangalore",
        locationType: "Onsite",
        domain: "Data Science",
        duration: "2 months",
        stipend: "₹35,000/mo",
        postedBy: "Rohan Singh",
        postedAt: "3 days ago",
        verified: false,
        description: "Analyze user investment behavior and build ML models to personalize the Groww app experience. Work with Python, PySpark, and BigQuery.",
        eligibility: "Any year with ML/Python experience",
    },
    {
        id: 5,
        company: "Adobe",
        companyColor: "bg-red-100 text-red-600",
        companyInitials: "Ad",
        role: "Creative Cloud Intern",
        location: "Remote",
        locationType: "Remote",
        domain: "Design",
        duration: "6 months",
        stipend: "₹70,000/mo",
        postedBy: "Simran Gill",
        postedAt: "Today",
        verified: true,
        description: "Work alongside the Adobe Creative Cloud team on next-generation creative tools for creators and designers worldwide.",
        eligibility: "Design or CS background, Figma proficiency required",
    },
    {
        id: 6,
        company: "Infosys",
        companyColor: "bg-purple-100 text-purple-600",
        companyInitials: "In",
        role: "Cloud Infrastructure Intern",
        location: "Hybrid · Pune",
        locationType: "Hybrid",
        domain: "Engineering",
        duration: "3 months",
        stipend: "₹25,000/mo",
        postedBy: "Vikram Patel",
        postedAt: "1 week ago",
        verified: true,
        description: "Work on Infosys Cobalt cloud platform, configuring AWS/Azure environments and building CI/CD pipelines for enterprise clients.",
        eligibility: "Any final year student with AWS knowledge",
    },
];

type Internship = typeof INTERNSHIPS[0];

export default function OpportunitiesDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("All");
    const [domainFilter, setDomainFilter] = useState("All");
    const [durationFilter, setDurationFilter] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

    const links = [
        { label: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Profile", href: "/profile", icon: <User size={20} /> },
        { label: "Opportunities", href: "/internships", icon: <Briefcase size={20} /> },
        { label: "My Applications", href: "/applications", icon: <FileText size={20} /> },
        { label: "Alumni Connect", href: "/alumni", icon: <Users size={20} /> },
        { label: "Logout", href: "/", icon: <LogOut size={20} /> },
    ];

    const resetFilters = () => {
        setSearch("");
        setLocationFilter("All");
        setDomainFilter("All");
        setDurationFilter("All");
    };

    const filtered = INTERNSHIPS.filter(i => {
        const matchSearch = search === "" || i.role.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase());
        const matchLocation = locationFilter === "All" || i.locationType === locationFilter;
        const matchDomain = domainFilter === "All" || i.domain === domainFilter;
        const matchDuration = durationFilter === "All" || i.duration === durationFilter;
        return matchSearch && matchLocation && matchDomain && matchDuration;
    });

    const hasActiveFilters = search || locationFilter !== "All" || domainFilter !== "All" || durationFilter !== "All";

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
                                className={cn(styles.sidebarItem, link.label === "Opportunities" && styles.sidebarActive)}
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
                        {/* Page Header */}
                        <div className={cn(styles.sectionHeader, "mb-8")}>
                            <div>
                                <h1 className={styles.pageTitle}>Opportunities</h1>
                                <p className="text-slate-500 mt-1">Explore internship referrals shared by alumni.</p>
                            </div>
                            <div className="relative shrink-0">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 pr-10 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                >
                                    <option>Newest</option>
                                    <option>Deadline Soon</option>
                                    <option>Most Applied</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Search + Filter Row */}
                        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm mb-6">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className={styles.searchIcon} size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by role or company..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className={styles.searchInput}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex flex-wrap items-center gap-2">
                                <FilterSelect value={locationFilter} onChange={setLocationFilter} options={["All", "Remote", "Onsite", "Hybrid"]} label="Location" />
                                <FilterSelect value={domainFilter} onChange={setDomainFilter} options={["All", "Engineering", "Design", "Data Science", "Finance"]} label="Domain" />
                                <FilterSelect value={durationFilter} onChange={setDurationFilter} options={["All", "1 month", "2 months", "3 months", "6 months"]} label="Duration" />
                            </div>
                            {hasActiveFilters && (
                                <button onClick={resetFilters} className="flex items-center gap-1.5 text-slate-400 text-xs font-bold hover:text-blue-600 transition-colors ml-auto">
                                    <RotateCcw size={13} /> Reset
                                </button>
                            )}
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm font-semibold text-slate-400">{filtered.length} opportunities found</p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((internship, i) => (
                                    <InternshipCard
                                        key={internship.id}
                                        internship={internship}
                                        index={i}
                                        onViewDetails={() => setSelectedInternship(internship)}
                                    />
                                ))}
                            </AnimatePresence>
                            {filtered.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                                        <Search size={28} />
                                    </div>
                                    <p className="font-bold text-slate-700 text-lg">No results found</p>
                                    <p className="text-slate-400 text-sm mt-1">Try different filters or search terms.</p>
                                    <button onClick={resetFilters} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Clear filters</button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedInternship && (
                    <InternshipModal internship={selectedInternship} onClose={() => setSelectedInternship(null)} />
                )}
            </AnimatePresence>
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
            <p className="font-bold text-slate-500 text-sm hidden sm:block">Alumnex · Opportunities</p>
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
                    <div className="text-sm font-semibold text-slate-900">Arjun Raghav</div>
                    <div className="text-xs text-slate-500">Student</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    AR
                </div>
            </div>
        </div>
    </header>
);

function FilterSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "appearance-none text-sm px-4 py-2.5 pr-9 rounded-xl font-semibold border transition-all cursor-pointer focus:outline-none shadow-sm",
                    value !== "All"
                        ? "bg-blue-50 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-100"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                )}
            >
                {options.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

function InternshipCard({ internship, index, onViewDetails }: { internship: Internship; index: number; onViewDetails: () => void }) {
    const locationColors: Record<string, string> = {
        Remote: "bg-emerald-50 text-emerald-700 border-emerald-100",
        Onsite: "bg-amber-50 text-amber-700 border-amber-100",
        Hybrid: "bg-purple-50 text-purple-700 border-purple-100",
    };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.10)" }}
            className="bg-white rounded-[20px] border border-slate-200 shadow-sm flex flex-col overflow-hidden cursor-pointer transition-colors"
        >
            <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm", internship.companyColor)}>
                        {internship.companyInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-lg leading-snug truncate">{internship.role}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-semibold text-slate-600">{internship.company}</span>
                            {internship.verified && <CheckCircle2 size={14} className="text-blue-500 shrink-0" />}
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 pt-1">{internship.postedAt}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold border", locationColors[internship.locationType] || "bg-slate-50 text-slate-600 border-slate-100")}>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {internship.location}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-slate-50 text-slate-600 border-slate-100 flex items-center gap-1">
                        <Clock size={11} /> {internship.duration}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-blue-50 text-blue-700 border-blue-100">
                        {internship.domain}
                    </span>
                </div>

                {/* Stipend */}
                <div className="flex items-center gap-1.5 text-slate-800">
                    <IndianRupee size={15} className="text-emerald-600" />
                    <span className="font-extrabold text-base">{internship.stipend.replace("₹", "")}</span>
                    <span className="text-xs text-slate-400 font-medium">stipend</span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                        {internship.postedBy.split(" ").map(w => w[0]).join("")}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold truncate">
                        <span className="text-slate-400">by</span> {internship.postedBy}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={onViewDetails}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                        <ExternalLink size={12} /> Details
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
                        Apply
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

function InternshipModal({ internship, onClose }: { internship: Internship; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[24px] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
            >
                {/* Modal Header */}
                <div className="p-8 flex items-start gap-5">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0", internship.companyColor)}>
                        {internship.companyInitials}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900">{internship.role}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-600 font-semibold">{internship.company}</span>
                            {internship.verified && <CheckCircle2 size={15} className="text-blue-500" />}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Meta Tags */}
                <div className="px-8 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 flex items-center gap-1.5">
                        <MapPin size={14} /> {internship.location}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 flex items-center gap-1.5">
                        <Clock size={14} /> {internship.duration}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-blue-50 text-blue-700">{internship.domain}</span>
                    <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700">{internship.stipend}</span>
                </div>

                {/* Content */}
                <div className="p-8 space-y-5">
                    <div>
                        <h4 className="text-[11px] uppercase font-black text-slate-400 tracking-wider mb-2">Description</h4>
                        <p className="text-slate-700 font-medium leading-relaxed">{internship.description}</p>
                    </div>
                    <div>
                        <h4 className="text-[11px] uppercase font-black text-slate-400 tracking-wider mb-2">Eligibility</h4>
                        <p className="text-slate-700 font-medium leading-relaxed">{internship.eligibility}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-black">
                            {internship.postedBy.split(" ").map(w => w[0]).join("")}
                        </div>
                        <span className="text-sm text-slate-500">Referred by <strong className="text-slate-800">{internship.postedBy}</strong></span>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 pb-8 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                        Maybe Later
                    </button>
                    <button className="flex-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-extrabold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
                        Apply Now
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
