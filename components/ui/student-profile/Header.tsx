"use client";
import React from "react";
import Image from "next/image";
import { Edit3, Download } from "lucide-react";
import { motion } from "framer-motion";
import styles from "../../../app/student-dashboard/student-dashboard.module.css";
import { cn } from "../../../lib/utils";

interface ProfileHeaderProps {
    name: string;
    department: string;
    year: string;
    cgpa: string;
    university: string;
    avatarUrl: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    department,
    year,
    cgpa,
    university,
    avatarUrl
}) => {
    return (
        <section className={cn(styles.card, "p-8 md:p-12 flex flex-col items-center text-center gap-6")}>
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
                <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{name}</h1>
                <p className="text-slate-500 font-semibold text-lg">{department} • {year}</p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-sm">CGPA: {cgpa}</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-sm">{university}</span>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 w-full max-w-md">
                <button className={cn(styles.btnPrimary, "flex-1 justify-center")}>
                    <Edit3 size={18} /> Edit Profile
                </button>
                <button className="flex-1 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all hover:border-slate-300 shadow-sm">
                    <Download size={18} /> Resume
                </button>
            </div>
        </section>
    );
};
