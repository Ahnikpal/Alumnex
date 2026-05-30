"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
    User, 
    Mail, 
    Building2, 
    GraduationCap, 
    MapPin, 
    Linkedin, 
    Info,
    Camera,
    Plus,
    CheckCircle2,
    Users,
    Trophy,
    Settings,
    Bell
} from "lucide-react";
import { cn } from "../../lib/utils";
import AlumniHeader from "./alumni-header";
import AlumniSidebar from "./alumni-sidebar";
import styles from "../../app/alumni-dashboard/alumni-dashboard.module.css";

export default function AlumniProfileDemo() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const [profile, setProfile] = useState({
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@google.com",
        company: "Google",
        title: "Senior Software Engineer / Mentor",
        location: "Mountain View, CA",
        gradYear: "2015",
        linkedin: "linkedin.com/in/sarahjenkins",
        bio: "Passionate about helping alumni navigate their career journeys in big tech. Specializing in cloud architecture and leadership.",
        skills: ["React", "Backend", "System Design", "Cloud", "Data Engineering"]
    });

    const stats = [
        { label: "Total Referrals", value: "128", icon: <Users size={20} />, color: "bg-blue-50 text-blue-600" },
        { label: "Students Referred", value: "84", icon: <Plus size={20} />, color: "bg-emerald-50 text-emerald-600" },
        { label: "Successful Hires", value: "18", icon: <Trophy size={20} />, color: "bg-amber-50 text-amber-600" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.dashboardWrapper}>
            <div className="flex w-full h-full relative">
                <AlumniSidebar sidebarOpen={sidebarOpen} activeLabel="Profile" />

                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-y-auto pb-12">
                    <AlumniHeader 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        searchPlaceholder="Search profile details..."
                    />

                    <div className={styles.mainContent}>
                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
                            <p className="text-slate-500 mt-2 font-medium">Update your professional details and referral preferences</p>
                        </div>

                        {/* 70/30 Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-10 items-start">
                            
                            {/* Left Section - 70% (7 Columns) */}
                            <div className="col-span-1 md:col-span-7 space-y-8">
                                
                                {/* Profile Header Card */}
                                <div className="bg-white border border-slate-200 rounded-[12px] p-6 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
                                        <div className="relative group shrink-0">
                                            <div className="w-32 h-32 rounded-full border-4 border-emerald-50 overflow-hidden bg-white shadow-md ring-1 ring-slate-200 transition-all duration-300 group-hover:border-emerald-100">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?uxlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                            <button className="absolute bottom-1 right-1 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95">
                                                <Camera size={16} />
                                            </button>
                                        </div>
                                        
                                        <div className="text-center md:text-left py-1 flex flex-col justify-center">
                                            <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tight mb-3">{profile.name}</h2>
                                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-5 gap-y-2 text-slate-500 text-sm font-bold">
                                                <span className="flex items-center gap-2">
                                                    <Building2 size={16} className="text-emerald-600" /> {profile.company}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-emerald-600" /> {profile.location}
                                                </span>
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    Class of {profile.gradYear}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button 
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="px-6 py-3 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-sm active:scale-95 group"
                                        >
                                            <Settings size={18} className="text-slate-400 group-hover:rotate-45 transition-transform" /> Edit Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Professional Details Form Card */}
                                <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm overflow-hidden">
                                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                                            <Info size={19} className="text-emerald-600" />
                                            Professional Details
                                        </h3>
                                        <div className="flex gap-4">
                                            <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors px-2">Cancel</button>
                                            <button className="text-sm font-bold text-emerald-600 bg-emerald-50 px-6 py-2.5 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 active:scale-95">Save Changes</button>
                                        </div>
                                    </div>
                                    <div className="p-10">
                                        {/* Two-Column Form Grid - Row Based */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-[20px]">
                                            
                                            {/* Row 1: Name | Email */}
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500" />
                                                    <input 
                                                        type="text" 
                                                        name="name"
                                                        value={profile.name}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/40 transition-all outline-none"
                                                        placeholder="Sarah Jenkins"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input 
                                                        type="email" 
                                                        name="email"
                                                        value={profile.email}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-50 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Company | Graduation Year */}
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Company</label>
                                                <div className="relative group">
                                                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500" />
                                                    <input 
                                                        type="text" 
                                                        name="company"
                                                        value={profile.company}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/40 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Graduation Year</label>
                                                <div className="relative group">
                                                    <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500" />
                                                    <input 
                                                        type="text" 
                                                        name="gradYear"
                                                        value={profile.gradYear}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/40 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: LinkedIn | Location */}
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">LinkedIn Profile</label>
                                                <div className="relative group">
                                                    <Linkedin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500" />
                                                    <input 
                                                        type="url" 
                                                        name="linkedin"
                                                        value={profile.linkedin}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/40 transition-all outline-none"
                                                        placeholder="linkedin.com/in/username"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Location</label>
                                                <div className="relative group">
                                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500" />
                                                    <input 
                                                        type="text" 
                                                        name="location"
                                                        value={profile.location}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/40 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 4: Bio - Full Width */}
                                            <div className="space-y-3 md:col-span-2 mt-2">
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Bio / About</label>
                                                <textarea 
                                                    rows={4}
                                                    name="bio"
                                                    value={profile.bio}
                                                    onChange={handleInputChange}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/40 transition-all resize-none outline-none leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - 30% (3 Columns) */}
                            <div className="col-span-1 md:col-span-3 space-y-6">
                                
                                {/* Referral Impact Card */}
                                <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900 text-base">Referral Impact</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {stats.map((stat, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:border-emerald-100 hover:bg-emerald-50/30 group cursor-default">
                                                <div className={cn("p-2.5 rounded-lg transition-transform duration-300 group-hover:scale-110", stat.color)}>
                                                    {stat.icon}
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black text-slate-900 leading-none">{stat.value}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Card */}
                                <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-900 text-base">Skills & Expertise</h3>
                                        <button className="text-emerald-600 hover:text-emerald-700 transition-all hover:scale-110 active:scale-95">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-lg border border-emerald-100 uppercase tracking-tight hover:bg-emerald-100 transition-colors cursor-default"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-2.5 border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold rounded-xl hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all active:scale-[0.98]">
                                            + Add New Skill
                                        </button>
                                    </div>
                                </div>

                                {/* Preferences Card */}
                                <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900 text-base">Preferences</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <PreferenceToggle 
                                            label="Accepting Referrals" 
                                            subtitle="Show in student searches" 
                                            active={true} 
                                        />
                                        <PreferenceToggle 
                                            label="Open to Mentorship" 
                                            subtitle="Mentor badge visibility" 
                                            active={true} 
                                        />
                                        <PreferenceToggle 
                                            label="Email Notifications" 
                                            subtitle="Daily digest of requests" 
                                            active={false} 
                                        />
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

const PreferenceToggle = ({ label, subtitle, active }: { label: string, subtitle: string, active: boolean }) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="text-sm font-bold text-slate-800">{label}</div>
            <div className="text-[11px] text-slate-400 font-medium">{subtitle}</div>
        </div>
        <div className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors", active ? "bg-emerald-500" : "bg-slate-200")}>
            <div className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all", active ? "right-0.5" : "left-0.5")}></div>
        </div>
    </div>
);
