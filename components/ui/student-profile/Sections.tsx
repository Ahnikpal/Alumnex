"use client";
import React from "react";
import { User, Code, GraduationCap, FileText, Plus, Eye, FileUp, CheckCircle2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import styles from "../../../app/student-dashboard/student-dashboard.module.css";
import { cn } from "../../../lib/utils";

export const AboutSection = ({ bio }: { bio: string }) => (
    <div className={styles.card}>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> About
            </h2>
            <button className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
        </div>
        <p className="text-slate-600 leading-relaxed font-medium">{bio}</p>
    </div>
);

export const EducationSection = ({ university, degree, duration, location, major }: any) => (
    <div className={styles.card}>
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
            <GraduationCap size={22} className="text-blue-600" /> Education
        </h2>
        <div className="flex items-start gap-5 p-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                <GraduationCap size={28} />
            </div>
            <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                    <h3 className="font-extrabold text-slate-900 text-lg">{university}</h3>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg w-fit">{duration}</span>
                </div>
                <p className="text-slate-600 font-bold mt-1">{degree}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Calendar size={14} /> {location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={14} /> {major}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const SkillsSection = ({ skills }: { skills: string[] }) => (
    <div className={styles.card}>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Code size={20} className="text-blue-600" /> Skills
            </h2>
            <button className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all">
                <Plus size={18} />
            </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
            {skills.map((skill, i) => (
                <motion.span
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100/50 cursor-default"
                >
                    {skill}
                </motion.span>
            ))}
        </div>
    </div>
);

export const ResumeSection = ({ filename, date, size }: any) => (
    <div className={styles.card}>
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
            <FileText size={20} className="text-blue-600" /> Resume
        </h2>
        <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center gap-5 bg-slate-50/50">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <FileText size={28} />
            </div>
            <div className="space-y-1">
                <p className="font-extrabold text-slate-900">{filename}</p>
                <p className="text-[11px] font-bold text-slate-400 tracking-wide">Updated {date} • {size}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                <button className="py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Eye size={16} /> View
                </button>
                <button className="py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <FileUp size={16} /> Replace
                </button>
            </div>
        </div>
    </div>
);
