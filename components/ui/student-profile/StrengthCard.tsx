"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../../../app/student-dashboard/student-dashboard.module.css";
import { cn } from "../../../lib/utils";

interface StrengthCardProps {
    percentage: number;
    tips: string[];
}

export const StrengthCard: React.FC<StrengthCardProps> = ({ percentage, tips }) => {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <section className={cn(styles.card, "text-center")}>
            <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        className="text-slate-100"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                    />
                    <motion.circle
                        className="text-blue-600"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-800">{percentage}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strength</span>
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Profile Strength</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Almost there! Your profile is more complete than 70% of your peers.</p>
            <div className="text-left space-y-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Improvement Tips</p>
                <ul className="space-y-3">
                    {tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-600 leading-tight">
                            <div className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>
            <button className="mt-8 w-full bg-blue-50 text-blue-600 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100/50">
                Improve Profile
            </button>
        </section>
    );
};
