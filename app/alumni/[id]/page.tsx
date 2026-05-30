"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
    MapPin, 
    GraduationCap, 
    Link as LinkIcon, 
    CheckCircle2, 
    Linkedin, 
    Mail, 
    Loader2,
    Briefcase,
    Globe
} from "lucide-react";
import { fetchAlumniById, ApiAlumni } from "../../../lib/api";
import { cn } from "../../../lib/utils";

export default function PublicAlumniProfile() {
    const params = useParams();
    const id = params.id as string;
    const [alumni, setAlumni] = useState<ApiAlumni | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchAlumniById(Number(id))
            .then(setAlumni)
            .catch(err => {
                console.error(err);
                setError("Alumni not found or failed to load profile.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                    <p className="font-medium font-sans text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !alumni) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
                    <p className="text-slate-600 font-medium mb-6">{error || "The profile you are looking for does not exist."}</p>
                    <a href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }

    const skills = alumni.skills ? alumni.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Elegant Header/Banner */}
            <div className="h-48 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
                {/* Profile Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                            {/* Avatar */}
                            <div className="w-40 h-40 rounded-3xl border-[6px] border-white overflow-hidden shadow-2xl shadow-slate-300 -mt-20 md:-mt-24 bg-slate-100 shrink-0">
                                <img 
                                    src={alumni.profile_picture ? `http://localhost:5000${alumni.profile_picture}` : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?uxlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} 
                                    alt={alumni.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                                        {alumni.name}
                                    </h1>
                                    <div className="inline-flex mx-auto md:mx-0 items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
                                        <CheckCircle2 size={14} /> Verified Alumni
                                    </div>
                                </div>
                                <p className="text-lg md:text-xl font-bold text-emerald-600 flex items-center justify-center md:justify-start gap-2 mb-4">
                                    {alumni.role} <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {alumni.company}
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-slate-500 font-semibold text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-slate-400" />
                                        {alumni.location || "Available Worldwide"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={18} className="text-slate-400" />
                                        Batch of {alumni.graduation_year}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {alumni.linkedin && (
                                    <a 
                                        href={alumni.linkedin} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-1"
                                    >
                                        <Linkedin size={22} />
                                    </a>
                                )}
                                <a 
                                    href={`mailto:${alumni.email}`}
                                    className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:-translate-y-1"
                                >
                                    <Mail size={22} />
                                </a>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 w-full my-10"></div>

                        {/* Bio & Skills Grid */}
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Globe size={16} /> Professional Biography
                                </h3>
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                        {alumni.bio || `Passionate professional currently working at ${alumni.company} as a ${alumni.role}. Excited to help current students with industry insights and referrals.`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Briefcase size={16} /> Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.length > 0 ? skills.map(skill => (
                                        <span 
                                            key={skill}
                                            className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    )) : (
                                        <span className="text-slate-400 text-sm italic">No specific skills listed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Footer Action */}
                    <div className="bg-slate-50/50 border-top border-slate-100 p-8 text-center">
                        <p className="text-slate-500 font-medium mb-4">Interested in working with {alumni.name.split(' ')[0]}?</p>
                        <button className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-all">
                            View Available Referrals
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
