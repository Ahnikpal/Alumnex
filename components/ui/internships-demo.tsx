"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { fetchStudents, ApiStudent } from "../../lib/api";

export default function InternshipsDemo() {
    const links = [
        {
            label: "Dashboard",
            href: "/student-dashboard",
            icon: <div className="icon-box"><i className="fas fa-home"></i></div>,
        },
        {
            label: "My Profile",
            href: "/profile",
            icon: <div className="icon-box"><i className="fas fa-user"></i></div>,
        },
        {
            label: "Opportunities",
            href: "/internships",
            icon: <div className="icon-box"><i className="fas fa-briefcase"></i></div>,
        },
        {
            label: "Applications",
            href: "/applications",
            icon: <div className="icon-box"><i className="fas fa-file-alt"></i></div>,
        },
        {
            label: "Logout",
            href: "/",
            icon: <div className="icon-box" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}><i className="fas fa-sign-out-alt"></i></div>,
        },
    ];
    const [open, setOpen] = useState(false);
    const [student, setStudent] = useState<ApiStudent | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);

    React.useEffect(() => {
        fetchStudents().then(data => { if (data.length > 0) setStudent(data[0]); }).catch(() => { });
    }, []);

    const displayName = student?.name ?? "Arjun Raghav";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const shortName = student?.name ? (student.name.split(" ").length > 1 ? `${student.name.split(" ")[0]} ${student.name.split(" ")[1][0]}.` : student.name) : "Arjun R.";

    return (
        <div
            className={cn(
                "rounded-md flex flex-col md:flex-row bg-[#030614] overflow-hidden vision-ui w-full h-screen mx-auto"
            )}
        >
            <Sidebar open={open} setOpen={setOpen} animate={true}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarLink
                            link={{
                                label: shortName,
                                href: "/profile",
                                icon: student?.profile_picture ? (
                                    <img
                                        src={`http://localhost:5000${student.profile_picture}`}
                                        className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                                        alt="Avatar"
                                    />
                                ) : (
                                    <Image
                                        src="https://assets.aceternity.com/manu.png"
                                        className="h-7 w-7 flex-shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <InternshipsContent student={student} initials={initials} showNotifications={showNotifications} setShowNotifications={setShowNotifications} />
        </div>
    );
}

export const Logo = () => {
    return (
        <div className="sidebar-header" style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <Link href="/student-dashboard" className="sidebar-logo" style={{ marginBottom: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-graduation-cap" style={{ color: 'var(--v-primary)', fontSize: '20px' }}></i>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ letterSpacing: '2px', color: 'white', fontWeight: 'bold' }}
                >
                    Inte<span className="hidden-r" style={{ opacity: 0.3 }}>r</span>era
                </motion.span>
            </Link>
        </div>
    );
};

export const LogoIcon = () => {
    return (
        <div className="sidebar-header" style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Link href="/student-dashboard" className="sidebar-logo" style={{ marginBottom: 0, textDecoration: 'none' }}>
                <i className="fas fa-graduation-cap" style={{ color: 'var(--v-primary)', fontSize: '20px' }}></i>
            </Link>
        </div>
    );
};

const InternshipsContent = ({ student, initials, showNotifications, setShowNotifications }: { student: ApiStudent | null, initials: string, showNotifications: boolean, setShowNotifications: (v: boolean) => void }) => {
    return (
        <main className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
            {/* Top Bar */}
            <div className="top-bar v-glass-card" style={{ marginBottom: '2rem', borderRadius: '15px', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 11, 40, 0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--v-text-muted)' }}>
                        Pages / <span style={{ color: 'white', fontWeight: 500 }}>Internships</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="v-search" style={{ background: 'var(--v-bg)', border: '1px solid var(--v-glass-border)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-search" style={{ fontSize: '12px', color: 'var(--v-text-muted)' }}></i>
                        <input type="text" placeholder="Search internships, companies..." aria-label="Search internships" data-testid="search-input" style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '13px', outline: 'none' }} />
                    </div>
                    <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="notification-btn" 
                                aria-label="Notifications" 
                                style={{ background: 'transparent', border: 'none', color: 'var(--v-text-muted)', position: 'relative', cursor: 'pointer' }}
                            >
                                <i className="fas fa-bell"></i>
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ea580c', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--v-bg)' }}></span>
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '280px', background: 'rgba(6, 11, 40, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100 }}
                                    >
                                        <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>Notifications</span>
                                            <span style={{ fontSize: '10px', color: 'var(--v-primary)', cursor: 'pointer' }}>Clear all</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Application Viewed</div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Someone at Microsoft just viewed your application.</div>
                                            </div>
                                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Interview Tip</div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Check out our new guide on system design interviews.</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ width: 1, height: 36, background: "#e2e8f0" }} />
                        <div className="user-avatar" style={{ width: '35px', height: '35px', background: 'var(--v-grad-blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', overflow: 'hidden' }}>
                            {student?.profile_picture ? (
                                <img src={`http://localhost:5000${student.profile_picture}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard-content">

                <div className="page-header reveal-on-scroll">
                    <h1 className="page-title">Browse Internships</h1>
                    <p className="page-subtitle">Discover opportunities from alumni at top companies</p>
                </div>

                {/* Filters */}
                <div className="filters-bar reveal-on-scroll">
                    <select className="filter-select" aria-label="Filter by location">
                        <option value="">All Locations</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="remote">Remote</option>
                        <option value="gurgaon">Gurgaon</option>
                    </select>
                    <select className="filter-select" aria-label="Filter by type">
                        <option value="">All Types</option>
                        <option value="fulltime">Full Time</option>
                        <option value="parttime">Part Time</option>
                        <option value="contract">Contract</option>
                    </select>
                    <select className="filter-select" aria-label="Filter by duration">
                        <option value="">Any Duration</option>
                        <option value="3">3 Months</option>
                        <option value="4">4 Months</option>
                        <option value="6">6 Months</option>
                    </select>
                </div>

                {/* Internship Cards */}
                <div className="internships-grid">

                    {/* Card 1: Google */}
                    <div className="internship-card reveal-on-scroll">
                        <div className="internship-header">
                            <span className="alumni-referral"><i className="fas fa-user-check"></i> Referred by Priya S.</span>
                        </div>
                        <div className="internship-details">
                            <span className="detail-tag"><i className="fas fa-map-marker-alt"></i> Bangalore</span>
                            <span className="detail-tag"><i className="fas fa-clock"></i> 6 Months</span>
                            <span className="detail-tag"><i className="fas fa-rupee-sign"></i> 80k/month</span>
                        </div>
                        <div className="company-logo">
                            <i className="fab fa-google"></i>
                        </div>
                        <div className="company-info">
                            <h3>Google</h3>
                            <p>Software Engineering Intern</p>
                        </div>
                        <div className="internship-footer">
                            <button className="btn-apply"><i className="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>

                    {/* Card 2: Microsoft */}
                    <div className="internship-card reveal-on-scroll">
                        <div className="internship-header">
                            <span className="alumni-referral"><i className="fas fa-user-check"></i> Referred by Amit K.</span>
                        </div>
                        <div className="internship-details">
                            <span className="detail-tag"><i className="fas fa-map-marker-alt"></i> Hyderabad</span>
                            <span className="detail-tag"><i className="fas fa-clock"></i> 3 Months</span>
                            <span className="detail-tag"><i className="fas fa-rupee-sign"></i> 60k/month</span>
                        </div>
                        <div className="company-logo microsoft">
                            <i className="fab fa-microsoft"></i>
                        </div>
                        <div className="company-info">
                            <h3>Microsoft</h3>
                            <p>Product Design Intern</p>
                        </div>
                        <div className="internship-footer">
                            <button className="btn-apply"><i className="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>

                    {/* Card 3: Amazon */}
                    <div className="internship-card reveal-on-scroll">
                        <div className="internship-header">
                            <span className="alumni-referral"><i className="fas fa-user-check"></i> Referred by Neha R.</span>
                        </div>
                        <div className="internship-details">
                            <span className="detail-tag"><i className="fas fa-map-marker-alt"></i> Remote</span>
                            <span className="detail-tag"><i className="fas fa-clock"></i> 4 Months</span>
                            <span className="detail-tag"><i className="fas fa-rupee-sign"></i> 70k/month</span>
                        </div>
                        <div className="company-logo amazon">
                            <i className="fab fa-amazon"></i>
                        </div>
                        <div className="company-info">
                            <h3>Amazon</h3>
                            <p>Data Science Intern</p>
                        </div>
                        <div className="internship-footer">
                            <button className="btn-apply"><i className="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>

                    {/* Card 4: Meta */}
                    <div className="internship-card reveal-on-scroll">
                        <div className="internship-header">
                            <span className="alumni-referral"><i className="fas fa-user-check"></i> Referred by Raj M.</span>
                        </div>
                        <div className="internship-details">
                            <span className="detail-tag"><i className="fas fa-map-marker-alt"></i> Gurgaon</span>
                            <span className="detail-tag"><i className="fas fa-clock"></i> 6 Months</span>
                            <span className="detail-tag"><i className="fas fa-rupee-sign"></i> 85k/month</span>
                        </div>
                        <div className="company-logo meta">
                            <i className="fab fa-facebook"></i>
                        </div>
                        <div className="company-info">
                            <h3>Meta</h3>
                            <p>Frontend Developer Intern</p>
                        </div>
                        <div className="internship-footer">
                            <button className="btn-apply"><i className="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>

                    {/* Card 5: Flipkart */}
                    <div className="internship-card reveal-on-scroll">
                        <div className="internship-header">
                            <span className="alumni-referral"><i className="fas fa-user-check"></i> Referred by Sneha P.</span>
                        </div>
                        <div className="internship-details">
                            <span className="detail-tag"><i className="fas fa-map-marker-alt"></i> Bangalore</span>
                            <span className="detail-tag"><i className="fas fa-clock"></i> 3 Months</span>
                            <span className="detail-tag"><i className="fas fa-rupee-sign"></i> 50k/month</span>
                        </div>
                        <div className="company-logo flipkart">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        <div className="company-info">
                            <h3>Flipkart</h3>
                            <p>Backend Engineer Intern</p>
                        </div>
                        <div className="internship-footer">
                            <button className="btn-apply"><i className="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>

                    {/* Card 6: Razorpay */}
                    <div className="internship-card reveal-on-scroll">
                        <div className="internship-header">
                            <span className="alumni-referral"><i className="fas fa-user-check"></i> Referred by Vikram S.</span>
                        </div>
                        <div className="internship-details">
                            <span className="detail-tag"><i className="fas fa-map-marker-alt"></i> Bangalore</span>
                            <span className="detail-tag"><i className="fas fa-clock"></i> 6 Months</span>
                            <span className="detail-tag"><i className="fas fa-rupee-sign"></i> 55k/month</span>
                        </div>
                        <div className="company-logo razorpay">
                            <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="company-info">
                            <h3>Razorpay</h3>
                            <p>Full Stack Developer Intern</p>
                        </div>
                        <div className="internship-footer">
                            <button className="btn-apply"><i className="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
};
